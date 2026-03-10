# Rehably API Reference

Base URL: `https://api.rehably.com` (production) | `https://localhost:5001` (local)

All endpoints return JSON. Include `Content-Type: application/json` for request bodies.

---

## Authentication

JWT Bearer authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Login

```
POST /api/auth/login
```

```json
{
  "email": "owner@clinic.com",
  "password": "YourPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "d4f8a2...",
    "expiresAt": "2026-03-04T14:00:00Z",
    "user": {
      "id": "guid",
      "email": "owner@clinic.com",
      "firstName": "Karim",
      "lastName": "Essam",
      "roleType": "ClinicOwner",
      "tenantId": "guid"
    }
  }
}
```

### Refresh Token

```
POST /api/auth/refresh
```

```json
{
  "refreshToken": "d4f8a2..."
}
```

Returns new `accessToken` + `refreshToken` pair. Call this before the access token expires.

### Logout

```
POST /api/auth/logout
Authorization: Bearer <token>
```

Revokes all refresh tokens for the user.

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

Returns the authenticated user's profile.

### Change Password

```
POST /api/auth/change-password
Authorization: Bearer <token>
```

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

### Reset Password (from email link)

```
POST /api/auth/reset-password
```

```json
{
  "token": "selector.token-from-email",
  "newPassword": "NewPassword456!"
}
```

### Reset Password (OTP-verified)

```
POST /api/auth/password/reset
```

```json
{
  "resetToken": "otp-verified-token",
  "newPassword": "NewPassword456!"
}
```

---

## OTP

### Request OTP

```
POST /api/otp/request
```

```json
{
  "email": "user@clinic.com",
  "purpose": "PasswordReset"
}
```

### Verify OTP

```
POST /api/otp/verify
```

```json
{
  "email": "user@clinic.com",
  "code": "123456",
  "purpose": "PasswordReset"
}
```

Returns a `resetToken` on success (used with `POST /api/auth/password/reset`).

---

## Response Envelope

Every response follows this format:

### Success

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Success (no data)

```json
{
  "success": true,
  "message": "Operation completed"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": ["Field X is required", "Field Y must be positive"]
  }
}
```

---

## Error Codes

### Validation (400)

| Code | Meaning |
|------|---------|
| `VALIDATION_ERROR` | Request body failed validation |
| `INVALID_INPUT` | General bad input |
| `MISSING_REQUIRED_FIELD` | Required field not provided |
| `INVALID_FORMAT` | Wrong format (date, GUID, etc.) |
| `INVALID_EMAIL` | Malformed email address |
| `INVALID_PASSWORD` | Password doesn't meet requirements |
| `PASSWORD_MISMATCH` | Passwords don't match |
| `DUPLICATE_ENTRY` | Value already exists |

### Authentication (401)

| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Not authenticated |
| `INVALID_CREDENTIALS` | Wrong email/password |
| `TOKEN_EXPIRED` | Access token expired — refresh it |
| `TOKEN_INVALID` | Malformed or tampered token |
| `SESSION_EXPIRED` | Session no longer valid |
| `OTP_INVALID` | Wrong OTP code |
| `OTP_EXPIRED` | OTP code expired |

### Authorization (403)

| Code | Meaning |
|------|---------|
| `FORBIDDEN` | Access denied |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permission |
| `SUBSCRIPTION_REQUIRED` | No active subscription |
| `FEATURE_NOT_AVAILABLE` | Feature not in current plan |
| `LIMIT_EXCEEDED` | Usage quota reached |

### Not Found (404)

| Code | Meaning |
|------|---------|
| `NOT_FOUND` | Generic not found |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `USER_NOT_FOUND` | User ID doesn't exist |
| `CLINIC_NOT_FOUND` | Clinic ID doesn't exist |
| `SUBSCRIPTION_NOT_FOUND` | Subscription not found |
| `PACKAGE_NOT_FOUND` | Package ID doesn't exist |
| `FEATURE_NOT_FOUND` | Feature ID doesn't exist |
| `EXERCISE_NOT_FOUND` | Exercise not found |
| `TREATMENT_NOT_FOUND` | Treatment not found |
| `ASSESSMENT_NOT_FOUND` | Assessment not found |
| `DEVICE_NOT_FOUND` | Device not found |
| `MODALITY_NOT_FOUND` | Modality not found |
| `INVOICE_NOT_FOUND` | Invoice not found |
| `PAYMENT_NOT_FOUND` | Payment not found |

