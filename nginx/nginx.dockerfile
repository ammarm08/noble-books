FROM nginx

RUN mkdir /etc/nginx/logs/
RUN touch /etc/nginx/logs/error.log

# copy nginx config file
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80