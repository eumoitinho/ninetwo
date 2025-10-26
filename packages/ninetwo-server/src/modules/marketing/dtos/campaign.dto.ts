import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MarketingCampaignDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  platform?: string;

  @Field({ nullable: true })
  externalId?: string;

  @Field(() => Float, { nullable: true })
  budget?: number;

  @Field(() => Float, { nullable: true })
  dailyBudget?: number;

  @Field(() => Float, { nullable: true })
  totalBudget?: number;

  @Field({ nullable: true })
  budgetType?: string;

  @Field({ nullable: true })
  currencyCode?: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  connectedAccountId?: string;

  @Field({ nullable: true })
  customerId?: string;

  @Field(() => Float, { nullable: true })
  impressions?: number;

  @Field(() => Float, { nullable: true })
  clicks?: number;

  @Field(() => Float, { nullable: true })
  cost?: number;

  @Field(() => Float, { nullable: true })
  conversions?: number;

  @Field(() => Float, { nullable: true })
  conversionValue?: number;
}

@ObjectType()
export class MarketingMetricDto {
  @Field()
  campaignId: string;

  @Field()
  campaignName: string;

  @Field()
  date: string;

  @Field(() => Float)
  impressions: number;

  @Field(() => Float)
  clicks: number;

  @Field(() => Float)
  cost: number;

  @Field(() => Float)
  conversions: number;

  @Field(() => Float, { nullable: true })
  ctr?: number;

  @Field(() => Float, { nullable: true })
  cpc?: number;

  @Field(() => Float, { nullable: true })
  cpm?: number;
}
