FROM node:alpine
WORKDIR /usr/src/app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN  yarn install
COPY ./server.js ./
CMD ["npm", "start"] 