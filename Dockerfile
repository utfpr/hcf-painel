FROM node:18.16-alpine AS build

WORKDIR /tmp/app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_URL_IMAGE
ENV VITE_URL_IMAGE=$VITE_URL_IMAGE

COPY .yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install \
  && yarn cache clean

COPY . .

RUN yarn build

# imagem que contém os arquivos do projeto

FROM alpine:3.10 AS runtime

VOLUME /var/www

COPY --from=build /tmp/app/dist /var/app/dist

CMD rm -rf /var/www/* \
  && cp -R /var/app/dist/* /var/www/ \
  && echo "The files were successfully copied" \
  && sleep 9999d
