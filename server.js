const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const WIP_FILE     = path.join(DATA_DIR, 'wip.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

// ── Ensure data directory exists ────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Seed files if missing
if (!fs.existsSync(WIP_FILE))
  fs.writeFileSync(WIP_FILE, JSON.stringify({ text: '', updated: null }));
if (!fs.existsSync(TICKETS_FILE))
  fs.writeFileSync(TICKETS_FILE, JSON.stringify({ tickets: [] }));

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ──────────────────────────────────────────────────────────────────
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── WIP Routes ───────────────────────────────────────────────────────────────
app.get('/api/wip', (req, res) => {
  try {
    res.json(readJson(WIP_FILE));
  } catch {
    res.status(500).json({ error: 'Could not read WIP status' });
  }
});

app.post('/api/wip', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    writeJson(WIP_FILE, { text: text.trim(), updated: new Date().toISOString() });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Could not save WIP status' });
  }
});

// ── Ticket Routes ─────────────────────────────────────────────────────────────
app.get('/api/tickets', (req, res) => {
  try {
    res.json(readJson(TICKETS_FILE));
  } catch {
    res.status(500).json({ error: 'Could not read tickets' });
  }
});

app.post('/api/tickets', (req, res) => {
  const { name, email, type, description } = req.body;

  if (!name || !type || !description) {
    return res.status(400).json({ error: 'name, type, and description are required' });
  }

  const VALID_TYPES = ['crash', 'bug', 'data', 'access', 'other'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid ticket type' });
  }

  try {
    const store   = readJson(TICKETS_FILE);
    const newId   = Date.now().toString();
    const ticket  = {
      id:          newId,
      name:        name.trim().slice(0, 120),
      email:       (email || '').trim().slice(0, 200),
      type,
      description: description.trim().slice(0, 2000),
      status:      'open',
      created:     new Date().toISOString()
    };
    store.tickets.push(ticket);
    writeJson(TICKETS_FILE, store);
    res.status(201).json({ ok: true, id: newId });
  } catch {
    res.status(500).json({ error: 'Could not save ticket' });
  }
});

// ── Catch-all: serve index.html for SPA ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅  Mr Pool Hub running on port ${PORT}`);
});
