import {
  Controller,
  Put,
  Get,
  Body,
  Param,
  Delete,
  BadRequestException,
  Post,
  Req,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { Post as Posts } from './models/posts.model';
import { PostsService } from './posts.service';
import { PostDto } from './dto/post.dto';
import { PostUpdateDto } from './dto/post-update.dto';

type AuthedRequest = Request & { user: { sub: number } };

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @AuthGuard(AuthType.None)
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Get all Posts',
  })
  public async findRootPosts(): Promise<Posts[]> {
    return this.postsService.findAll();
  }
  @AuthGuard(AuthType.Bearer)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Create a Post',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request' })
  public async createPost(
    @Body() postDto: PostDto,
    @Req() req: AuthedRequest,
  ): Promise<Posts> {
    const userId = req.user.sub;
    if (postDto.parentPostId && !postDto.operator) {
      throw new BadRequestException('Operator is required for child posts');
    }
    return this.postsService.create(userId, postDto);
  }

  @AuthGuard(AuthType.None)
  @Get('/:postId')
  @ApiResponse({
    status: 200,
    description: 'Get a Post by id',
  })
  @ApiNotFoundResponse({ status: 400, description: 'Post not found' })
  public async findOnePost(@Param('postId') postId: string): Promise<Posts> {
    return this.postsService.findById(Number(postId));
  }

  @AuthGuard(AuthType.Bearer)
  @Put('/:postId')
  @ApiResponse({
    status: 200,
    description: 'Update a Post by id',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request' })
  @ApiNotFoundResponse({ status: 400, description: 'Post not found' })
  public async updatePost(
    @Param('postId') postId: string,
    @Body() postDto: PostUpdateDto,
    @Req() req: AuthedRequest,
  ): Promise<Posts> {
    const userId = req.user.sub;
    const post = await this.postsService.findById(Number(postId));
    if (post.user.id !== userId) {
      throw new BadRequestException('You are not allowed to update this post');
    }
    return this.postsService.update(Number(postId), postDto);
  }

  @AuthGuard(AuthType.Bearer)
  @Delete('/:postId')
  @ApiNoContentResponse({
    status: 204,
    description: 'Delete a Post by id',
  })
  @ApiNotFoundResponse({ status: 400, description: 'Post not found' })
  public async deletePost(
    @Param('postId') postId: string,
    @Req() req: AuthedRequest,
  ): Promise<void> {
    const userId = req.user.sub;
    const post = await this.postsService.findById(Number(postId));

    if (post.user.id !== userId) {
      throw new BadRequestException('You are not allowed to delete this post');
    }
    await this.postsService.delete(Number(postId));
  }

  @AuthGuard(AuthType.None)
  @Get('/:postId/parent')
  @ApiResponse({
    status: 200,
    description: 'Get parent of a Post',
  })
  @ApiNotFoundResponse({ status: 400, description: 'Post not found' })
  public async findParent(@Param('postId') postId: string): Promise<Posts> {
    return this.postsService.findParent(Number(postId));
  }
  @AuthGuard(AuthType.None)
  @Get('/:postId/children/count')
  @ApiResponse({
    status: 200,
    description: 'Get children count of a Post',
  })
  @ApiNotFoundResponse({ status: 400, description: 'Post not found' })
  public async findChildrenCount(
    @Param('postId') postId: string,
  )  {
    const count = await this.postsService.findChildrenCount(Number(postId));
    return { count };
  }
  @AuthGuard(AuthType.None)
  @Get('/:postId/children/page/:page')
  @ApiResponse({
    status: 200,
    description: 'Get children of a Post by page',
  })
  @ApiNotFoundResponse({ status: 400, description: 'Post not found' })
  public async getChildrenPage(
    @Param('postId') postId: string,
    @Param('page') page: string,
  ): Promise<{ posts: Posts[]; left: number }> {
    return this.postsService.getChildrenPage(Number(postId), Number(page));
  }
  @AuthGuard(AuthType.None)
  @Get('/page/:page')
  @ApiResponse({
    status: 200,
    description: 'Get roots of Posts by page',
  })
  @ApiNotFoundResponse({ status: 400, description: 'Posts not found' })
  public async getRootsPage(
    @Param('page') page: string,
  ): Promise<{ posts: Posts[]; left: number }> {
    return this.postsService.getRootsPage(Number(page));
  }
}
