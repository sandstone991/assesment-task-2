import { PartialType } from '@nestjs/swagger';
import { PostDto } from './post.dto';

export class PostUpdateDto extends PartialType(PostDto) {}
