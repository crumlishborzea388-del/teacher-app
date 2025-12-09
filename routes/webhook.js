const express = require('express');
const router = express.Router();

router.post('/telegram', async (req, res) => {
  const update = req.body;
  console.log('tg webhook update:', JSON.stringify(update).slice(0,500));
  res.json({ ok: true });
});

module.exports = router;
