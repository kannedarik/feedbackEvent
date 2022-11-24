FROM docker.rupeek.com/base_image/node:14.16.1
# RUN mkdir -p /app/node_modules
COPY ./ /app
EXPOSE 3000
# command as per package.json
CMD [ "npm", "run", "start" ]