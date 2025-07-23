import { Expose, Transform } from 'class-transformer';

export class ViewUserDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  birthday: Date;

  @Expose()
  gender: string;

  @Expose()
  roleId: string;

  @Expose()
  @Transform(({ value }: { value: Date }): string => value?.toISOString())
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
