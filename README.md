# Bistro Booking - Restaurant Reservation System

Bistro Booking is a modern, high-fidelity restaurant reservation and seating management application designed with a sleek, user-friendly interface. It features real-time floor plan visualization, robust booking validation, and dedicated workflows for both customers and administrators.

To facilitate seamless evaluation, the application features a built-in **Offline Sandbox Mode** utilizing reactive local persistence to simulate a fully active cloud backend.

---

## Live Demo
https://bistrobooking-main.vercel.app/

---

## 🚀 Setup Instructions

Follow these simple steps to run the application locally on your computer:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) and `npm` installed.

### 1. Install Dependencies
Navigate to the project root directory in your terminal and run:
```bash
npm install
```

### 2. Run the Development Server
Start the local server by running:
```bash
npm run dev
```
The application will launch and be available in your browser at `http://localhost:3000`.

### 3. Build for Production
To generate optimized production static assets inside the `dist/` folder:
```bash
npm run build
```

---

## 📋 Assumptions Made

1. **Local Sandbox Persistence**: Since cloud database backends require external provisioning, we opted to implement high-fidelity local persistence using `localStorage` coupled with state synchronization intervals. This ensures that changes made on the Admin panel (e.g., configuring new tables, approving/canceling reservations) reflect instantly on the Customer's floor plan.
2. **Default Users**: The sandbox automatically seeds default credentials for testing:
   - **Customer**: `demo_customer@restaurant.com` (Demo Customer)
   - **Administrator**: `demo_admin@restaurant.com` (Demo Admin)
3. **Role Switching**: We assume evaluators need to switch roles rapidly. An interactive **Evaluation Banner** is pinned to the top of the interface, letting you change active context instantly without having to log out or lose your place.
4. **Pre-Seeded Seating Plan**: Upon the first launch, the app auto-seeds 6 default table configurations of varying seating capacities (2-seater, 4-seater, 6-seater, 8-seater) so you can test bookings immediately.

---

## 📊 Reservation & Availability Logic

The reservation engine ensures zero double-bookings or over-capacity seating through a dual-phase validation pipeline:

### 1. Interactive Floor Plan Query
When a customer selects a specific **Date**, **Time Slot**, and **Guest Count**:
- The application scans the master bookings collection.
- Any table associated with a `pending` or `confirmed` reservation for that exact date and slot is marked as **Reserved** (rendered in muted red and disabled from selection).
- Tables with seating capacity smaller than the requested guest count are highlighted with warning indicators or disabled, preventing under-sized seating assignments.

### 2. Atomic Submission Validation
To prevent race conditions (e.g., two users booking the same table concurrently):
- When clicking the **"Book This Table"** button, the reservation form triggers an atomic re-check of the master booking collection.
- If the selected table has been reserved in the brief interim, the transaction is rejected, and a clear, user-friendly notification prompts the customer to choose another table.

---

## 🔑 Role-Based Access Control (User vs. Admin)

The application maintains a strict separation of concerns, rendered dynamically depending on the active profile:

### Customer Portal
- **Seating Floor Plan**: View and interact with available tables.
- **Bookings Form**: Set dates, select guests, choose a specific table, and reserve a spot.
- **Personal Booking Ledger**: View active, pending, or past bookings, and cancel upcoming reservations.

### Administrator Console
- **Unified Overview Dashboard**: Real-time analytical counters tracking total reservations, active bookings, configured tables, and active seating capacity.
- **Reservations Manager**: Access the master list of all restaurant bookings. Filter reservations dynamically by date or status.
- **Status Coordinator**: Update reservation statuses on-the-fly (`Pending` ➜ `Confirmed` ➜ `Cancelled`).
- **Layout Manager**:
  - Add new physical tables with custom numbers and seating capacities.
  - Deactivate/activate tables (deactivated tables immediately disappear from the customer floor plan).
  - Delete table configurations from the layout.

---

## ⚠️ Known Limitations

1. **Device Isolation**: Because data is stored in browser-level storage (`localStorage`), changes are isolated to your current browser and device, rather than synchronized across multiple remote devices.
2. **Simulated Date/Time Boundary**: Standard date selection prevents booking in the past, but the time-slot logic works within fixed hourly brackets rather than evaluating custom hourly intervals (e.g., minute-by-minute booking).

---

## 🌟 Future Improvements (With More Time)

If given additional development time, we would implement the following production-grade enhancements:

1. **Durable Cloud Sync**: Integrate a live Firebase Firestore database to enable real-time, cross-device multi-player booking updates and unified cloud backups.
2. **Draggable Layout Designer**: Build a visual vector canvas allowing administrators to drag, rotate, and resize circular, square, or bar-side tables to match their exact real-world restaurant floor plan layout.
3. **Automated Reminders**: Integrate Twilio SMS or SendGrid email APIs to automatically send reservation confirmations and 2-hour pre-booking arrival reminders.
4. **Intelligent Table Combiner**: Create logic that suggests combining adjacent tables (e.g., joining two 4-seater tables) when a customer attempts to book for a large group exceeding the capacity of any single table.
