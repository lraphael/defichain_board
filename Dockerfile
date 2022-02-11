FROM node:16-alpine

RUN apk update && \
    apk --no-cache upgrade && \
    apk --no-cache add bash bash-completion git && \
    rm -rf /var/cache/apk/*

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY docker/profile /root/.profile
RUN chmod 775 /root/.profile

WORKDIR /app

COPY package*.json /app/
RUN npm ci

ENTRYPOINT ["/entrypoint.sh"]
CMD [""]
