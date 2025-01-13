FROM node:17

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY index.js index.js

CMD ["node", "index.js"]
