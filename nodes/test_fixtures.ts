// Shared G-code fixtures for gcode-tools node tests. NOT a test file itself.

// A hand-verified 10mm x 10mm square, cut at F600 (600 mm/min), starting
// and ending at the origin. Total cut distance = 40mm exactly (4 x 10mm
// sides) — a value computed by hand from the coordinates, independent of
// the wrapped library's own internals.
export const SQUARE_GCODE = `; 10mm square, F600
G21 ; millimeters
G90 ; absolute positioning
G1 X0 Y0 F600
G1 X10 Y0
G1 X10 Y10
G1 X0 Y10
G1 X0 Y0
`;

// A full circle: move to (10,0), then G2 (clockwise) back to (10,0) with
// center offset I-10 J0 -> center (0,0), radius 10. Circumference =
// 2 * PI * 10 = 62.83185307179586mm (the standard formula — independent of
// how the library resolves the arc's center point).
export const CIRCLE_GCODE = `G21
G90
G1 X10 Y0 F600
G2 X10 Y0 I-10 J0
`;

// Deliberately malformed / edge-case G-code for ValidateGcode.
export const MALFORMED_GCODE = `G1 X10 Y5
G1 X1.2.3 Y5
G1 X10 @@@ Y5
`;

// A single line with a hand-computed-correct checksum (82, verified via
// XOR of every character in "N3 G1 X10") and one with a deliberately wrong
// checksum.
export const VALID_CHECKSUM_LINE = 'N3 G1 X10*82';
export const INVALID_CHECKSUM_LINE = 'N3 G1 X10*99';

// Realistic command mix for ListCommands: G1 appears 3 times, everything
// else once.
export const COMMAND_MIX_GCODE = `G21
G90
G1 X10 F600
G1 X20
M3 S1000
G1 X30
M5
`;

// Comments (both ";" and "(...)" styles) plus a blank line, for ReemitGcode.
export const COMMENTED_GCODE = `G21 ; set units to mm
G1 X10 Y5 (rapid to start)

G1 X20 Y5
`;
