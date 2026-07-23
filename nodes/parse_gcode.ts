import { GcodeInput, ParsedGcode, GcodeLine, GcodeWord } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as gcodeParser from 'gcode-parser';
import { splitLines } from './gcode_lib';

/**
 * Tokenize raw G-code text into its structured lines: every source line
 * (including blank ones), 1-based, with its address words split into
 * (letter, numeric value) pairs (e.g. "G1 X10.5 F500" -> G=1, X=10.5,
 * F=500), any trailing comment ("; ..." or "(...)"), and the raw source
 * text. This is the general-purpose parse the other nodes build on; use
 * ValidateGcode first if you need to know whether a file is well-formed.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseGcode(ax: AxiomContext, input: GcodeInput): ParsedGcode {
  const out = new ParsedGcode();
  const content = input.getContent();

  const rawLines = splitLines(content);
  const lines: GcodeLine[] = rawLines.map((raw, index) => {
    const trimmed = raw.trim();
    const line = new GcodeLine();
    line.setLineNumber(index + 1);
    line.setRaw(raw);

    if (trimmed.length === 0) {
      return line;
    }

    const parsed = gcodeParser.parseLine(trimmed, { lineMode: 'original' });
    const words: GcodeWord[] = [];
    for (const [letter, value] of parsed.words) {
      // A word with a malformed numeric argument (e.g. "X1.2.3") comes back
      // as a string, not a number — skip it here rather than encode NaN
      // into a double field; ValidateGcode surfaces it as an issue instead.
      if (typeof value !== 'number' || Number.isNaN(value)) {
        continue;
      }
      const w = new GcodeWord();
      w.setLetter(letter);
      w.setValue(value);
      words.push(w);
    }
    line.setWordsList(words);
    if (parsed.comments && parsed.comments.length > 0) {
      line.setComment(parsed.comments.join(' '));
    }
    return line;
  });

  out.setLinesList(lines);
  out.setLineCount(lines.length);
  return out;
}
