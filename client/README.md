# HierarchicalRAG Client (Next.js + Tailwind + shadcn)

## 开发启动

1. 进入目录并安装依赖：

```bash
cd Client
pnpm i # 或 npm i / yarn
```

2. 配置后端代理（Spring Boot）

- 将 `.env.local.example` 复制为 `.env.local`，并根据你的后端地址修改：

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080
```

- Next 在开发环境会把 `/api/**` 请求转发到 `${NEXT_PUBLIC_BACKEND_BASE_URL}/api/**`。

3. 运行开发服务器：

```bash
pnpm dev # 或 npm run dev / yarn dev
```

访问 http://localhost:3000

## 功能说明
- 顶部导航、右上角“登录”按钮
- 登录弹窗使用 shadcn 组件（button、input、label、dialog）
- 登录接口：`POST /api/auth/login`，请求体：`{ username, password }`

## 目录结构
- `app/`：App Router 页面
- `components/ui/`：shadcn 组件
- `lib/utils.ts`：`cn` 工具
