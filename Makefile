.PHONY: help build run stop restart logs clean rebuild shell test health ps up down \
	azure-login azure-acr-create azure-acr-login azure-build azure-push azure-deploy \
	azure-redeploy azure-logs azure-status azure-stop azure-start azure-delete azure-cleanup

# Variables
IMAGE_NAME = yacht-cabin-auction
CONTAINER_NAME = yacht-auction
HOST_PORT = 5001
CONTAINER_PORT = 5000

# Azure Variables (override with environment variables or make azure-deploy AZURE_RG=mygroup)
AZURE_RG ?= yacht-auction-rg
AZURE_ACR_NAME ?= yachtauctionacr
AZURE_ACI_NAME ?= yacht-auction-aci
AZURE_LOCATION ?= westus
AZURE_IMAGE_TAG ?= latest
AZURE_FULL_IMAGE = $(AZURE_ACR_NAME).azurecr.io/$(IMAGE_NAME):$(AZURE_IMAGE_TAG)

# Default target
help:
	@echo "Yacht Cabin Auction - Docker Management"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Local Docker Targets:"
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
	@echo "Azure Container Instances Targets:"
	@echo "  azure-login      - Login to Azure CLI"
	@echo "  azure-acr-create - Create Azure Container Registry"
	@echo "  azure-acr-login  - Login to Azure Container Registry"
	@echo "  azure-build      - Build image for AMD64 and push to ACR"
	@echo "  azure-push       - Push local image to ACR"
	@echo "  azure-deploy     - Deploy to Azure Container Instances"
	@echo "  azure-redeploy   - Full redeploy (build, push, deploy)"
	@echo "  azure-logs       - View ACI container logs"
	@echo "  azure-status     - Check ACI deployment status"
	@echo "  azure-stop       - Stop the ACI container"
	@echo "  azure-start      - Start the ACI container"
	@echo "  azure-delete     - Delete the ACI container instance"
	@echo "  azure-cleanup    - Delete ACI and ACR resources"
	@echo ""
	@echo "Azure Configuration (set via environment or make params):"
	@echo "  AZURE_RG=$(AZURE_RG)"
	@echo "  AZURE_ACR_NAME=$(AZURE_ACR_NAME)"
	@echo "  AZURE_ACI_NAME=$(AZURE_ACI_NAME)"
	@echo "  AZURE_LOCATION=$(AZURE_LOCATION)"
	@echo ""
	@echo "Quick start: make rebuild"
	@echo "Azure quick start: make azure-redeploy"

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

# ============================================================================
# Azure Container Instances Deployment Targets
# ============================================================================

# Login to Azure
azure-login:
	@echo "Logging in to Azure..."
	az login

# Create Azure Container Registry
azure-acr-create:
	@echo "Creating Azure Container Registry: $(AZURE_ACR_NAME) in $(AZURE_RG)..."
	@az acr show --name $(AZURE_ACR_NAME) --resource-group $(AZURE_RG) >/dev/null 2>&1 || \
		az acr create \
			--resource-group $(AZURE_RG) \
			--name $(AZURE_ACR_NAME) \
			--sku Basic \
			--location $(AZURE_LOCATION) \
			--admin-enabled true
	@echo "Container Registry ready: $(AZURE_ACR_NAME).azurecr.io"

# Login to Azure Container Registry
azure-acr-login: azure-acr-create
	@echo "Logging in to Azure Container Registry..."
	az acr login --name $(AZURE_ACR_NAME)

# Build Docker image for AMD64 architecture (required for MacBook -> Azure)
azure-build: azure-acr-login
	@echo "Building multi-platform image for AMD64 and pushing to ACR..."
	@echo "Image: $(AZURE_FULL_IMAGE)"
	docker buildx build \
		--platform linux/amd64 \
		-t $(AZURE_FULL_IMAGE) \
		--push \
		.
	@echo "Image built and pushed successfully"

# Push existing local image to ACR (builds for AMD64 if needed)
azure-push: azure-acr-login
	@echo "Tagging and pushing image to ACR..."
	docker tag $(IMAGE_NAME):latest $(AZURE_FULL_IMAGE) 2>/dev/null || \
		docker buildx build --platform linux/amd64 -t $(AZURE_FULL_IMAGE) --push .
	@docker push $(AZURE_FULL_IMAGE) 2>/dev/null || echo "Image already pushed via buildx"
	@echo "Image available at: $(AZURE_FULL_IMAGE)"