### Conflict (409)

| Code | Meaning |
|------|---------|
| `CONFLICT` | Generic conflict |
| `DUPLICATE_EMAIL` | Email already registered |
| `DUPLICATE_CLINIC` | Clinic name/slug taken |
| `DUPLICATE_SUBSCRIPTION` | Subscription already exists |
| `CLINIC_ALREADY_EXISTS` | Clinic already registered |
| `SUBSCRIPTION_ALREADY_ACTIVE` | Cannot create — already active |
| `SUBSCRIPTION_ALREADY_CANCELLED` | Already cancelled |

### Business Logic (422)

| Code | Meaning |
|------|---------|
| `BUSINESS_RULE_VIOLATION` | General business rule failure |
| `INVALID_OPERATION` | Operation not allowed in current state |
| `INVALID_STATE_TRANSITION` | Invalid status change |
| `CLINIC_NOT_ACTIVE` | Clinic must be active |
| `CLINIC_BANNED` | Clinic is banned |
| `CLINIC_PENDING_VERIFICATION` | Clinic awaiting verification |
| `PAYMENT_FAILED` | Payment processing failed |
| `REFUND_NOT_ALLOWED` | Refund not possible |

### Server (500 / 503)

| Code | Meaning |
|------|---------|
| `INTERNAL_ERROR` | Unexpected server error |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | Third-party service failed |
| `EMAIL_SERVICE_ERROR` | Email delivery failed |
| `SMS_SERVICE_ERROR` | SMS delivery failed |
| `PAYMENT_SERVICE_ERROR` | Stripe/PayMob issue |
| `FILE_UPLOAD_ERROR` | File upload failed |
| `SERVICE_UNAVAILABLE` | Service temporarily down |
| `MAINTENANCE_MODE` | Platform under maintenance |

---

## Enums

These are the integer values sent/received in API payloads.

### ClinicStatus

| Value | Name | Description |
|-------|------|-------------|
| 0 | PendingEmailVerification | Owner hasn't verified email |
| 1 | PendingDocumentsAndPackage | Awaiting documents and package selection |
| 2 | PendingApproval | Documents submitted, admin reviewing |
| 3 | PendingPayment | Approved, awaiting payment |
| 4 | Active | Fully operational |
| 5 | Suspended | Temporarily disabled |
| 6 | Cancelled | Subscription cancelled |
| 7 | Banned | Permanently blocked by admin |
| 8 | PendingCustomPackageReview | Custom package awaiting admin review |

### SubscriptionStatus

| Value | Name |
|-------|------|
| 0 | Trial |
| 1 | Active |
| 2 | Suspended |
| 3 | Cancelled |
| 4 | Expired |

### PaymentType

| Value | Name |
|-------|------|
| 0 | Cash |
| 1 | Online |
| 2 | Free |

### BillingCycle

| Value | Name |
|-------|------|
| 0 | Monthly |
| 1 | Yearly |

### RoleType

| Value | Name |
|-------|------|
| 0 | SuperAdmin |
| 1 | ClinicOwner |
| 2 | Doctor |
| 3 | Receptionist |
| 4 | Staff |

### DocumentType

| Value | Name |
|-------|------|
| 0 | OwnerId |
| 1 | MedicalLicense |

---

## Endpoints by Area

