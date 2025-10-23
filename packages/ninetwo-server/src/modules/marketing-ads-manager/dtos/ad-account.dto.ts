import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AdAccount')
export class AdAccountDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  platform: string;

  @Field(() => String)
  currencyCode: string;

  @Field(() => String, { nullable: true })
  timezone?: string;
}

@ObjectType('AdAccountsResult')
export class AdAccountsResultDto {
  @Field(() => [AdAccountDto])
  accounts: AdAccountDto[];

  @Field(() => String, { nullable: true })
  managerAccountId?: string;
}
