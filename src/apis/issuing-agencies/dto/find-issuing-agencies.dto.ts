import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, Max, Min } from 'class-validator';

export interface IssuingAgencyFilter {
  name?: string;
  email?: string;
  location?: string;
  isUniversity?: boolean | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class FindIssuingAgenciesQueryDto {
  @IsObject()
  @Transform(({ value }) => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as IssuingAgencyFilter;
      } catch {
        return {};
      }
    }
    return value as IssuingAgencyFilter;
  })
  @IsOptional()
  filter?: IssuingAgencyFilter;

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
