g# Rehably Backend API - Frontend Integration Guide

**Version:** 1.0
**Last Updated:** 2026-01-29
**Base URL:** `https://api.rehably.com/api` (or your configured base URL)

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Clinic Management (Platform Admin)](#2-clinic-management-platform-admin)
3. [Role & Permission Management](#3-role--permission-management)
4. [User Management](#4-user-management)
5. [Package & Pricing Management](#5-package--pricing-management)
6. [Feature & Usage Tracking](#6-feature--usage-tracking)
7. [Response Format Standards](#7-response-format-standards)
8. [Error Handling](#8-error-handling)

---

## 1. Authentication & Authorization

### 1.1 Overview

The API supports multiple authentication methods:
- **Password-based login** - Traditional email/password authentication
- **OTP-based login** - Passwordless authentication using one-time codes sent via email
- **Refresh token rotation** - Secure token refresh mechanism

### 1.2 Password Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "UserPassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_abc123xyz...",
    "expiresAt": "2026-01-29T13:15:00Z",
    "mustChangePassword": false,
    "emailVerified": true
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Token Expiration Rules:**
- Normal access token: **15 minutes**
- When `mustChangePassword = true`: **5 minutes**
- Refresh token: **7 days**

### 1.3 OTP Login (Passwordless)

**Step 1: Request OTP**

**Endpoint:** `POST /api/auth/login-via-otp`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Step 2: Verify OTP and Login**

**Endpoint:** `POST /api/auth/verify-otp-login`

**Request:**
```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```

**Response:** Same as password login (section 1.2)

### 1.4 Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "rt_abc123xyz..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_newtoken456...",
    "expiresAt": "2026-01-29T13:30:00Z"
  }
}
```

**Important:** The old refresh token is invalidated after use. Always use the new refresh token.

### 1.5 Logout

**Endpoint:** `POST /api/auth/logout`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### 1.6 Password Reset Flow

**Step 1: Request Reset Link**

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If email exists, reset link sent"
}
```

**Step 2: Reset Password**

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "selector.token",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 1.7 Change Password (Authenticated)

**Endpoint:** `POST /api/auth/change-password`
**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 1.8 Get Current User

**Endpoint:** `GET /api/auth/me`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "isActive": true,
    "mustChangePassword": false,
    "emailVerified": true,
    "tenantId": 1,
    "clinicId": 1,
    "roles": ["ClinicOwner_1"],
    "createdAt": "2026-01-01T00:00:00Z",
    "lastLoginAt": "2026-01-29T12:00:00Z",
    "accessFailedCount": 0,
    "lockoutEnd": null
  }
}
```

### 1.9 JWT Token Structure

**Claims included in JWT:**
```javascript
{
  // Standard claims
  "nameid": "user-id",           // User ID
  "jti": "guid",                 // JWT ID
  "exp": 1234567890,            // Expiration timestamp

  // Custom claims
  "mustChangePassword": "false", // Forces redirect to change password
  "TenantId": "1",               // Multi-tenancy
  "ClinicId": "1",              // Clinic association
  "role": "ClinicOwner_1",      // User role(s)
  "Permission": "patients.view"  // Permission(s) - multiple claims
}
```

### 1.10 Special Login Scenarios

#### First Login (Must Change Password)

When a user logs in for the first time (admin-created), the response includes:
```json
{
  "mustChangePassword": true,
  "expiresAt": "2026-01-29T12:05:00Z"  // Only 5 minutes!
}
```

**Frontend Action:** Immediately redirect to a "Change Password" page.

#### Email Not Verified

If email is not verified:
```json
{
  "success": false,
  "error": "Email verification required. Please verify your email to continue.",
  "requiresEmailVerification": true
}
```

#### Account Locked

```json
{
  "success": false,
  "error": "Account locked due to too many failed attempts. Try again in 15 minutes"
}
```

#### Account Disabled

```json
{
  "success": false,
  "error": "Account is disabled"
}
```

---

## 2. Clinic Management (Platform Admin)

### 2.1 Create Clinic

**Endpoint:** `POST /api/admin/clinics`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "clinicName": "City Physiotherapy Center",
  "clinicNameArabic": "مركز العلاج الطبيعي",
  "phone": "+201234567890",
  "email": "clinic@example.com",
  "address": "123 Main Street, Downtown",
  "city": "Cairo",
  "country": "Egypt",
  "logoUrl": "https://example.com/logo.png",
  "packageId": 1,
  "billingCycle": 1,
  "ownerEmail": "owner@example.com",
  "ownerFirstName": "Ahmed",
  "ownerLastName": "Mohamed",
  "settings": {
    "language": "en",
    "timezone": "Africa/Cairo"
  }
}
```

**Field Requirements:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clinicName` | string | ✅ | Clinic name (max 200 chars) |
| `clinicNameArabic` | string | ❌ | Arabic name (max 200 chars) |
| `phone` | string | ✅ | Contact phone (max 20 chars) |
| `email` | string | ❌ | Clinic email |
| `address` | string | ❌ | Physical address (max 500 chars) |
| `city` | string | ❌ | City name (max 100 chars) |
| `country` | string | ❌ | Country name (max 100 chars) |
| `logoUrl` | string | ❌ | URL to clinic logo |
| `packageId` | integer | ✅ | Subscription package ID |
| `billingCycle` | integer | ❌ | 1 = Monthly, 2 = Yearly (default: 1) |
| `ownerEmail` | string | ✅ | Clinic owner email |
| `ownerFirstName` | string | ✅ | Owner first name (max 100 chars) |
| `ownerLastName` | string | ✅ | Owner last name (max 100 chars) |
| `settings` | object | ❌ | Custom clinic settings |

**BillingCycle Enum:**
```javascript
{
  Monthly: 1,
  Yearly: 2
}
```

**Success Response (200 OK):**
```json
{
  "clinic": {
    "id": 1,
    "name": "City Physiotherapy Center",
    "nameArabic": "مركز العلاج الطبيعي",
    "slug": "city-physiotherapy-center",
    "logoUrl": "https://example.com/logo.png",
    "description": null,
    "phone": "+201234567890",
    "email": "clinic@example.com",
    "address": "123 Main Street, Downtown",
    "city": "Cairo",
    "country": "Egypt",
    "subscriptionStatus": "Active",
    "subscriptionStartDate": "2026-01-29T00:00:00Z",
    "subscriptionEndDate": "2026-02-28T23:59:59Z",
    "storageUsedBytes": 0,
    "storageLimitBytes": 1048576000,
    "patientsCount": 0,
    "patientsLimit": 100,
    "usersCount": 0,
    "usersLimit": 5,
    "storageUsedPercentage": 0,
    "patientsUsedPercentage": 0,
    "usersUsedPercentage": 0,
    "tempPassword": "xK7$mP2@nQ4",
    "createdAt": "2026-01-29T00:00:00Z",
    "updatedAt": "2026-01-29T00:00:00Z"
  },
  "subscription": {
    "id": 1,
    "status": "Active",
    "startDate": "2026-01-29T00:00:00Z",
    "endDate": "2026-02-28T23:59:59Z",
    "trialEndsAt": null,
    "packageId": 1,
    "packageName": "Basic Package",
    "priceSnapshot": { ... }
  },
  "paymentTransactionId": "txn_abc123"
}
```

**What happens on creation:**
1. Clinic entity is created
2. Subscription is created with selected package
3. Cash payment is recorded automatically
4. Clinic owner user is created with temporary password
5. Welcome email is sent with credentials
6. Custom role `ClinicOwner_{clinicId}` is created
7. Clinic is activated

### 2.2 List All Clinics

**Endpoint:** `GET /api/admin/clinics?page=1&pageSize=20`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |
| `search` | string | - | Search by name/email |
| `status` | string | - | Filter by subscription status |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "City Physiotherapy Center",
      ... // Same structure as Create response
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 45,
    "totalPages": 3
  }
}
```

### 2.3 Get Clinic by ID

**Endpoint:** `GET /api/admin/clinics/{id}`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:** Same as individual clinic object in list response.

### 2.4 Update Clinic

**Endpoint:** `PUT /api/admin/clinics/{id}`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "Updated Clinic Name",
  "nameArabic": "اسم العيادة المحدث",
  "description": "Clinic description",
  "phone": "+201234567899",
  "email": "updated@example.com",
  "address": "456 New Street",
  "city": "Alexandria",
  "country": "Egypt",
  "settings": {
    "language": "ar"
  }
}
```

**Response:** Updated clinic object.

### 2.5 Delete Clinic

**Endpoint:** `DELETE /api/admin/clinics/{id}`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `204 No Content`

### 2.6 Suspend Clinic

**Endpoint:** `POST /api/admin/clinics/{id}/suspend`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "message": "Clinic suspended successfully"
}
```

### 2.7 Activate Clinic

**Endpoint:** `POST /api/admin/clinics/{id}/activate`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "message": "Clinic activated successfully"
}
```

### 2.8 Update Clinic Subscription

**Endpoint:** `PUT /api/admin/clinics/{id}/subscription`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "newPackageId": 2
}
```

**Response:**
```json
{
  "message": "Subscription updated successfully",
  "subscription": {
    "id": 1,
    "status": "Active",
    "packageId": 2,
    "packageName": "Premium Package",
    "priceSnapshot": { ... }
  }
}
```

### 2.9 Get Pending Clinics

**Endpoint:** `GET /api/admin/clinics/pending`
**Permission Required:** `platform.manage_clinics`
**Headers:** `Authorization: Bearer {accessToken}`

Returns clinics awaiting approval (self-registered).

---

## 3. Role & Permission Management

### 3.1 Permission System Overview

**Permission Format:** `resource.action`

**Examples:**
- `clinics.view` - View clinic information
- `patients.create` - Create new patient
- `users.delete` - Delete users
- `*.view` - View all resources (wildcard)

### 3.2 Built-in Role Types

| Role Type | Value | Description |
|-----------|-------|-------------|
| `SuperAdmin` | 0 | Platform-wide administrator |
| `ClinicOwner` | 1 | Owns/controls clinic |
| `Doctor` | 2 | Medical professional |
| `Receptionist` | 3 | Front desk staff |
| `Staff` | 4 | General staff member |

### 3.3 Platform Role Management

#### Get All Platform Roles

**Endpoint:** `GET /api/admin/roles`
**Permission Required:** `platform.manage_roles`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "PlatformAdmin",
      "isCustom": false,
      "description": "Platform administrator with full access",
      "permissions": [
        "platform.manage_features",
        "platform.manage_packages",
        "platform.manage_clinics"
      ],
      "userCount": 3
    }
  ]
}
```

#### Create Platform Role

**Endpoint:** `POST /api/admin/roles`
**Permission Required:** `platform.manage_roles`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "ContentManager",
  "description": "Manages website content",
  "permissions": [
    "content.view",
    "content.create",
    "content.update"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "ContentManager",
    "description": "Manages website content",
    "isCustom": true,
    "permissions": [...]
  }
}
```

