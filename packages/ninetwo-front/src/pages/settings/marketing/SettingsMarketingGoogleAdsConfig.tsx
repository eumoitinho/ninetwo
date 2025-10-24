import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SettingsMarketingGoogleAdsAccountSelector } from '@/marketing/components/SettingsMarketingGoogleAdsAccountSelector';
import { type MarketingChannel } from '@/marketing/types/MarketingChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath, isDefined } from 'ninetwo-shared/utils';
import { IconPlus } from 'ninetwo-ui/display';
import { Button } from 'ninetwo-ui/input';

export const SettingsMarketingGoogleAdsConfig = () => {
  const { t } = useLingui();
  const { marketingChannelId } = useParams<{ marketingChannelId: string }>();
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const { records: marketingChannels } = useFindManyRecords<MarketingChannel>({
    objectNameSingular: CoreObjectNameSingular.MarketingChannel,
    filter: {
      id: {
        eq: marketingChannelId,
      },
    },
    skip: !marketingChannelId,
  });

  const marketingChannel = marketingChannels[0];

  const handleSaveConfiguration = async () => {
    if (!marketingChannelId || selectedAccountIds.length === 0) {
      enqueueErrorSnackBar({
        message: t`Please select at least one account`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call GraphQL mutation to update marketing channel accountConfig
      // await updateMarketingChannel({
      //   variables: {
      //     id: marketingChannelId,
      //     accountConfig: { customerIds: selectedAccountIds },
      //   },
      // });

      enqueueSuccessSnackBar({
        message: t`Google Ads account configured successfully. Sync started.`,
      });

      navigate(getSettingsPath(SettingsPath.IntegrationsMarketing));
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Error configuring Google Ads account`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDefined(marketingChannel)) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Configure Google Ads`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Integrations`,
          href: getSettingsPath(SettingsPath.Integrations),
        },
        {
          children: t`Marketing`,
          href: getSettingsPath(SettingsPath.IntegrationsMarketing),
        },
        { children: t`Google Ads` },
      ]}
      actionButton={
        <Button
          Icon={IconPlus}
          title={t`Save and sync`}
          accent="blue"
          size="small"
          variant="primary"
          onClick={handleSaveConfiguration}
          disabled={isSubmitting || selectedAccountIds.length === 0}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsMarketingGoogleAdsAccountSelector
          marketingChannel={marketingChannel}
          onAccountsSelected={setSelectedAccountIds}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};

