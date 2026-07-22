// Shared helpers for the gcode-tools nodes: input bounds, line splitting,
// code normalization, and the toolpath-metrics geometry built on top of the
// cncjs gcode-parser / gcode-interpreter / gcode-toolpath library family.
import * as gcodeParser from 'gcode-parser';
import Toolpath, { ToolpathModal, Vector3 } from 'gcode-toolpath';

// Input bounds (Phase: input -> cost). Chosen to sit under the Axiom
// platform's own ~4 MiB gRPC message cap (so we reject with a clear
// structured error rather than the transport failing first) and to bound
// per-request CPU: every line is tokenized at least once, and toolpath
// resolution invokes the interpreter once per line.
export const MAX_CONTENT_BYTES = 3 * 1024 * 1024; // 3 MiB
export const MAX_LINES = 200_000;

export function checkInputBounds(content: string): string | null {
  const byteLength = Buffer.byteLength(content, 'utf8');
  if (byteLength > MAX_CONTENT_BYTES) {
    return `content exceeds the ${MAX_CONTENT_BYTES}-byte limit (got ${byteLength} bytes)`;
  }
  const lineCount = countLines(content);
  if (lineCount > MAX_LINES) {
    return `content exceeds the ${MAX_LINES}-line limit (got ${lineCount} lines)`;
  }
  return null;
}

function countLines(content: string): number {
  if (content.length === 0) {
    return 0;
  }
  // Count line separators + 1, without allocating the split array twice.
  let count = 1;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
      count++;
    }
  }
  return count;
}

// Split on \r\n, \r, or \n, preserving one entry per source line (including
// blank lines) so callers can report accurate 1-based line numbers.
export function splitLines(content: string): string[] {
  if (content.length === 0) {
    return [];
  }
  return content.split(/\r\n|\r|\n/);
}

// Normalize a (letter, value) word into its canonical command code string,
// e.g. ("G", 1) -> "G1", ("G", 1.0) -> "G1", ("G", 38.2) -> "G38.2",
// ("M", 3) -> "M3". Mirrors how G-code addresses are conventionally written
// (no leading zeros, no trailing ".0").
export function normalizeCode(letter: string, value: number): string {
  const trimmed = Number.isInteger(value) ? String(value) : trimTrailingZeros(value);
  return `${letter}${trimmed}`;
}

function trimTrailingZeros(value: number): string {
  // toString() on a float already omits unnecessary trailing zeros in JS
  // (1.50 -> "1.5"), so this is just a readable name for that fact.
  return value.toString();
}

export interface ResolvedSegment {
  motion: string; // modal.motion at the time of the move, e.g. "G0", "G1", "G2", "G3"
  distance: number; // 3D Euclidean (line) or true arc-length (curve), in mm
  endZ: number;
}

export interface ToolpathResolution {
  segments: ResolvedSegment[];
  min: Vector3;
  max: Vector3;
  hasAnyPoint: boolean;
  feedRatesUsed: Set<number>;
  spindleSpeedsUsed: Set<number>;
  toolsUsed: Set<number>;
  // Sum of (segment distance / active feedrate) across every segment where
  // an active feedrate was known at the time it was traversed; rapid moves
  // fall back to rapidFeedrate. Segments traversed before any F word (for
  // G1/G2/G3) and with rapidFeedrate <= 0 (for G0) contribute 0 — the
  // estimate is then an honest lower bound, not a guess.
  estimatedTimeMinutes: number;
}

const DEFAULT_RAPID_FEEDRATE = 3000; // units/min — typical desktop CNC/3D-printer rapid rate

