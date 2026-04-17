/* ============================================
   MR POOL LEAK REPAIR — HUB APP JS
============================================ */

document.getElementById('year').textContent = new Date().getFullYear();

const API = ''; // same origin — Railway will serve both

// ============================================
// WIP STATUS
// ============================================
const wipText    = document.getElementById('wip-text');
const wipUpdated = document.getElementById('wip-updated');
const wipEditBtn = document.getElementById('wip-edit-btn');
const wipPanel   = document.getElementById('wip-edit-panel');
const wipInput   = document.getElementById('wip-input');
const wipSaveBtn = document.getElementById('wip-save-btn');
const wipCancel  = document.getElementById('wip-cancel-btn');

async function loadWip() {
  try {
    const res = await fetch(`${API}/api/wip`);
    const data = await res.json();
    wipText.textContent = data.text || 'No status set yet. Click ✏️ Edit to add one.';
    if (data.updated) {
      wipUpdated.textContent = 'Last updated: ' + new Date(data.updated).toLocaleString();
    }
    wipInput.value = data.text || '';
  } catch {
    wipText.textContent = 'Could not load status.';
  }
}

wipEditBtn.addEventListener('click', () => {
  wipPanel.style.display = wipPanel.style.display === 'none' ? 'block' : 'none';
});

wipCancel.addEventListener('click', () => {
  wipPanel.style.display = 'none';
});

wipSaveBtn.addEventListener('click', async () => {
  const newText = wipInput.value.trim();
  if (!newText) return;
  wipSaveBtn.textContent = 'Saving...';
  wipSaveBtn.disabled = true;
  try {
    await fetch(`${API}/api/wip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText })
    });
    wipPanel.style.display = 'none';
    await loadWip();
  } catch {
    alert('Failed to save. Please try again.');
  } finally {
    wipSaveBtn.textContent = 'Save Status';
    wipSaveBtn.disabled = false;
  }
});

// ============================================
// TICKETS
// ============================================
const ticketForm    = document.getElementById('ticket-form');
const ticketSuccess = document.getElementById('ticket-success');
const submitBtn     = document.getElementById('submit-btn');
const submitLabel   = document.getElementById('submit-label');
const newTicketBtn  = document.getElementById('new-ticket-btn');
const ticketList    = document.getElementById('ticket-list');

const BADGE_CLASS = {
  crash:  'badge-crash',
  bug:    'badge-bug',
  data:   'badge-data',
  access: 'badge-access',
  other:  'badge-other'
};

const TYPE_LABEL = {
  crash:  'Crash',
  bug:    'Bug',
  data:   'Data Issue',
  access: 'Access',
  other:  'Other'
};

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

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
loadWip();
loadTickets();
