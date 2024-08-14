import { PostsRepository } from '../posts.repository.interface';
import { DataSource, Repository, TreeRepository } from 'typeorm';

import { Post } from '@/posts/models/posts.model';
import { PostDto } from '@/posts/dto/post.dto';
import { PostUpdateDto } from '@/posts/dto/post-update.dto';

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
  /**
   *  @Note finds direct children of a post
   */
  async findAllChildren(id: number): Promise<Post[]> {
    const post = await this.postsTreeRepository.findOneBy({ id: id });

    return await this.postsTreeRepository.findDescendants(post, {
      depth: 1,
      relations: ['user'],
    });
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
    const ancestors = await this.postsTreeRepository.findAncestors(post);
    let number = ancestors[0].number;
    for (let i = 1; i < ancestors.length; i++) {
      switch (ancestors[i].operation) {
        case '+':
          number += ancestors[i].number;
          break;
        case '-':
          number -= ancestors[i].number;
          break;
        case '*':
          number *= ancestors[i].number;
          break;
        case '/':
          number /= ancestors[i].number;
          break;
      }
    }
    post.number = number;
    // delete post.user.password;
    console.log(post);
    return post;
  }

  async findRoots(): Promise<Post[]> {
    return (
      await this.postsTreeRepository.findRoots({
        relations: ['user'],
      })
    ).map((post) => {
      delete post.user.password;
      return post;
    });
  }
  async findRootsByUserId(userId: number): Promise<Post[]> {
    const user = { id: userId } as any;
    return await this.postsRepository.find({
      where: { user: user, parent: null },
    });
  }
  async findParent(id: number): Promise<Post> {
    return (
      await this.postsTreeRepository.findAncestors(
        await this.postsTreeRepository.findOneByOrFail({ id: id }),
      )
    )[0];
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
    const post = await this.postsTreeRepository.findOneByOrFail({ id: id });
    return await this.postsTreeRepository
      .createDescendantsQueryBuilder('post', 'postClosure', post)
      .andWhere('post.parentId = :parentId', { parentId: id })
      .getCount();
  }

  async getChildrenPage(
    id: number,
    page: number,
  ): Promise<{ posts: Post[]; left: number }> {
    const post = await this.postsTreeRepository.findOneByOrFail({ id: id });
    const data = await this.postsTreeRepository
      .createDescendantsQueryBuilder('post', 'postClosure', post)
      .andWhere('post.parentId = :parentId', { parentId: id })
      .leftJoin('post.user', 'user')
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
      .getMany();
    const total = await this.findChildrenCount(id);
    let left = total - (page + 1) * 10;
    if (left < 0) {
      left = 0;
    }
    return { posts: data, left };
  }
}
