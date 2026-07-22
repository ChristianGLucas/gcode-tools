// Ambient module declarations for the cncjs G-code library family (all MIT),
// which ships no type declarations of its own and has no @types package.
// Signatures verified against each package's installed dist/cjs source
// (node_modules/<pkg>/dist/cjs/*.js), pinned exactly in package.json:
//   gcode-parser@2.2.0, gcode-interpreter@3.0.0, gcode-toolpath@3.0.0

declare module 'gcode-parser' {
  // A single tokenized address word, e.g. ['G', 1] for "G1", ['X', 12.5] for
  // "X12.5". Value is a string only in the rare case the argument isn't
  // numeric (parseLine falls back to the raw string when Number() is NaN).
  export type GCodeWordTuple = [string, number | string];

  export interface ParsedLine {
    line: string;
    words: GCodeWordTuple[];
    comments?: string[];
    ln?: number; // N-word line/block number, if present
    cs?: number; // "*" checksum, if present
    err?: boolean; // true when a checksum was present and did not match
  }

  export interface ParseOptions {
    flatten?: boolean;
    lineMode?: 'original' | 'stripped' | 'compact';
    batchSize?: number;
  }

  export function parseLine(line: string, options?: ParseOptions): ParsedLine;
  export function parseStringSync(str: string, options?: ParseOptions): ParsedLine[];
}

declare module 'gcode-interpreter' {
  export interface InterpreterOptions {
    handlers?: Record<string, (params: Record<string, number | string>) => void>;
    defaultHandler?: (cmd: string, params: Record<string, number | string>) => void;
  }

  export default class Interpreter {
    constructor(options?: InterpreterOptions);
    loadFromStringSync(
      str: string,
      callback?: (data: unknown, index: number) => void,
    ): unknown[];
  }
}

declare module 'gcode-toolpath' {
  export interface Vector3 {
    x: number;
    y: number;
    z: number;
  }

  export interface ToolpathModal {
    motion: string; // 'G0' | 'G1' | 'G2' | 'G3' | 'G38.2' | 'G38.3' | 'G38.4' | 'G38.5' | 'G80'
    wcs: string; // 'G54'..'G59'
    plane: string; // 'G17' | 'G18' | 'G19'
    units: string; // 'G20' (inch) | 'G21' (mm)
    distance: string; // 'G90' (absolute) | 'G91' (relative)
    feedrate: string; // 'G93' | 'G94' | 'G95'
    program: string; // 'M0' | 'M1' | 'M2' | 'M30'
    spindle: string; // 'M3' | 'M4' | 'M5'
    coolant: string; // 'M7' | 'M8' | 'M7,M8' | 'M9'
    tool: number | string;
  }

  export interface ToolpathOptions {
    position?: Partial<Vector3>;
    modal?: Partial<ToolpathModal>;
    addLine?: (modal: ToolpathModal, v1: Vector3, v2: Vector3) => void;
    addArcCurve?: (modal: ToolpathModal, v1: Vector3, v2: Vector3, v0: Vector3) => void;
  }

  // NOTE: the real constructor returns a gcode-interpreter Interpreter
  // instance (JS constructor-return-override), patched with getPosition/
  // getModal/setPosition/setModal bound to the real Toolpath's state — NOT
  // a plain Toolpath instance. loadFromStringSync is inherited from there.
  export default class Toolpath {
    constructor(options?: ToolpathOptions);
    loadFromStringSync(
      str: string,
      callback?: (data: unknown, index: number) => void,
    ): unknown[];
    getPosition(): Vector3;
    getModal(): ToolpathModal;
  }
}
