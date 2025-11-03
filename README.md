# Yacht Cabin Auction

A live auction system for allocating yacht cabins among cruise participants using a dynamic pricing mechanism. Participants submit their maximum willingness to pay, and cabin assignments and prices are determined automatically based on all submitted bids.

## Features

- **Admin Setup**: Configure auction parameters including total cost, minimum price spread, auction duration, and cabin counts
- **Live Bidding**: Real-time auction where participants submit bids and see dynamic cabin assignments
- **Dynamic Pricing**: Automatic price calculation ensuring total revenue equals configured cost while maintaining minimum spread
- **Auction Controls**: Admin can lock/unlock bidding, reset assignments, or clear all data
- **Auto-extension**: Auction extends by 10 minutes when bids are submitted in the final 10 minutes
- **Browser Notifications**: Push notifications alert participants to price changes and cabin status updates

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS 4
- **State Management**: GitHub Spark KV store
- **Build Tool**: Vite
- **Icons**: Phosphor Icons

## Getting Started

### Prerequisites

#### For Local Development
- Node.js (v18 or higher recommended)
- npm or yarn

#### For Docker Deployment
- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher) - optional, for simplified container management

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jspoelstra/yacht-cabin-auction.git
cd yacht-cabin-auction
```

2. Install dependencies (for local development):
```bash
npm install
```

### Running the Application

#### Local Development

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite's default port) or the port shown in your terminal.

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

#### Docker Deployment

**Using Makefile (Quickest):**

```bash
make rebuild    # Build and run the container
make logs       # View container logs
make stop       # Stop the container
make help       # See all available commands
```

Access the application at `http://localhost:5001`

**Using Docker Compose:**

1. Build and start the container:
```bash
docker-compose up --build
```

2. Access the application at `http://localhost:5001`

> **Note for macOS users:** Port 5000 is often used by macOS Control Center (AirPlay Receiver). The docker-compose.yml uses port 5001 by default to avoid conflicts.

3. To run in detached mode:
```bash
docker-compose up -d
```

4. To stop the container:
```bash
docker-compose down
```

**Using Docker directly:**

1. Build the Docker image:
```bash
docker build -t yacht-cabin-auction .
```

2. Run the container:
```bash
docker run -d -p 5001:5000 --name yacht-auction yacht-cabin-auction
```

3. Access the application at `http://localhost:5001`

> **Important:** The `-p 5001:5000` flag maps container port 5000 to host port 5001. Port 5000 is often blocked on macOS by Control Center.

4. To stop the container:
```bash
docker stop yacht-auction
docker rm yacht-auction
```

**Using a custom port:**

You can run the container on a different port by changing the port mapping:
```bash
docker run -d -p 8080:5000 --name yacht-auction yacht-cabin-auction
```
Then access at `http://localhost:8080`

**Note on State Persistence:**
The containerized application uses in-memory state. When the container is stopped or restarted, all auction data will be lost. This is acceptable for the use case as outlined in the PRD - the admin can simply reinitialize the auction from the setup screen.

**For more detailed Docker instructions, see [DOCKER.md](DOCKER.md).**

## Usage

### Admin Flow
1. Access the application and configure auction settings (total cost, price spread, duration, cabin counts)
2. Start the auction to allow participants to begin bidding
3. Monitor real-time bids and cabin assignments in the admin dashboard
4. Control auction state with lock/unlock, reset, or clear actions

### Participant Flow
1. Log in with your name and password
2. View your current cabin assignment and price
3. Submit your maximum bid amount
4. Receive notifications when prices change or your cabin status updates

## Deployment

### Azure Container Services

The application is designed to be deployed to Azure Container Apps or Azure Container Instances for production use. The Docker container provides:

- **Managed hosting** - Azure handles infrastructure, scaling, and HTTPS
- **Container resilience** - Automatic restart on failures
- **Secure configuration** - Environment-based admin credentials

See the [PRD.md](PRD.md) for detailed deployment architecture.

### State Management

The application uses in-memory state storage, which means:
- State is lost when the container restarts
- This is acceptable for auction use cases - admin can reinitialize
- No external database dependencies required
- Future migration to Azure Redis or Cosmos DB is possible if persistence is needed

For local testing and development, Docker provides a consistent environment that mirrors production deployment.

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** ensuring they align with the project's coding style
3. **Test your changes** by running the build and verifying the app works correctly
4. **Submit a pull request** with a clear description of your changes

### Development Guidelines

- Follow the existing code structure and naming conventions
- Ensure TypeScript types are properly defined
- Test your changes in both admin and participant views
- Verify responsive design on mobile and desktop

## Project Structure

```
yacht-cabin-auction/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Reusable UI components (shadcn)
│   │   ├── AdminSetup.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── ParticipantLogin.tsx
│   │   └── ParticipantDashboard.tsx
│   ├── lib/            # Utilities and types
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── PRD.md              # Product Requirements Document
└── package.json        # Project dependencies and scripts
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
