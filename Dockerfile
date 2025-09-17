FROM node:18-alpine
LABEL "language"="nodejs"
LABEL "framework"="pokemon-showdown"
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p config && echo "TurboRx,~" > config/usergroups.csv
ENV PORT=8000
EXPOSE 8000
CMD ["node", "pokemon-showdown", "--no-build"]
