# ─────────────────────────────────────────────
# Stage 1: deps
# ─────────────────────────────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─────────────────────────────────────────────
# Stage 2: builder
# ─────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before building
RUN bunx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ─────────────────────────────────────────────
# Stage 3: runner
# ─────────────────────────────────────────────
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
