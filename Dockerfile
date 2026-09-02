FROM node:20-alpine

WORKDIR /app

COPY services/api/package*.json ./api/
RUN cd api && npm install

COPY services/scheduler/package*.json ./scheduler/
RUN cd scheduler && npm install

COPY services/worker/package*.json ./worker/
RUN cd worker && npm install

COPY services/api ./api
COPY services/scheduler ./scheduler
COPY services/worker ./worker

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "cd /app/api && npx tsx src/index.ts & cd /app/scheduler && npx tsx src/index.ts & cd /app/worker && npx tsx src/index.ts & wait"]