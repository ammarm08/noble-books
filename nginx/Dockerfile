FROM nginx

RUN mkdir /etc/nginx/logs/
RUN touch /etc/nginx/logs/error.log

# ssl keys and certs
COPY ./ssl/private/bookswell.csr /etc/ssl/private/
COPY ./ssl/private/bookswell.key /etc/ssl/private/
COPY ./ssl/certs/www_bookswell_io.certchain.crt /etc/ssl/certs/

# copy nginx config file
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443