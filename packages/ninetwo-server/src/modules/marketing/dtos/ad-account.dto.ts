import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdAccountDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true, name: 'currencyCode' })
  currency?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  platform?: string;
}

@ObjectType()
export class AdAccountsResultDto {
  @Field(() => [AdAccountDto])
  accounts: AdAccountDto[];

  @Field(() => [String])
  selectedAccounts: string[];

  @Field(() => String, { nullable: true })
  managerCustomerId?: string;

  @Field(() => String, { nullable: true, name: 'managerAccountId' })
  get managerAccountId(): string | undefined {
    return this.managerCustomerId;
  }
}
