const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data.sqlite3');

// ---------- Database setup ----------
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT NOT NULL DEFAULT 'step1',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    full_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,

    experience_level TEXT,
    focus_area TEXT,
    target_platform TEXT,
    project_summary TEXT,

    idea_name TEXT,
    genre TEXT,
    timeline TEXT,
    portfolio_link TEXT,
    extra_notes TEXT
  );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function now() {
  return new Date().toISOString();
}

// ---------- API ----------

// Step 1: create a new submission
app.post('/api/submissions', (req, res) => {
  const { full_name, email, phone, city } = req.body || {};
  if (!full_name || !email || !phone || !city) {
    return res.status(400).json({ error: 'همه فیلدهای فرم اول الزامی هستند.' });
  }
  const ts = now();
  const stmt = db.prepare(`
    INSERT INTO submissions (status, created_at, updated_at, full_name, email, phone, city)
    VALUES ('step1', ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(ts, ts, full_name, email, phone, city);
  res.json({ id: info.lastInsertRowid });
});

// Step 2: update an existing submission
app.put('/api/submissions/:id/step2', (req, res) => {
  const { id } = req.params;
  const { experience_level, focus_area, target_platform, project_summary } = req.body || {};
  if (!experience_level || !focus_area || !target_platform || !project_summary) {
    return res.status(400).json({ error: 'همه فیلدهای فرم دوم الزامی هستند.' });
  }
  const row = db.prepare('SELECT id FROM submissions WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'رکورد پیدا نشد.' });

  db.prepare(`
    UPDATE submissions
    SET status = 'step2', updated_at = ?, experience_level = ?, focus_area = ?, target_platform = ?, project_summary = ?
    WHERE id = ?
  `).run(now(), experience_level, focus_area, target_platform, project_summary, id);

  res.json({ ok: true });
});

// Step 3: finalize a submission
app.put('/api/submissions/:id/step3', (req, res) => {
  const { id } = req.params;
  const { idea_name, genre, timeline, portfolio_link, extra_notes } = req.body || {};
  if (!idea_name || !genre || !timeline) {
    return res.status(400).json({ error: 'فیلدهای الزامی فرم سوم پر نشده‌اند.' });
  }
  const row = db.prepare('SELECT id FROM submissions WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'رکورد پیدا نشد.' });

  db.prepare(`
    UPDATE submissions
    SET status = 'completed', updated_at = ?, idea_name = ?, genre = ?, timeline = ?, portfolio_link = ?, extra_notes = ?
    WHERE id = ?
  `).run(now(), idea_name, genre, timeline, portfolio_link || '', extra_notes || '', id);

  res.json({ ok: true });
});

// List all submissions for the dashboard
app.get('/api/submissions', (req, res) => {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
  res.json(rows);
});

// Single submission (used to resume a form if the id is still in the browser)
app.get('/api/submissions/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'رکورد پیدا نشد.' });
  res.json(row);
});

app.listen(PORT, () => {
  console.log(`✔ سرور روشن شد → http://localhost:${PORT}`);
  console.log(`✔ پایگاه داده SQLite: ${DB_PATH}`);
});
