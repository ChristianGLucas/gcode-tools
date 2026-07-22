import { ComputeToolpathMetricsInput } from '../gen/messages_pb';
import { computeToolpathMetrics } from './compute_toolpath_metrics';
import { testContext } from './test_context';
import { SQUARE_GCODE, CIRCLE_GCODE } from './test_fixtures';
import { MAX_CONTENT_BYTES } from './gcode_lib';

describe('ComputeToolpathMetrics', () => {
  it('computes exact distances/bbox/time for a hand-verified 10mm square cut at F600', () => {
    const input = new ComputeToolpathMetricsInput();
    input.setContent(SQUARE_GCODE);
    const result = computeToolpathMetrics(testContext, input);

    expect(result.getError()).toBe('');
    // Independent oracle: 4 sides of 10mm each = 40mm exactly, hand-added.
    expect(result.getCutDistance()).toBeCloseTo(40, 9);
    expect(result.getRapidDistance()).toBe(0);
    expect(result.getTotalDistance()).toBeCloseTo(40, 9);
    // Independent oracle: 40mm / 600mm-per-minute = 4 seconds exactly.
    expect(result.getEstimatedTimeSeconds()).toBeCloseTo(4, 9);
    expect(result.getUnits()).toBe('mm');
    expect(result.getMoveCount()).toBe(5);
    expect(result.getFeedRatesUsedList()).toEqual([600]);

    const bbox = result.getBoundingBox();
    expect(bbox).toBeDefined();
    expect(bbox!.getMin()!.getX()).toBeCloseTo(0, 9);
    expect(bbox!.getMin()!.getY()).toBeCloseTo(0, 9);
    expect(bbox!.getMax()!.getX()).toBeCloseTo(10, 9);
    expect(bbox!.getMax()!.getY()).toBeCloseTo(10, 9);
    expect(bbox!.getExtents()!.getX()).toBeCloseTo(10, 9);
    expect(bbox!.getExtents()!.getY()).toBeCloseTo(10, 9);
  });

  it('interpolates a full G2 circle to its true circumference and bbox, not the zero-length start=end chord', () => {
    const input = new ComputeToolpathMetricsInput();
    input.setContent(CIRCLE_GCODE);
    const result = computeToolpathMetrics(testContext, input);

    expect(result.getError()).toBe('');
    // Independent oracle: circumference = 2 * PI * r, r=10 -> 62.83185307179586,
    // computed from the standard formula, not from the wrapped library.
    const circumference = 2 * Math.PI * 10;
    // cut_distance = the initial 10mm approach move + the full circle.
    expect(result.getCutDistance()).toBeCloseTo(10 + circumference, 6);

    // Independent oracle: a circle of radius 10 centered at the origin has
    // bounding box (-10,-10) to (10,10) by definition — the chord between
    // an arc's identical start/end point alone would wrongly collapse this
    // to a single point.
    const bbox = result.getBoundingBox()!;
    expect(bbox.getMin()!.getX()).toBeCloseTo(-10, 6);
    expect(bbox.getMin()!.getY()).toBeCloseTo(-10, 6);
    expect(bbox.getMax()!.getX()).toBeCloseTo(10, 6);
    expect(bbox.getMax()!.getY()).toBeCloseTo(10, 6);

    expect(result.getMoveCount()).toBe(2);
  });

  it('interpolates a clockwise semicircle to half the circumference, with a bbox extreme at its swept midpoint but not its unswept side', () => {
    // G2 (clockwise) from (10,0) to (-10,0) around center (0,0), radius 10:
    // sweeps through (0,-10) (270 degrees) but never (0,10) (90 degrees).
    const input = new ComputeToolpathMetricsInput();
    input.setContent('G21\nG90\nG1 X10 Y0 F600\nG2 X-10 Y0 I-10 J0\n');
    const result = computeToolpathMetrics(testContext, input);

    // Independent oracle: half a circle's circumference = PI * r = PI * 10.
    const halfCircumference = Math.PI * 10;
    expect(result.getCutDistance()).toBeCloseTo(10 + halfCircumference, 6);

    const bbox = result.getBoundingBox()!;
    expect(bbox.getMin()!.getX()).toBeCloseTo(-10, 6);
    expect(bbox.getMax()!.getX()).toBeCloseTo(10, 6);
    // Swept side (270 degrees, y=-10) is captured...
    expect(bbox.getMin()!.getY()).toBeCloseTo(-10, 6);
    // ...but the UNswept side (90 degrees, y=+10) must not leak in from the
    // full circle's cardinal points.
    expect(bbox.getMax()!.getY()).toBeCloseTo(0, 6);
  });

  it('buckets G0 as rapid and G1 as cut distance separately', () => {
    const input = new ComputeToolpathMetricsInput();
    input.setContent('G0 X5 Y0\nG1 X15 Y0 F300\n');
    const result = computeToolpathMetrics(testContext, input);

    expect(result.getRapidDistance()).toBeCloseTo(5, 9);
    expect(result.getCutDistance()).toBeCloseTo(10, 9);
    expect(result.getTotalDistance()).toBeCloseTo(15, 9);
  });

  it('normalizes G20 (inch) feedrates to mm/min before estimating time — regression for a bug where F was left in inches, giving a 25.4x-wrong estimate', () => {
    // Independent oracle: 1 inch traveled at 60 inches/min takes 1 second,
    // regardless of what unit the distance/feedrate are expressed in — an
    // invariant that catches a unit-mismatch bug even without hand-tracking
    // the internal mm conversion.
    const input = new ComputeToolpathMetricsInput();
    input.setContent('G20\nG1 X1 Y0 F60\n');
    const result = computeToolpathMetrics(testContext, input);

    expect(result.getCutDistance()).toBeCloseTo(25.4, 9); // 1 inch, normalized to mm
    expect(result.getFeedRatesUsedList()).toEqual([1524]); // 60 in/min -> 1524 mm/min
    expect(result.getEstimatedTimeSeconds()).toBeCloseTo(1, 9);
  });

  it('tracks distinct spindle speeds and tool numbers independently of feedrate', () => {
    const input = new ComputeToolpathMetricsInput();
    input.setContent('T2 M6\nM3 S1000\nG1 X10 F500\nM3 S2000\nG1 X20\n');
    const result = computeToolpathMetrics(testContext, input);

    expect(result.getSpindleSpeedsUsedList()).toEqual([1000, 2000]);
    expect(result.getToolsUsedList()).toEqual([2]);
    expect(result.getFeedRatesUsedList()).toEqual([500]);
  });

  it('rejects content over the size cap with a structured error instead of hanging', () => {
    const input = new ComputeToolpathMetricsInput();
    input.setContent('G1 X1\n'.repeat(Math.ceil(MAX_CONTENT_BYTES / 6) + 1)); // just over the 3 MiB cap
    const result = computeToolpathMetrics(testContext, input);
    expect(result.getError()).toContain('exceeds');
  });
});
