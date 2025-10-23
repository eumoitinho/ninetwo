import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';

export const SettingsNewAccount = () => {
  return (
    <SubMenuTopBarContainer
      title="New Account"
      links={[
        {
          children: 'User',
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: 'Accounts',
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: `New` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
