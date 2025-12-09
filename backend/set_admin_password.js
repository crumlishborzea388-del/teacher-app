const readline = require('readline');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('输入新的管理员密码: ', async (pw) => {
  if (!pw) { console.log('密码不能为空'); rl.close(); process.exit(1); }
  const hash = await bcrypt.hash(pw, 10);
  const admin = { hashedPassword: hash };
  fs.writeFileSync(path.join(__dirname, 'admin.json'), JSON.stringify(admin, null, 2));
  console.log('管理员密码已保存到 backend/admin.json');
  rl.close();
});