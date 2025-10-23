import { gql } from '@apollo/client';

export const CONFIGURE_MARKETING_AD_ACCOUNTS = gql`
  mutation ConfigureMarketingAdAccounts(
    $connectedAccountId: UUID!
    $customerIds: [String!]!
    $managerCustomerId: String
  ) {
    configureMarketingAdAccounts(
      connectedAccountId: $connectedAccountId
      customerIds: $customerIds
      managerCustomerId: $managerCustomerId
    )
  }
`;
