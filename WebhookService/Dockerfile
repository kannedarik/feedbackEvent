FROM node:12-alpine AS builder

RUN mkdir -p /home/code/app/node_modules && chown -R node:node /home/code/app

# Set work directory
WORKDIR /home/code/app

# Install app dependencies
COPY package*.json ./
USER node
RUN npm install --production

FROM node:12-alpine

# Set work directory
WORKDIR /home/code/app

COPY --from=builder /home/code/app/node_modules ./node_modules

# application files are owned by the non-root node user
COPY --chown=node:node . .

# expose the port to outside world
EXPOSE 3000

# command as per package.json
CMD [ "npm", "run", "docker:start" ]
