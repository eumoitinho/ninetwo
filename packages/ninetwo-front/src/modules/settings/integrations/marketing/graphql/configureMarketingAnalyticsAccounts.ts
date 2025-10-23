import { gql } from '@apollo/client';

export const CONFIGURE_MARKETING_ANALYTICS_ACCOUNTS = gql`
  mutation ConfigureMarketingAnalyticsAccounts(
    $connectedAccountId: ID!
    $propertyIds: [String!]!
  ) {
    configureMarketingAnalyticsAccounts(
      connectedAccountId: $connectedAccountId
      propertyIds: $propertyIds
    ) {
      success
      message
    }
  }
`;


