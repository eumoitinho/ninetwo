import { gql } from '@apollo/client';

export const PAUSE_MARKETING_CAMPAIGN = gql`
  mutation PauseMarketingCampaign(
    $connectedAccountId: UUID!
    $customerId: String!
    $campaignId: String!
    $managerCustomerId: String
  ) {
    pauseMarketingCampaign(
      connectedAccountId: $connectedAccountId
      customerId: $customerId
      campaignId: $campaignId
      managerCustomerId: $managerCustomerId
    )
  }
`;

export const ACTIVATE_MARKETING_CAMPAIGN = gql`
  mutation ActivateMarketingCampaign(
    $connectedAccountId: UUID!
    $customerId: String!
    $campaignId: String!
    $managerCustomerId: String
  ) {
    activateMarketingCampaign(
      connectedAccountId: $connectedAccountId
      customerId: $customerId
      campaignId: $campaignId
      managerCustomerId: $managerCustomerId
    )
  }
`;
