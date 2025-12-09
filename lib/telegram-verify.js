const crypto = require('crypto');

function parseInitData(initData) {
  const params = {};
  // try &-separated
  if (typeof initData === 'string' && initData.indexOf('&') !== -1) {
    initData.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) params[k] = decodeURIComponent(v || '');
    });
    return params;
  }
  // try newline separated k=v
  initData.split('\n').forEach(line => {
    if (!line) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const k = line.slice(0, idx);
    const v = line.slice(idx + 1);
    params[k] = v;
  });
  return params;
}

function checkTelegramInitData(initDataRaw, botToken) {
  const params = parseInitData(initDataRaw);
  if (!params || !params.hash) {
    return { valid: false, data: params };
  }

  const checkKeys = Object.keys(params).filter(k => k !== 'hash').sort();
  const dataCheckArr = checkKeys.map(k => `${k}=${params[k]}`);
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const receivedHash = params.hash;
  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(receivedHash));
  } catch(e) {
    valid = false;
  }
  return { valid, data: params };
}

module.exports = { checkTelegramInitData, parseInitData };
