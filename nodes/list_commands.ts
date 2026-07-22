import { GcodeInput, CommandInventory, CommandCount } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as gcodeParser from 'gcode-parser';
import { checkInputBounds, splitLines, normalizeCode } from './gcode_lib';

const MAX_LINES_PER_COMMAND = 50;

/**
 * Inventory every distinct G/M command used in a G-code file: its
 * normalized code (e.g. "G01" and "G1" both count as "G1"), how many times
 * it occurs, and which lines it occurs on (capped at 50 line references per
 * command — use count for the true total). Commands are counted per
 * occurrence of a G or M address word, not per line (a line with "G1 M8"
 * contributes one count to both G1 and M8).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function listCommands(ax: AxiomContext, input: GcodeInput): CommandInventory {
  const out = new CommandInventory();
  const content = input.getContent();

  const boundsError = checkInputBounds(content);
  if (boundsError !== null) {
    out.setError(boundsError);
    return out;
  }

  const counts = new Map<string, { count: number; lines: number[] }>();
  const rawLines = splitLines(content);

  rawLines.forEach((rawLine, index) => {
    const lineNo = index + 1;
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      return;
    }
    const parsed = gcodeParser.parseLine(trimmed, { lineMode: 'stripped' });
    for (const [letter, value] of parsed.words) {
      if ((letter !== 'G' && letter !== 'M') || typeof value !== 'number' || Number.isNaN(value)) {
        continue;
      }
      const code = normalizeCode(letter, value);
      const entry = counts.get(code) ?? { count: 0, lines: [] };
      entry.count += 1;
      if (entry.lines.length < MAX_LINES_PER_COMMAND) {
        entry.lines.push(lineNo);
      }
      counts.set(code, entry);
    }
  });

  const commands: CommandCount[] = Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([code, entry]) => {
      const c = new CommandCount();
      c.setCode(code);
      c.setCount(entry.count);
      c.setLinesList(entry.lines);
      return c;
    });

  out.setCommandsList(commands);
  out.setTotalLines(rawLines.length);
  return out;
}
