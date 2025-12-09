# Telegram MiniApp (MVP) — 部署说明

目录结构:
- backend/: Express + lowdb 后端（示例）
- frontend/: React + Vite 前端（Telegram WebApp 集成）
- docker-compose.yml: 用于本地开发

## 本地启动（开发）
1. 在项目根创建 `.env` 文件（参考 backend/.env.example），填写 BOT_TOKEN 和 JWT_SECRET。
2. 启动：
   - 使用 Docker Compose:
     ```
     docker-compose up --build
     ```
   - 或分别在 frontend/backend 目录运行 `npm install`，然后 `npm run dev`（frontend）和 `npm run start`（backend）。

## 生产部署建议
- 前端: 部署到 Vercel / Netlify / Cloudflare Pages（HTTPS 要求）
- 后端: Railway / Render / Heroku / DigitalOcean App；请使用 Postgres/Managed DB 而非 lowdb
- 文件存储: S3 / Cloudflare R2
- 数据库迁移: 提供 SQL 或 ORM 映射（建议使用 Prisma / TypeORM）
- CI/CD: GitHub Actions 可实现自动构建 + 部署

## 在 Telegram 中配置 WebApp
1. 将前端部署到 HTTPS URL（如 https://myapp.example.com）
2. 使用 Bot API 发送消息或设置菜单按钮，示例：
   ```
   curl -s -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{
       "chat_id": <CHAT_ID>,
       "text": "打开老师小程序",
       "reply_markup": {
         "inline_keyboard": [
           [
             {
               "text": "打开小程序",
               "web_app": { "url": "https://myapp.example.com" }
             }
           ]
         ]
       }
     }'
   ```
3. 将前端页面的 `window.Telegram.WebApp.initData` 发送到后端 `/api/auth/telegram` 完成登录验证。

## 注意事项
- 切勿将 `BOT_TOKEN`、`JWT_SECRET`、数据库凭证提交到公共仓库
- initData 验签必须严格按照 Telegram 文档进行（示例实现已包含）
- lowdb 仅用于示例与快速原型，生产请换为关系型数据库
