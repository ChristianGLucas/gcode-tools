import { GcodeInput } from '../gen/messages_pb';
import { listCommands } from './list_commands';
import { testContext } from './test_context';
import { COMMAND_MIX_GCODE } from './test_fixtures';

describe('ListCommands', () => {
  it('inventories every distinct G/M code with its hand-counted occurrence total', () => {
    const input = new GcodeInput();
    input.setContent(COMMAND_MIX_GCODE);
    const result = listCommands(testContext, input);

    expect(result.getTotalLines()).toBe(8); // 7 content lines + trailing blank

    const byCode = new Map(result.getCommandsList().map((c) => [c.getCode(), c]));
    expect(byCode.get('G1')!.getCount()).toBe(3);
    expect(byCode.get('G1')!.getLinesList()).toEqual([3, 4, 6]);
    expect(byCode.get('G21')!.getCount()).toBe(1);
    expect(byCode.get('G90')!.getCount()).toBe(1);
    expect(byCode.get('M3')!.getCount()).toBe(1);
    expect(byCode.get('M5')!.getCount()).toBe(1);
    expect(byCode.size).toBe(5);

    // Sorted numerically by code, not lexicographically ("G1" before "G21"
    // before "G90", not "G1" < "G21" < "G90" as plain strings would also
    // happen to give here — verified against "G9" < "G21" as a trickier
    // case below).
    expect(result.getCommandsList().map((c) => c.getCode())).toEqual(['G1', 'G21', 'G90', 'M3', 'M5']);
  });

  it('sorts multi-digit codes numerically, not lexicographically', () => {
    const input = new GcodeInput();
    input.setContent('G9\nG21\nG3\n');
    const result = listCommands(testContext, input);
    // Lexicographic order would be "G21" < "G3" < "G9"; numeric order is
    // "G3" < "G9" < "G21".
    expect(result.getCommandsList().map((c) => c.getCode())).toEqual(['G3', 'G9', 'G21']);
  });

  it('counts G1 and M8 on the same line as one occurrence each', () => {
    const input = new GcodeInput();
    input.setContent('G1 X10 M8\n');
    const result = listCommands(testContext, input);
    const codes = result.getCommandsList().map((c) => c.getCode());
    expect(codes).toEqual(expect.arrayContaining(['G1', 'M8']));
    expect(result.getCommandsList().find((c) => c.getCode() === 'G1')!.getCount()).toBe(1);
    expect(result.getCommandsList().find((c) => c.getCode() === 'M8')!.getCount()).toBe(1);
  });
});
