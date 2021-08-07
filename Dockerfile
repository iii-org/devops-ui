FROM nginx:1.19
RUN git rev-parse HEAD > git_commit && git log -1 --date=iso8601 --format="%ad" > git_date && git describe --abbrev=0 --tags --always > git_tag && echo -e "VUE_APP_COMMIT='$(cat git_commit)'\nVUE_APP_TAG='$(cat git_tag)'\nVUE_APP_DATE='$(cat git_date)'" >> .env.staging
COPY ./dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