// Resolve raw G-code text into a full toolpath: every rapid/feed move and
// arc, in order, with the geometric bounding box, per-motion-type
// distances, a run-time estimate, and the distinct F/S/T values used.
//
// Feed/spindle/tool tracking is done independently of gcode-toolpath (which
// does not track numeric F/S values at all, and only tracks tool number via
// its own modal.tool) by re-tokenizing each line with gcode-parser and
// scanning its words directly for F/S/T — this is why lines are fed into
// the toolpath interpreter ONE AT A TIME below: it lets the F/S/T value
// belonging to a line be known before that line's own move is resolved,
// matching real G-code's "modal word active for the move on its own line"
// semantics, while reusing the library's real per-line word grouping
// (gcode-toolpath re-parses whatever string it's given) instead of
// reimplementing it.
export function resolveToolpath(content: string, rapidFeedrate: number): ToolpathResolution {
  const segments: ResolvedSegment[] = [];
  const feedRatesUsed = new Set<number>();
  const spindleSpeedsUsed = new Set<number>();
  const toolsUsed = new Set<number>();

  const min: Vector3 = { x: Infinity, y: Infinity, z: Infinity };
  const max: Vector3 = { x: -Infinity, y: -Infinity, z: -Infinity };
  let hasAnyPoint = false;
  const includePoint = (p: Vector3) => {
    hasAnyPoint = true;
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    min.z = Math.min(min.z, p.z);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
    max.z = Math.max(max.z, p.z);
  };

  const effectiveRapidFeedrate = rapidFeedrate > 0 ? rapidFeedrate : DEFAULT_RAPID_FEEDRATE;
  let currentFeedrate = 0; // 0 = "not yet set by the file"
  let estimatedTimeMinutes = 0;

  const toolpath = new Toolpath({
    addLine: (modal: ToolpathModal, v1: Vector3, v2: Vector3) => {
      includePoint(v1);
      includePoint(v2);
      const distance = euclidean3(v1, v2);
      segments.push({ motion: modal.motion, distance, endZ: v2.z });
      estimatedTimeMinutes += timeContribution(modal.motion, distance, currentFeedrate, effectiveRapidFeedrate);
    },
    addArcCurve: (modal: ToolpathModal, v1: Vector3, v2: Vector3, v0: Vector3) => {
      const arc = resolveArc(v1, v2, v0, modal.motion === 'G2');
      includePoint(v1);
      includePoint(v2);
      for (const extreme of arc.extremes) {
        includePoint(extreme);
      }
      segments.push({ motion: modal.motion, distance: arc.length, endZ: v2.z });
      estimatedTimeMinutes += timeContribution(modal.motion, arc.length, currentFeedrate, effectiveRapidFeedrate);
    },
  });

  for (const rawLine of splitLines(content)) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const parsed = gcodeParser.parseLine(trimmed, { lineMode: 'stripped' });
    for (const [letter, value] of parsed.words) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        continue;
      }
      if (letter === 'F') {
        currentFeedrate = value;
        feedRatesUsed.add(value);
      } else if (letter === 'S') {
        spindleSpeedsUsed.add(value);
      } else if (letter === 'T') {
        toolsUsed.add(value);
      }
    }
    // A tool change can also arrive as "M6 T1" — T1 is its own word/group
    // either way, so the scan above already captures it; nothing further
    // to do here.
    toolpath.loadFromStringSync(trimmed);
  }

  return {
    segments,
    min,
    max,
    hasAnyPoint,
    feedRatesUsed,
    spindleSpeedsUsed,
    toolsUsed,
    estimatedTimeMinutes,
  };
}

function timeContribution(motion: string, distance: number, currentFeedrate: number, rapidFeedrate: number): number {
  if (distance <= 0) {
    return 0;
  }
  const feedrate = motion === 'G0' ? rapidFeedrate : currentFeedrate;
  if (!feedrate || feedrate <= 0) {
    return 0; // honest lower bound: no known rate to estimate this segment's time from
  }
  return distance / feedrate; // minutes, since feedrate is units/min
}

function euclidean3(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

interface ResolvedArc {
  length: number;
  extremes: Vector3[]; // additional points to fold into the bounding box (beyond v1/v2)
}

const TWO_PI = Math.PI * 2;
const EPSILON = 1e-9;

// Resolve a G2/G3 arc (already plane-normalized and offset-applied by
// gcode-toolpath, so v1/v2/v0 are absolute mm coordinates with .x/.y as the
// arc's own plane and .z as the perpendicular/helical axis) into its true
// curved length and the extra axis-aligned extreme points its sweep visits
// (needed for a correct bounding box — the chord between endpoints alone
// under-reports it for anything over a quarter turn).
function resolveArc(v1: Vector3, v2: Vector3, center: Vector3, clockwise: boolean): ResolvedArc {
  const radius = Math.hypot(v1.x - center.x, v1.y - center.y);
  if (!(radius > EPSILON)) {
    // Degenerate (coincident center/start) — treat as a straight move so we
    // never divide by zero or emit NaN.
    return { length: euclidean3(v1, v2), extremes: [] };
  }

  const startAngle = Math.atan2(v1.y - center.y, v1.x - center.x);
  const endAngle = Math.atan2(v2.y - center.y, v2.x - center.x);
  const isFullCircle = Math.hypot(v1.x - v2.x, v1.y - v2.y) < EPSILON;

  let sweep: number;
  if (isFullCircle) {
    sweep = TWO_PI;
  } else if (clockwise) {
    sweep = startAngle - endAngle;
    if (sweep <= EPSILON) sweep += TWO_PI;
  } else {
    sweep = endAngle - startAngle;
    if (sweep <= EPSILON) sweep += TWO_PI;
  }

  const planarLength = radius * sweep;
  const dz = v2.z - v1.z;
  const length = Math.hypot(planarLength, dz);

  // The four axis-aligned extremes of the full circle, at angles 0, 90,
  // 180, 270 degrees from center.
  const candidateAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const extremes: Vector3[] = [];
  for (const angle of candidateAngles) {
    if (angleWithinSweep(angle, startAngle, sweep, clockwise)) {
      // Interpolate z linearly along the sweep for a helical arc.
      const angleFromStart = clockwise ? startAngle - angle : angle - startAngle;
      const normalizedFromStart = ((angleFromStart % TWO_PI) + TWO_PI) % TWO_PI;
      const fraction = sweep > 0 ? normalizedFromStart / sweep : 0;
      extremes.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
        z: v1.z + dz * Math.min(Math.max(fraction, 0), 1),
      });
    }
  }
  return { length, extremes };
}

function angleWithinSweep(angle: number, startAngle: number, sweep: number, clockwise: boolean): boolean {
  const delta = clockwise ? startAngle - angle : angle - startAngle;
  const normalized = ((delta % TWO_PI) + TWO_PI) % TWO_PI;
  return normalized <= sweep + EPSILON;
}
