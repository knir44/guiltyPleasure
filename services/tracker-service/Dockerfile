FROM node:18-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY src/ ./src/

RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

CMD ["node", "src/app.js"]
