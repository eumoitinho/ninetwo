import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DateRangeInput {
  @Field()
  startDate: string;

  @Field()
  endDate: string;
}
