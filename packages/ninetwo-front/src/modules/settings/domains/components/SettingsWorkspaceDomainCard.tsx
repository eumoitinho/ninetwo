import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { IconWorld, Status } from 'ninetwo-ui/display';
import { UndecoratedLink } from 'ninetwo-ui/navigation';

export const SettingsWorkspaceDomainCard = () => {
  const { t } = useLingui();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  if (!isMultiWorkspaceEnabled) {
    return null;
  }

  return (
    <UndecoratedLink to={getSettingsPath(SettingsPath.Domain)}>
      <SettingsCard
        title={t`Customize Domain`}
        Icon={<IconWorld />}
        Status={
          currentWorkspace?.customDomain &&
          currentWorkspace?.isCustomDomainEnabled ? (
            <Status text={t`Active`} color="turquoise" />
          ) : currentWorkspace?.customDomain ? (
            <Status text={t`Inactive`} color="orange" />
          ) : undefined
        }
      />
    </UndecoratedLink>
  );
};
