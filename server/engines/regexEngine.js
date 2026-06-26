/**
 * RegexEngine — pattern-based secret & credential scanner.
 * Exports scanWithRegex(code) → Finding[]
 *
 * Each rule is defined as a factory that returns a fresh RegExp on every scan,
 * preventing stale lastIndex state in concurrent or repeated calls.
 */

const RULES = [
  {
    ruleId: 'SEC-001',
    title: 'AWS Access Key Exposed',
    createPattern: () => /AKIA[0-9A-Z]{16}/g,
    severity: 'high',
    cwe: 'CWE-798',
  },
  {
    ruleId: 'SEC-002',
    title: 'Generic API Key Assignment',
    createPattern: () => /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/gi,
    severity: 'high',
    cwe: 'CWE-798',
  },
  {
    ruleId: 'SEC-003',
    title: 'Hardcoded Password',
    createPattern: () => /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{3,}['"]/gi,
    severity: 'high',
    cwe: 'CWE-259',
  },
  {
    ruleId: 'SEC-004',
    title: 'Private Key Block',
    createPattern: () => /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
    severity: 'high',
    cwe: 'CWE-321',
  },
  {
    ruleId: 'SEC-005',
    title: 'JWT / Bearer Token',
    createPattern: () =>
      /(?:eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,})|(?:bearer\s+[A-Za-z0-9_\-\.]{20,})/gi,
    severity: 'medium',
    cwe: 'CWE-522',
  },
  {
    ruleId: 'SEC-006',
    title: 'Database Connection String',
    createPattern: () => /(?:mongodb(?:\+srv)?|postgres|mysql|mssql):\/\/[^\s'"]{10,}/gi,
    severity: 'high',
    cwe: 'CWE-798',
  },
  {
    ruleId: 'SEC-007',
    title: 'Internal IP Address',
    createPattern: () =>
      /(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})/g,
    severity: 'low',
    cwe: 'CWE-200',
  },
  {
    ruleId: 'SEC-008',
    title: 'Security TODO/FIXME',
    createPattern: () =>
      /(?:TODO|FIXME|HACK|XXX).*(?:security|auth|password|credential|encrypt|vulnerab)/gi,
    severity: 'low',
    cwe: 'CWE-546',
  },
  {
    ruleId: 'SEC-009',
    title: 'Hardcoded Email Address',
    createPattern: () => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    severity: 'low',
    cwe: 'CWE-200',
  },
  {
    ruleId: 'SEC-010',
    title: 'Base64 Encoded Secret',
    createPattern: () =>
      /(?:secret|token|key|password)\s*[:=]\s*['"][A-Za-z0-9+\/]{40,}={0,2}['"]/gi,
    severity: 'medium',
    cwe: 'CWE-798',
  },
];

/**
 * Compute the 1-based line number for a given character index.
 */
function getLineNumber(code, index) {
  let line = 1;
  for (let i = 0; i < index && i < code.length; i++) {
    if (code[i] === '\n') line++;
  }
  return line;
}

/**
 * Compute the 0-based column offset within its line for a given character index.
 */
function getColumn(code, index) {
  let col = 0;
  for (let i = index - 1; i >= 0; i--) {
    if (code[i] === '\n') break;
    col++;
  }
  return col;
}

/**
 * Extract the full source line at a given 1-based line number, for context.
 */
function getSourceLine(code, lineNumber) {
  const lines = code.split('\n');
  const line = (lines[lineNumber - 1] || '').trim();
  return line.length > 100 ? line.slice(0, 100) + '…' : line;
}

/**
 * Scan source code against all regex rules.
 * @param {string} code - The source code to scan.
 * @returns {Array} Array of finding objects.
 */
function scanWithRegex(code) {
  const findings = [];

  for (const rule of RULES) {
    // Create a fresh regex instance to avoid stale lastIndex
    const pattern = rule.createPattern();

    let match;
    while ((match = pattern.exec(code)) !== null) {
      const line = getLineNumber(code, match.index);
      findings.push({
        ruleId: rule.ruleId,
        title: rule.title,
        severity: rule.severity,
        line,
        column: getColumn(code, match.index),
        snippet: getSourceLine(code, line),
        cwe: rule.cwe,
      });
    }
  }

  return findings;
}

module.exports = { scanWithRegex };
