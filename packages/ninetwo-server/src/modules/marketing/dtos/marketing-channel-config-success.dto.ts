import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('MarketingChannelConfigSuccess')
export class MarketingChannelConfigSuccessDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  marketingChannelId: string;
}

