# Docker Deployment Guide

This guide explains how to run Pokémon Showdown using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the server:
   ```bash
   docker-compose up -d
   ```

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Stop the server:
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. Build the image:
   ```bash
   docker build -t pokemon-showdown .
   ```

2. Run the container:
   ```bash
   docker run -d -p 8000:8000 --name pokemon-showdown pokemon-showdown
   ```

3. View logs:
   ```bash
   docker logs -f pokemon-showdown
   ```

4. Stop the container:
   ```bash
   docker stop pokemon-showdown
   docker rm pokemon-showdown
   ```

## Accessing the Server

Once the server is running, visit:
- `http://localhost:8000` - If running locally
- `http://YOUR_SERVER_IP:8000` - If running on a remote server

You will be redirected to the Pokémon Showdown client interface.

## Configuration

### Admin Access

The user **TurboRx** is pre-configured as an administrator (~) in `config/usergroups.csv`.

To add more administrators:
1. Edit `config/usergroups.csv`
2. Add new lines in the format: `USERNAME,~`
3. Restart the server

### Server Settings

To customize server settings:
1. Edit `config/config.js`
2. Restart the server

The configuration file is automatically created from `config/config-example.js` if it doesn't exist.

## Data Persistence

When using Docker Compose, the following directories are mounted as volumes to persist data:
- `config/` - Server configuration and user groups
- `databases/` - Database files
- `logs/` - Server logs

## Troubleshooting

### Port already in use
If port 8000 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - "8080:8000"  # Use port 8080 instead
```

Or when using Docker directly:
```bash
docker run -d -p 8080:8000 --name pokemon-showdown pokemon-showdown
```

### Viewing server logs
```bash
# Docker Compose
docker-compose logs -f pokemon-showdown

# Docker
docker logs -f pokemon-showdown
```

### Rebuilding after code changes
```bash
# Docker Compose
docker-compose up -d --build

# Docker
docker build -t pokemon-showdown .
docker stop pokemon-showdown
docker rm pokemon-showdown
docker run -d -p 8000:8000 --name pokemon-showdown pokemon-showdown
```

## Notes

- The server will automatically install dependencies and build on first run
- The first startup may take a few minutes while dependencies are installed
- Configuration changes require a server restart to take effect
