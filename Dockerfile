FROM nginx:alpine
RUN chmod +w /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY dist/digitalInno/ .
