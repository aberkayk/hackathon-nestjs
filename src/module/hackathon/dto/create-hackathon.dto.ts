import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsFutureDate } from '../../../common/validators/is-future-date.decorator';

export class CreateHackathonDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  description?: string;

  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  startsAt: Date;

  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  endsAt: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
