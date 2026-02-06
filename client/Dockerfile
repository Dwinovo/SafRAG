# Stage 1: Install dependencies
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm install --legacy-peer-deps

# Stage 2: Build the app
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 禁用 Next.js 遥测数据收集
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Production image
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 只需要复制 standalone 构建结果和 public 目录
COPY --from=builder /app/public ./public

# 自动利用 standalone 模式减少镜像体积
#如果不开启 standalone，这里需要复制整个 .next 和 node_modules
# 为了兼容性，这里我们假设没有开启 standalone 模式，复制完整构建
# 更好的做法是在 next.config.mjs 中开启 output: 'standalone'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# server.js 是 standalone 模式的入口
CMD ["node", "server.js"]