### Public (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/packages` | List all available packages |
| GET | `/api/public/packages/{id}` | Get package details |
| GET | `/api/public/packages/default` | Get the default package |
| GET | `/api/public/packages/{id}/features` | List features in a package |
| GET | `/api/public/feature-catalog` | List all feature categories |
| GET | `/api/public/feature-catalog/categories/{id}` | Get category with features |
| GET | `/api/public/feature-catalog/features` | List all features |
| GET | `/api/public/feature-catalog/features/{id}` | Get feature details |
| GET | `/api/public/feature-catalog/features/{id}/pricing` | Get feature pricing tiers |
| POST | `/api/public/package-calculator/calculate` | Calculate custom package price |
| POST | `/api/public/package-calculator/compare` | Compare multiple configurations |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/logout` | Yes | Revoke refresh tokens |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| POST | `/api/auth/change-password` | Yes | Change own password |
| POST | `/api/auth/reset-password` | No | Reset via email link token |
| POST | `/api/auth/password/reset` | No | Reset via OTP token |
| POST | `/api/otp/request` | No | Request OTP code |
| POST | `/api/otp/verify` | No | Verify OTP code |
| POST | `/api/otp/request-password-reset` | No | Request password reset OTP |
| GET | `/api/otp/status` | No | Check OTP status |
| POST | `/api/otp/resend` | No | Resend OTP code |

### Registration (clinic onboarding)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registration/start` | Start clinic registration |
| GET | `/api/registration/{registrationId}` | Get registration status |
| POST | `/api/registration/{registrationId}/documents` | Upload clinic documents |
| GET | `/api/registration/{registrationId}/documents` | Get uploaded documents |
| POST | `/api/registration/{registrationId}/complete` | Complete registration |
| POST | `/api/registration/payment/initiate` | Initiate payment |
| GET | `/api/registration/payment/{registrationId}/status` | Get payment status |
| GET | `/api/registration/payment/{registrationId}/options` | Get payment options |
| POST | `/api/registration/payment/{registrationId}/confirm` | Confirm payment |
| POST | `/api/payments/initiate` | Self-service payment initiation |
| GET | `/api/payments/{paymentId}/status` | Self-service payment status |
| POST | `/api/payments/callback` | Payment provider callback |

