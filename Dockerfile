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

RUN cd api && npm run build
RUN cd scheduler && npm run build
RUN cd worker && npm run build

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "node /app/api/dist/index.js & node /app/scheduler/dist/index.js & node /app/worker/dist/index.js & wait -n"]