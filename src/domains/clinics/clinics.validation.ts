/**
 * Clinic Validation Rules
 * 
 * Domain-level validation for clinic data.
 * Follows the domain-first architecture — validation lives alongside
 * types, service, and store in the clinics domain folder.
 */

// ===== Regex Patterns =====
const ARABIC_REGEX = /^[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/;
const EGYPTIAN_PHONE_REGEX = /^01[0125]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ===== Step 1 Validation =====

export interface Step1Data {
  clinicNameArabic: string;
  clinicName: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  slug: string;
}

export interface Step1Errors {
  clinicNameArabic?: string;
  clinicName?: string;
  ownerFirstName?: string;
  ownerEmail?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  slug?: string;
}

/**
 * Validates Step 1 (Create Clinic) form data.
 * Returns an errors object — empty means valid.
 */
export function validateStep1(
  data: Step1Data,
  t: (key: string) => string
): Step1Errors {
  const errors: Step1Errors = {};

  // اسم العيادة بالعربي — required + Arabic only
  if (!data.clinicNameArabic.trim()) {
    errors.clinicNameArabic = t('wizard.validation.required');
  } else if (!ARABIC_REGEX.test(data.clinicNameArabic.trim())) {
    errors.clinicNameArabic = t('wizard.validation.arabicOnly');
  }

  // اسم العيادة بالإنجليزي — required
  if (!data.clinicName.trim()) {
    errors.clinicName = t('wizard.validation.required');
  }

  // مدير العيادة — required (ownerFirstName + ownerLastName)
  if (!data.ownerFirstName.trim() || !data.ownerLastName.trim()) {
    errors.ownerFirstName = t('wizard.validation.twoNamesRequired');
  }

  // البريد الإلكتروني — required + valid format
  if (!data.ownerEmail.trim()) {
    errors.ownerEmail = t('wizard.validation.required');
  } else if (!EMAIL_REGEX.test(data.ownerEmail.trim())) {
    errors.ownerEmail = t('wizard.validation.invalidEmail');
  }

  // رقم التليفون — required + Egyptian format (01xxxxxxxxx)
  if (!data.phone.trim()) {
    errors.phone = t('wizard.validation.required');
  } else if (!EGYPTIAN_PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = t('wizard.validation.egyptianPhone');
  }

  // المحافظة — required
  if (!data.country) {
    errors.country = t('wizard.validation.required');
  }

  // المدينة — required
  if (!data.city) {
    errors.city = t('wizard.validation.required');
  }

  // العنوان — required
  if (!data.address.trim()) {
    errors.address = t('wizard.validation.required');
  }

  // slug — required + English lowercase + hyphens only
  if (!data.slug.trim()) {
    errors.slug = t('wizard.validation.required');
  } else if (!SLUG_REGEX.test(data.slug.trim())) {
    errors.slug = t('wizard.validation.slugEnglish');
  }

  return errors;
}

/**
 * Returns true if there are no validation errors.
 */
export function isStep1Valid(errors: Step1Errors): boolean {
  return Object.keys(errors).length === 0;
}
