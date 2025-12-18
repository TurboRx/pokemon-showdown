# Use Node.js LTS version  
FROM node:20

# Set working directory
WORKDIR /app

# Copy the entire application
COPY . .

# Create config directory and copy example config if needed
RUN mkdir -p config && \
    if [ ! -f config/config.js ]; then \
        cp config/config-example.js config/config.js; \
    fi

# Create required log directories
RUN mkdir -p logs/repl logs/chat logs/modlog logs/tickets

# Expose the default port
EXPOSE 8000

# The pokemon-showdown script will install dependencies and build on first run
# Note: In production deployments, consider mounting /app/dist as a volume 
# to persist the build across container restarts and avoid rebuild issues
CMD ["./pokemon-showdown", "start"]
