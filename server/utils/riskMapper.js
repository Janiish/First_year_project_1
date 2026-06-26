/**
 * RiskMapper — scores findings, assigns grades, and attaches business-impact narratives.
 * Exports mapRisks(findings) → AnalysisResult
 *
 * This is the core technical-to-business translation layer of GuardRail.
 * Every raw finding gets enriched with:
 *   - businessImpact:   Plain-English corporate consequence
 *   - recommendation:   Actionable remediation guidance
 *   - regulatoryFlags:  Applicable compliance frameworks (GDPR, PCI-DSS, HIPAA, SOX, OWASP)
 */

const SEVERITY_COST = {
  high: 15,
  medium: 8,
  low: 3,
};

/**
 * Central knowledge base mapping each rule ID to its business context.
 * Fields:
 *   impact          — non-technical business/financial consequence
 *   recommendation  — actionable developer fix guidance
 *   regulatory      — applicable compliance frameworks
 */
const RULE_METADATA = {
  'SEC-001': {
    impact:
      'Exposed AWS credentials can lead to unauthorized cloud resource usage, potentially costing thousands in compute charges and triggering data breach notifications under GDPR Article 33.',
    recommendation:
      'Remove the hardcoded key immediately, rotate the compromised credential in AWS IAM, and use environment variables or AWS Secrets Manager instead.',
    regulatory: ['GDPR', 'PCI-DSS', 'SOC 2'],
  },
  'SEC-002': {
    impact:
      'Leaked API keys grant unauthorized access to third-party services, risking data exfiltration, service abuse charges, and violation of vendor terms of service.',
    recommendation:
      'Move the API key to an environment variable or a secrets vault. Regenerate the exposed key from the provider dashboard.',
    regulatory: ['PCI-DSS', 'SOC 2'],
  },
  'SEC-003': {
    impact:
      'Hardcoded passwords in source code can be extracted by any developer or attacker with repository access, enabling unauthorized system entry and potential account takeover.',
    recommendation:
      'Store passwords in a secure vault (e.g., HashiCorp Vault, AWS Secrets Manager). Use bcrypt or argon2 hashing for stored credentials.',
    regulatory: ['GDPR', 'PCI-DSS', 'HIPAA', 'NIST 800-63'],
  },
  'SEC-004': {
    impact:
      'Exposed private keys compromise all encrypted communications and digital signatures, potentially invalidating TLS certificates and enabling man-in-the-middle attacks.',
    recommendation:
      'Immediately revoke and re-issue the key pair. Store private keys in HSMs or encrypted key vaults, never in source code.',
    regulatory: ['PCI-DSS', 'HIPAA', 'SOC 2', 'NIST 800-57'],
  },
  'SEC-005': {
    impact:
      'Leaked authentication tokens allow session hijacking and identity impersonation, granting attackers full access to user accounts without credentials.',
    recommendation:
      'Remove the token from source code. Implement short-lived tokens with automatic rotation and store them in HTTP-only secure cookies.',
    regulatory: ['GDPR', 'OWASP Top 10'],
  },
  'SEC-006': {
    impact:
      'Exposed database connection strings provide direct database access credentials, risking complete data breach, regulatory fines (GDPR/CCPA), and reputational damage.',
    recommendation:
      'Use environment variables for connection strings. Enable TLS for database connections and restrict IP access with firewall rules.',
    regulatory: ['GDPR', 'CCPA', 'PCI-DSS', 'HIPAA'],
  },
  'SEC-007': {
    impact:
      'Internal IP address exposure reveals network topology, aiding attackers in reconnaissance and lateral movement during a breach.',
    recommendation:
      'Remove hardcoded IPs. Use DNS-based service discovery or configuration files excluded from version control.',
    regulatory: ['NIST 800-53', 'ISO 27001'],
  },
  'SEC-008': {
    impact:
      'Unresolved security TODOs indicate known but unfixed vulnerabilities, representing acknowledged risk that could be flagged in security audits.',
    recommendation:
      'Create tracked issues (Jira, GitHub Issues) for each security TODO and prioritize remediation before release.',
    regulatory: ['SOX', 'ISO 27001'],
  },
  'SEC-009': {
    impact:
      'Hardcoded email addresses can be harvested for phishing campaigns targeting employees or used for social engineering attacks.',
    recommendation:
      'Move email addresses to configuration files or environment variables. Use contact forms instead of exposing addresses directly.',
    regulatory: ['GDPR', 'CCPA'],
  },
  'SEC-010': {
    impact:
      'Base64-encoded secrets provide only obfuscation, not encryption — easily decoded by attackers to extract credentials and access tokens.',
    recommendation:
      'Replace Base64 encoding with proper encryption (AES-256) or move secrets to a dedicated secrets manager.',
    regulatory: ['PCI-DSS', 'OWASP Top 10'],
  },
  'AST-001': {
    impact:
      'Use of eval() enables Remote Code Execution (RCE), allowing attackers to run arbitrary commands on your servers — a direct path to full system compromise.',
    recommendation:
      'Replace eval() with JSON.parse() for data, or use a sandboxed interpreter. If dynamic code execution is truly needed, use a strict CSP and input validation.',
    regulatory: ['OWASP Top 10', 'CWE/SANS Top 25'],
  },
  'AST-002': {
    impact:
      'The Function() constructor dynamically creates executable code, bypassing security controls and enabling injection of malicious payloads.',
    recommendation:
      'Refactor to use static function definitions or safe alternatives like Map-based dispatch tables.',
    regulatory: ['OWASP Top 10', 'CWE/SANS Top 25'],
  },
  'AST-003': {
    impact:
      'document.write() can inject unvalidated content into the DOM, enabling Cross-Site Scripting (XSS) attacks that steal user sessions and credentials.',
    recommendation:
      'Use DOM APIs (createElement, textContent, appendChild) or a templating framework with auto-escaping (React, Vue).',
    regulatory: ['OWASP Top 10', 'PCI-DSS'],
  },
  'AST-004': {
    impact:
      'Direct innerHTML assignment bypasses browser sanitization, creating Cross-Site Scripting (XSS) vectors that can steal cookies, redirect users, or deface the application.',
    recommendation:
      'Use textContent for plain text, or sanitize HTML input with DOMPurify before inserting into the DOM.',
    regulatory: ['OWASP Top 10', 'PCI-DSS'],
  },
  'AST-005': {
    impact:
      'Passing strings to setTimeout/setInterval acts as an implicit eval(), enabling code injection attacks through timer callbacks.',
    recommendation:
      'Pass a function reference instead of a string: setTimeout(myFunction, 1000) instead of setTimeout("myFunction()", 1000).',
    regulatory: ['OWASP Top 10'],
  },
  'AST-006': {
    impact:
      'SQL string concatenation creates SQL Injection vulnerabilities — the #1 web application risk (OWASP Top 10), enabling attackers to read, modify, or delete entire databases.',
    recommendation:
      'Use parameterized queries (prepared statements) with placeholders. Never concatenate user input into SQL strings.',
    regulatory: ['OWASP Top 10', 'PCI-DSS', 'HIPAA', 'SOX'],
  },
};

