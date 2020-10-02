# need .env file to be mounted to /server
# -v [dir/.env:/server/.env]
FROM keymetrics/pm2:14-alpine

EXPOSE 3000

COPY ./bin /server/bin
COPY ./static /server/static
COPY package.json /server
COPY ./dist /server/dist
COPY ecosystem.config.js /server

WORKDIR /server

RUN npm install --production

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
