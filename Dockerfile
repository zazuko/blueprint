# First step: build the app
FROM docker.io/library/node:20 AS builder

ARG BUILD_DATE
ARG COMMIT
ARG VERSION

WORKDIR /app
ADD . ./
RUN npm ci
RUN sed -i "s/<BUILD_DATE>/${BUILD_DATE}/" ./projects/blueprint/src/build/build.ts
RUN sed -i "s/<COMMIT>/${COMMIT}/" ./projects/blueprint/src/build/build.ts
RUN sed -i "s/<VERSION>/${VERSION}/" ./projects/blueprint/src/build/build.ts
RUN npm run build blueprint

# Second step: serve the builded app
FROM nginx:1.23.4-alpine

RUN mkdir -p /app
WORKDIR /app
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/blueprint/browser/ .

EXPOSE 80
