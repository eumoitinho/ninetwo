import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { SettingsObjectCoverImage } from '@/settings/data-model/objects/components/SettingsObjectCoverImage';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { H2Title, IconPlus } from 'ninetwo-ui/display';
import { Button } from 'ninetwo-ui/input';
import { Section } from 'ninetwo-ui/layout';
import { UndecoratedLink } from 'ninetwo-ui/navigation';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';

export const SettingsObjects = () => {
  const { t } = useLingui();

  const {
    activeNonSystemObjectMetadataItems,
    inactiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  return (
    <SubMenuTopBarContainer
      title={t`Data model`}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.NewObject)}>
          <Button
            Icon={IconPlus}
            title={t`Add object`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Objects</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <>
          <SettingsObjectCoverImage />
          <Section>
            <H2Title title={t`Existing objects`} />

            <SettingsObjectTable
              activeObjects={activeNonSystemObjectMetadataItems}
              inactiveObjects={inactiveNonSystemObjectMetadataItems}
            />
          </Section>
        </>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
