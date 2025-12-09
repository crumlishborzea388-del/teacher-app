const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const db = req.db;
  const banners = (db.data.banners || []).filter(b => b.is_active).sort((a,b)=>a.sort_order-b.sort_order);
  const topTeachers = (db.data.teachers || []).filter(t => t.is_top).slice(0,10);
  const cities = [...new Set((db.data.teachers || []).map(t => t.city).filter(Boolean))];
  res.json({ banners, topTeachers, cities });
});

module.exports = router;
