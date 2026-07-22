import { GcodeInput } from '../gen/messages_pb';
import { validateGcode } from './validate_gcode';
import { testContext } from './test_context';
import { SQUARE_GCODE, MALFORMED_GCODE, VALID_CHECKSUM_LINE, INVALID_CHECKSUM_LINE } from './test_fixtures';

describe('ValidateGcode', () => {
  it('reports a well-formed file as valid with zero issues', () => {
    const input = new GcodeInput();
    input.setContent(SQUARE_GCODE);
    const result = validateGcode(testContext, input);
    expect(result.getError()).toBe('');
    expect(result.getValid()).toBe(true);
    expect(result.getIssuesList()).toHaveLength(0);
  });

  it('flags a malformed numeric argument and unrecognized text as errors, each on its own line', () => {
    const input = new GcodeInput();
    input.setContent(MALFORMED_GCODE);
    const result = validateGcode(testContext, input);

    expect(result.getValid()).toBe(false);
    const issues = result.getIssuesList();

    const malformedNumeric = issues.find((i) => i.getLine() === 2);
    expect(malformedNumeric).toBeDefined();
    expect(malformedNumeric!.getSeverity()).toBe('error');
    expect(malformedNumeric!.getMessage()).toContain('X1.2.3');

    const unrecognized = issues.find((i) => i.getLine() === 3);
    expect(unrecognized).toBeDefined();
    expect(unrecognized!.getSeverity()).toBe('error');
    expect(unrecognized!.getMessage()).toContain('@@@');

    // The first line ("G1 X10 Y5") is clean and contributes no issue.
    expect(issues.some((i) => i.getLine() === 1)).toBe(false);
  });

  it('accepts a line whose checksum matches (hand-computed: XOR of "N3 G1 X10" == 82)', () => {
    const input = new GcodeInput();
    input.setContent(VALID_CHECKSUM_LINE);
    const result = validateGcode(testContext, input);
    expect(result.getValid()).toBe(true);
    expect(result.getIssuesList()).toHaveLength(0);
  });

  it('rejects a line whose checksum does not match', () => {
    const input = new GcodeInput();
    input.setContent(INVALID_CHECKSUM_LINE);
    const result = validateGcode(testContext, input);
    expect(result.getValid()).toBe(false);
    expect(result.getIssuesList()).toHaveLength(1);
    expect(result.getIssuesList()[0].getSeverity()).toBe('error');
    expect(result.getIssuesList()[0].getMessage()).toContain('checksum');
  });

  it('warns (but does not invalidate) when N line numbers go backwards', () => {
    const input = new GcodeInput();
    input.setContent('N10 G1 X1\nN5 G1 X2\n');
    const result = validateGcode(testContext, input);
    expect(result.getValid()).toBe(true); // warning only, no error
    expect(result.getIssuesList()).toHaveLength(1);
    expect(result.getIssuesList()[0].getSeverity()).toBe('warning');
    expect(result.getIssuesList()[0].getLine()).toBe(2);
  });
});
