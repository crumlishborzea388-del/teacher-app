const express = require('express');
const router = express.Router();
const { checkTelegramInitData } = require('../lib/telegram-verify');
const jwt = require('jsonwebtoken');

const BOT_TOKEN = process.env.BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/telegram', async (req, res) => {
  const { initData } = req.body;
  if (!initData) return res.status(400).json({ error: 'initData required' });

  try {
    const { valid, data } = checkTelegramInitData(initData, BOT_TOKEN);
    if (!valid) return res.status(401).json({ error: 'invalid initData' });

    const telegramUser = (data.user && JSON.parse(data.user)) || null;
    if (!telegramUser) return res.status(400).json({ error: 'no user data' });

    const db = req.db;
    const existing = db.data.users.find(u => u.telegram_id == telegramUser.id);
    let user;
    if (existing) {
      existing.username = telegramUser.username || existing.username;
      existing.first_name = telegramUser.first_name || existing.first_name;
      existing.avatar_url = telegramUser.photo_url || existing.avatar_url;
      user = existing;
    } else {
      user = {
        id: nanoid(),
        telegram_id: telegramUser.id,
        username: telegramUser.username || null,
        first_name: telegramUser.first_name || null,
        last_name: telegramUser.last_name || null,
        avatar_url: telegramUser.photo_url || null,
        created_at: new Date().toISOString()
      };
      db.data.users.push(user);
    }
    await db.write();

    const token = jwt.sign({ id: user.id, telegram_id: user.telegram_id }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
