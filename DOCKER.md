# Docker Deployment Guide

This guide provides detailed instructions for building, running, and managing the Yacht Cabin Auction application using Docker.

## Quick Start

The fastest way to run the application locally with Docker:

**Using Makefile (Recommended):**
```bash
make rebuild    # Build and run the container
```

**Using Docker Compose:**
```bash
docker-compose up --build
```

Access the application at `http://localhost:5001`

> **Note for macOS users:** Port 5000 is often used by macOS Control Center (AirPlay Receiver). This configuration uses port 5001 to avoid conflicts.

## Makefile Commands

The project includes a Makefile for convenient Docker management:

```bash
make help       # Show all available commands
make build      # Build the Docker image
make run        # Run the container in detached mode
make stop       # Stop the running container
make restart    # Restart the container
make logs       # View container logs (follow mode)
make clean      # Stop and remove container
make rebuild    # Clean, build, and run (fresh start)
make shell      # Open a shell in the running container
make test       # Test the application endpoint
make health     # Check container health status
make ps         # Show running containers
make up         # Start with docker-compose
make down       # Stop docker-compose containers
```

**Common workflows:**

First time setup:
```bash
make rebuild
```

View logs:
```bash
make logs
```

Restart after code changes:
```bash
make rebuild
```

Clean up everything:
```bash
make clean
```

## Docker Architecture

The application uses a multi-stage Docker build:

1. **Builder stage**: Installs dependencies and builds the Vite application
2. **Production stage**: Creates a minimal image with only production dependencies and the built application

This approach results in a smaller final image size and faster deployment times.

## Building the Image

### Using Docker Compose
```bash
docker-compose build
```

### Using Docker directly
```bash
docker build -t yacht-cabin-auction .
```

To rebuild without cache:
```bash
docker build --no-cache -t yacht-cabin-auction .
```

## Running the Container

### Using Docker Compose (Recommended)

**Foreground mode** (see logs in terminal):
```bash
docker-compose up
```

**Background mode** (detached):
```bash
docker-compose up -d
```

**With rebuild**:
```bash
docker-compose up --build
```

### Using Docker directly

**Basic run** (foreground):
```bash
docker run -p 5001:5000 --name yacht-auction yacht-cabin-auction
```

**Detached mode** (recommended):
```bash
docker run -d -p 5001:5000 --name yacht-auction yacht-cabin-auction
```
Access at `http://localhost:5001`

> **Important:** Port 5000 is often blocked on macOS by Control Center. Use port 5001 or another available port.

**Custom port**:
```bash
docker run -d -p 8080:5000 --name yacht-auction yacht-cabin-auction
```
Access at `http://localhost:8080`

**With environment variables**:
```bash
docker run -d -p 5001:5000 -e PORT=5000 --name yacht-auction yacht-cabin-auction
```

## Managing Containers

### Using Docker Compose

**View logs**:
```bash
docker-compose logs
docker-compose logs -f  # Follow mode
```

**Stop containers**:
```bash
docker-compose stop
```

**Stop and remove containers**:
```bash
docker-compose down
```

**Restart containers**:
```bash
docker-compose restart
```

### Using Docker directly

**View logs**:
```bash
docker logs yacht-auction
docker logs -f yacht-auction  # Follow mode
```

**Stop container**:
```bash
docker stop yacht-auction
```

**Start stopped container**:
```bash
docker start yacht-auction
```

**Restart container**:
```bash
docker restart yacht-auction
```

**Remove container**:
```bash
docker rm yacht-auction
```

**Remove container (force)**:
```bash
docker rm -f yacht-auction
```

## Health Checks

The container includes a health check that runs every 30 seconds to verify the application is responding.

**Check container health status**:
```bash
docker ps
```

Look for the health status in the STATUS column.

**View detailed health check logs**:
```bash
docker inspect --format='{{json .State.Health}}' yacht-auction | jq
```

## Troubleshooting

### Container won't start

1. **Port already in use** (common on macOS with port 5000):
```bash
lsof -i :5001  # Check if port 5001 is in use
```

On macOS, port 5000 is typically used by Control Center (AirPlay Receiver). Use port 5001 or disable AirPlay Receiver in System Settings > General > AirDrop & Handoff.

2. View container logs:
```bash
docker logs yacht-auction
```

3. Try running with a different port:
```bash
docker run -d -p 8080:5000 --name yacht-auction yacht-cabin-auction
```

### Application not accessible

1. Verify container is running:
```bash
docker ps
```

2. Check container health:
```bash
docker inspect yacht-auction
```

3. Test from inside the container:
```bash
docker exec yacht-auction wget -O- http://localhost:5000
```

4. Verify port mapping:
```bash
docker port yacht-auction
```
Should show: `5000/tcp -> 0.0.0.0:5001`

### Build failures

1. Clear Docker cache and rebuild:
```bash
docker build --no-cache -t yacht-cabin-auction .
```

2. Check for syntax errors in Dockerfile:
```bash
docker build --progress=plain -t yacht-cabin-auction .
```

### State persistence issues

Remember: The application uses in-memory state. All auction data is lost when the container stops or restarts. This is by design as outlined in the PRD.

To reset the application:
1. Stop the container
2. Start it again - you'll get a fresh state
3. Admin can reinitialize the auction from the setup screen

## Image Management

### List images
```bash
docker images
```

### Remove image
```bash
docker rmi yacht-cabin-auction
```

### Remove unused images
```bash
docker image prune
```

### View image details
```bash
docker inspect yacht-cabin-auction
```

### Check image size
```bash
docker images yacht-cabin-auction
```

## Advanced Usage

### Running with custom environment variables

Create a `.env` file:
```env
PORT=5000
NODE_ENV=production
```

Then run with Docker Compose (it automatically reads .env files):
```bash
docker-compose up
```

### Accessing the container shell

```bash
docker exec -it yacht-auction sh
```

### Copying files from container

```bash
docker cp yacht-auction:/app/dist ./local-dist
```

### Viewing resource usage

```bash
docker stats yacht-auction
```

## Azure Deployment Preparation

Before deploying to Azure Container Apps:

1. Tag the image for Azure Container Registry:
```bash
docker tag yacht-cabin-auction <your-acr>.azurecr.io/yacht-cabin-auction:latest
```

2. Push to ACR (after logging in):
```bash
docker push <your-acr>.azurecr.io/yacht-cabin-auction:latest
```

3. Deploy to Azure Container Apps using Azure CLI or Portal

See the [PRD.md](PRD.md) for full deployment architecture details.
