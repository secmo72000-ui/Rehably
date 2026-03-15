git pull origin main# Backend Changes — Branch `031-owner-portal-integration`

> What changed in the backend and why it matters for the frontend.
> **Date:** 2026-03-13 | **Files changed:** 38 | **+839 / -288 lines**

---

## Summary of Changes

| Area | What Changed | Impact |
|------|-------------|--------|
| Auth | Phone OTP login/verify/resend + forgot-password endpoints added to `/api/auth` | New endpoints frontend can use |
| Clinics | Response wrapping unified, owner info enriched | Response shape is now consistent |
| Packages | Feature pricing populated, public filter fixed | Package detail now has real prices |
| Admin users | Role response simplified to `RoleReferenceDto` | Smaller payload, fewer fields |
| Library | Duplicate code validation, DB error handling | Better error messages on create/update |
| Tax | Default config returned when none exists | No more 400 error on first load |
| Swagger | Enabled in all environments (not just Development) | Swagger UI always available |
| Tests | Updated to match new signatures | No frontend impact |

---

## 1. New Auth Endpoints

Three new endpoints added directly on `AuthController` (aliases for OTP controller):

### `POST /api/auth/login-via-otp` — NEW
Request phone-based OTP login.
```json
{ "phone": "01000000000" }
// → 200 { success: true, message: "OTP sent to your phone" }
```

### `POST /api/auth/verify-otp-login` — NEW
Verify OTP and get JWT tokens.
```json
{ "phone": "01000000000", "otp": "123456" }
// → 200 { success: true, data: { accessToken, refreshToken, expiresAt, ... } }
```

### `POST /api/auth/resend-otp` — NEW
Resend OTP code (invalidates previous).
```json
{ "phone": "01000000000", "purpose": 0 }
// → 200 { success: true, message: "New code sent. Previous code invalidated." }
// → 429 if rate-limited (cooldown active)
```

### `POST /api/auth/forgot-password` — NEW
Request password reset OTP via email.
```json
{ "email": "user@example.com" }
// → 200 { success: true, message: "If the email exists, a reset code was sent" }
```
> Always returns 200 to prevent email enumeration.

### New DTOs

```typescript
interface PhoneOtpLoginRequestDto {
  phone: string;
}

interface PhoneOtpVerifyRequestDto {
  phone: string;
  otp: string;
}

interface PhoneOtpResendRequestDto {
  phone: string;
  purpose: OtpPurpose; // 0=Login, 1=PasswordReset, 2=EmailVerification
}
```

---

## 2. Admin Clinics — Response Wrapping Fixed

**Before:** Controllers returned raw `Ok(result.Value)`, `BadRequest(new { error })`, `NotFound(new { error })` — inconsistent shapes.

**After:** All endpoints now use `BaseController` helpers → consistent `ApiResponse<T>` wrapping.

| Endpoint | Before | After |
|----------|--------|-------|
| `GET /api/admin/clinics` | `Ok(result.Value)` | `Success(result.Value)` |
| `GET /api/admin/clinics/{id}` | `NotFound({ error })` | `NotFoundError(result.Error)` |
| `PUT /api/admin/clinics/{id}` | `BadRequest({ error })` | `ValidationError(result.Error)` |
| `POST /{id}/suspend` | `Ok({ message })` | `Success("Clinic suspended successfully")` |
| `POST /{id}/activate` | `Ok({ message })` | `Success("Clinic activated successfully")` |
| `POST /{id}/ban` | `Ok({ message, clinicId })` | `Success("Clinic banned successfully")` |
| `POST /{id}/unban` | `Ok({ message, clinicId })` | `Success("Clinic unbanned successfully")` |

**Frontend impact:** All responses are now wrapped in `{ success, data, message, error }`. If your frontend was handling raw `{ error: "..." }` responses, update to use `response.data.error.message` instead.

---

## 3. Clinic Response — Owner Info Enriched

`GET /api/admin/clinics/{id}` and `GET /api/tenant/clinics/me` now include owner details:

```json
{
  "ownerFirstName": "Ahmed",
  "ownerLastName": "Hassan",
  "ownerEmail": "ahmed@clinic.com"
}
```

**Before:** These fields were always `null`.
**After:** Backend queries the clinic owner user and populates them.

Also uses `GetWithSubscriptionAndPackageAsync` instead of `GetWithSubscriptionAsync` — subscription plan name is now populated.

---

## 4. Admin Users — Simplified Role Response

`PlatformAdminResponse.Role` changed from `PlatformRoleResponse` (heavy, with permissions/users/count) to `RoleReferenceDto` (lightweight):

**Before:**
```json
{
  "role": {
    "id": "...",
    "name": "PlatformAdmin",
    "description": "...",
    "permissions": ["clinics.view", "clinics.edit", ...],
    "userCount": 4,
    "createdAt": "..."
  }
}
```

**After:**
```json
{
  "role": {
    "id": "...",
    "name": "PlatformAdmin"
  }
}
```

**Frontend impact:** If you're reading `user.role.permissions` or `user.role.userCount` from the admin user response — those fields no longer exist. Fetch role details separately from the roles endpoint.

---

## 5. Package Details — Real Pricing Now Populated

`GET /api/public/packages/{id}/details` and `GET /api/admin/packages/{id}/details` now return **actual feature prices** instead of zeros.

