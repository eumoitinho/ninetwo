import { gql } from '@apollo/client';

export const GET_MARKETING_ANALYTICS_ACCOUNTS = gql`
  query GetMarketingAnalyticsAccounts($connectedAccountId: ID!) {
    getMarketingAnalyticsAccounts(connectedAccountId: $connectedAccountId) {
      accounts {
        id
        name
        type
        platform
      }
    }
  }
`;


