require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const path = require('path');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const teacherRoutes = require('./routes/teachers');
const webhookRoutes = require('./routes/webhook');

const PORT = process.env.PORT || 4000;

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));

  // lowdb init (DB file under db/db.json)
  const file = path.join(__dirname, 'db', 'db.json');
  const adapter = new JSONFile(file);
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || { users: [], teachers: [], courses: [], feedbacks: [], banners: [], files: [] };

  // attach db to req for simple access
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/home', homeRoutes);
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/webhook', webhookRoutes);

  // serve a tiny health check on root
  app.get('/', (req, res) => res.send('Telegram MiniApp Backend'));

  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

createServer().catch(err => {
  console.error('Failed to start server', err);
});