#### Update Platform Role

**Endpoint:** `PUT /api/admin/roles/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "description": "Updated description",
  "permissions": [
    "content.view",
    "content.create",
    "content.update",
    "content.delete"
  ]
}
```

#### Delete Platform Role

**Endpoint:** `DELETE /api/admin/roles/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `204 No Content`

### 3.4 Tenant (Clinic) Role Management

#### Get All Clinic Roles

**Endpoint:** `GET /api/tenant/roles`
**Permission Required:** `roles.view`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "ClinicOwner_1",
      "isCustom": true,
      "description": "Clinic owner with full permissions",
      "userCount": 1,
      "permissions": [
        "clinics.view",
        "clinics.update",
        "patients.view",
        "patients.create",
        "patients.update",
        "patients.delete"
      ]
    }
  ]
}
```

#### Create Custom Role

**Endpoint:** `POST /api/tenant/roles`
**Permission Required:** `roles.create`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "SeniorTherapist",
  "description": "Senior therapist with extended patient access",
  "permissions": [
    "patients.view",
    "patients.create",
    "patients.update",
    "appointments.view"
  ]
}
```

#### Get Available Permissions

**Endpoint:** `GET /api/tenant/roles/permissions/available`
**Headers:** `Authorization: Bearer {accessToken}`

Returns permissions based on the clinic's subscription package.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "resource": "patients",
      "actions": ["view", "create", "update", "delete"],
      "isIncluded": true
    },
    {
      "resource": "invoices",
      "actions": ["view", "create"],
      "isIncluded": false
    }
  ]
}
```

