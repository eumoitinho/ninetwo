import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';

import { type MarketingChannel } from '@/marketing/types/MarketingChannel';
import { H2Title, H3Title } from 'ninetwo-ui/display';
import { Loader } from 'ninetwo-ui/feedback';
import { Radio } from 'ninetwo-ui/input';
import { Card, CardContent, Section } from 'ninetwo-ui/layout';

type GoogleAnalyticsProperty = {
  id: string;
  name: string;
  displayName: string;
  propertyType: string;
};

type GoogleAnalyticsAccount = {
  id: string;
  name: string;
  displayName: string;
  properties: GoogleAnalyticsProperty[];
};

const StyledPropertyCard = styled(CardContent)<{ selected?: boolean }>`
  cursor: pointer;
  border: 2px solid
    ${({ selected, theme }) =>
      selected ? theme.color.blue : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledPropertyHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
`;

const StyledPropertyInfo = styled.div`
  flex: 1;
`;

const StyledPropertyName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyId = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledAccountSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 200px;
  justify-content: center;
`;

type SettingsMarketingGoogleAnalyticsPropertySelectorProps = {
  marketingChannel: MarketingChannel;
  onPropertySelected: (propertyId: string) => void;
};

export const SettingsMarketingGoogleAnalyticsPropertySelector = ({
  marketingChannel,
  onPropertySelected,
}: SettingsMarketingGoogleAnalyticsPropertySelectorProps) => {
  const { t } = useLingui();
  const [accounts, setAccounts] = useState<GoogleAnalyticsAccount[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // TODO: Call GraphQL query to get Google Analytics accounts and properties
        // const response = await getGoogleAnalyticsProperties({
        //   variables: { connectedAccountId: marketingChannel.connectedAccountId },
        // });
        // setAccounts(JSON.parse(response.data));

        // Mock data for now
        setAccounts([
          {
            id: 'accounts/123456',
            name: 'accounts/123456',
            displayName: 'Main Account',
            properties: [
              {
                id: 'properties/111111111',
                name: 'properties/111111111',
                displayName: 'Website Traffic',
                propertyType: 'PROPERTY_TYPE_ORDINARY',
              },
              {
                id: 'properties/222222222',
                name: 'properties/222222222',
                displayName: 'Mobile App',
                propertyType: 'PROPERTY_TYPE_ORDINARY',
              },
            ],
          },
        ]);
      } catch (error) {
        console.error('Error fetching Google Analytics properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [marketingChannel.connectedAccountId]);

  const handlePropertySelection = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    onPropertySelected(propertyId);
  };

  if (loading) {
    return (
      <Section>
        <StyledLoadingContainer>
          <Loader />
        </StyledLoadingContainer>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Select Google Analytics Property`}
        description={t`Choose the Google Analytics property you want to sync`}
      />

      {accounts.map((account) => (
        <StyledAccountSection key={account.id}>
          <H3Title title={account.displayName} />
          <Card rounded>
            {account.properties.map((property) => (
              <StyledPropertyCard
                key={property.id}
                selected={selectedPropertyId === property.id}
                onClick={() => handlePropertySelection(property.id)}
                divider
              >
                <StyledPropertyHeader>
                  <StyledPropertyInfo>
                    <StyledPropertyName>
                      {property.displayName}
                    </StyledPropertyName>
                    <StyledPropertyId>{property.id}</StyledPropertyId>
                  </StyledPropertyInfo>
                  <Radio
                    name="analytics-property"
                    value={property.id}
                    checked={selectedPropertyId === property.id}
                    onCheckedChange={() => handlePropertySelection(property.id)}
                  />
                </StyledPropertyHeader>
              </StyledPropertyCard>
            ))}
          </Card>
        </StyledAccountSection>
      ))}
    </Section>
  );
};

