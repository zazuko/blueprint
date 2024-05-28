# First step
FROM node:lts AS builder

ARG BUILD_DATE
ARG COMMIT
ARG VERSION

WORKDIR /src
ADD . ./
RUN npm ci
RUN sed -i "s/<BUILD_DATE>/${BUILD_DATE}/" ./projects/nilea-app/src/build/build.ts
RUN sed -i "s/<COMMIT>/${COMMIT}/" ./projects/nilea-app/src/build/build.ts
RUN sed -i "s/<VERSION>/${VERSION}/" ./projects/nilea-app/src/build/build.ts
RUN npm run build flux-library
RUN npm run build nilea-app
RUN rm -rf ./dist/flux-library

# Second step
FROM nginx:1.23.4-alpine

RUN mkdir -p /app
WORKDIR /app
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /src/dist/nilea-app .