### Tenant (clinic-scoped, requires auth + tenant context)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Clinic** | | |
| GET | `/api/tenant/clinics` | Get current clinic details |
| PUT | `/api/tenant/clinics` | Update clinic profile |
| **Users** | | |
| POST | `/api/tenant/users` | Create clinic user |
| POST | `/api/tenant/users/upload-avatar` | Upload user avatar |
| GET | `/api/tenant/users/usage-stats` | Get usage statistics |
| **Roles** | | |
| GET | `/api/tenant/roles` | List clinic roles |
| GET | `/api/tenant/roles/{roleName}` | Get role details |
| POST | `/api/tenant/roles` | Create custom role |
| PUT | `/api/tenant/roles/{roleName}` | Update role |
| DELETE | `/api/tenant/roles/{roleName}` | Delete custom role |
| GET | `/api/tenant/roles/permissions/available` | List available permissions |
| POST | `/api/tenant/roles/{roleName}/permissions` | Assign permission to role |
| DELETE | `/api/tenant/roles/{roleName}/permissions/{permission}` | Remove permission |
| **Subscriptions** | | |
| GET | `/api/tenant/subscriptions` | Get subscription details |
| **Platform Subscriptions** | | |
| GET | `/api/tenant/platform-subscriptions` | Get subscription overview |
| GET | `/api/tenant/platform-subscriptions/features` | List subscribed features |
| GET | `/api/tenant/platform-subscriptions/usage` | Get feature usage |
| GET | `/api/tenant/platform-subscriptions/invoices` | List invoices |
| POST | `/api/tenant/platform-subscriptions/renew` | Renew subscription |
| POST | `/api/tenant/platform-subscriptions/cancel` | Cancel subscription |
| POST | `/api/tenant/platform-subscriptions/convert-trial` | Convert trial to paid |
| POST | `/api/tenant/platform-subscriptions/change-plan` | Change subscription plan |
| **Add-Ons** | | |
| GET | `/api/tenant/addons` | List available add-ons |
| **Invoices** | | |
| GET | `/api/tenant/invoices` | List clinic invoices |
| GET | `/api/tenant/invoices/{id}` | Get invoice details |
| GET | `/api/tenant/invoices/{id}/download` | Download invoice PDF |
| POST | `/api/tenant/invoices/{id}/pay` | Pay an invoice |
| **Payments** | | |
| GET | `/api/tenant/payments` | List clinic payments |
| GET | `/api/tenant/payments/{id}` | Get payment details |
| POST | `/api/tenant/payments` | Create a payment |
| GET | `/api/tenant/payments/pending` | List pending payments |
| POST | `/api/tenant/payments/{id}/retry` | Retry failed payment |
| **Library (clinic-scoped)** | | |
| GET | `/api/tenant/library/exercises` | List exercises |
| GET | `/api/tenant/library/treatments` | List treatments |
| GET | `/api/tenant/library/modalities` | List modalities |
| GET | `/api/tenant/library/assessments` | List assessments |
| GET | `/api/tenant/library/devices` | List devices |
| GET | `/api/tenant/library/body-regions` | List body regions |
| POST | `/api/tenant/library/clone/{id}` | Clone a library item |
| **Exercises** | | |
| GET | `/api/tenant/exercises` | List exercises |
| GET | `/api/tenant/exercises/{id}` | Get exercise |
| POST | `/api/tenant/exercises` | Create exercise |
| PUT | `/api/tenant/exercises/{id}` | Update exercise |
| DELETE | `/api/tenant/exercises/{id}` | Delete exercise |
| **Treatments** | | |
| GET | `/api/tenant/treatments` | List treatments |
| GET | `/api/tenant/treatments/{id}` | Get treatment |
| POST | `/api/tenant/treatments` | Create treatment |
| PUT | `/api/tenant/treatments/{id}` | Update treatment |
| DELETE | `/api/tenant/treatments/{id}` | Delete treatment |
| **Stages** | | |
| GET | `/api/tenant/stages/{treatmentId}` | List treatment stages |
| GET | `/api/tenant/stages/{treatmentId}/{stageId}` | Get stage details |
| POST | `/api/tenant/stages/{treatmentId}` | Create stage |
| PUT | `/api/tenant/stages/{treatmentId}/{stageId}` | Update stage |
| DELETE | `/api/tenant/stages/{treatmentId}/{stageId}` | Delete stage |
| **Modalities** | | |
| GET | `/api/tenant/modalities` | List modalities |
| GET | `/api/tenant/modalities/{id}` | Get modality |
| POST | `/api/tenant/modalities` | Create modality |
| PUT | `/api/tenant/modalities/{id}` | Update modality |
| DELETE | `/api/tenant/modalities/{id}` | Delete modality |
| **Assessments** | | |
| GET | `/api/tenant/assessments` | List assessments |
| GET | `/api/tenant/assessments/{id}` | Get assessment |
| POST | `/api/tenant/assessments` | Create assessment |
| PUT | `/api/tenant/assessments/{id}` | Update assessment |
| DELETE | `/api/tenant/assessments/{id}` | Delete assessment |
| **Devices** | | |
| GET | `/api/tenant/devices` | List devices |
| GET | `/api/tenant/devices/{id}` | Get device |
| POST | `/api/tenant/devices` | Create device |
| PUT | `/api/tenant/devices/{id}` | Update device |
| DELETE | `/api/tenant/devices/{id}` | Delete device |
| **Body Regions** | | |
| GET | `/api/tenant/body-regions` | List body regions |
| GET | `/api/tenant/body-regions/tree` | Get body region tree |
| **Usage** | | |
| GET | `/api/tenant/usage` | Get usage summary |
| GET | `/api/tenant/usage/history` | Get usage history |
| GET | `/api/tenant/usage/features` | Get per-feature usage |
| GET | `/api/tenant/usage/limits` | Get feature limits |
| **Data Export** | | |
| POST | `/api/tenant/data-export` | Export clinic data |
| **Tenant Settings** | | |
| GET | `/api/tenant` | Get tenant details |
| PUT | `/api/tenant` | Update tenant settings |

