# The legacy Gatsby 1 build requires Node 8. It is isolated to the build stage;
# the production image contains only static assets and modern unprivileged nginx.
FROM node:8@sha256:a681bf74805b80d03eb21a6c0ef168a976108a287a74167ab593fc953aac34df AS build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn run build

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:44e36330f74d4f3a1d4e222acca9e23b401fb87811a7597024502bb759c4dd49

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/public /usr/share/nginx/html

USER 101:101
EXPOSE 8080
