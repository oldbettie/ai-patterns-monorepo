// @feature:device-registration @domain:devices @backend
// @summary: DEPRECATED - Temporary store for device registration tokens during setup flow
// 
// This has been replaced with database-backed pending device registrations.
// See PendingDeviceRegistrationRepository for the new implementation.

// DEPRECATED: This file is kept for compatibility but is no longer used.
// All device registration token handling is now done via the database.

export const deviceTokenStore = {
  setPendingRegistration: () => {
    console.warn('[DEPRECATED] deviceTokenStore.setPendingRegistration is deprecated. Use PendingDeviceRegistrationRepository instead.')
  },
  getPendingRegistration: () => {
    console.warn('[DEPRECATED] deviceTokenStore.getPendingRegistration is deprecated. Use PendingDeviceRegistrationRepository instead.')
    return null
  },
  removePendingRegistration: () => {
    console.warn('[DEPRECATED] deviceTokenStore.removePendingRegistration is deprecated. Use PendingDeviceRegistrationRepository instead.')
  }
}