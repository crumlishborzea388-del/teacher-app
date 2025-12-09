const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5500";
app.use(express.json());
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(session({
  name: "teacher_app_sid",
  secret: process.env.SESSION_SECRET || "change_this_secret_in_prod",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 24*60*60*1000 }
}));

const DATA_FILE = path.join(__dirname, "teachers.json");
const ADMIN_FILE = path.join(__dirname, "admin.json");
function readTeachers(){ if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]"); return JSON.parse(fs.readFileSync(DATA_FILE,"utf8"));}
function writeTeachers(arr){ fs.writeFileSync(DATA_FILE, JSON.stringify(arr,null,2));}
function readAdmin(){ if(!fs.existsSync(ADMIN_FILE)) return null; return JSON.parse(fs.readFileSync(ADMIN_FILE,"utf8"));}

// 公共 API
app.get("/api/teachers", (req,res)=>{
  let teachers = readTeachers();
  const { city,q } = req.query;
  if(city) teachers = teachers.filter(t=>(t.city||"").toLowerCase()===city.toLowerCase());
  if(q){ const key = q.toLowerCase(); teachers = teachers.filter(t=> (t.name||"").toLowerCase().includes(key)||(t.title||"").toLowerCase().includes(key)||(t.tags||[]).join(" ").toLowerCase().includes(key)); }
  res.json(teachers);
});
app.get("/api/teacher/:id", (req,res)=>{ const t = readTeachers().find(t=>String(t.id)===String(req.params.id)); res.json(t||{}); });

// admin auth
app.post("/api/admin/login", async (req,res)=>{
  const { password } = req.body;
  const admin = readAdmin();
  if(!admin) return res.status(500).json({success:false,message:"管理员未设置"});
  const ok = await bcrypt.compare(password||"", admin.hashedPassword);
  if(!ok) return res.status(401).json({success:false,message:"密码错误"});
  req.session.authenticated = true; res.json({success:true});
});
app.post("/api/admin/logout", (req,res)=>{ req.session.destroy(()=>{ res.clearCookie("teacher_app_sid"); res.json({success:true}); }); });
app.get("/api/admin/check", (req,res)=>{ res.json({authenticated:!!req.session.authenticated}); });

function requireAuth(req,res,next){ if(req.session && req.session.authenticated) return next(); res.status(401).json({success:false,message:"未授权"});}
app.post("/api/admin/save", requireAuth, (req,res)=>{
  const teachers = readTeachers();
  const body = req.body;
  if(typeof body.tags==="string") body.tags = body.tags.split(",").map(s=>s.trim()).filter(Boolean);
  if(body.id){ const idx = teachers.findIndex(t=>String(t.id)===String(body.id)); if(idx>-1) teachers[idx] = {...teachers[idx],...body,id:teachers[idx].id}; else teachers.push(body);} else { body.id=Date.now(); teachers.push(body); }
  writeTeachers(teachers); res.json({success:true});
});
app.delete("/api/admin/delete/:id", requireAuth, (req,res)=>{
  let teachers = readTeachers(); teachers = teachers.filter(t=>String(t.id)!==String(req.params.id)); writeTeachers(teachers); res.json({success:true});
});

const PORT = process.env.PORT||3000;
app.listen(PORT,()=>console.log(`Backend running on http://localhost:${PORT}`));