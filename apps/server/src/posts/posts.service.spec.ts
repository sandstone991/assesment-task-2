import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { POSTS_REPOSITORY_TOKEN } from './repositories/posts.repository.interface';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService
        ,{
          provide: POSTS_REPOSITORY_TOKEN,
          useValue: {
            findRoots: jest.fn(),
            getChildrenPage: jest.fn(),
            findChildrenCount: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            findRootsByUserId: jest.fn(),
            findParent: jest.fn(),
          },
          
        }

      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
