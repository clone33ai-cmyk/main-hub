# 💧 Mr Pool Leak Repair — Internal Hub

A private internal dashboard with:
- **Links** to your website and spreadsheets
- **"What I'm Working On"** status board (editable)
- **Ticket system** — anyone can submit if something breaks

---

## 🚀 Deploy to Railway (step by step)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial hub"
git remote add origin https://github.com/YOUR_USERNAME/mr-pool-hub.git
git push -u origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project → Deploy from GitHub Repo**
3. Select this repository
4. Railway will auto-detect Node.js and deploy ✅
5. Go to **Settings → Networking → Generate Domain** to get your public URL

That's it — no environment variables needed.

---

## ✏️ Customize your links

Open `public/index.html` and update these placeholders:

| Placeholder | Replace with |
|---|---|
| `YOUR_WEBSITE_URL_HERE` | Your actual website URL |
| `YOUR_SPREADSHEET_1_URL_HERE` | Google Sheet / Excel link |
| `YOUR_SPREADSHEET_2_URL_HERE` | Second spreadsheet link |

To **add more cards**, copy any `<a class="card">` block in the `#projects-grid` section.

---

## 📁 Project Structure

```
mr-pool-hub/
├── public/
│   ├── index.html    ← Main page (edit links here)
│   ├── style.css     ← All styles
│   └── app.js        ← Frontend logic
├── server.js         ← Express backend (API + static files)
├── package.json
├── .gitignore
└── README.md
```

Data is stored in a `data/` folder (auto-created, gitignored):
- `data/wip.json` — current "working on" status
- `data/tickets.json` — all submitted tickets

---

## 🛠️ Run locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## ➕ Roadmap ideas

- Email notification when a ticket is submitted
- Password protect the hub
- Mark tickets as resolved
- Add more tool cards (CRM, invoicing, etc.)
