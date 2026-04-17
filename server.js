const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR      = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const TICKETS_FILE  = path.join(DATA_DIR, 'tickets.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PROJECTS_FILE))
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects: [] }));
if (!fs.existsSync(TICKETS_FILE))
  fs.writeFileSync(TICKETS_FILE, JSON.stringify({ tickets: [] }));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

const VALID_STATUSES = ['in_progress', 'done', 'canceled'];

app.get('/api/projects', (req, res) => {
  try { res.json(readJson(PROJECTS_FILE)); }
  catch { res.status(500).json({ error: 'Could not read projects' }); }
});

app.post('/api/projects', (req, res) => {
  const { title, description, status } = req.body;
  if (!title || typeof title !== 'string')
    return res.status(400).json({ error: 'title is required' });
  const s = status || 'in_progress';
  if (!VALID_STATUSES.includes(s))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const store = readJson(PROJECTS_FILE);
    const project = {
      id: Date.now().toString(),
      title: title.trim().slice(0, 200),
      description: (description || '').trim().slice(0, 500),
      status: s,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    store.projects.push(project);
    writeJson(PROJECTS_FILE, store);
    res.status(201).json({ ok: true, project });
  } catch { res.status(500).json({ error: 'Could not save project' }); }
});

app.patch('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  if (status && !VALID_STATUSES.includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const store = readJson(PROJECTS_FILE);
    const idx = store.projects.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });
    if (title) store.projects[idx].title = title.trim().slice(0, 200);
    if (description !== undefined) store.projects[idx].description = description.trim().slice(0, 500);
    if (status) store.projects[idx].status = status;
    store.projects[idx].updated = new Date().toISOString();
    writeJson(PROJECTS_FILE, store);
    res.json({ ok: true, project: store.projects[idx] });
  } catch { res.status(500).json({ error: 'Could not update project' }); }
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  try {
    const store = readJson(PROJECTS_FILE);
    store.projects = store.projects.filter(p => p.id !== id);
    writeJson(PROJECTS_FILE, store);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Could not delete project' }); }
});

app.get('/api/tickets', (req, res) => {
  try { res.json(readJson(TICKETS_FILE)); }
  catch { res.status(500).json({ error: 'Could not read tickets' }); }
});

app.post('/api/tickets', (req, res) => {
  const { name, email, type, description } = req.body;
  if (!name || !type || !description)
    return res.status(400).json({ error: 'name, type, and description are required' });
  const VALID_TYPES = ['crash', 'bug', 'data', 'access', 'other'];
  if (!VALID_TYPES.includes(type))
    return res.status(400).json({ error: 'Invalid ticket type' });
  try {
    const store = readJson(TICKETS_FILE);
    const ticket = {
      id: Date.now().toString(),
      name: name.trim().slice(0, 120),
      email: (email || '').trim().slice(0, 200),
      type,
      description: description.trim().slice(0, 2000),
      status: 'open',
      created: new Date().toISOString()
    };
    store.tickets.push(ticket);
    writeJson(TICKETS_FILE, store);
    res.status(201).json({ ok: true, id: ticket.id });
  } catch { res.status(500).json({ error: 'Could not save ticket' }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`✅  Mr Pool Hub running on port ${PORT}`));
