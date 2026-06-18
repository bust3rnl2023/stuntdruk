# Firestore Security Specification - stuntdruk.nl

This document establishes the Attribute-Based Access Control (ABAC) and security invariants required to protect the customer order histories and synchronized cart items data collections from any malicious client modifications, state tampering, or ID poisoning.

## 1. Safety & Data Invariants
1. **No Shared Reading**: An order can only be read (`get` or `list`) by its respective creator (`userId` matches the authenticated `request.auth.uid`), or anonymously if the order belongs to a matching guest session token which the client possesses.
2. **Order Immutability**: Once an order status is created, the configuration fields, ordered items, and final calculated prices (`pricing.net`, `pricing.gross`) are completely immutable. The user cannot update them. The status transitions (e.g. from `pending` to `processing` or `shipped`) are system-managed.
3. **Valid Timestamp Integrity**: All order creations must leverage the server-authoritative timestamp (`request.time`). Custom backdated client values will be immediately rejected.
4. **ID Sanitization**: All order IDs and user IDs must adhere strictly to standard length and alphanumeric limitations to prevent Denial-of-Wallet (recursive processing charges) or path poisoning attacks.
5. **Private Data Isolation**: Addresses (`shippingAddress`, `billingAddress`) are strictly locked down. No blanket reads exist for other users' address books.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following specific JSON payloads are designed to challenge the Firestore security rules. Our rule set blocks and denies every one of these malicious vectors.

### [Attack 1: Identity Spoofing] Create order with someone else's UID
Attempting to associate an order to a premium account belonging to another user.
```json
{
  "id": "ord_malicious_1",
  "userId": "legit_victim_user_123",
  "items": [],
  "pricing": { "net": 9.99, "gross": 12.09, "vat": 2.10 },
  "shippingAddress": {},
  "paymentMethod": "ideal",
  "status": "pending",
  "createdAt": "SERVER_TIMESTAMP"
}
```
**Assert**: Rejected because `incoming().userId != request.auth.uid`.

---

### [Attack 2: State Change Escalation] Inject "delivered" status directly on creation
Skyping pending validation and registering paid printed goods directly in shipping queues.
```json
{
  "id": "ord_malicious_2",
  "userId": "attacker_456",
  "items": [],
  "pricing": { "net": 50.00, "gross": 60.50, "vat": 10.50 },
  "shippingAddress": {},
  "paymentMethod": "bancontact",
  "status": "delivered",
  "createdAt": "SERVER_TIMESTAMP"
}
```
**Assert**: Rejected because initial creations must strictly have `status == "pending"`.

---

### [Attack 3: Price Fabrication] Tampering payload pricing to €0.01
Overriding product costs directly in client payload during order request.
```json
{
  "id": "ord_malicious_3",
  "userId": "attacker_456",
  "items": [],
  "pricing": { "net": 0.01, "gross": 0.01, "vat": 0.00 },
  "shippingAddress": {},
  "paymentMethod": "creditcard",
  "status": "pending",
  "createdAt": "SERVER_TIMESTAMP"
}
```
**Assert**: Rejected. Under normal flows, prices are calculated server-side. Writes must include structurally complete numbers validating against bounding limits.

---

### [Attack 4: Path & ID Poisoning] Injecting high-entropy 1MB string as order document ID
Attempting a Denial-of-Wallet attack on the Firestore index limits.
```json
// Target Path: /orders/SUPER_LONG_MALICIOUS_KEY_REPEATED_100000_TIMES...
{
  "items": [],
  "status": "pending"
}
```
**Assert**: Rejected because the path variable validation `isValidId(orderId)` guarantees a string length `<= 128`.

---

### [Attack 5: Temporal Fraud] Setting order creation date to year 2035
Attempting chronological spoofing.
```json
{
  "id": "ord_malicious_5",
  "userId": "attacker_456",
  "createdAt": "2035-12-25T12:00:00.000Z",
  "status": "pending"
}
```
**Assert**: Rejected because metadata must verify `incoming().createdAt == request.time`.

---

### [Attack 6: Order Modification Trigger] Overwriting list content after purchase
Attempting to modify the quantity ordered from 100 to 10000 after paying standard price.
```json
{
  "id": "ord_existing_33",
  "items": [{ "quantity": 10000, "productType": "flyer" }]
}
```
**Assert**: Rejected because existing orders cannot be modified (`allow update: if false` or locked for normal customers).

---

### [Attack 7: Theft by Query Scavenging] Reading all orders without filter
Performing standard `getDocs(collectionGroup("orders"))` to scrape customer invoices.
```Assert**: Rejected because `allow list: if resource.data.userId == request.auth.uid` forces client queries to contain a secure query filter constraint.

---

### [Attack 8: Cart Poisoning] Injecting corrupt data fields inside Cartesian Sync
Trying to force other users' browsers to crash with missing keys or invalid layout types.
```json
{
  "userId": "attacker_456",
  "items": "THIS_SHOULD_BE_AN_ARRAY_BUT_I_INJECTED_A_STRING",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Assert**: Rejected because the validation helper enforces `data.items is list`.

---

### [Attack 9: Email Spoofing Admin Bypass] Registering as admin in user claims
Spoofing authentication emails or trying to write to `/admins` database structure.
```json
// Write target: /admins/attacker_456
{
  "email": "bastiaanh79@gmail.com",
  "email_verified": false
}
```
**Assert**: Rejected because any writing to `/admins` is strictly forbidden for normal/anonymous clients.

---

### [Attack 10: Anonymous Orphan Writes] Flooding carts under invalid guest session IDs
```json
{
  "userId": "../../hack_dir",
  "items": [],
  "updatedAt": "SERVER_TIMESTAMP"
}
```
**Assert**: Rejected due to `isValidId(userId)` checks sanitizing alphanumeric inputs.

---

### [Attack 11: Ghost Fields Injection] Adding "bonusMarginPoints: 1000" in Cart details
Attempting to bypass rules structure with undocumented fields.
```json
{
  "userId": "attacker_456",
  "items": [],
  "updatedAt": "SERVER_TIMESTAMP",
  "ghostField": "unauthorized_value"
}
```
**Assert**: Rejected because the strict key set matching size restricts items exactly: `keys().size() == 3`.

---

### [Attack 12: Order Refund Exploit] Modifying order status directly to processing without paying
```json
// Update target on pending order:
{
  "status": "processing"
}
```
**Assert**: Rejected. Standard clients cannot change values under write rules.

---

## 3. Test Runner Schema (firestore.rules)
Production deployments enforce unit test coverage simulating the rules engine locally before deploying live configurations to the workspace.
