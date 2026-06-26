/**
 * ASTEngine — Acorn-based static analysis for dangerous code patterns.
 * Exports scanWithAST(code) → Finding[]
 *
 * Detects 6 categories of structural flaws via AST walking:
 *   AST-001  eval() calls
 *   AST-002  Function() constructor
 *   AST-003  document.write()
 *   AST-004  innerHTML assignment
 *   AST-005  setTimeout/setInterval with string argument
 *   AST-006  SQL injection via string concatenation OR template literals
 */

const acorn = require('acorn');
const walk = require('acorn-walk');

const SQL_KEYWORDS = /\b(?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION)\b/i;

/**
 * Extract the source line at the given 1-based line number.
 */
function getSourceLine(code, lineNumber) {
  const lines = code.split('\n');
  const line = (lines[lineNumber - 1] || '').trim();
  return line.length > 100 ? line.slice(0, 100) + '…' : line;
}

/**
 * Recursively check if any node within a subtree contains a SQL keyword literal.
 * Works on both Literal nodes and TemplateElement quasis.
 */
function containsSQLKeyword(node) {
  if (!node) return false;

  // Direct string literal with SQL keyword
  if (node.type === 'Literal' && typeof node.value === 'string' && SQL_KEYWORDS.test(node.value)) {
    return true;
  }

  // Template literal — check each quasi (raw text portion)
  if (node.type === 'TemplateLiteral') {
    for (const quasi of node.quasis) {
      if (quasi.value && SQL_KEYWORDS.test(quasi.value.raw)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Scan JavaScript source code using AST analysis.
 * @param {string} code - The source code to scan.
 * @returns {Array} Array of finding objects.
 */
function scanWithAST(code) {
  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    });
  } catch {
    // If module parse fails, try script mode (handles CommonJS patterns)
    try {
      ast = acorn.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        locations: true,
      });
    } catch {
      // Unparseable code — gracefully return no AST findings
      return [];
    }
  }

  const findings = [];

  walk.simple(ast, {
    CallExpression(node) {
      // AST-001: eval() call
      if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
        findings.push({
          ruleId: 'AST-001',
          title: 'eval() Call Detected',
          severity: 'high',
          line: node.loc.start.line,
          column: node.loc.start.column,
          snippet: getSourceLine(code, node.loc.start.line),
          cwe: 'CWE-95',
        });
      }

      // AST-003: document.write()
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'document' &&
        node.callee.property.type === 'Identifier' &&
        node.callee.property.name === 'write'
      ) {
        findings.push({
          ruleId: 'AST-003',
          title: 'document.write() Usage',
          severity: 'medium',
          line: node.loc.start.line,
          column: node.loc.start.column,
          snippet: getSourceLine(code, node.loc.start.line),
          cwe: 'CWE-79',
        });
      }

      // AST-005: setTimeout/setInterval with string argument
      if (
        node.callee.type === 'Identifier' &&
        (node.callee.name === 'setTimeout' || node.callee.name === 'setInterval') &&
        node.arguments.length > 0 &&
        node.arguments[0].type === 'Literal' &&
        typeof node.arguments[0].value === 'string'
      ) {
        findings.push({
          ruleId: 'AST-005',
          title: 'setTimeout/setInterval with String Argument',
          severity: 'medium',
          line: node.loc.start.line,
          column: node.loc.start.column,
          snippet: getSourceLine(code, node.loc.start.line),
          cwe: 'CWE-95',
        });
      }
    },

    NewExpression(node) {
      // AST-002: Function() constructor
      if (node.callee.type === 'Identifier' && node.callee.name === 'Function') {
        findings.push({
          ruleId: 'AST-002',
          title: 'Function() Constructor',
          severity: 'high',
          line: node.loc.start.line,
          column: node.loc.start.column,
          snippet: getSourceLine(code, node.loc.start.line),
          cwe: 'CWE-95',
        });
      }
    },

    AssignmentExpression(node) {
      // AST-004: innerHTML assignment
      if (
        node.left.type === 'MemberExpression' &&
        node.left.property.type === 'Identifier' &&
        node.left.property.name === 'innerHTML'
      ) {
        findings.push({
          ruleId: 'AST-004',
          title: 'innerHTML Assignment',
          severity: 'medium',
          line: node.loc.start.line,
          column: node.loc.start.column,
          snippet: getSourceLine(code, node.loc.start.line),
          cwe: 'CWE-79',
        });
      }
    },

    BinaryExpression(node) {
      // AST-006: SQL injection via string concatenation
      if (node.operator === '+') {
        if (containsSQLKeyword(node.left) || containsSQLKeyword(node.right)) {
          findings.push({
            ruleId: 'AST-006',
            title: 'SQL Injection via Concatenation',
            severity: 'high',
            line: node.loc.start.line,
            column: node.loc.start.column,
            snippet: getSourceLine(code, node.loc.start.line),
            cwe: 'CWE-89',
          });
        }
      }
    },

    TemplateLiteral(node) {
      // AST-006 (template variant): SQL injection via template literal interpolation
      // Only flag if there are expressions (interpolations) — a plain template string is fine
      if (node.expressions.length > 0) {
        for (const quasi of node.quasis) {
          if (quasi.value && SQL_KEYWORDS.test(quasi.value.raw)) {
            findings.push({
              ruleId: 'AST-006',
              title: 'SQL Injection via Template Literal',
              severity: 'high',
              line: node.loc.start.line,
              column: node.loc.start.column,
              snippet: getSourceLine(code, node.loc.start.line),
              cwe: 'CWE-89',
            });
            break; // One finding per template literal
          }
        }
      }
    },
  });

  return findings;
}

module.exports = { scanWithAST };
