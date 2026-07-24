# gcode-tools

Composable [Axiom](https://axiomide.com) nodes for G-code — the CNC/3D-printing
toolpath instruction format (RS-274/NIST, as spoken by GRBL, Marlin,
Smoothieware, LinuxCNC, and friends).

Built for the Axiom marketplace under the `christiangeorgelucas` handle.

Wraps the MIT-licensed [cncjs](https://github.com/cncjs) G-code library
family — [`gcode-parser`](https://github.com/cncjs/gcode-parser),
[`gcode-interpreter`](https://github.com/cncjs/gcode-interpreter), and
[`gcode-toolpath`](https://github.com/cncjs/gcode-toolpath) — the same
parsing/interpretation engine behind the cncjs CNC controller application,
rather than reimplementing G-code tokenization or modal-state tracking.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/gcode-tools@0.1.1

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/gcode-tools/ParseGcode --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/gcode-tools/0.1.1/ParseGcode \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/gcode-tools/ParseGcode`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

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
communication, no file-system access, no network calls. Payload size,
memory, and DoS containment are the Axiom platform's job, not this
package's — these nodes place no size/line/entry caps of their own and
validate G-code meaning, not size.

## License

MIT. See [LICENSE](./LICENSE).
