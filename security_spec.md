# Security Specification & "Dirty Dozen" Payloads

This specification defines the security invariants and testing requirements for the Restaurant Reservation System's Firestore database.

## 1. Data Invariants

1. **Authentication Required**: All read and write actions must be authenticated (unless checking public components, but reservation creation/viewing requires a valid signed-in user).
2. **User Profiles**: A user can only write/update their own profile. Non-admins cannot elevate their role to `admin`.
3. **Table Configurations**: Only Admins can create, update, or delete tables. Customers can only read tables.
4. **Reservation Integrity**:
   - Customers can only read, create, and cancel (update `status` to `'cancelled'`) their own reservations.
   - Customers cannot modify other fields of existing reservations (like changing `tableId`, `date`, `guests`, `userId`) once booked.
   - Customers cannot create reservations for other users (the `userId` must match `request.auth.uid`).
   - Admins can read, update, or cancel any reservation.
   - All reservations must have valid data (guests count > 0, future dates or valid date format, etc.).

---

## 2. The "Dirty Dozen" Malicious Payloads

Here are the 12 malicious payload scenarios designed to test and breach our rules:

### Payload 1: Unauthorized Table Mutation
* **Description**: A non-admin customer attempts to create a new table.
* **Payload**: `{"id": "table_99", "number": 99, "capacity": 10, "isActive": true}` on `/tables/table_99`
* **Expected**: `PERMISSION_DENIED`

### Payload 2: Table Modification by Customer
* **Description**: A non-admin customer attempts to disable/deactivate a table or change its capacity.
* **Payload**: `{"isActive": false}` on `/tables/table_1` by Customer
* **Expected**: `PERMISSION_DENIED`

### Payload 3: Role Elevation during Registration
* **Description**: A user tries to create their own profile with `role: "admin"`.
* **Payload**: `{"uid": "user_123", "email": "hacker@example.com", "displayName": "Hacker", "role": "admin"}` on `/users/user_123`
* **Expected**: `PERMISSION_DENIED` (Unless they are a bootstrapped admin or created by existing admin)

### Payload 4: User Profile Hijacking
* **Description**: An authenticated user `user_A` tries to modify the profile of `user_B`.
* **Payload**: `{"displayName": "Modified"}` on `/users/user_B` by `user_A`
* **Expected**: `PERMISSION_DENIED`

### Payload 5: Booking on Behalf of Another User
* **Description**: Authenticated user `user_A` attempts to create a reservation with `userId: "user_B"`.
* **Payload**: `{"userId": "user_B", "tableId": "table_2", "tableNumber": 2, "date": "2026-07-05", "timeSlot": "18:00 - 20:00", "guests": 4, "status": "confirmed"}`
* **Expected**: `PERMISSION_DENIED`

### Payload 6: Changing Table of a Booked Reservation
* **Description**: Customer attempts to change the `tableId` of their reservation to hijack someone else's table.
* **Payload**: `{"tableId": "table_5"}` on `/reservations/res_123` by Owner
* **Expected**: `PERMISSION_DENIED` (Updates must only allow modifying `status` to `'cancelled'`)

### Payload 7: Overwriting Reservation Owner
* **Description**: Customer attempts to transfer reservation ownership by modifying `userId`.
* **Payload**: `{"userId": "user_B"}` on `/reservations/res_123` by Owner
* **Expected**: `PERMISSION_DENIED`

### Payload 8: Creating Reservation with Negative Guests
* **Description**: Customer tries to book a table for `-5` guests.
* **Payload**: `{"userId": "user_A", "tableId": "table_1", "tableNumber": 1, "date": "2026-07-05", "timeSlot": "18:00 - 20:00", "guests": -5, "status": "confirmed"}`
* **Expected**: `PERMISSION_DENIED`

### Payload 9: Forging Timestamps
* **Description**: User tries to specify a client timestamp instead of server timestamp for `createdAt`.
* **Payload**: `{"userId": "user_A", "tableId": "table_1", "tableNumber": 1, "date": "2026-07-05", "timeSlot": "18:00 - 20:00", "guests": 2, "status": "confirmed", "createdAt": "2020-01-01T00:00:00Z"}`
* **Expected**: `PERMISSION_DENIED` (Must match `request.time`)

### Payload 10: Status Shifting to Arbitrary Value
* **Description**: Customer tries to set an unapproved status like `"vip_approved"`.
* **Payload**: `{"status": "vip_approved"}` on `/reservations/res_123` by Owner
* **Expected**: `PERMISSION_DENIED`

### Payload 11: System-Only Fields Intrusion
* **Description**: Customer tries to insert extra unrequested keys ("Ghost Fields") into a reservation.
* **Payload**: `{"userId": "user_A", "tableId": "table_1", "tableNumber": 1, "date": "2026-07-05", "timeSlot": "18:00 - 20:00", "guests": 2, "status": "confirmed", "isVipPromo": true}`
* **Expected**: `PERMISSION_DENIED` (due to strict size and key checks)

### Payload 12: Blanket Read on Reservations
* **Description**: A customer tries to fetch all reservations across the entire restaurant without filtering for their own `userId`.
* **Payload**: A query on `reservations` collection without a `userId == currentUserId` where-clause.
* **Expected**: `PERMISSION_DENIED` (The rules must enforce query matching)

---

## 3. Test Runner Design

While we rely on manual/automated checks, the following code structure validates the rules using `@firebase/rules-unit-testing`:

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('Firestore Security Rules', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'lyrical-ring-468515-a1',
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('non-admin cannot create a table', async () => {
    const context = testEnv.authenticatedContext('user_123');
    const db = context.firestore();
    const tableRef = doc(db, 'tables', 'table_99');
    await expect(setDoc(tableRef, {
      id: 'table_99',
      number: 99,
      capacity: 10,
      isActive: true
    })).rejects.toThrow();
  });

  // Additional tests validating each of the Dirty Dozen payloads...
});
```
