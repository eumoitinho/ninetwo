import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationMCP } from '@/settings/integrations/components/SettingsIntegrationMCP';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { H2Title } from 'ninetwo-ui/display';
import { Section } from 'ninetwo-ui/layout';

export const SettingsIntegrationMCPPage = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Integrations`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Integrations</Trans> },
        { children: <Trans>MCP</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={`MCP Server`}
            description={`Access your workspace data from your favorite MCP client like Claude Desktop, Windsurf or Cursor.`}
          />
          <SettingsIntegrationMCP />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
