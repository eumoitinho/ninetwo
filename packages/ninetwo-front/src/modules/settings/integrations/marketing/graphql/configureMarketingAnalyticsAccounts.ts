import { gql } from '@apollo/client';

export const CONFIGURE_MARKETING_ANALYTICS_ACCOUNTS = gql`
  mutation ConfigureMarketingAnalyticsAccounts(
    $connectedAccountId: UUID!
    $propertyIds: [String!]!
  ) {
    configureMarketingAnalyticsAccounts(
      connectedAccountId: $connectedAccountId
      propertyIds: $propertyIds
    )
  }
`;



