import { ReemitGcodeInput, ReemitGcodeOutput } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as gcodeParser from 'gcode-parser';
import { checkInputBounds, splitLines } from './gcode_lib';

const LINE_MODES = ['original', 'stripped', 'compact'] as const;
type LineMode = (typeof LINE_MODES)[number];

/**
 * Re-serialize G-code text through the tokenizer and back, normalizing line
 * endings to "\n". line_mode "original" (byte-identical content, endings
 * aside) is a true round-trip: re-parsing the output with ParseGcode always
 * yields the same words. "stripped" (the default) drops comments and
 * blank/comment-only lines while keeping each line's inner word spacing;
 * "compact" additionally removes all whitespace. An unrecognized line_mode
 * falls back to "stripped".
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function reemitGcode(ax: AxiomContext, input: ReemitGcodeInput): ReemitGcodeOutput {
  const out = new ReemitGcodeOutput();
  const content = input.getContent();

  const boundsError = checkInputBounds(content);
  if (boundsError !== null) {
    out.setError(boundsError);
    return out;
  }

  const requested = input.getLineMode();
  const lineMode: LineMode = (LINE_MODES as readonly string[]).includes(requested) ? (requested as LineMode) : 'stripped';

  const outputLines: string[] = [];
  for (const raw of splitLines(content)) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      if (lineMode === 'original') {
        outputLines.push(raw);
      }
      continue;
    }
    if (lineMode === 'original') {
      outputLines.push(raw);
      continue;
    }
    const parsed = gcodeParser.parseLine(trimmed, { lineMode });
    if (parsed.line.length > 0) {
      outputLines.push(parsed.line);
    }
  }

  out.setContent(outputLines.join('\n'));
  return out;
}
