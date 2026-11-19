# The legacy Gatsby 1 build requires Node 8. It is isolated to the build stage;
# the production image contains only static assets and modern unprivileged nginx.
FROM node:8@sha256:a681bf74805b80d03eb21a6c0ef168a976108a287a74167ab593fc953aac34df AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn run build

FROM nginx/nginx-unprivileged:1.30.7-alpine@sha256:0c53a1f2890c3526bfd201440f0fd3970e5b78f80630f58284aad0d34b5ec7bd

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/public /usr/share/nginx/html

USER 101:101
EXPOSE 8080
