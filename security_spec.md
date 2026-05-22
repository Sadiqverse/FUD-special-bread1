# Security Specification (TDD SPEC)

## 1. Data Invariants
- **Users**: A user's profile must match their authenticated identity (`userId == request.auth.uid`). Users can read and write their own profile details, but they are forbidden from modifying their own roles or self-assigning senior permissions like `Admin`. A user's role can only be written if the auth token's email is verified (`request.auth.token.email_verified == true`).
- **Breads (Catalog)**: Only `Admin` role can create, update, or delete bread catalog items. All prices, costs, and stock counts must be valid (non-negative numbers). Custom IDs must conform to alphanumeric formatting rules.
- **Production Logs**: Only `Admin` or `Baker` roles can write/update production logs. `quantityPlanned`, `quantityProduced`, and `quantityScrapped` must be non-negative. Terminal status values (e.g., `Completed`, `Cancelled`) lock the document, preventing subsequent modifications to values unless bypassed by an `Admin`.
- **Sales (Ledger)**: Only `Admin` or `Cashier` roles can write sales records. `quantitySold`, `pricePerUnit`, and `totalAmount` must be non-negative. Existing sales cannot be modified; they can only be created or deleted (voided) by allowed roles.

---

## 2. The "Dirty Dozen" Malicious Payloads
The following payloads are designed to challenge and bypass security controls. They must all return `PERMISSION_DENIED`.

1. **Privilege Escalation**: An authenticated user `user_123` attempts to write to `/users/user_123` setting their own `role` to `"Admin"`.
2. **PII/Profile Soping**: An authenticated user `user_123` attempts to read profile details at `/users/user_456` (another user's record).
3. **Unauthorized Catalog Modification**: A user authenticated with `Baker` or `Cashier` role attempts to add a bread item `/breads/new-croissant`.
4. **Unauthorized Writing to Production Logs**: A user with `Cashier` role attempts to write a daily production run to `/production/prod_999`.
5. **Unauthorized Voiding of Transactions**: A user with `Baker` role attempts to delete a cashier's transacted sale record at `/sales/sale_456`.
6. **Anonymity/External Read Attack**: A anonymous or unauthenticated guest user attempts to list `/sales` or `/production` records.
7. **Negative Balance/Resource Manipulation**: An `Admin` user attempts to write a bread catalog item `/breads/free-loaf` with a negative unit price (`price: -5.00`).
8. **Invalid Production State Insertion**: A `Baker` attempts to record a completed production run with negative planned quantity (`quantityPlanned: -10`).
9. **Zero/Negative Quantity Sales Ticket**: A `Cashier` attempts to create a transaction with negative sales levels (`quantitySold: -50`).
10. **Immutability Bypass**: A user attempts to update/change the immutable `createdAt` timestamp of a pre-existing bread catalog item.
11. **State Lock Tampering**: A user attempts to update the notes field on a completed production log whose status is locked to `Completed`.
12. **Id Poisoning (Denial of Wallet)**: A user attempts to create a document under `/breads/{breadId}` where the `breadId` is a 1.5MB junk string of malicious script characters.

---

## 3. Test Runner Schema (firestore.rules.test.ts)
The mock assertions below verify that the security engine correctly denies or permits the above scenarios.

```typescript
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

// Verification suite mock architecture representing TDD testing against rules:
describe('Bakery Security Fortress', () => {
  it('prevents privilege escalation by restricting role self-assignment', async () => {
    const db = getFirestore({ uid: 'user_123' });
    await assertFails(setDoc(doc(db, 'users/user_123'), { role: 'Admin', email: 'user@example.com' }));
  });

  it('prevents cross-user profile snooping', async () => {
    const db = getFirestore({ uid: 'user_123' });
    await assertFails(getDoc(doc(db, 'users/user_456')));
  });

  it('only allows admin to write catalog items', async () => {
    const db = getFirestore({ uid: 'user_baker_456' }); // cached role: Baker
    await assertFails(setDoc(doc(db, 'breads/sweet-croissant'), { name: 'Croissant', price: 3.50 }));
  });
});
```
