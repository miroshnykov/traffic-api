FROM node:14.17-alpine3.14

RUN apk add --no-cache redis

RUN mkdir /tmp/recipe && chmod 755 /tmp

WORKDIR /home/app

COPY . .

EXPOSE 80

ENTRYPOINT redis-server --daemonize yes && \
        npm run start
