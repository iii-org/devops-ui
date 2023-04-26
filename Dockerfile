FROM dockerhub/library/node:16 as build-stage
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN git rev-parse HEAD > git_commit && echo "1.28.1" > git_tag && git log -1 --date=iso8601 --format="%ad" > git_date
RUN echo -e "\nVUE_APP_COMMIT='$(cat git_commit)'\nVUE_APP_TAG='$(cat git_tag)'\nVUE_APP_DATE='$(cat git_date)'" >> .env.production
RUN yarn run build:prod

FROM dockerhub/library/nginx:1.24-alpine-perl
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/default.conf.template /etc/nginx/templates/default.conf.template
ENV API_URL=http://devopsapi-service:10009/
RUN chmod -R 775 /usr/share/nginx/html
EXPOSE 80
