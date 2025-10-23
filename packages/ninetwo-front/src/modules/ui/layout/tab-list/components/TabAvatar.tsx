import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useTheme } from '@emotion/react';
import { isDefined } from 'ninetwo-shared/utils';
import { Avatar } from 'ninetwo-ui/display';

export const TabAvatar = ({ tab }: { tab: SingleTabProps }) => {
  const theme = useTheme();

  if (isDefined(tab.logo)) {
    return <Avatar avatarUrl={tab.logo} size="md" placeholder={tab.title} />;
  }
  return (
    tab.Icon && (
      <tab.Icon
        size={theme.icon.size.md}
        color={
          tab.disabled ? theme.font.color.tertiary : theme.font.color.secondary
        }
        stroke={theme.icon.stroke.md}
      />
    )
  );
};
