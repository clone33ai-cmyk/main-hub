document.getElementById('year').textContent = new Date().getFullYear();

const API = '';

// ============================================
// PROJECT TRACKER
// ============================================
const addProjectBtn   = document.getElementById('add-project-btn');
const addProjectPanel = document.getElementById('add-project-panel');
const projTitle       = document.getElementById('proj-title');
const projDesc        = document.getElementById('proj-desc');
const projStatus      = document.getElementById('proj-status');
const projSaveBtn     = document.getElementById('proj-save-btn');
const projCancelBtn   = document.getElementById('proj-cancel-btn');
const projectsList    = document.getElementById('projects-list');

const STATUS_LABEL = { in_progress: '🔵 In Progress', done: '✅ Done', canceled: '❌ Canceled' };

addProjectBtn.addEventListener('click', () => {
  addProjectPanel.style.display = addProjectPanel.style.display === 'none' ? 'block' : 'none';
  if (addProjectPanel.style.display === 'block') projTitle.focus();
});

projCancelBtn.addEventListener('click', () => {
  addProjectPanel.style.display = 'none';
  projTitle.value = '';
  projDesc.value = '';
  projStatus.value = 'in_progress';
});

projSaveBtn.addEventListener('click', async () => {
  const title = projTitle.value.trim();
  if (!title) { projTitle.focus(); return; }
  projSaveBtn.textContent = 'Saving...';
  projSaveBtn.disabled = true;
  try {
    await fetch(`${API}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: projDesc.value.trim(), status: projStatus.value })
    });
    projTitle.value = '';
    projDesc.value = '';
    projStatus.value = 'in_progress';
    addProjectPanel.style.display = 'none';
    await loadProjects();
  } catch {
    alert('Failed to save. Try again.');
  } finally {
    projSaveBtn.textContent = 'Save Project';
    projSaveBtn.disabled = false;
  }
});

async function updateProjectStatus(id, status) {
  await fetch(`${API}/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  await loadProjects();
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await fetch(`${API}/api/projects/${id}`, { method: 'DELETE' });
  await loadProjects();
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    projectsList.innerHTML = '<p class="empty-state">No projects yet. Click "+ Add Project" to get started.</p>';
    return;
  }

  // Sort: in_progress first, then done, then canceled
  const order = { in_progress: 0, done: 1, canceled: 2 };
  const sorted = [...projects].sort((a, b) => order[a.status] - order[b.status]);

  projectsList.innerHTML = sorted.map(p => `
    <div class="project-item" data-id="${p.id}">
      <div class="project-status-dot dot-${p.status}"></div>
      <div class="project-body">
        <div class="project-title-row">
          <span class="project-title ${p.status}">${escHtml(p.title)}</span>
          <span class="status-badge status-${p.status}">${STATUS_LABEL[p.status]}</span>
        </div>
        ${p.description ? `<div class="project-desc">${escHtml(p.description)}</div>` : ''}
        <div class="project-date">Added ${new Date(p.created).toLocaleDateString()}</div>
      </div>
      <div class="project-actions">
        <button class="status-btn ${p.status === 'in_progress' ? 'active-in_progress' : ''}" onclick="updateProjectStatus('${p.id}','in_progress')">In Progress</button>
        <button class="status-btn ${p.status === 'done' ? 'active-done' : ''}" onclick="updateProjectStatus('${p.id}','done')">Done</button>
        <button class="status-btn ${p.status === 'canceled' ? 'active-canceled' : ''}" onclick="updateProjectStatus('${p.id}','canceled')">Canceled</button>
        <button class="delete-btn" onclick="deleteProject('${p.id}')" title="Delete">🗑</button>
      </div>
    </div>
  `).join('');
}

async function loadProjects() {
  try {
    const res = await fetch(`${API}/api/projects`);
    const data = await res.json();
    renderProjects(data.projects || []);
  } catch {
    projectsList.innerHTML = '<p class="empty-state">Could not load projects.</p>';
  }
}

// Make these global so inline onclick works
window.updateProjectStatus = updateProjectStatus;
window.deleteProject = deleteProject;

// ============================================
// TICKETS
// ============================================
const ticketForm    = document.getElementById('ticket-form');
const ticketSuccess = document.getElementById('ticket-success');
const submitBtn     = document.getElementById('submit-btn');
const submitLabel   = document.getElementById('submit-label');
const newTicketBtn  = document.getElementById('new-ticket-btn');
const ticketList    = document.getElementById('ticket-list');

const BADGE_CLASS = { crash:'badge-crash', bug:'badge-bug', data:'badge-data', access:'badge-access', other:'badge-other' };
const TYPE_LABEL  = { crash:'Crash', bug:'Bug', data:'Data Issue', access:'Access', other:'Other' };

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderTickets(tickets) {
  if (!tickets || tickets.length === 0) {
    ticketList.innerHTML = '<p class="empty-state">No tickets yet.</p>';
    return;
  }
  ticketList.innerHTML = tickets.slice().reverse().map(t => `
    <div class="ticket-item">
      <div class="ticket-item-header">
        <span class="ticket-name">${escHtml(t.name)}</span>
        <span class="ticket-badge ${BADGE_CLASS[t.type] || 'badge-other'}">${TYPE_LABEL[t.type] || t.type}</span>
      </div>
      <div class="ticket-desc">${escHtml(t.description)}</div>
      <div class="ticket-date">${new Date(t.created).toLocaleString()}</div>
    </div>
  `).join('');
}

async function loadTickets() {
  try {
    const res = await fetch(`${API}/api/tickets`);
    const data = await res.json();
    renderTickets(data.tickets || []);
  } catch {
    ticketList.innerHTML = '<p class="empty-state">Could not load tickets.</p>';
  }
}

ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitLabel.textContent = 'Submitting...';
  submitBtn.disabled = true;
  const payload = {
    name:        document.getElementById('t-name').value.trim(),
    email:       document.getElementById('t-email').value.trim(),
    type:        document.getElementById('t-type').value,
    description: document.getElementById('t-desc').value.trim()
  };
  try {
    await fetch(`${API}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    ticketForm.style.display = 'none';
    ticketSuccess.style.display = 'block';
    await loadTickets();
  } catch {
    alert('Failed to submit ticket. Please try again.');
  } finally {
    submitLabel.textContent = 'Submit Ticket';
    submitBtn.disabled = false;
  }
});

newTicketBtn.addEventListener('click', () => {
  ticketForm.reset();
  ticketForm.style.display = 'flex';
  ticketSuccess.style.display = 'none';
});

// ============================================
// INIT
// ============================================
loadProjects();
loadTickets();
