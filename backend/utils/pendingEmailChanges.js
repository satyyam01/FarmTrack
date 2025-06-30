// utils/pendingEmailChanges.js
// Stores: { userId: { newEmail, otp, expiresAt } }
const pendingEmailChanges = new Map();

module.exports = pendingEmailChanges; 