#### Assign Permission to Role

**Endpoint:** `POST /api/tenant/roles/{roleName}/permissions`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "permission": "patients.delete"
}
```

#### Remove Permission from Role

**Endpoint:** `DELETE /api/tenant/roles/{roleName}/permissions/{permission}`
**Headers:** `Authorization: Bearer {accessToken}`

### 3.5 Using Permissions in Controllers

The backend uses `[RequirePermission]` attribute:

```csharp
[RequirePermission(Permissions.Patients.View)]
public async Task<ActionResult> GetPatients() { }
```

Frontend must include the JWT in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### 3.6 Permission Invalidation

When permissions are modified, call this to invalidate cache:

**Endpoint:** (Internal service method, no direct HTTP endpoint)

Permission cache automatically invalidates after 30 minutes or when:
- User roles are modified
- Role permissions are updated
- Subscription package changes

---

## 4. User Management

### 4.1 Create User (Clinic Admin)

**Endpoint:** `POST /api/tenant/users`
**Permission Required:** Feature code `users` capacity
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "email": "therapist@example.com",
  "password": "TempPassword123!",
  "firstName": "Sara",
  "lastName": "Ahmed",
  "phoneNumber": "+201234567890",
  "roleType": 2
}
```

**Field Requirements:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | User email |
| `password` | string | ✅ | Initial password |
| `firstName` | string | ✅ | First name |
| `lastName` | string | ✅ | Last name |
| `phoneNumber` | string | ❌ | Contact phone |
| `roleType` | integer | ✅ | Role type (0-4) |