**Before:**
```json
{
  "featurePrice": 0,
  "pricingType": { "Fixed": 0 },  // was enum object
  "perUnitPrice": null
}
```

**After:**
```json
{
  "featurePrice": 50.00,
  "pricingType": 0,                // now integer
  "perUnitPrice": 50.00
}
```

### Breaking changes:
| Field | Before | After |
|-------|--------|-------|
| `pricingType` | `PricingType` enum object | `int` (0=Fixed, 1=PerUnit, etc.) |
| `perUnitPrice` | `decimal?` (nullable) | `decimal` (non-nullable, defaults to 0) |
| `featurePrice` | Always 0 | Actual price from pricing history |

**Frontend impact:** Update TypeScript types — `pricingType` is now `number`, `perUnitPrice` is now `number` (not `number | null`).

---

## 6. Public Packages — Filter Fix

`GET /api/public/packages` now properly filters:

**Before:** Could return non-public packages in the list.
**After:** Only packages where `isPublic === true` are returned.

Also fixed status check: was using `IsActive` boolean, now checks `Status == PackageStatus.Active` — more precise.

---

## 7. Tax Configuration — Default Fallback

`GET /api/admin/settings/tax` behavior changed:

**Before:** Returns `400 Bad Request` when no tax config exists in DB.
**After:** Returns `200 OK` with a sensible default:

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "name": "Default VAT (Egypt)",
  "countryCode": "EG",
  "taxRate": 14.00,
  "effectiveDate": "2026-03-13T...",
  "isDefault": true,
  "createdBy": "system"
}
```

**Frontend impact:** Remove any error handling for "tax config not found" — it always returns data now.

---

## 8. Library Services — Validation + Error Handling

All library create/update endpoints (Treatments, Modalities, Assessments) now have:

### Pre-validation
- `Code` is required and max 20 chars
- `Name` is required
- Duplicate `Code` check within same clinic scope

### PostgreSQL error handling
Database constraint violations return friendly messages instead of 500 errors:

| PostgreSQL Code | Error Message |
|----------------|---------------|
| `23505` (unique violation) | "A treatment with code 'X' already exists" |
| `22001` (string overflow) | "One or more field values exceed the maximum allowed length" |
| Other | "Failed to create treatment due to a database constraint violation" |

### Treatment list — body region name populated
`GET /api/admin/library/treatments` now includes `bodyRegionCategoryName` from the navigation property (was `null` before).

---

## 9. Clinic Creation — Returns Temp Password

`CreateClinicAsync` now returns `ClinicCreationResult` instead of `ClinicResponse`:

```typescript
interface ClinicCreationResult {
  clinic: ClinicResponse;
  tempPassword: string;   // Generated password for clinic owner
}
```

**Frontend impact:** If admin creates a clinic, the response now includes the temporary password to share with the clinic owner.

---

## 10. Owner Permissions Expanded

When a clinic is created, the owner role now gets these **additional permissions** (beyond the previous basic set):

```
library.view, library.manage,
roles.view, roles.create, roles.update, roles.delete,
invoices.view, invoices.create,
stages.view, stages.manage,
users.view, users.create, users.update, users.delete,
subscriptions.view
```

**Frontend impact:** Clinic owners can now access library, roles, users, invoices, and stages in their portal without getting 403 errors.

---

## 11. Temp Password Generation — More Secure

The `GenerateTemporaryPassword()` method was rewritten to **guarantee** at least one uppercase, one lowercase, one digit, and one special character — then shuffle. Previously, random selection could (rarely) produce passwords that didn't meet ASP.NET Identity complexity requirements.

---

## 12. BaseController — Admin ID Fix

`CurrentAdminId` (was `Guid`) changed to `CurrentAdminIdString` (now `string`).

**Why:** Prevents `FormatException` when the claim value isn't a valid GUID (ASP.NET Identity uses string IDs).

---

## 13. Swagger — Always Enabled

Swagger UI is no longer gated behind `IsDevelopment()`. It's available in all environments.

```
GET /swagger → Swagger UI
```

---

## 14. Mapster — MaxDepth(1) for Treatments

Treatment mapping config now has `MaxDepth(1)` to prevent circular reference issues when mapping navigation properties (BodyRegionCategory → Treatments → BodyRegionCategory → ...).

---

## Migration Checklist for Frontend

- [ ] Add `PhoneOtpLoginRequestDto`, `PhoneOtpVerifyRequestDto`, `PhoneOtpResendRequestDto` types
- [ ] Update auth service to use new `/api/auth/login-via-otp`, `/verify-otp-login`, `/resend-otp`, `/forgot-password`
- [ ] Update `PackageFeatureDto.pricingType` from enum to `number`
- [ ] Update `PackageFeatureDto.perUnitPrice` from `number | null` to `number`
- [ ] Update admin user response — `role` is now `{ id, name }` only (no permissions/userCount)
- [ ] Remove tax config error handling — always returns 200 now
- [ ] Update clinic creation response — now returns `{ clinic, tempPassword }`
- [ ] All admin clinic endpoints now return `ApiResponse<T>` wrapper (not raw objects)
- [ ] Clinic response now has `ownerFirstName`, `ownerLastName`, `ownerEmail` populated
