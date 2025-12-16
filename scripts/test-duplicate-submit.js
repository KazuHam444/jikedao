const axios = require('axios');
const apiBase = process.env.API_BASE || 'http://localhost:3000';

async function login(username, password) {
  const res = await axios.post(`${apiBase}/api/auth/login`, { username, password });
  return res.data.data.token;
}

async function testDuplicate(token) {
  const unique = Date.now();
  const payload = {
    figure_id: 1,
    title: `测试重复提交 ${unique}`,
    content: `这是一条用于测试重复提交保护的信件内容。时间戳: ${unique}`
  };

  const headers = { Authorization: `Bearer ${token}` };

  // 并发发送两次
  const p1 = axios.post(`${apiBase}/api/letters`, payload, { headers });
  const p2 = axios.post(`${apiBase}/api/letters`, payload, { headers });

  const results = await Promise.allSettled([p1, p2]);

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`请求 ${i + 1} 成功:`, r.value.data);
    } else {
      if (r.reason && r.reason.response) {
        console.log(`请求 ${i + 1} 返回状态 ${r.reason.response.status}:`, r.reason.response.data);
      } else {
        console.log(`请求 ${i + 1} 失败:`, r.reason.message);
      }
    }
  });
}

(async () => {
  const username = process.argv[2];
  const password = process.argv[3];
  if (!username || !password) {
    console.error('用法: node test-duplicate-submit.js <username> <password>');
    process.exit(1);
  }

  try {
    const token = await login(username, password);
    console.log('登录成功，开始并发测试...');
    await testDuplicate(token);
  } catch (e) {
    console.error('测试失败:', e.response ? e.response.data : e.message);
    process.exit(1);
  }
})();