**RoleType Values:**
```javascript
{
  SuperAdmin: 0,
  ClinicOwner: 1,
  Doctor: 2,
  Receptionist: 3,
  Staff: 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

**What happens on creation:**
1. User capacity is checked (limited by subscription package)
2. User is created with `EmailVerified = true`, `MustChangePassword = true`
3. User is assigned to the specified role
4. Welcome email is sent with credentials

### 4.2 Upload User Avatar

**Endpoint:** `POST /api/tenant/users/upload-avatar`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "fileName": "avatar.jpg",
  "contentType": "image/jpeg",
  "fileSizeBytes": 524288,
  "base64Data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAA..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "storageUsed": 0.5
}
```

### 4.3 Get Usage Statistics

**Endpoint:** `GET /api/tenant/users/usage-stats`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "code": "users",
      "name": "Users",
      "limit": 10,
      "used": 3,
      "remaining": 7,
      "percentage": 30
    },
    "storage": {
      "code": "storage",
      "name": "Storage",
      "limit": 53687091200,
      "used": 2147483648,
      "remaining": 3222217752,
      "percentage": 40
    },
    "patients": {
      "code": "patients",
      "name": "Patients",
      "limit": 500,
      "used": 127,
      "remaining": 373,
      "percentage": 25.4
    }
  }
}
```

---

## 5. Package & Pricing Management

### 5.1 Package Overview

**Package Types:**
- **Public Packages** (`IsPublic = true`) - Available to all clinics
- **Custom Packages** (`IsCustom = true`) - Created for specific clinics
- **Standard Packages** - Default public packages with predefined features

**Package Status:**
```javascript
{
  Draft: 1,      // Package created but not active
  Active: 2,     // Package available for subscription
  Archived: 3    // Package retired but preserved
}
```

### 5.2 Get All Packages (Admin)

**Endpoint:** `GET /api/admin/packages`
**Permission Required:** `platform.manage_packages`
**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status (Draft, Active, Archived) |
| `isPublic` | boolean | - | Filter public/custom packages |
| `includeFeatures` | boolean | false | Include package features |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Basic Package",
      "code": "BASIC",
      "description": "Essential features for small clinics",
      "monthlyPrice": 100.00,
      "yearlyPrice": 1000.00,
      "calculatedMonthlyPrice": 100.00,
      "calculatedYearlyPrice": 1000.00,
      "isPublic": true,
      "isCustom": false,
      "status": "Active",
      "trialDays": 14,
      "displayOrder": 1,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### 5.3 Get Package Details

**Endpoint:** `GET /api/admin/packages/{id}/details`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Basic Package",
    "code": "BASIC",
    "description": "Essential features for small clinics",
    "monthlyPrice": 100.00,
    "yearlyPrice": 1000.00,
    "status": "Active",
    "trialDays": 14,
    "features": [
      {
        "id": 1,
        "featureId": 1,
        "featureName": "Users",
        "featureCode": "users",
        "featurePrice": 20.00,
        "pricingType": 2,
        "perUnitPrice": 20.00,
        "isIncluded": true,
        "quantity": 5,
        "calculatedPrice": 0.00,
        "category": "Core Features"
      },
      {
        "id": 2,
        "featureId": 2,
        "featureName": "Storage",
        "featureCode": "storage",
        "featurePrice": 10.00,
        "pricingType": 3,
        "perUnitPrice": 10.00,
        "isIncluded": true,
        "quantity": 10,
        "calculatedPrice": 0.00,
        "category": "Core Features"
      },
      {
        "id": 3,
        "featureId": 3,
        "featureName": "Patients",
        "featureCode": "patients",
        "featurePrice": 0.50,
        "pricingType": 4,
        "perUnitPrice": 0.50,
        "isIncluded": true,
        "quantity": 100,
        "calculatedPrice": 0.00,
        "category": "Core Features"
      }
    ]
  }
}
```

