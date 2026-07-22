import { GcodeInput, ValidationResult, ValidationIssue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import * as gcodeParser from 'gcode-parser';
import { checkInputBounds, splitLines } from './gcode_lib';

// Mirrors the word grammar gcode-parser itself recognizes (a letter
// followed by one or more digits/sign/decimal characters, or a "*nnn"
// checksum) so that whatever DOESN'T match is genuinely unrecognized by the
// underlying parser too — this is a leftover check, not a stricter
// re-implementation of the grammar.
const WORD_OR_CHECKSUM = /([a-zA-Z][0-9+\-.]+)|(\*[0-9]+)/g;

/**
 * Validate a G-code file's SYNTAX: every line's address words tokenize
 * cleanly (no stray unrecognized characters), every word's numeric
 * argument actually parses as a number, and any "*nnn" checksum matches
 * its computed value. This checks tokenization only — NOT whether a G/M
 * code number is a real, supported command (e.g. an unusual vendor-specific
 * code like "G28.1" is not flagged). issues with severity "error" make
 * valid=false; "warning" entries (currently: an N line-number that goes
 * backwards) do not.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function validateGcode(ax: AxiomContext, input: GcodeInput): ValidationResult {
  const out = new ValidationResult();
  const content = input.getContent();

  const boundsError = checkInputBounds(content);
  if (boundsError !== null) {
    out.setError(boundsError);
    out.setValid(false);
    return out;
  }

  const issues: ValidationIssue[] = [];
  const addIssue = (line: number, severity: 'error' | 'warning', message: string) => {
    const issue = new ValidationIssue();
    issue.setLine(line);
    issue.setSeverity(severity);
    issue.setMessage(message);
    issues.push(issue);
  };

  const rawLines = splitLines(content);
  let lastLineNumber: number | null = null;

  rawLines.forEach((rawLine, index) => {
    const lineNo = index + 1;
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) {
      return;
    }

    // Commands the underlying parser treats specially and consumes whole
    // (bCNC/TinyG/g2core/Grbl low-level syntax) — not standard G-code words,
    // but not a syntax error either.
    if (trimmed[0] === '%' || trimmed[0] === '{' || trimmed[0] === '$') {
      return;
    }

    const parsed = gcodeParser.parseLine(trimmed, { lineMode: 'compact' });

    if (parsed.err) {
      addIssue(lineNo, 'error', `checksum verification failed (*${parsed.cs ?? '?'})`);
    }

    if (typeof parsed.ln === 'number') {
      if (lastLineNumber !== null && parsed.ln < lastLineNumber) {
        addIssue(lineNo, 'warning', `line number N${parsed.ln} is out of sequence (previous was N${lastLineNumber})`);
      }
      lastLineNumber = parsed.ln;
    }

    const compact = parsed.line; // comments + whitespace already stripped
    let leftover = compact;
    let match: RegExpExecArray | null;
    WORD_OR_CHECKSUM.lastIndex = 0;
    while ((match = WORD_OR_CHECKSUM.exec(compact)) !== null) {
      leftover = leftover.replace(match[0], '');
      const wordMatch = match[1];
      if (wordMatch) {
        const letter = wordMatch[0];
        const argument = wordMatch.slice(1);
        if (Number.isNaN(Number(argument))) {
          addIssue(lineNo, 'error', `word "${wordMatch}" has a malformed numeric argument`);
        }
      }
    }
    if (leftover.length > 0) {
      addIssue(lineNo, 'error', `unrecognized text "${leftover}"`);
    }
  });

  out.setIssuesList(issues);
  out.setLineCount(rawLines.length);
  out.setValid(!issues.some((i) => i.getSeverity() === 'error'));
  return out;
}
