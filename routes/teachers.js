const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// list teachers with filters
router.get('/', (req, res) => {
  const db = req.db;
  const { city, level, page = 1, pageSize = 20, search } = req.query;
  let items = (db.data.teachers || []).slice();
  if (city) items = items.filter(t => t.city === city);
  if (level && level !== 'all') items = items.filter(t => t.level === level);
  if (search) items = items.filter(t => (t.name||'').includes(search) || (t.bio||'').includes(search));
  const rank = { diamond: 3, gold: 2, normal: 1 };
  items.sort((a,b) => {
    if ((rank[b.level]||0) - (rank[a.level]||0) !== 0) return (rank[b.level]||0) - (rank[a.level]||0);
    if ((b.is_top?1:0) - (a.is_top?1:0) !== 0) return (b.is_top?1:0) - (a.is_top?1:0);
    return 0;
  });
  const total = items.length;
  const start = (page-1)*pageSize;
  const paged = items.slice(start, start+Number(pageSize));
  res.json({ items: paged, total });
});

// get teacher detail
router.get('/:id', (req, res) => {
  const db = req.db;
  const t = (db.data.teachers || []).find(x => x.id == req.params.id);
  if (!t) return res.status(404).json({ error: 'not found' });
  const courses = (db.data.courses || []).filter(c => c.teacher_id == t.id);
  const feedbacks = (db.data.feedbacks || []).filter(f => f.teacher_id == t.id && f.status === 'approved');
  const avg = feedbacks.length ? (feedbacks.reduce((s,r)=>s+r.rating,0)/feedbacks.length).toFixed(2) : null;
  res.json({ teacher: t, courses, feedbacks, avg_rating: avg });
});

// submit feedback (auth required)
router.post('/:id/feedbacks', authMiddleware, async (req, res) => {
  const db = req.db;
  const t = (db.data.teachers || []).find(x => x.id == req.params.id);
  if (!t) return res.status(404).json({ error: 'teacher not found' });
  const { rating, text, image_urls } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'invalid rating' });
  const fb = {
    id: Date.now().toString(),
    teacher_id: t.id,
    user_id: req.user.id,
    rating,
    text: text || '',
    image_urls: image_urls || [],
    status: 'approved',
    created_at: new Date().toISOString()
  };
  db.data.feedbacks.push(fb);
  await db.write();
  res.json({ success: true, feedback: fb });
});

module.exports = router;