# Deploy to Azure Container Instances
azure-deploy: azure-acr-create
	@echo "Deploying to Azure Container Instances..."
	@ACR_USERNAME=$$(az acr credential show --name $(AZURE_ACR_NAME) --query username -o tsv); \
	ACR_PASSWORD=$$(az acr credential show --name $(AZURE_ACR_NAME) --query passwords[0].value -o tsv); \
	az container create \
		--resource-group $(AZURE_RG) \
		--name $(AZURE_ACI_NAME) \
		--image $(AZURE_FULL_IMAGE) \
		--os-type Linux \
		--cpu 1 \
		--memory 1.5 \
		--registry-login-server $(AZURE_ACR_NAME).azurecr.io \
		--registry-username $$ACR_USERNAME \
		--registry-password $$ACR_PASSWORD \
		--dns-name-label $(AZURE_ACI_NAME) \
		--ports $(CONTAINER_PORT) \
		--environment-variables PORT=$(CONTAINER_PORT) \
		--location $(AZURE_LOCATION) \
		|| az container restart --name $(AZURE_ACI_NAME) --resource-group $(AZURE_RG)
	@echo ""
	@echo "Deployment complete!"
	@echo "Getting container details..."
	@sleep 5
	@FQDN=$$(az container show --name $(AZURE_ACI_NAME) --resource-group $(AZURE_RG) --query ipAddress.fqdn -o tsv); \
	echo ""; \
	echo "=============================================="; \
	echo "Application URL: http://$$FQDN:$(CONTAINER_PORT)"; \
	echo "Resource Group:  https://portal.azure.com/#@/resource/subscriptions/$$(az account show --query id -o tsv)/resourceGroups/$(AZURE_RG)"; \
	echo "=============================================="; \
	echo ""

# Full redeploy - build, push, and deploy
azure-redeploy:
	@echo "Starting full Azure redeployment..."
	@$(MAKE) azure-build
	@$(MAKE) azure-deploy
	@echo "Redeploy complete!"

# View Azure Container Instances logs
azure-logs:
	@echo "Fetching logs from Azure Container Instances..."
	az container logs \
		--name $(AZURE_ACI_NAME) \
		--resource-group $(AZURE_RG) \
		--follow

# Check Azure Container Instances status
azure-status:
	@echo "Azure Container Instance Status:"
	@az container show \
		--name $(AZURE_ACI_NAME) \
		--resource-group $(AZURE_RG) \
		--query "{Name:name, State:instanceView.state, FQDN:ipAddress.fqdn, IP:ipAddress.ip, CPU:containers[0].instanceView.currentState.detailStatus}" \
		-o table
	@echo ""
	@echo "Recent events:"
	@az container show \
		--name $(AZURE_ACI_NAME) \
		--resource-group $(AZURE_RG) \
		--query "instanceView.events[].{Time:firstTimestamp, Type:type, Message:message}" \
		-o table

# Stop Azure Container Instance
azure-stop:
	@echo "Stopping Azure Container Instance..."
	az container stop \
		--name $(AZURE_ACI_NAME) \
		--resource-group $(AZURE_RG)
	@echo "Container stopped"

# Start Azure Container Instance
azure-start:
	@echo "Starting Azure Container Instance..."
	az container start \
		--name $(AZURE_ACI_NAME) \
		--resource-group $(AZURE_RG)
	@echo "Container started"
	@sleep 3
	@$(MAKE) azure-status

# Delete Azure Container Instance
azure-delete:
	@echo "Deleting Azure Container Instance..."
	az container delete \
		--name $(AZURE_ACI_NAME) \
		--resource-group $(AZURE_RG) \
		--yes
	@echo "Container instance deleted"

# Full cleanup - delete ACI and optionally ACR
azure-cleanup:
	@echo "Cleaning up Azure resources..."
	@az container delete --name $(AZURE_ACI_NAME) --resource-group $(AZURE_RG) --yes 2>/dev/null || echo "ACI already deleted"
	@echo ""
	@echo "Container instance removed."
	@echo "To also delete the Container Registry, run:"
	@echo "  az acr delete --name $(AZURE_ACR_NAME) --resource-group $(AZURE_RG) --yes"

