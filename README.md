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

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jspoelstra/yacht-cabin-auction.git
cd yacht-cabin-auction
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

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
