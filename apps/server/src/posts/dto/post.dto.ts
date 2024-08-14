import { IsNumber, IsIn, IsOptional } from 'class-validator';

export class PostDto {
  @IsIn(['+', '-', '*', '/'])
  @IsOptional()
  operator?: '+' | '-' | '*' | '/';
  @IsNumber()
  number: number;
  @IsNumber()
  @IsOptional()
  parentPostId?: number;
}
