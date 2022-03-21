# STAGE 1
FROM node:16-alpine as builder
RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY package*.json ./
RUN npm config set unsafe-perm true
RUN npm install -g typescript
RUN npm install -g ts-node
# USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build

# STAGE 2
FROM node:16-alpine
RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY package*.json ./
# USER node

# # RUN npm install --save-dev sequelize-cli
# RUN npm install --production
COPY --from=builder /app/build ./build

# COPY --chown=node:node .env .
# COPY --chown=node:node .sequelizerc .
# COPY --chown=node:node  /config ./config
# COPY --chown=node:node  /public ./public


# RUN npx sequelize db:seed:all; exit 0
# RUN npm un sequelize-cli

# EXPOSE 2700
CMD [ "node", "build/index.js" ]