import { type IconComponent } from 'ninetwo-ui/display';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsRolePermissionsSettingPermission = {
  key: PermissionFlagType;
  name: string;
  description: string;
  Icon: IconComponent;
  isToolPermission?: boolean;
};
