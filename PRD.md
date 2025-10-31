# Yacht Cabin Auction - Product Requirements Document

A live auction system for allocating yacht cabins among cruise participants using a dynamic pricing mechanism where participants submit their maximum willingness to pay, and cabin assignments and prices are determined automatically based on all submitted bids.

**Experience Qualities:**
1. **Transparent** - All participants can see real-time pricing and their cabin status, creating trust in the auction mechanism
2. **Engaging** - Dynamic price updates and countdown timers keep participants invested in the auction process
3. **Fair** - Algorithmic cabin allocation ensures the system is impartial and rewards those willing to pay more

**Complexity Level**: Light Application (multiple features with basic state)
This is a real-time auction system with role-based access, persistent state management, and automated pricing algorithms. It requires coordination between multiple users but doesn't involve complex external integrations.

## Essential Features

### Admin Setup
- **Functionality**: Configure initial auction parameters including total cost to recover, minimum price spread between cabin types, auction duration, and number of each cabin type
- **Purpose**: Allows the auction organizer to customize the auction to their specific yacht cruise economics
- **Trigger**: Admin accesses the system before participants
- **Progression**: Admin login → Configure settings (total cost, spread, duration, cabin counts) → Start auction → Participants can join
- **Success criteria**: Auction state is created with correct configuration and random initial cabin assignments

### Participant Authentication
- **Functionality**: Simple name/password login system for participants to access their personal auction dashboard
- **Purpose**: Ensures each participant can only view and modify their own bids
- **Trigger**: Participant navigates to the application
- **Progression**: Enter name and password → Access personal dashboard with current cabin assignment and pricing
- **Success criteria**: Participant is authenticated and sees their unique auction state

### Live Bidding Interface
- **Functionality**: Participants submit their maximum willingness to pay, which automatically updates cabin assignments and prices for all participants
- **Purpose**: Core auction mechanism that determines who gets which cabin at what price
- **Trigger**: Participant decides to change their bid
- **Progression**: View current prices → Enter new bid amount → Submit → See updated cabin assignment and price → Individual locked from re-bidding until another participant bids
- **Success criteria**: Bid is processed, assignments recalculated, prices updated across all participants in real-time

### Auction Lock Controls
- **Functionality**: Admin can lock/unlock the entire auction to control when participants can submit bids
- **Purpose**: Gives admin control over auction flow - can review settings before allowing bids or pause for discussion
- **Trigger**: Admin clicks "Start Bidding" or "Lock Bidding" button
- **Progression**: Admin reviews setup → Clicks Start Bidding → Auction unlocks → Participants can bid → Admin can re-lock if needed
- **Success criteria**: When locked, participants cannot submit bids and see lock status; when unlocked, participants can bid freely

### Dynamic Pricing Algorithm
- **Functionality**: Automatically calculates cabin prices based on all bids to ensure total revenue equals configured cost while maintaining minimum spread
- **Purpose**: Creates a market-driven pricing system that's fair and mathematically sound
- **Trigger**: Any participant submits a bid
- **Progression**: Bid received → Sort all participants by bid amount and timestamp → Assign top N to outside cabins, next M to inside cabins → Calculate prices based on marginal bids → Update all participant views
- **Success criteria**: Total revenue equals configured cost, spread maintained, highest bidders get outside cabins

### Admin Dashboard
- **Functionality**: Real-time view of all participants, their bids, cabin assignments, and prices with ability to modify settings mid-auction
- **Purpose**: Gives organizer full visibility and control over the auction process
- **Trigger**: Admin logs in during active auction
- **Progression**: View participant table sorted by bid → Monitor pricing → Adjust settings if needed → View countdown timer
- **Success criteria**: Admin can see all auction state and has full control over configuration

