import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CircleDivideIcon,
  CircleXIcon,
  Edit2,
  MinusCircleIcon,
  MinusIcon,
  PlusCircleIcon,
  PlusIcon
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  useInfiniteQuery,
  useMutation,
  UseMutationResult,
  useQuery
} from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthedClient, client } from '@/lib/client';
import { ApiPost } from '@/lib/interface';
import { cn } from '@/lib/utils';
import { PopoverClose } from '@radix-ui/react-popover';
import { isNumber } from 'lodash-es';
export type PostProps = {
  id: number;
  user: {
    name: string;
    id: number;
    email: string;
  };
  selfNumber: number;
  date: string;
  operation?: '+' | '-' | '*' | '/' | null;
  parentNumber?: number;
};

const operations = [
  {
    operation: '+',
    icon: PlusCircleIcon,
    label: 'Add'
  },
  {
    operation: '-',
    icon: MinusCircleIcon,
    label: 'Subtract'
  },
  {
    operation: '*',
    icon: CircleXIcon,
    label: 'Multiply'
  },
  {
    operation: '/',
    icon: CircleDivideIcon,
    label: 'Divide'
  }
] as const;
const dataFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short'
});

const EditPostSchema = z.union([
  z.object({
    isRoot: z.literal(false),
    number: z.number(),
    operator: z.union([
      z.literal('+'),
      z.literal('-'),
      z.literal('*'),
      z.literal('/')
    ])
  }),
  z.object({
    isRoot: z.literal(true),
    number: z.number(),
    operator: z.literal('NA')
  })
]);
type EditPostFormData = z.infer<typeof EditPostSchema>;
function EditPostForm({
  mutation,
  defaultValues
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, any, any, any>;
  defaultValues: {
    isRoot: boolean;
    number: number;
    operation: '+' | '-' | '*' | '/' | 'NA';
  };
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<EditPostFormData>({
    defaultValues: defaultValues
  });
  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (data.operator === '/' && data.number === 0) {
          setError('number', { message: 'Cannot divide by 0' });
          return;
        }
        mutation.mutate({
          number: data.number,
          operator: data.operator === 'NA' ? undefined : data.operator
        });
      })}
    >
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor="number">
            Number
          </Label>
          <Input
            id="number"
            placeholder="Enter a number"
            type="number"
            disabled={mutation.isPending}
            {...register('number')}
          />
          {errors?.number && (
            <p className="px-1 text-xs text-red-600">{errors.number.message}</p>
          )}
        </div>
        {defaultValues.isRoot ? (
          <Input
            type="hidden"
            value={defaultValues.operation}
            id="operator"
            {...register('operator')}
            disabled
          />
        ) : (
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="operator">
              Operator
            </Label>
            <select
              id="operator"
              defaultValue={defaultValues.operation}
              {...register('operator')}
            >
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/</option>
            </select>
            {errors?.operator && (
              <p className="px-1 text-xs text-red-600">
                {errors.operator.message}
              </p>
            )}
          </div>
        )}
        <PopoverClose asChild>
          <Button
            type="submit"
            className="p-2"
            disabled={mutation.isPending}
            aria-label={`Submit ${defaultValues.operation}`}
          >
            Submit
          </Button>
        </PopoverClose>
      </div>
    </form>
  );
}

