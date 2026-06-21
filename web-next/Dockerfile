# United Hotels — Frontend (Next.js, standalone output).
# NEXT_PUBLIC_* vars are inlined at BUILD time, so they're passed as build args.
# Server-only vars (BACKEND_URL, PRICING_URL) are read at runtime.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build-time public config (baked into the client bundle).
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_URL=https://bookunitedhotels.com
ARG NEXT_PUBLIC_ISBANK_ENABLED=true
ARG NEXT_PUBLIC_SUPPORT_WHATSAPP=905449580798
ARG NEXT_PUBLIC_SUPPORT_PHONE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ISBANK_ENABLED=$NEXT_PUBLIC_ISBANK_ENABLED \
    NEXT_PUBLIC_SUPPORT_WHATSAPP=$NEXT_PUBLIC_SUPPORT_WHATSAPP \
    NEXT_PUBLIC_SUPPORT_PHONE=$NEXT_PUBLIC_SUPPORT_PHONE \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Standalone server + static assets only — minimal runtime image.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
