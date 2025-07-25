import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, Max, Min } from 'class-validator';

export class FindUsersQueryDto {
  @IsObject()
  @Transform(({ value }) => {
    if (!value) return {};
    if (typeof value === 'string')
      return JSON.parse(value) as Record<string, any>;

    return value as Record<string, any>;
  })
  @IsOptional()
  filter?: Record<string, any>;

  @Min(1)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @Max(100)
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