### Admin (requires platform admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Platform Users** | | |
| GET | `/api/admin/platform-users` | List platform admins |
| GET | `/api/admin/platform-users/{id}` | Get admin details |
| POST | `/api/admin/platform-users` | Create admin user |
| PUT | `/api/admin/platform-users/{id}` | Update admin user |
| DELETE | `/api/admin/platform-users/{id}` | Delete admin user |
| POST | `/api/admin/platform-users/{id}/toggle-status` | Enable/disable admin |
| **Platform Roles** | | |
| GET | `/api/admin/roles` | List platform roles |
| GET | `/api/admin/roles/{id}` | Get role details |
| POST | `/api/admin/roles` | Create platform role |
| PUT | `/api/admin/roles/{id}` | Update platform role |
| DELETE | `/api/admin/roles/{id}` | Delete platform role |
| **Clinic Management** | | |
| GET | `/api/admin/clinics` | List all clinics (filterable) |
| GET | `/api/admin/clinics/{id}` | Get clinic details |
| PUT | `/api/admin/clinics/{id}` | Update clinic |
| DELETE | `/api/admin/clinics/{id}` | Delete clinic |
| POST | `/api/admin/clinics/{id}/approve` | Approve clinic |
| POST | `/api/admin/clinics/{id}/reject` | Reject clinic |
| POST | `/api/admin/clinics/{id}/ban` | Ban clinic |
| POST | `/api/admin/clinics/{id}/unban` | Unban clinic |
| POST | `/api/admin/clinics/{id}/suspend` | Suspend clinic |
| POST | `/api/admin/clinics/{id}/activate` | Reactivate clinic |
| POST | `/api/admin/clinics` | Create clinic (admin) |
| POST | `/api/admin/clinics/import` | Import clinics from Excel |
| POST | `/api/admin/clinics/{id}/billing/activate-cash` | Activate cash payment |
| POST | `/api/admin/clinics/{id}/billing/subscription` | Update subscription |
| **Subscriptions** | | |
| GET | `/api/admin/subscriptions` | List all subscriptions |
| GET | `/api/admin/subscriptions/{id}` | Get subscription |
| POST | `/api/admin/subscriptions` | Create subscription |
| PUT | `/api/admin/subscriptions/{id}` | Update subscription |
| POST | `/api/admin/subscriptions/{id}/activate` | Activate subscription |
| POST | `/api/admin/subscriptions/{id}/suspend` | Suspend subscription |
| POST | `/api/admin/subscriptions/{id}/cancel` | Cancel subscription |
| GET | `/api/admin/subscriptions/{id}/history` | Subscription history |
| **Features** | | |
| GET | `/api/admin/features` | List features |
| GET | `/api/admin/features/{id}` | Get feature |
| POST | `/api/admin/features` | Create feature |
| PUT | `/api/admin/features/{id}` | Update feature |
| DELETE | `/api/admin/features/{id}` | Delete feature |
| GET | `/api/admin/features/{id}/pricing` | Get feature pricing |
| PUT | `/api/admin/features/{id}/pricing` | Set feature pricing |
| POST | `/api/admin/features/{id}/toggle` | Enable/disable feature |
| GET | `/api/admin/features/codes` | List feature codes |
| **Feature Categories** | | |
| GET | `/api/admin/feature-categories` | List categories |
| GET | `/api/admin/feature-categories/{id}` | Get category |
| POST | `/api/admin/feature-categories` | Create category |
| PUT | `/api/admin/feature-categories/{id}` | Update category |
| DELETE | `/api/admin/feature-categories/{id}` | Delete category |
| GET | `/api/admin/feature-categories/{id}/features` | List features in category |
| **Packages** | | |
| GET | `/api/admin/packages` | List packages |
| GET | `/api/admin/packages/{id}` | Get package |
| POST | `/api/admin/packages` | Create package |
| PUT | `/api/admin/packages/{id}` | Update package |
| DELETE | `/api/admin/packages/{id}` | Delete package |
| POST | `/api/admin/packages/{id}/toggle` | Enable/disable package |
| POST | `/api/admin/packages/{id}/set-default` | Set as default |
| GET | `/api/admin/packages/{id}/snapshot` | Get package snapshot |
| POST | `/api/admin/packages/{id}/duplicate` | Duplicate package |
| **Invoices** | | |
| GET | `/api/admin/invoices` | List all invoices |
| GET | `/api/admin/invoices/{id}` | Get invoice |
| POST | `/api/admin/invoices` | Create invoice |
| PUT | `/api/admin/invoices/{id}` | Update invoice |
| POST | `/api/admin/invoices/{id}/send` | Send invoice to clinic |
| **Tax** | | |
| GET | `/api/admin/settings/tax` | List tax configs |
| GET | `/api/admin/settings/tax/{id}` | Get tax config |
| POST | `/api/admin/settings/tax` | Create tax config |
| PUT | `/api/admin/settings/tax/{id}` | Update tax config |
| **Permissions** | | |
| GET | `/api/admin/permissions` | List all permissions |
| GET | `/api/admin/permissions/resources` | List resources |
| GET | `/api/admin/permissions/roles/{roleName}` | Get role permissions |
| POST | `/api/admin/permissions/roles/{roleName}` | Assign permission |
| DELETE | `/api/admin/permissions/roles/{roleName}/{permission}` | Remove permission |
| GET | `/api/admin/permissions/features` | List feature permissions |
| **Add-Ons** | | |
| GET | `/api/admin/add-ons` | List add-ons |
| POST | `/api/admin/add-ons` | Create add-on |
| PUT | `/api/admin/add-ons/{id}` | Update add-on |
| **Global Library** | | |
| GET | `/api/admin/exercises` | List global exercises |
| GET | `/api/admin/exercises/{id}` | Get exercise |
| POST | `/api/admin/exercises` | Create exercise |
| PUT | `/api/admin/exercises/{id}` | Update exercise |
| DELETE | `/api/admin/exercises/{id}` | Delete exercise |
| GET | `/api/admin/treatments` | List global treatments |
| GET | `/api/admin/treatments/{id}` | Get treatment |
| POST | `/api/admin/treatments` | Create treatment |
| PUT | `/api/admin/treatments/{id}` | Update treatment |
| DELETE | `/api/admin/treatments/{id}` | Delete treatment |
| GET | `/api/admin/modalities` | List global modalities |
| GET | `/api/admin/modalities/{id}` | Get modality |
| POST | `/api/admin/modalities` | Create modality |
| PUT | `/api/admin/modalities/{id}` | Update modality |
| DELETE | `/api/admin/modalities/{id}` | Delete modality |
| GET | `/api/admin/assessments` | List global assessments |
| GET | `/api/admin/assessments/{id}` | Get assessment |
| POST | `/api/admin/assessments` | Create assessment |
| PUT | `/api/admin/assessments/{id}` | Update assessment |
| DELETE | `/api/admin/assessments/{id}` | Delete assessment |
| GET | `/api/admin/devices` | List global devices |
| GET | `/api/admin/devices/{id}` | Get device |
| POST | `/api/admin/devices` | Create device |
| PUT | `/api/admin/devices/{id}` | Update device |
| DELETE | `/api/admin/devices/{id}` | Delete device |
| GET | `/api/admin/library` | List body regions |
| **Audit Logs** | | |
| GET | `/api/admin/audit-logs` | Query audit logs |
| GET | `/api/admin/audit-logs/{id}` | Get audit log entry |
| **Communication** | | |
| POST | `/api/communication/email` | Send email |
| POST | `/api/communication/sms` | Send SMS |
| POST | `/api/communication/notification` | Send notification |
| GET | `/api/communication/templates` | List email templates |

