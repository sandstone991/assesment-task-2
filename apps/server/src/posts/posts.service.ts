import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { POSTS_REPOSITORY_TOKEN } from './repositories/posts.repository.interface';
import { PostsTypeOrmRepository } from './repositories/implementations/posts.typeorm.repository';
import { Post } from './models/posts.model';
import { PostDto } from './dto/post.dto';
import { PostUpdateDto } from './dto/post-update.dto';

@Injectable()
export class PostsService {
  constructor(
    @Inject(POSTS_REPOSITORY_TOKEN)
    private readonly postsRepository: PostsTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Post[]> {
    return await this.postsRepository.findRoots();
  }

  public async create(userId: number, postDto: PostDto): Promise<Post> {
    try {
      return await this.postsRepository.create(userId, postDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
  public async update(id: number, postDto: PostUpdateDto): Promise<Post> {
    try {
      return await this.postsRepository.update(id, postDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async findById(id: number): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    
    if (!post) {
      throw new NotFoundException(`Post #${id} not found`);
    }

    return post;
  }

  public async delete(id: number): Promise<void> {
    try {
      await this.postsRepository.delete(id);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async findChildrenCount(id: number): Promise<number> {
    return await this.postsRepository.findChildrenCount(id);
  }
  public async getRootsPage(page: number): Promise<{ posts: Post[]; left: number }> {
    return await this.postsRepository.getRootsPage(page);
  }
  public async findParent(id: number): Promise<Post> {
    return await this.postsRepository.findParent(id);
  }

  public async getChildrenPage(
    id: number,
    page: number,
  ): Promise<{ posts: Post[]; left: number }> {
    return await this.postsRepository.getChildrenPage(id, page);
  }
}
