import { ReemitGcodeInput, GcodeInput } from '../gen/messages_pb';
import { reemitGcode } from './reemit_gcode';
import { parseGcode } from './parse_gcode';
import { testContext } from './test_context';
import { COMMENTED_GCODE } from './test_fixtures';

describe('ReemitGcode', () => {
  it('"original" mode reproduces the input byte-identically (line endings aside)', () => {
    const input = new ReemitGcodeInput();
    input.setContent(COMMENTED_GCODE);
    input.setLineMode('original');
    const result = reemitGcode(testContext, input);
    expect(result.getContent()).toBe(COMMENTED_GCODE);
  });

  it('"stripped" mode drops comments and blank lines but keeps word spacing', () => {
    const input = new ReemitGcodeInput();
    input.setContent(COMMENTED_GCODE);
    input.setLineMode('stripped');
    const result = reemitGcode(testContext, input);
    expect(result.getContent()).toBe('G21\nG1 X10 Y5\nG1 X20 Y5');
  });

  it('"compact" mode also removes all whitespace', () => {
    const input = new ReemitGcodeInput();
    input.setContent(COMMENTED_GCODE);
    input.setLineMode('compact');
    const result = reemitGcode(testContext, input);
    expect(result.getContent()).toBe('G21\nG1X10Y5\nG1X20Y5');
  });

  it('falls back to "stripped" for an unrecognized line_mode', () => {
    const input = new ReemitGcodeInput();
    input.setContent(COMMENTED_GCODE);
    input.setLineMode('nonsense');
    const result = reemitGcode(testContext, input);
    expect(result.getContent()).toBe('G21\nG1 X10 Y5\nG1 X20 Y5');
  });

  it('round-trips: re-parsing the "stripped" output yields the same non-comment words as the original', () => {
    const reemitInput = new ReemitGcodeInput();
    reemitInput.setContent(COMMENTED_GCODE);
    reemitInput.setLineMode('stripped');
    const reemitted = reemitGcode(testContext, reemitInput);

    const originalParsed = parseGcode(testContext, (() => {
      const gi = new GcodeInput();
      gi.setContent(COMMENTED_GCODE);
      return gi;
    })());
    const reemittedParsed = parseGcode(testContext, (() => {
      const gi = new GcodeInput();
      gi.setContent(reemitted.getContent());
      return gi;
    })());

    const wordsOf = (lines: ReturnType<typeof originalParsed.getLinesList>) =>
      lines
        .filter((l) => l.getWordsList().length > 0)
        .map((l) => l.getWordsList().map((w) => `${w.getLetter()}${w.getValue()}`).join(' '));

    expect(wordsOf(reemittedParsed.getLinesList())).toEqual(wordsOf(originalParsed.getLinesList()));
  });
});
