import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, Max, Min } from 'class-validator';

export class FindBlocksQueryDto {
  @IsOptional()
  @IsObject()
  @Transform(({ value }) => {
    if (!value) return {};
    if (typeof value === 'string')
      return JSON.parse(value) as Record<string, any>;

    return value as Record<string, any>;
  })
  filter?: Record<string, any>;

  @IsOptional()
  @Min(1)
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Min(1)
  @Max(100)
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
