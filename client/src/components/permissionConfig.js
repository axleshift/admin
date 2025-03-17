// permissionConfig.js - Main index file
import { accessPermissions as superadminPermissions, alwaysPermitted as superadminAlwaysPermitted } from './permissionConfigSuperadmin';
import { accessPermissions as adminPermissions, alwaysPermitted as adminAlwaysPermitted } from './permissionConfigAdmin';
import { accessPermissions as managerPermissions, alwaysPermitted as managerAlwaysPermitted } from './permissionConfigManager';

// Merge all permission configurations
const accessPermissions = {
  ...superadminPermissions,
  ...adminPermissions,
  ...managerPermissions
};

// Use one consistent "always permitted" list (they're all the same anyway)
const alwaysPermitted = superadminAlwaysPermitted;

export { accessPermissions, alwaysPermitted };