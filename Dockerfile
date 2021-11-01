FROM node:16 as build-stage
WORKDIR /app
RUN npm install -g yarn
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn run build:stage

FROM nginx:1.19
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