### Webhooks (server-to-server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe payment webhook |
| POST | `/api/webhooks/paymob` | PayMob payment webhook |

---

## Common Patterns

### Filtering & Pagination

List endpoints support query parameters:

```
GET /api/admin/clinics?status=Active&page=1&pageSize=20&search=rehab
```

Common query params:
- `page` (int, default 1)
- `pageSize` (int, default 20)
- `search` (string, text search)
- `sortBy` (string, field name)
- `sortDirection` (string, "asc" or "desc")
- `status` (enum value or name)

### GUID IDs

All entity IDs are GUIDs:

```
GET /api/admin/clinics/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

### Error Handling Pattern

```typescript
const response = await fetch('/api/tenant/exercises', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});

const result = await response.json();

if (!result.success) {
  // result.error.code  → machine-readable (e.g., "VALIDATION_ERROR")
  // result.error.message → human-readable
  // result.error.details → array of specific issues (optional)

  switch (result.error.code) {
    case 'TOKEN_EXPIRED':
      await refreshToken();
      break;
    case 'VALIDATION_ERROR':
      showFieldErrors(result.error.details);
      break;
    case 'FEATURE_NOT_AVAILABLE':
      showUpgradePrompt();
      break;
    default:
      showToast(result.error.message);
  }
}
```

### Token Refresh Flow

```
1. Make API call → get 401 with TOKEN_EXPIRED
2. Call POST /api/auth/refresh with stored refreshToken
3. Store new tokens
4. Retry original request
5. If refresh fails → redirect to login
```

---

## Swagger UI

Interactive API explorer available at:

```
https://localhost:5001/swagger
```

All endpoints are grouped by tags matching the sections above.
