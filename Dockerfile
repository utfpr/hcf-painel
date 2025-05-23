FROM node:18.16-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock tsconfig.json vite.config.ts ./

RUN yarn install --production=false && \
  yarn cache clean

ARG \
  VITE_API_URL \
  VITE_IMAGE_BASE_URL

ENV \
  VITE_API_URL=$VITE_API_URL \
  VITE_IMAGE_BASE_URL=$VITE_IMAGE_BASE_URL

COPY ./public ./public
COPY ./src ./src
COPY index.html ./

RUN ls -la && yarn build

CMD rm -rf /var/www/* \
  && cp -R /usr/src/app/dist/* /var/www/ \
  && echo "The files were successfully copied" \
  && sleep 9999d
