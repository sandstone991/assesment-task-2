import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CircleDivideIcon,
  CircleXIcon,
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
import { isNumber } from 'lodash-es';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthedClient, client } from '@/lib/client';
import { ApiPost } from '@/lib/interface';
import { cn } from '@/lib/utils';

export type PostProps = {
  id: number;
  user: string;
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
export const Post = (props: PostProps) => {
  const isAuthed = useAuth();
  const isRoot = !props.parentNumber && !props.operation;
  const commentMutatuion = useMutation({
    mutationFn: async (data: OperationFormData) => {
      const res = await AuthedClient.post('posts', {
        json: {
          number: data.number,
          operator: data.operator,
          parentPostId: props.id
        }
      });
      return res.json();
    },
    onSuccess: () => {
      commentCount.refetch();
    }
  });
  const commentCount = useQuery({
    queryKey: ['commentCount', props.id],
    queryFn: async () => {
      const response = await client(`posts/${props.id}/children/count`);
      return (await response.json()) as { count: number };
    }
  });
  const [initialShowMore, setInitialShowMore] = useState(false);
  const [hideComments, setHideComments] = useState(false);
  const [page, setPage] = useState(0);
  const comments = useInfiniteQuery({
    queryKey: ['comments', props.id],
    queryFn: async () => {
      const response = await client(`posts/${props.id}/children/page/${page}`);
      return (await response.json()) as { posts: ApiPost[]; left: number };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.left > 0) {
        setPage(page + 1);
        return page + 1;
      }
    },
    enabled: initialShowMore
  });
  let number = props.selfNumber;
  if (props.parentNumber && props.operation) {
    switch (props.operation) {
      case '+':
        number = number + props.parentNumber;
        break;
      case '-':
        number = props.parentNumber - number;
        break;
      case '*':
        number = number * props.parentNumber;
        break;
      case '/':
        number = props.parentNumber / number;
        break;
    }
  }
  const commentsLeft = isNumber(comments.data?.pages[page].left)
    ? comments.data!.pages[page]!.left
    : commentCount.data?.count ?? 0;

  return (
    <div
      className={cn('relative flex flex-col gap-1', {
        'p-4 shadow-lg border': isRoot,
        'pl-4 border-l': !isRoot
      })}
    >
      <div className="flex flex-row items-center gap-2">
        <Avatar>
          <AvatarImage src="https://avatar.iran.liara.run/public" />
          <AvatarFallback>{props.user.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div>
            <p>{props.user}</p>
          </div>
          <Link to={`/post/${props.id}`}>
            <p>{dataFormat.format(new Date(props.date))}</p>
          </Link>
        </div>
      </div>
      <div className="px-4">
        {props.operation ? (
          <div>
            {`${props.parentNumber} ${props.operation} ${props.selfNumber} = `}{' '}
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
                  mutation={commentMutatuion}
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
              user={post.user.name}
              parentNumber={number}
              operation={post.operation}
            />
          ));
        })}
      </div>
      {commentsLeft > 0 ? (
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
          <Badge>
            {isNumber(comments.data?.pages[page].left)
              ? comments.data?.pages[page].left
              : commentCount.data?.count ?? 0}
          </Badge>
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
        <Button
          type="submit"
          className="p-2"
          disabled={mutation.isPending}
          aria-label={`Submit ${operation}`}
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
