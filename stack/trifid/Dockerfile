FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD [ "tini", "--", "npm", "run", "start" ]
EXPOSE 8080
