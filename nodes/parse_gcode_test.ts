import { GcodeInput } from '../gen/messages_pb';
import { parseGcode } from './parse_gcode';
import { testContext } from './test_context';
import { SQUARE_GCODE } from './test_fixtures';
import { MAX_CONTENT_BYTES } from './gcode_lib';

describe('ParseGcode', () => {
  it('tokenizes a realistic G-code file into the hand-verified line/word structure', () => {
    const input = new GcodeInput();
    input.setContent(SQUARE_GCODE);
    const result = parseGcode(testContext, input);

    expect(result.getError()).toBe('');
    // 8 content lines + 1 trailing empty line from the fixture's final "\n".
    expect(result.getLineCount()).toBe(9);
    expect(result.getLinesList()).toHaveLength(9);

    const first = result.getLinesList()[0];
    expect(first.getLineNumber()).toBe(1);
    expect(first.getComment()).toBe('10mm square, F600');
    expect(first.getWordsList()).toHaveLength(0);

    const g21Line = result.getLinesList()[1];
    expect(g21Line.getWordsList()).toHaveLength(1);
    expect(g21Line.getWordsList()[0].getLetter()).toBe('G');
    expect(g21Line.getWordsList()[0].getValue()).toBe(21);
    expect(g21Line.getComment()).toBe('millimeters');

    const moveLine = result.getLinesList()[3]; // "G1 X0 Y0 F600"
    const words = moveLine.getWordsList().map((w) => [w.getLetter(), w.getValue()]);
    expect(words).toEqual([
      ['G', 1],
      ['X', 0],
      ['Y', 0],
      ['F', 600],
    ]);

    const lastRealLine = result.getLinesList()[7]; // "G1 X0 Y0"
    expect(lastRealLine.getRaw()).toBe('G1 X0 Y0');
    const trailingBlank = result.getLinesList()[8];
    expect(trailingBlank.getRaw()).toBe('');
    expect(trailingBlank.getWordsList()).toHaveLength(0);
  });

  it('reports a blank line as an empty-words entry, not an error', () => {
    const input = new GcodeInput();
    input.setContent('G1 X1\n\nG1 X2\n');
    const result = parseGcode(testContext, input);
    expect(result.getError()).toBe('');
    // "G1 X1", "", "G1 X2", "" (trailing newline).
    expect(result.getLinesList()).toHaveLength(4);
    expect(result.getLinesList()[1].getWordsList()).toHaveLength(0);
    expect(result.getLinesList()[1].getRaw()).toBe('');
  });

  it('rejects content over the size cap with a structured error instead of crashing', () => {
    const input = new GcodeInput();
    input.setContent('G1 X1\n'.repeat(Math.ceil(MAX_CONTENT_BYTES / 6) + 1));
    const result = parseGcode(testContext, input);
    expect(result.getError()).toContain('exceeds');
    expect(result.getLinesList()).toHaveLength(0);
  });
});
