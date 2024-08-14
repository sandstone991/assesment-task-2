import { PostsRepository } from '../posts.repository.interface';
import { Repository, TreeRepository } from 'typeorm';

import { Post } from '../../models/posts.model';
import { PostDto } from '../../dto/post.dto';
import { PostUpdateDto } from '../../dto/post-update.dto';

export class PostsTypeOrmRepository implements PostsRepository {
  constructor(
    private readonly postsRepository: Repository<Post>,
    private readonly postsTreeRepository: TreeRepository<Post>,
  ) {}
  async create(userId: number, dto: PostDto): Promise<Post> {
    const post = new Post();
    post.number = dto.number;
    post.user = { id: userId } as any;
    if (dto.parentPostId) {
      post.parent = { id: dto.parentPostId } as any;
    }
    post.operation = dto.operator;
    return await this.postsTreeRepository.save(post);
  }
  async delete(id: number): Promise<void> {
    await this.postsTreeRepository.delete(id);
  }

  async findById(id: number): Promise<Post> {
    const post = await this.postsTreeRepository.findOne({
      where: { id: id },
      relations: ['user'],
      select: {
        id: true,
        number: true,
        operation: true,
        createdAt: true,
        updatedAt: true,
        user: {
          email: true,
          id: true,
          username: true,
          name: true,
        },
      },
    });
    let ancestorsTree = await this.postsTreeRepository.findAncestorsTree(post);
    let ancestors:Post[] = []
    ancestors.push(post)
    while(true){
      if(ancestorsTree.parent){
        ancestors.push(ancestorsTree.parent)
        ancestorsTree = ancestorsTree.parent
      }else{
        ancestors.push(ancestorsTree)
        break;
      }
    }
    ancestors = ancestors.reverse()
    let number = ancestors[0].number;
    for (let i = 1; i < ancestors.length; i++) {
      const left = ancestors[i];
      const operation = left.operation;
      const leftArg = number;
      const rightArg = ancestors[i].number;
      switch (operation) {
        case '+':
          number = leftArg + rightArg;
          break;
        case '-':
          number = leftArg - rightArg;
          break;
        case '*':
          number = leftArg * rightArg;
          break;
        case '/':
          number = leftArg / rightArg;
          break;
      }
    }
    post.number = number;
    return post;
  }
  async getRootsPage(page: number): Promise<{ posts: Post[]; left: number }> {
    const data = await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.parentId IS NULL')
      .innerJoin('posts.user', 'user')
      .select([
        'posts.id',
        'posts.number',
        'posts.operation',
        'posts.createdAt',
        'posts.updatedAt',
        'user.email',
        'user.id',
        'user.username',
        'user.name',
      ])
      .orderBy('posts.createdAt', 'DESC')
      .skip(page * 10)
      .take(10)
      .getManyAndCount();
    const total = data[1];
    let left = total - (page + 1) * 10;
    if (left < 0) {
      left = 0;
    }
    return { posts: data[0], left };
  }
  async findRoots(): Promise<Post[]> {
    return await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.parentId IS NULL')
      .innerJoin('posts.user', 'user')
      .select([
        'posts.id',
        'posts.number',
        'posts.operation',
        'posts.createdAt',
        'posts.updatedAt',
        'user.email',
        'user.id',
        'user.username',
        'user.name',
      ])
      .getMany();
  }
  async findRootsByUserId(userId: number): Promise<Post[]> {
    const user = { id: userId } as any;
    return await this.postsRepository.find({
      where: { user: user, parent: null },
    });
  }
  async findParent(id: number): Promise<Post> {
    const post = await this.postsTreeRepository.findOne({
      where: { id: id },
      relations: {
        parent: true,
      },
    });
    return post.parent;
  }
  async update(id: number, dto: PostUpdateDto): Promise<Post> {
    const post = await this.findById(id);
    post.number = dto.number ?? post.number;
    post.operation = dto.operator ?? post.operation;
    return await this.postsRepository.save(post);
  }
  /**
   *
   * @Note finds direct children count of a post
   */
  async findChildrenCount(id: number): Promise<number> {
    return await this.postsTreeRepository
      .createQueryBuilder('post')
      .where('post.parentId = :parentId', { parentId: id })
      .getCount();
  }

  async getChildrenPage(
    id: number,
    page: number,
  ): Promise<{ posts: Post[]; left: number }> {
    const data = await this.postsTreeRepository
      .createQueryBuilder('post')
      .andWhere('post.parentId = :parentId', { parentId: id })
      .innerJoin('post.user', 'user')
      .select([
        'post.id',
        'post.number',
        'post.operation',
        'post.createdAt',
        'post.updatedAt',
        'user.email',
        'user.id',
        'user.username',
        'user.name',
      ])
      .orderBy('post.createdAt', 'DESC')
      .skip(page * 10)
      .take(10)
      .getManyAndCount();
    const total = data[1];
    let left = total - (page + 1) * 10;
    if (left < 0) {
      left = 0;
    }
    return { posts: data[0], left };
  }
}