export const Post = (props: PostProps) => {
  const { isAuthed, user } = useAuth();
  const [post, setPost] = useState(() => props);
  const isUserPost = user && user.id === post.user.id;
  const isRoot = !isNumber(props.parentNumber) && !post.operation;

  const commentMutation = useMutation({
    mutationFn: async (data: OperationFormData) => {
      const res = await AuthedClient.post('posts', {
        json: {
          number: data.number,
          operator: data.operator,
          parentPostId: post.id
        }
      });
      return res.json();
    },
    onSuccess: () => {
      commentCount.refetch();
      comments.refetch();
    }
  });
  const [left, setLeft] = useState<null | number>(null);
  const commentCount = useQuery({
    queryKey: ['commentCount', post.id],
    queryFn: async () => {
      const response = await client(`posts/${post.id}/children/count`);
      return (await response.json()) as { count: number };
    }
  });

  const [initialShowMore, setInitialShowMore] = useState(false);
  const [hideComments, setHideComments] = useState(false);
  const comments = useInfiniteQuery({
    queryKey: ['comments', post.id],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await client(
        `posts/${post.id}/children/page/${pageParam}`
      );
      const data = (await response.json()) as {
        posts: ApiPost[];
        left: number;
      };
      setLeft(data.left);
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.left > 0) {
        return allPages.length;
      }
    },
    enabled: initialShowMore
  });
  let number = post.selfNumber;
  if (isNumber(props.parentNumber) && post.operation) {
    switch (post.operation) {
      case '+':
        number = number + props.parentNumber!;
        break;
      case '-':
        number = props.parentNumber! - number;
        break;
      case '*':
        number = number * props.parentNumber!;
        break;
      case '/':
        number = props.parentNumber! / number;
        break;
    }
  }
  const editPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await AuthedClient.put(`posts/${post.id}`, {
        json: data
      });
      return (await res.json()) as ApiPost;
    },
    onSuccess: (data) => {
      setPost({
        date: data.createdAt,
        id: data.id,
        operation: data.operation,
        parentNumber: props.parentNumber,
        selfNumber: data.number,
        user: data.user
      });
      comments.refetch();
    }
  });
  const commentsLeft = left ?? commentCount.data?.count ?? 0;
  return (
    <div
      className={cn('relative flex flex-col gap-1', {
        'p-4 shadow-lg border': isRoot,
        'pl-4 border-l': !isRoot
      })}
    >
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          <Avatar>
            <AvatarImage src="https://avatar.iran.liara.run/public" />
            <AvatarFallback>{post.user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div>
              <p>{post.user.name}</p>
            </div>
            <Link to={`/post/${post.id}`}>
              <p>{dataFormat.format(new Date(post.date))}</p>
            </Link>
          </div>
        </div>
        {isUserPost ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost">
                <Edit2 size={24} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <EditPostForm
                mutation={editPostMutation}
                defaultValues={{
                  isRoot,
                  number: post.selfNumber,
                  operation: post.operation ?? 'NA'
                }}
              />
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
      <div className="px-4">
        {post.operation ? (
          <div>
            {`${props.parentNumber} ${post.operation} ${post.selfNumber} = `}{' '}
          </div>
        ) : null}
        <Badge>{number}</Badge>
      </div>
      {isAuthed ? (
        <div className="pl-6">
          {operations.map((operation) => (
            <Popover key={operation.operation}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2"
                  aria-label={operation.label}
                >
                  <operation.icon size={24} />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <OperationForm
                  mutation={commentMutation}
                  operation={operation.operation}
                  parentNumber={number}
                />
              </PopoverContent>
            </Popover>
          ))}
        </div>
      ) : null}
      {comments.data && comments.data.pages.length > 0 ? (
        <div className="flex">
          <Button
            onClick={() => {
              setHideComments((prev) => !prev);
            }}
            className=" rounded-full p-2"
            variant="ghost"
          >
            <MinusIcon size={24} />
          </Button>
        </div>
      ) : null}
      <div
        className={cn('pl-2 grid gap-3', {
          hidden: hideComments
        })}
      >
        {comments.data?.pages.map((page) => {
          return page.posts.map((post) => (
            <Post
              selfNumber={post.number}
              date={post.createdAt}
              key={post.id}
              id={post.id}
              user={post.user}
              parentNumber={number}
              operation={post.operation}
            />
          ));
        })}
      </div>
      {
        <div>
          {comments.isFetching && <p>Loading...</p>}
          {comments.isError && <p>Error: {comments.error.message}</p>}
        </div>
      }
      {commentsLeft > 0 && !hideComments ? (
        <div className="flex ">
          <Button
            onClick={() => {
              setInitialShowMore(true);
              if (initialShowMore) {
                comments.fetchNextPage();
              }
            }}
            className=" rounded-full p-2"
            variant="ghost"
          >
            <PlusIcon size={24} />
          </Button>
          <Badge>{commentsLeft}</Badge>
        </div>
      ) : null}
    </div>
  );
};

const operationSchema = z.union([
  z.object({
    number: z.coerce.number(),
    operator: z.union([z.literal('+'), z.literal('-'), z.literal('*')])
  }),
  z.object({
    number: z.coerce
      .number()
      .refine((n) => n !== 0, { message: 'Cannot divide by 0' }),
    operator: z.literal('/')
  })
]);
type OperationFormData = z.infer<typeof operationSchema>;

function OperationForm({
  mutation,
  operation,
  parentNumber
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: UseMutationResult<any, any, any, any>;
  operation: '+' | '-' | '*' | '/';
  parentNumber: number;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      operator: operation
    }
  });
  return (
    <form
      onSubmit={handleSubmit((data) => {
        mutation.mutate(data);
      })}
    >
      <div className="grid gap-2">
        <div>{`${parentNumber} ${operation}`}</div>
        <div className="grid gap-1">
          <Label className="sr-only" htmlFor={`number-${operation}`}>
            Number
          </Label>
          <Input
            id={`number-${operation}`}
            placeholder="Enter a number"
            type="number"
            disabled={mutation.isPending}
            {...register('number')}
          />
          {errors?.number && (
            <p className="px-1 text-xs text-red-600">{errors.number.message}</p>
          )}
        </div>
        <Input
          type="hidden"
          value={operation}
          id="operator"
          {...register('operator')}
          disabled
        />
        <PopoverClose asChild>
          <Button
            type="submit"
            className="p-2"
            disabled={mutation.isPending}
            aria-label={`Submit ${operation}`}
          >
            Submit
          </Button>
        </PopoverClose>
      </div>
    </form>
  );
}
