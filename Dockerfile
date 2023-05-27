FROM node:18

# Create app directory
WORKDIR /usr/src/app
COPY . .

RUN yarn
RUN yarn build

CMD ["sh", "-c", "yarn start"]