### Auction Reset System
- **Functionality**: Three distinct admin actions - Start/Pause bidding, Reset assignments/prices, Clear all data
- **Purpose**: Provides granular control over auction lifecycle without losing participant data unnecessarily
- **Trigger**: Admin clicks respective button in admin dashboard
- **Progression**: 
  - **Start/Pause**: Toggle auction lock → Participants can/cannot bid
  - **Reset**: Confirm action → Randomize cabin assignments → Reset all bids to default prices → Lock auction
  - **Clear**: Confirm action → Delete all auction data → Return to setup screen
- **Success criteria**: Each action performs its specific function without affecting unrelated data

### Auto-extension Mechanism
- **Functionality**: Auction automatically extends by 10 minutes when a bid is submitted within 10 minutes of close time
- **Purpose**: Prevents last-second bid sniping and ensures all participants have fair opportunity to respond
- **Trigger**: Bid submitted when less than 10 minutes remain
- **Progression**: Bid received → Check time remaining → If < 10 minutes, set new close time to current time + 10 minutes → Continue auction
- **Success criteria**: Timer extends appropriately, participants notified of extension

### Browser Notifications
- **Functionality**: Push notifications alert participants when auction prices change or their cabin status changes
- **Purpose**: Keeps participants engaged even when not actively viewing the page
- **Trigger**: Participant grants notification permission, then prices change
- **Progression**: Request permission → Monitor auction state → Detect changes → Send browser notification
- **Success criteria**: Participants receive timely notifications of auction events

## Edge Case Handling

- **Mid-auction configuration changes** - Recalculate all assignments and prices when admin changes cabin counts or pricing parameters
- **Participant deletion** - Only allow deletion of participants without assigned cabins to prevent broken state
- **Concurrent bid submissions** - Use timestamps to determine priority when bids are equal
- **Browser refresh/reconnection** - All state persisted in KV store, seamless reconnection
- **Insufficient bids** - Handle cases where not enough participants bid to fill all cabins
- **Auction close with locked user** - Allow auction to close even if a participant is locked
- **Network interruptions** - State is persisted, user can reload and continue

## Design Direction

The design should feel professional, trustworthy, and nautical without being overly playful. It should communicate sophistication appropriate for a yacht cruise while maintaining clarity and ease of use for participants who may not be tech-savvy. The interface should feel elegant and calm, reducing anxiety about the auction process.

Minimal interface that focuses on essential information - current prices, cabin assignments, and bidding controls. Avoid clutter and excessive decoration in favor of clear typography and purposeful use of space.

## Color Selection

**Analogous (adjacent colors on color wheel)**
A blue-based palette evoking ocean and nautical themes, with progression from deep navy to lighter cyan accents. This creates a cohesive, calming atmosphere appropriate for a cruise-related application while maintaining professional credibility.

- **Primary Color**: Deep nautical blue (oklch(0.42 0.18 240)) - Communicates trust, stability, and maritime heritage. Used for primary actions and key UI elements.
- **Secondary Colors**: Light blue-gray (oklch(0.92 0.02 240)) for backgrounds and muted elements, maintaining the nautical theme while providing subtle contrast.
- **Accent Color**: Bright cyan (oklch(0.65 0.20 200)) - Draws attention to outside cabin pricing and important status indicators, evoking premium ocean views.
- **Foreground/Background Pairings**:
  - Background (oklch(0.98 0.01 220)): Dark navy text (oklch(0.15 0.02 240)) - Ratio 15.2:1 ✓
  - Card (oklch(1 0 0)): Dark navy text (oklch(0.15 0.02 240)) - Ratio 16.5:1 ✓
  - Primary (oklch(0.42 0.18 240)): White text (oklch(0.98 0 0)) - Ratio 8.4:1 ✓
  - Accent (oklch(0.65 0.20 200)): White text (oklch(0.98 0 0)) - Ratio 4.8:1 ✓
  - Muted (oklch(0.95 0.01 240)): Medium gray text (oklch(0.50 0.01 240)) - Ratio 7.2:1 ✓

