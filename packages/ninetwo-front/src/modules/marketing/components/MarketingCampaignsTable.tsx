import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { type AdsCampaign } from '@/marketing/types/AdsCampaign';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip, Status } from 'ninetwo-ui/display';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableRows = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type MarketingCampaignsTableProps = {
  campaigns: AdsCampaign[];
};

export const MarketingCampaignsTable = ({
  campaigns,
}: MarketingCampaignsTableProps) => {
  const { t } = useLingui();

  const formatCurrency = (micros: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(micros / 1000000);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('pt-BR').format(Math.round(value));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENABLED':
        return 'green';
      case 'PAUSED':
        return 'orange';
      case 'REMOVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <StyledTable>
      <TableRow gridAutoColumns="2fr 1fr 1fr 1fr 1fr 1fr 1fr">
        <TableHeader>{t`Campaign`}</TableHeader>
        <TableHeader align="right">{t`Status`}</TableHeader>
        <TableHeader align="right">{t`Impressions`}</TableHeader>
        <TableHeader align="right">{t`Clicks`}</TableHeader>
        <TableHeader align="right">{t`Cost`}</TableHeader>
        <TableHeader align="right">{t`Conversions`}</TableHeader>
        <TableHeader align="right">{t`ROAS`}</TableHeader>
      </TableRow>
      <StyledTableRows>
        {campaigns.map((campaign) => (
          <TableRow
            key={campaign.id}
            gridAutoColumns="2fr 1fr 1fr 1fr 1fr 1fr 1fr"
          >
            <TableCell>
              <OverflowingTextWithTooltip text={campaign.name} />
            </TableCell>
            <TableCell align="right">
              <Status
                color={getStatusColor(campaign.status)}
                text={campaign.status}
              />
            </TableCell>
            <TableCell align="right">
              {formatNumber(campaign.impressions || 0)}
            </TableCell>
            <TableCell align="right">
              {formatNumber(campaign.clicks || 0)}
            </TableCell>
            <TableCell align="right">
              {formatCurrency(campaign.costMicros || 0)}
            </TableCell>
            <TableCell align="right">
              {formatNumber(campaign.conversions || 0)}
            </TableCell>
            <TableCell align="right">
              {(campaign.roas || 0).toFixed(2)}x
            </TableCell>
          </TableRow>
        ))}
      </StyledTableRows>
    </StyledTable>
  );
};


