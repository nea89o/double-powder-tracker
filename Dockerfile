FROM node:22
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY src ./src
ENTRYPOINT ["npm", "start"]
