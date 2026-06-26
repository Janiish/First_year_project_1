const express = require('express');
const cors = require('cors');
const { scanWithRegex } = require('./engines/regexEngine');
const { scanWithAST } = require('./engines/astEngine');
const { mapRisks } = require('./utils/riskMapper');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/** Health check — useful for deployment readiness probes */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GuardRail SAST API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/** Core analysis endpoint */
app.post('/api/analyze', (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code string is required.' });
    }

    if (code.length > 500000) {
      return res.status(413).json({ error: 'Code exceeds maximum size of 500KB.' });
    }

    // Run both scanning engines
    const regexFindings = scanWithRegex(code);
    const astFindings = language === 'javascript' ? scanWithAST(code) : [];

    // Merge and map to business risks
    const allFindings = [...regexFindings, ...astFindings];
    const result = mapRisks(allFindings);

    // Attach analysis metadata
    result.meta = {
      language: language || 'unknown',
      codeLength: code.length,
      lineCount: code.split('\n').length,
      analyzedAt: new Date().toISOString(),
      enginesUsed: ['regex', ...(language === 'javascript' ? ['ast'] : [])],
    };

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Internal analysis error.' });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────────────┐`);
  console.log(`  │  GuardRail SAST API                         │`);
  console.log(`  │  Running on http://localhost:${PORT}            │`);
  console.log(`  │  Health:     http://localhost:${PORT}/api/health │`);
  console.log(`  └─────────────────────────────────────────────┘\n`);
});
