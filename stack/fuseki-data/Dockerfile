FROM docker.io/library/alpine:latest
WORKDIR /app
RUN apk add --no-cache curl
COPY load-data.sh .
CMD [ "/app/load-data.sh" ]
