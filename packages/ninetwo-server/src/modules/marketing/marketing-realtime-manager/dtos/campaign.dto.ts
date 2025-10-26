import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('MarketingCampaign')
export class MarketingCampaignDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  platform: string;

  @Field(() => String)
  externalId: string;

  @Field(() => String)
  status: string;

  @Field(() => Float, { nullable: true })
  dailyBudget?: number;

  @Field(() => Float, { nullable: true })
  totalBudget?: number;

  @Field(() => String)
  currencyCode: string;

  @Field(() => String)
  connectedAccountId: string;
}

@ObjectType('MoneyAmount')
export class MoneyAmountDto {
  @Field(() => Float)
  amountMicros: number;

  @Field(() => String)
  currencyCode: string;
}

@ObjectType('MarketingMetric')
export class MarketingMetricDto {
  @Field(() => String)
  campaignId: string;

  @Field(() => String)
  label: string;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  platform: string;

  @Field(() => String, { nullable: true })
  device?: string;

  @Field(() => String, { nullable: true })
  adNetworkType?: string;

  @Field(() => String)
  currencyCode: string;

  @Field(() => Float)
  impressions: number;

  @Field(() => Float)
  clicks: number;

  @Field(() => Float)
  conversions: number;

  @Field(() => Float, { nullable: true })
  conversionsValue?: number;

  @Field(() => MoneyAmountDto)
  cost: MoneyAmountDto;

  @Field(() => MoneyAmountDto, { nullable: true })
  cpc: MoneyAmountDto | null;

  @Field(() => MoneyAmountDto, { nullable: true })
  cpa: MoneyAmountDto | null;

  @Field(() => Float, { nullable: true })
  cpm?: number;

  @Field(() => Float, { nullable: true })
  ctr?: number;

  @Field(() => Float, { nullable: true })
  conversionRate?: number;

  @Field(() => Float, { nullable: true })
  roas: number | null;

  @Field(() => Float, { nullable: true })
  interactions?: number;

  @Field(() => Float, { nullable: true })
  allConversions?: number;

  @Field(() => Float, { nullable: true })
  allConversionsValue?: number;

  @Field(() => Float, { nullable: true })
  viewThroughConversions?: number;
}