### 5.4 Create Package

**Endpoint:** `POST /api/admin/packages`
**Permission Required:** `platform.manage_packages`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "Premium Package",
  "code": "PREMIUM",
  "description": "Advanced features for growing clinics",
  "monthlyPrice": 299.00,
  "yearlyPrice": 2990.00,
  "calculatedMonthlyPrice": 299.00,
  "calculatedYearlyPrice": 2990.00,
  "isPublic": true,
  "isCustom": false,
  "trialDays": 14,
  "displayOrder": 2,
  "features": [
    {
      "featureId": 1,
      "quantity": 20,
      "isIncluded": true,
      "calculatedPrice": 0
    },
    {
      "featureId": 2,
      "quantity": 50,
      "isIncluded": true,
      "calculatedPrice": 0
    },
    {
      "featureId": 3,
      "quantity": 1000,
      "isIncluded": true,
      "calculatedPrice": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Premium Package",
    "code": "PREMIUM",
    "status": "Active",
    ...
  }
}
```

### 5.5 Update Package

**Endpoint:** `PUT /api/admin/packages/{id}`
**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "Premium Package v2",
  "description": "Updated description",
  "monthlyPrice": 349.00,
  "yearlyPrice": 3490.00,
  "trialDays": 30,
  "displayOrder": 2,
  "features": [
    {
      "featureId": 1,
      "quantity": 25,
      "isIncluded": true
    }
  ]
}
```

### 5.6 Activate Package

**Endpoint:** `POST /api/admin/packages/{id}/activate`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Package activated successfully"
}
```

### 5.7 Archive Package

**Endpoint:** `POST /api/admin/packages/{id}/archive`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Package archived successfully"
}
```

### 5.8 Recalculate Package Price

**Endpoint:** `POST /api/admin/packages/{id}/recalculate`
**Headers:** `Authorization: Bearer {accessToken}`

**Response:** Updated package with recalculated prices.

### 5.9 Public Package Endpoints

**Get Public Packages:**
```
GET /api/public/packages
GET /api/public/packages/{id}
GET /api/public/packages/{id}/details
GET /api/public/packages/by-status/{status}
```

These endpoints do not require authentication and can be used on pricing pages.

### 5.10 Package Calculator

**Calculate Price:**
```
POST /api/public/package-calculator/packages/{packageId}/calculate
```

**Request Body:**
```json
{
  "userCount": 15,
  "storageGB": 25,
  "featureQuantities": {
    "1": 500,
    "4": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basePrice": 299.00,
    "userPrice": 200.00,
    "storagePrice": 150.00,
    "featurePrices": [
      {
        "featureId": 3,
        "featureName": "Patients",
        "quantity": 500,
        "unitPrice": 0.50,
        "totalPrice": 250.00
      }
    ],
    "totalMonthlyPrice": 899.00
  }
}
```

---

## 6. Feature & Usage Tracking

### 6.1 Feature Categories

| Code | Name | Pricing Type | Description |
|------|------|-------------|-------------|
| `users` | Users | PerUser | Number of user accounts |
| `storage` | Storage | PerStorageGB | Storage space in GB |
| `patients` | Patients | PerUnit | Patient records |
| `sms` | SMS | PerUnit | SMS messages per month |
| `whatsapp` | WhatsApp | PerUnit | WhatsApp messages per month |
| `email` | Email | PerUnit | Email notifications per month |

### 6.2 Pricing Types

```javascript
{
  Fixed: 1,        // One-time fee
  PerUser: 2,      // Price per user
  PerStorageGB: 3, // Price per GB
  PerUnit: 4       // Price per unit
}
```

### 6.3 Usage Tracking Response Format

See section 4.3 for the `/api/tenant/users/usage-stats` endpoint.

