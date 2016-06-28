FROM node:argon

# where to house app data
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# install dependencies
COPY package.json /usr/src/app
RUN npm install

# move app data to workdir
COPY . /usr/src/app

# expose port and run npm start
EXPOSE 8443 8000
CMD ["npm", "start"]