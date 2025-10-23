import { type RolePermissionConfig } from 'src/engine/ninetwo-orm/types/role-permission-config';

export type DeleteRecordParams = {
  objectName: string;
  objectRecordId: string;
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
  soft?: boolean;
};