---

## 7. Response Format Standards

### 7.1 Success Response

**Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### 7.2 Error Response

**Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required or failed
- `FORBIDDEN` - Permission denied
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FEATURE_LIMIT_EXCEEDED` - Subscription feature limit reached

---

## 8. Error Handling

### 8.1 HTTP Status Codes

| Code | Meaning | Example Scenario |
|------|---------|------------------|
| 200 | Success | GET request successful |
| 201 | Created | POST created resource successfully |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Unexpected server error |

### 8.2 Handling mustChangePassword

When `mustChangePassword = true` in login response:

```javascript
if (response.data.mustChangePassword) {
  // Redirect to change password page
  // User has only 5 minutes before token expires
  router.push('/change-password');
}
```

### 8.3 Handling Token Expiration

```javascript
// On 401 Unauthorized response
if (error.response?.status === 401) {
  // Try refresh token
  const refreshSuccess = await tryRefreshToken();
  if (!refreshSuccess) {
    // Redirect to login
    router.push('/login');
  }
}
```

### 8.4 Handling Feature Limits

```javascript
// On 429 or FEATURE_LIMIT_EXCEEDED error
if (error.response?.data?.error?.code === 'FEATURE_LIMIT_EXCEEDED') {
  // Show upgrade prompt
  showUpgradeDialog(error.response.data.error.message);
}
```

---

## 9. Frontend Implementation Tips

### 9.1 Token Storage

```javascript
// Store tokens securely
const authStore = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),

  setTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
```

### 9.2 Axios Interceptor

```javascript
axios.interceptors.request.use(config => {
  const token = authStore.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: authStore.refreshToken
        });

        authStore.setTokens(data.accessToken, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axios(originalRequest);
      } catch {
        authStore.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

### 9.3 Permission Checking

```javascript
// Check if user has permission
function hasPermission(permissions, resource, action) {
  return permissions.some(p =>
    p === `${resource}.${action}` ||
    p === `${resource}.*` ||
    p === '*.*'
  );
}

// Usage in component
if (hasPermission(userPermissions, 'patients', 'create')) {
  // Show "Add Patient" button
}
```

---

## 10. Quick Reference: Endpoint Summary

### Authentication

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` | ❌ |
| POST | `/api/auth/login-via-otp` | ❌ |
| POST | `/api/auth/verify-otp-login` | ❌ |
| POST | `/api/auth/logout` | ✅ |
| POST | `/api/auth/refresh` | ❌ |
| POST | `/api/auth/forgot-password` | ❌ |
| POST | `/api/auth/reset-password` | ❌ |
| POST | `/api/auth/change-password` | ✅ |
| GET | `/api/auth/me` | ✅ |

### Platform Admin (Clinics)

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/admin/clinics` | `platform.manage_clinics` |
| POST | `/api/admin/clinics` | `platform.manage_clinics` |
| GET | `/api/admin/clinics/{id}` | `platform.manage_clinics` |
| PUT | `/api/admin/clinics/{id}` | `platform.manage_clinics` |
| DELETE | `/api/admin/clinics/{id}` | `platform.manage_clinics` |
| POST | `/api/admin/clinics/{id}/suspend` | `platform.manage_clinics` |
| POST | `/api/admin/clinics/{id}/activate` | `platform.manage_clinics` |
| PUT | `/api/admin/clinics/{id}/subscription` | `platform.manage_clinics` |

### Platform Admin (Packages)

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/admin/packages` | `platform.manage_packages` |
| POST | `/api/admin/packages` | `platform.manage_packages` |
| PUT | `/api/admin/packages/{id}` | `platform.manage_packages` |
| DELETE | `/api/admin/packages/{id}` | `platform.manage_packages` |

### Tenant (Clinic) Users

| Method | Endpoint | Permission |
|--------|----------|------------|
| POST | `/api/tenant/users` | Feature: `users` |
| GET | `/api/tenant/users/usage-stats` | ✅ |

### Tenant Roles

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/tenant/roles` | `roles.view` |
| POST | `/api/tenant/roles` | `roles.create` |
| PUT | `/api/tenant/roles/{roleName}` | `roles.update` |
| DELETE | `/api/tenant/roles/{roleName}` | `roles.delete` |

---

## 11. Support

For questions or issues, contact the backend team or refer to the API Swagger documentation at `/swagger` when running in development mode.
