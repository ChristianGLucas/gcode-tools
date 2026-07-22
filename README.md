# gcode-tools

Composable [Axiom](https://axiom.dev) nodes for G-code — the CNC/3D-printing
toolpath instruction format (RS-274/NIST, as spoken by GRBL, Marlin,
Smoothieware, LinuxCNC, and friends).

Built for the Axiom marketplace under the `christiangeorgelucas` handle.

Wraps the MIT-licensed [cncjs](https://github.com/cncjs) G-code library
family — [`gcode-parser`](https://github.com/cncjs/gcode-parser),
[`gcode-interpreter`](https://github.com/cncjs/gcode-interpreter), and
[`gcode-toolpath`](https://github.com/cncjs/gcode-toolpath) — the same
parsing/interpretation engine behind the cncjs CNC controller application,
rather than reimplementing G-code tokenization or modal-state tracking.

## Nodes

- **ParseGcode** — tokenize raw G-code text into structured lines: every
  address word as a (letter, value) pair, comments, and raw source text.
- **ValidateGcode** — syntax-level validation: unrecognized tokens,
  malformed numeric arguments, checksum mismatches, out-of-sequence line
  numbers.
- **ComputeToolpathMetrics** — resolve the full toolpath (rapids, feed
  moves, and true-length-interpolated G2/G3 arcs) into a bounding box,
  rapid/cut/total distance, an estimated run-time, and the distinct
  feedrates/spindle-speeds/tools used.
- **ListCommands** — inventory every distinct G/M code used, with counts
  and line references.
- **ReemitGcode** — re-serialize G-code text (original/stripped/compact),
  normalizing line endings; a true round-trip through ParseGcode.

Every node is a pure, deterministic transform on G-code TEXT — no machine
communication, no file-system access, no network calls. Input is capped at
3 MiB / 200,000 lines; over either limit, every node returns a structured
error instead of hanging or crashing.

## License

MIT. See [LICENSE](./LICENSE).
