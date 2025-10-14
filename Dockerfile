FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock tsconfig.json vite.config.ts ./

RUN yarn install --production=false && \
  yarn cache clean

ARG \
  BASE_URL \
  VITE_API_URL \
  VITE_IMAGE_BASE_URL \
  VITE_RECAPTCHA_SITE_KEY \
  VITE_ANALYTICS_APP_ID

ENV \
  BASE_URL=$BASE_URL \
  VITE_API_URL=$VITE_API_URL \
  VITE_IMAGE_BASE_URL=$VITE_IMAGE_BASE_URL \
  VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY \
  VITE_ANALYTICS_APP_ID=$VITE_ANALYTICS_APP_ID

COPY ./public ./public
COPY ./src ./src
COPY index.html ./

RUN yarn build

CMD rm -rf /var/www/* \
  && cp -R /usr/src/app/dist/* /var/www/ \
  && echo "The files were successfully copied" \
  && sleep 9999d
