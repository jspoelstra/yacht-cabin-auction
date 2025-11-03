.PHONY: help build run stop restart logs clean rebuild shell test health ps up down

# Variables
IMAGE_NAME = yacht-cabin-auction
CONTAINER_NAME = yacht-auction
HOST_PORT = 5001
CONTAINER_PORT = 5000

# Default target
help:
	@echo "Yacht Cabin Auction - Docker Management"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build      - Build the Docker image"
	@echo "  run        - Run the container in detached mode"
	@echo "  stop       - Stop the running container"
	@echo "  restart    - Restart the container"
	@echo "  logs       - View container logs (follow mode)"
	@echo "  clean      - Stop and remove container"
	@echo "  rebuild    - Clean, build, and run"
	@echo "  shell      - Open a shell in the running container"
	@echo "  test       - Test the application endpoint"
	@echo "  health     - Check container health status"
	@echo "  ps         - Show running containers"
	@echo "  up         - Start with docker-compose"
	@echo "  down       - Stop docker-compose containers"
	@echo ""
	@echo "Quick start: make rebuild"

# Build the Docker image
build:
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .

# Run the container
run:
	@echo "Starting container on port $(HOST_PORT)..."
	docker run -d \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		--name $(CONTAINER_NAME) \
		$(IMAGE_NAME)
	@echo "Container started at http://localhost:$(HOST_PORT)"

# Stop the container
stop:
	@echo "Stopping container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true

# Restart the container
restart: stop
	@echo "Starting container..."
	@docker start $(CONTAINER_NAME)

# View logs
logs:
	@echo "Streaming container logs (Ctrl+C to exit)..."
	docker logs -f $(CONTAINER_NAME)

# Clean up - stop and remove container
clean: stop
	@echo "Removing container..."
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true

# Full rebuild - clean, build, and run
rebuild: clean
	@echo "Rebuilding application..."
	@$(MAKE) build
	@$(MAKE) run

# Open shell in running container
shell:
	@echo "Opening shell in container..."
	docker exec -it $(CONTAINER_NAME) sh

# Test the application
test:
	@echo "Testing application endpoint..."
	@curl -s http://localhost:$(HOST_PORT) | head -20 || echo "Error: Container not responding"

# Check health status
health:
	@echo "Container health status:"
	@docker inspect --format='{{.State.Status}}: {{.State.Health.Status}}' $(CONTAINER_NAME) 2>/dev/null || echo "Container not running"

# Show running containers
ps:
	@docker ps --filter "name=$(CONTAINER_NAME)"

# Docker Compose commands
up:
	@echo "Starting with docker-compose..."
	docker-compose up -d
	@echo "Application running at http://localhost:$(HOST_PORT)"

down:
	@echo "Stopping docker-compose containers..."
	docker-compose down

# Build without cache
build-no-cache:
	@echo "Building Docker image (no cache)..."
	docker build --no-cache -t $(IMAGE_NAME) .

# Remove image
clean-image:
	@echo "Removing Docker image..."
	@docker rmi $(IMAGE_NAME) 2>/dev/null || true

# Full clean - remove container and image
clean-all: clean clean-image
	@echo "Cleanup complete"

# Show resource usage
stats:
	@echo "Container resource usage:"
	@docker stats --no-stream $(CONTAINER_NAME)

# Export logs to file
logs-export:
	@echo "Exporting logs to yacht-auction.log..."
	@docker logs $(CONTAINER_NAME) > yacht-auction.log
	@echo "Logs exported to yacht-auction.log"
