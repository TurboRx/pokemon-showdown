FROM node:18-alpine

WORKDIR /pokemon-showdown

COPY package*.json ./
RUN npm install --production

COPY . .

# Create config directory
RUN mkdir -p config

# Add entry point script to create usergroups.csv with TurboRx as admin
RUN echo '#!/bin/sh\n\
echo "TurboRx,~" > config/usergroups.csv\n\
node pokemon-showdown' > start.sh && chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
