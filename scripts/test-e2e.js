#!/usr/bin/env node
/**
 * 简单的本地 E2E 测试脚本（需要后端 `http://localhost:3000` 运行）
 * 流程：注册临时用户 -> 登录 -> 创建信件 -> 触发生成回信 -> 点赞 -> 评论 -> 拉取通知
 * 注意：仅用于本地开发环境测试，CI 不会运行此脚本（CI 可能没有数据库或服务）。
 */

const axios = require('axios');

const base = 'http://localhost:3000/api';

async function run(){
  try{
    // 1. 随机用户注册
    const username = `e2e_user_${Date.now()%10000}`;
    const password = 'password123';
    console.log('注册用户', username);
    await axios.post(base + '/auth/register', { username, password, email: `${username}@example.com` }).catch(()=>{});

    // 2. 登录
    const loginRes = await axios.post(base + '/auth/login', { username, password });
    if(!loginRes.data.success) throw new Error('登录失败');
    const token = loginRes.data.data.token;
    console.log('登录成功，token长度=', token.length);

    const client = axios.create({ baseURL: base, headers: { Authorization: `Bearer ${token}` } });

    // 3. 创建信件（使用第一个历史人物）
    const figures = await client.get('/figures');
    const figureId = figures.data.data[0].figure_id;
    const createRes = await client.post('/letters', { figure_id: figureId, title: 'E2E 测试信', content: '这是 E2E 测试内容。', is_public: true });
    const letterId = createRes.data.data.letter_id;
    console.log('创建信件', letterId);

    // 4. 触发生成回信（可能需要较长时间）
    console.log('触发回信生成（等待结果）...');
    await client.post(`/replies/generate/${letterId}`).catch(err=>{ console.warn('生成回信请求返回：', err.response?.data || err.message) });

    // 5. 点赞
    await client.post('/likes/toggle', { letter_id: letterId });
    console.log('已点赞');

    // 6. 评论
    await client.post('/comments', { letter_id: letterId, content: 'E2E 自动评论测试' });
    console.log('已评论');

    // 7. 获取通知
    const notes = await client.get('/notifications');
    console.log('通知数量：', notes.data.data.length);

    console.log('\nE2E 测试完成（本地）');
  }catch(err){
    console.error('E2E 运行出错：', err.response?.data || err.message || err);
    process.exit(1);
  }
}

run();
