import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { H2Title, IconPlus } from 'ninetwo-ui/display';
import { Button } from 'ninetwo-ui/input';
import { Section } from 'ninetwo-ui/layout';
import { UndecoratedLink } from 'ninetwo-ui/navigation';
import { useFindManyAgentsQuery } from '~/generated-metadata/graphql';

import { t } from '@lingui/core/macro';
import { SettingsAIAgentsTable } from './components/SettingsAIAgentsTable';

export const SettingsAI = () => {
  const { data } = useFindManyAgentsQuery();

  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.AINewAgent)}>
          <Button
            Icon={IconPlus}
            title={t`New Agent`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Agents`}
            description={t`Agents used to route queries to specialized agents`}
          />
          <SettingsAIAgentsTable agents={data?.findManyAgents || []} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
