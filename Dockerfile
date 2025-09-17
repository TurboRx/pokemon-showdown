FROM node:18-alpine

WORKDIR /pokemon-showdown

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p config

# Create start.sh script inside Dockerfile with correct permissions
RUN echo '#!/bin/sh\n\
echo "TurboRx,~" > config/usergroups.csv\n\
node pokemon-showdown' > ./start.sh && chmod +x ./start.sh

EXPOSE 8000

CMD ["./start.sh"]
