# 跨时空邮局前端项目

基于 Vue 3 + Vite + Element Plus 的前端项目

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP请求)
- Vite (构建工具)

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

启动后访问：http://localhost:5173

## 构建

```bash
npm run build
```

## 预览构建结果

```bash
npm run preview
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/       # 公共组件
├── router/          # 路由配置
├── stores/          # Pinia状态管理
├── utils/           # 工具函数
│   └── api.js       # API请求封装
├── views/           # 页面组件
│   ├── Home.vue     # 首页
│   ├── Login.vue    # 登录页
│   ├── Register.vue # 注册页
│   ├── Letters.vue  # 我的信件
│   ├── Write.vue    # 写信页
│   ├── LetterDetail.vue # 信件详情
│   └── admin/       # 管理员页面
├── App.vue          # 根组件
└── main.js          # 入口文件
```

## 功能模块

- 用户认证（登录/注册）
- 信件管理（查看/创建/编辑/删除）
- AI回信生成
- 历史人物选择
- 样式配置（信纸/字体/边框）
- 管理员后台

## API代理

开发环境下，所有 `/api` 请求会自动代理到后端服务器 `http://localhost:3000`

配置在 `vite.config.js` 中。

