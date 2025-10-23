import { gql } from '@apollo/client';

export const GET_MARKETING_CAMPAIGNS = gql`
  query GetMarketingCampaigns(
    $connectedAccountId: UUID!
    $customerId: String!
    $managerCustomerId: String
  ) {
    getMarketingCampaigns(
      connectedAccountId: $connectedAccountId
      customerId: $customerId
      managerCustomerId: $managerCustomerId
    ) {
      id
      name
      platform
      externalId
      status
      dailyBudget
      totalBudget
      currencyCode
      connectedAccountId
    }
  }
`;
