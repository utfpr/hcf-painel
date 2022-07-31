FROM node:12.13 AS build

WORKDIR /tmp/app

ARG CI
ENV CI=$CI

ARG GENERATE_SOURCEMAP
ENV GENERATE_SOURCEMAP=$GENERATE_SOURCEMAP

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ARG REACT_APP_URL_IMAGE
ENV REACT_APP_URL_IMAGE=$REACT_APP_URL_IMAGE

ARG REACT_APP_RECAPTCHA_KEY
ENV REACT_APP_RECAPTCHA_KEY=$REACT_APP_RECAPTCHA_KEY

COPY .yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install \
  && yarn cache clean

COPY . .

RUN yarn build

# imagem que contém os arquivos do projeto

FROM alpine:3.10 AS runtime

VOLUME /var/www

COPY --from=build /tmp/app/build /var/app/build

CMD rm -rf /var/www/* \
  && cp -R /var/app/build/* /var/www/ \
  && echo "The files were successfully copied" \
  && sleep 9999d
