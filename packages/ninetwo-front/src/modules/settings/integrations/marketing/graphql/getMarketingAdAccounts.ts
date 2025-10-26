import { gql } from '@apollo/client';

export const GET_MARKETING_AD_ACCOUNTS = gql`
  query GetMarketingAdAccounts($connectedAccountId: UUID!) {
    getMarketingAdAccounts(connectedAccountId: $connectedAccountId) {
      accounts {
        id
        name
        type
        platform
        currencyCode
        timezone
      }
      managerAccountId
      selectedAccounts
    }
  }
`;