## Font Selection

Typography should balance elegance with readability, using a classic serif for headings to evoke sophistication and a clean sans-serif for body text to ensure clarity of auction data and numbers.

**Typographic Hierarchy:**
- H1 (Page titles): Playfair Display Bold/32px/tight letter spacing - Elegant serif for main headings
- H2 (Section headings): Playfair Display Semibold/24px/normal spacing - Secondary hierarchy
- H3 (Card titles): Playfair Display Semibold/20px/normal spacing - Tertiary hierarchy  
- Body (Primary text): Inter Regular/16px/1.5 line height - Clean, readable data display
- Labels: Inter Medium/14px/normal spacing - Form labels and secondary text
- Captions: Inter Regular/12px/1.4 line height - Timestamps and helper text
- Numbers (Prices/bids): Inter Semibold/20-32px depending on context - Clear display of financial data

## Animations

Animations should be subtle and purposeful, reinforcing the professional nature of the application. Motion should feel smooth and confident, never frantic or playful, to maintain participant trust in the auction system.

**Purposeful Meaning:**
- Smooth transitions between locked/unlocked states communicate system reliability
- Gentle price updates avoid creating panic while keeping participants informed
- Fade transitions for alerts and notifications feel calm rather than alarming

**Hierarchy of Movement:**
- Most important: Price changes and cabin assignment updates (200ms fade)
- Secondary: Button state changes and form interactions (150ms)
- Tertiary: Card reveals and panel transitions (300ms)

## Component Selection

**Components:**
- **Cards** (shadcn Card) - Primary container for dashboard sections (pricing, bid submission, configuration). Use elevated cards with subtle shadows for hierarchy.
- **Buttons** (shadcn Button) - Primary actions use default variant, secondary actions use outline. Lock/unlock and admin controls use appropriate color variants.
- **Inputs** (shadcn Input) - Number inputs for bid amounts with clear validation states
- **Badges** (shadcn Badge) - Display cabin types (outside/inside/none) and lock status with color coding
- **Tables** (shadcn Table) - Admin view of all participants with sortable columns
- **Alerts** (shadcn Alert) - Status notifications (at risk, locked, closed) with appropriate severity levels
- **Dialogs** (shadcn Dialog) - Admin settings configuration and participant editing
- **Alert Dialogs** (shadcn AlertDialog) - Confirmation for destructive actions (reset, clear, delete)

**Customizations:**
- Custom status indicators combining Badges with Phosphor Icons for lock states
- Custom price display cards with larger typography for emphasis
- Countdown timer component using formatted time display

**States:**
- **Buttons**: Clear hover states with subtle color darkening, active states with pressed appearance, disabled states with reduced opacity
- **Inputs**: Focus states with accent color ring, error states with destructive color, disabled states when auction locked
- **Cards**: Subtle hover elevation for interactive elements, border color changes for status (at-risk cards use destructive border)

**Icon Selection:**
- Anchor (cabin/maritime theme) - App branding
- Lock/LockOpen - Bid lock status
- Play/Pause - Auction control
- ArrowsClockwise - Reset action  
- Eraser - Clear all action
- Clock - Time remaining
- SignOut - Logout
- PencilSimple - Edit participant
- Trash - Delete participant
- Plus - Add participant
- Key - Change password

**Spacing:**
- Consistent use of Tailwind spacing scale: gap-4 between related elements, gap-6 between sections
- Card padding: p-6 for standard cards, p-4 for compact displays
- Page margins: p-4 on mobile, p-6 on desktop
- max-w-7xl for admin dashboard, max-w-4xl for participant view

**Mobile:**
- Stack all grid layouts vertically on mobile (<768px)
- Full-width buttons on mobile for easy touch targets
- Collapsible admin table to show key columns only
- Single column card layouts for pricing information
- Larger touch targets (min 44x44px) for all interactive elements
- Simplified navigation with logout in header rather than separate panel
