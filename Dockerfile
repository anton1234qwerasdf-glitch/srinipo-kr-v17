# Base image digest recorded during the original manual build.
FROM node@sha256:438603bbb5cda404b9416f0b5c8026f61501ab911760d861ec28c36b5d675725

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY app.js ./
COPY test ./test
EXPOSE 80
CMD ["node", "app.js"]
