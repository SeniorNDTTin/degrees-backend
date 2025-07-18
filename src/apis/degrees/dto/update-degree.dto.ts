import { PartialType } from '@nestjs/mapped-types';
import { CreateDegreeBodyDto } from './create-degree.dto';

export class UpdateDegreeDto extends PartialType(CreateDegreeBodyDto) {}
