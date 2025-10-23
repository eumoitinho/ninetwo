import { Field, InputType } from '@nestjs/graphql';

import { IsDateString, IsNotEmpty } from 'class-validator';

@InputType('DateRangeInput')
export class DateRangeInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsDateString()
  from: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsDateString()
  to: string;
}
