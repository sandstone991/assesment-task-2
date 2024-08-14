import { Inject, Injectable, Provider } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { POSTS_REPOSITORY_TOKEN } from './posts.repository.interface';
import { PostsTypeOrmRepository } from './implementations/posts.typeorm.repository';
import { Post } from '../models/posts.model';

export function providePostsRepository(): Provider[] {
  return [
    {
      provide: POSTS_REPOSITORY_TOKEN,
      useFactory: async (dependenciesProvider: PostsRepoDependenciesProvider) =>
        providePostsRepositoryFactory(dependenciesProvider),
      inject: [PostsRepoDependenciesProvider],
    },
    PostsRepoDependenciesProvider,
  ];
}

async function providePostsRepositoryFactory(
  dependenciesProvider: PostsRepoDependenciesProvider,
) {
  return new PostsTypeOrmRepository(
    dependenciesProvider.typeOrmRepository,
    dependenciesProvider.typeOrmTreeRepository,
  );
}

@Injectable()
export class PostsRepoDependenciesProvider {
  constructor(
    @InjectRepository(Post)
    public typeOrmRepository: Repository<Post>,
    @InjectRepository(Post)
    public typeOrmTreeRepository: TreeRepository<Post>,

  ) {}
}
