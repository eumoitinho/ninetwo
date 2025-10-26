import gql from 'graphql-tag';

export const GET_MARKETING_CHANNEL = gql`
  query GetMarketingChannel($marketingChannelId: UUID!) {
    getMarketingChannel(marketingChannelId: $marketingChannelId)
  }
`;

