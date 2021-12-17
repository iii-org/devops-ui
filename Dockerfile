FROM dockerhub/library/node:16 as build-stage
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .
RUN yarn run build:stage

FROM dockerhub/library/nginx:1.19
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /default.conf.tmpl /etc/nginx/conf.d/default.conf.tmpl
RUN chmod -R 775 /usr/share/nginx/html
RUN chmod 775 /etc/nginx/conf.d/default.conf
RUN chmod a+x /run_ui.pl
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
CMD ["/run_ui.pl"]
