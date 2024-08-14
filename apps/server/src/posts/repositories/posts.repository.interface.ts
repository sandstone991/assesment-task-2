import { PostDto } from '../dto/post.dto';
import { Post } from '../models/posts.model';
export interface PostsRepository {
  findRoots(): Promise<Post[]>;
  findAllChildren(id: number): Promise<Post[]>;
  getChildrenPage(
    id: number,
    page: number,
  ): Promise<{
    posts: Post[];
    left: number;
  }>;
  findChildrenCount(id: number): Promise<number>;
  create(userId: number, dto: PostDto): Promise<Post>;
  delete(id: number): Promise<void>;
  update(id: number, dto: PostDto): Promise<Post>;
  findById(id: number): Promise<Post>;
  findRootsByUserId(userId: number): Promise<Post[]>;
  findParent(id: number): Promise<Post>;
}

export const POSTS_REPOSITORY_TOKEN = 'posts-repository-token';
