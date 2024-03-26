ARG WORK_DIR=/build

FROM node:18.19 as builder

ARG WORK_DIR
ENV PATH ${WORK_DIR}/node_modules/.bin:$PATH

RUN mkdir ${WORK_DIR}
WORKDIR ${WORK_DIR}

COPY package.json ${WORK_DIR}
COPY package-lock.json ${WORK_DIR}

RUN npm i -g @angular/cli@13.2.0
RUN npm i --legacy-peer-deps

COPY . ${WORK_DIR}

RUN ng build --configuration production

FROM nginx:latest

ARG WORK_DIR

COPY --from=builder  ${WORK_DIR}/dist/gri /usr/share/nginx/html

# COPY ../config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD nginx -g "daemon off;"