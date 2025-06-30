// utils/pendingUsers.js

const pendingUsers = new Map();

/*
Structure:
pendingUsers.set(email, {
  name,
  email,
  password, // hashed already
  role,
  farm_id (optional),
  timestamp
});
*/

module.exports = pendingUsers;
