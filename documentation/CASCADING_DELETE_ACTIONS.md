# Cascading Delete Actions for User Roles

This document outlines the comprehensive cascading delete actions implemented for different user roles in the FarmTrack system.

## Overview

When a user deletes their account, the system performs role-specific cascading deletions to maintain data integrity and prevent orphaned records. The actions vary based on the user's role and permissions.

## User Role Types and Delete Actions

### 🚨 Farm Owner (Admin with farm_id)

**Most Destructive Operation** - Deletes entire farm and all associated data

**Cascading Actions:**
1. **Notifications** - Delete all notifications for the farm
2. **Settings** - Delete all farm settings (night check schedules, etc.)
3. **Animals** - Delete all animals in the farm
4. **Animal-Related Data** - Delete all yields, medications, checkups, and return logs for each animal
5. **Orphaned Records** - Clean up any remaining farm-related records
6. **Farm** - Delete the farm record itself
7. **Users** - Delete all users associated with the farm
8. **User Account** - Finally delete the owner's account

**Impact:** Complete farm deletion - all data is permanently removed

### 🔧 System Admin (Admin without farm_id)

**Restricted Operation** - Cannot delete if they're the last admin

**Cascading Actions:**
1. **Validation** - Check if this is the last admin account
2. **Notifications** - Delete all notifications created by this admin
3. **User Account** - Delete the admin account

**Impact:** Minimal - only admin account and their notifications are removed

### 🩺 Veterinarian

**Safe Operation** - Preserves medical records for farm continuity

**Cascading Actions:**
1. **Notifications** - Delete all notifications created by this veterinarian
2. **User Account** - Delete the veterinarian account
3. **Data Preservation** - Health records (checkups, medications) remain but show "Unknown Veterinarian"

**Impact:** Medical history preserved, only user account and notifications removed

### 👨‍🌾 Farm Worker

**Safe Operation** - Preserves activity records for farm continuity

**Cascading Actions:**
1. **Notifications** - Delete all notifications created by this farm worker
2. **User Account** - Delete the farm worker account
3. **Data Preservation** - Activity records (return logs, yields) remain but show "Unknown Worker"

**Impact:** Activity history preserved, only user account and notifications removed

### 👤 Regular User

**Safe Operation** - Minimal data impact

**Cascading Actions:**
1. **Notifications** - Delete all notifications created by this user
2. **User Account** - Delete the user account
3. **Data Preservation** - Any created data remains but shows "Unknown User"

**Impact:** Minimal - only user account and notifications removed

### 🚨 Unknown Role

**Safe Operation** - Fallback for unexpected roles

**Cascading Actions:**
1. **Notifications** - Delete all notifications created by this user
2. **User Account** - Delete the user account

**Impact:** Safe deletion with minimal data loss

## Farm Deletion (Separate from User Deletion)

When a farm is deleted (via farm deletion endpoint), the following cascading actions occur:

1. **Notifications** - Delete all farm notifications
2. **Settings** - Delete all farm settings
3. **Animals** - Delete all animals and their related data
4. **Orphaned Records** - Clean up any remaining farm-related records
5. **User Associations** - Remove farm_id from all associated users
6. **Farm Record** - Delete the farm itself

## Data Models Affected

The following models are involved in cascading deletions:

- **User** - The account being deleted
- **Farm** - Farm records (for farm owners)
- **Animal** - Animal records
- **Yield** - Production records
- **Medication** - Medical treatment records
- **Checkup** - Health check records
- **ReturnLog** - Night return tracking records
- **Notification** - Alert and notification records
- **Setting** - Farm configuration records

## Safety Measures

### Admin Protection
- System admins cannot be deleted if they're the last admin
- Farm owners can delete their entire farm (with confirmation)

### Data Preservation
- Medical and activity records are preserved for non-owner roles
- Orphaned records are cleaned up to prevent database bloat
- User associations are properly updated

### Logging
- All deletion actions are logged with emojis for easy identification
- Detailed console output for debugging and audit trails

## API Response Format

```json
{
  "message": "Account deleted successfully",
  "deletedUser": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "farm_id": "farm_id"
  },
  "cascadingActions": {
    "notificationsDeleted": true,
    "roleSpecificActions": "admin"
  }
}
```

## Best Practices

1. **Always confirm destructive operations** - Farm owner deletions should require explicit confirmation
2. **Preserve important data** - Medical and activity records should be kept for farm continuity
3. **Clean up orphaned data** - Remove notifications and settings to prevent database bloat
4. **Log all actions** - Maintain audit trails for compliance and debugging
5. **Validate permissions** - Ensure users can only delete their own accounts or have proper authorization

## Testing

To test cascading deletions:

1. Create test users with different roles
2. Create associated data (animals, yields, medications, etc.)
3. Delete user accounts and verify proper cascading
4. Check that appropriate data is preserved or deleted
5. Verify no orphaned records remain in the database 