// ─── Fallback for unknown rules ────────────────────────────────────────────────
const DEFAULT_METADATA = {
  impact: 'This finding represents a potential security concern that should be reviewed by your security team.',
  recommendation: 'Review the flagged code and consult your organization\'s secure coding guidelines.',
  regulatory: [],
};

/**
 * Derive a letter grade from a numeric score.
 */
function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Generate a human-readable summary sentence based on grade.
 */
function gradeSummary(grade, riskCounts) {
  const total = riskCounts.high + riskCounts.medium + riskCounts.low;
  switch (grade) {
    case 'A':
      return total === 0
        ? 'Excellent — no security issues detected. Your code follows strong security practices.'
        : 'Excellent — your code follows strong security practices with only minor observations.';
    case 'B':
      return `Good — your code is mostly secure but has ${total} finding${total !== 1 ? 's' : ''} that could be hardened.`;
    case 'C':
      return `Moderate Risk — ${total} security concern${total !== 1 ? 's' : ''} detected that should be addressed before production deployment.`;
    case 'D':
      return `High Risk — ${riskCounts.high} high-severity issue${riskCounts.high !== 1 ? 's' : ''} detected. Immediate remediation is strongly recommended before any deployment.`;
    case 'F':
      return `Critical Risk — your code has ${riskCounts.high} high and ${riskCounts.medium} medium severity vulnerabilities. Do not deploy. Immediate security review required.`;
    default:
      return 'Unable to determine security posture.';
  }
}

/**
 * Assign a color key for UI rendering based on the letter grade.
 */
function gradeColor(grade) {
  switch (grade) {
    case 'A': return 'emerald';
    case 'B': return 'green';
    case 'C': return 'amber';
    case 'D': return 'orange';
    case 'F': return 'red';
    default:  return 'slate';
  }
}

/**
 * Score, grade, and enrich an array of raw findings.
 * @param {Array} findings - Raw finding objects from the scan engines.
 * @returns {Object} Complete analysis result with score, grade, enriched findings, and metadata.
 */
function mapRisks(findings) {
  // ─── Count severities ──────────────────────────────────────────────────────
  const riskCounts = { high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    if (riskCounts[f.severity] !== undefined) {
      riskCounts[f.severity]++;
    }
  }

  // ─── Compute score ─────────────────────────────────────────────────────────
  let score = 100;
  for (const f of findings) {
    score -= SEVERITY_COST[f.severity] || 0;
  }
  score = Math.max(score, 0);

  // ─── Grade, summary, color ─────────────────────────────────────────────────
  const grade = scoreToGrade(score);
  const summary = gradeSummary(grade, riskCounts);
  const color = gradeColor(grade);

  // ─── Enrich each finding with business context ─────────────────────────────
  const enrichedFindings = findings.map((f) => {
    const meta = RULE_METADATA[f.ruleId] || DEFAULT_METADATA;
    return {
      ...f,
      businessImpact: meta.impact,
      recommendation: meta.recommendation,
      regulatoryFlags: meta.regulatory,
    };
  });

  // ─── Aggregate regulatory exposure ─────────────────────────────────────────
  const regulatoryExposure = [...new Set(enrichedFindings.flatMap((f) => f.regulatoryFlags))].sort();

  return {
    score,
    grade,
    color,
    summary,
    riskCounts,
    totalFindings: enrichedFindings.length,
    regulatoryExposure,
    findings: enrichedFindings,
  };
}

module.exports = { mapRisks };
