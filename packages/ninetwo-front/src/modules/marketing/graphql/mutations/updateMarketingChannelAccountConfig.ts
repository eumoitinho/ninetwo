import gql from 'graphql-tag';

export const UPDATE_MARKETING_CHANNEL_ACCOUNT_CONFIG = gql`
  mutation UpdateMarketingChannelAccountConfig(
    $marketingChannelId: UUID!
    $accountConfig: String!
  ) {
    updateMarketingChannelAccountConfig(
      marketingChannelId: $marketingChannelId
      accountConfig: $accountConfig
    ) {
      success
      marketingChannelId
    }
  }
`;

