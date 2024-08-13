import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CircleDivideIcon,
  CircleXIcon,
  MinusCircleIcon,
  PlusCircleIcon
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  keepPreviousData,
  useMutation,
  UseMutationResult,
  useQuery
} from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export type PostProps = {
  id: string;
  user: string;
  content: number;
  date: string;
  commentCount?: number;
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

export const Post = (props: PostProps) => {
  const isAuthed = useAuth();
  const commentMutatuion = useMutation({});
  const commentCount = props.commentCount ?? 0;
  const [page, setPage] = useState(0);
  const comments = useQuery({
    queryKey: ['comments', props.id, page],
    queryFn: async () => {
      const response = await fetch(`/api/comments/${props.id}`);
      return response.json();
    },
    placeholderData: keepPreviousData
  });
  return (
    <div className="flex flex-col gap-1 relative">
      <div className="absolute h-full w-px bg-gray-400 -left-1"></div>
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
            <p>{props.date}</p>
          </Link>
        </div>
      </div>
      <div className="px-4">
        <Badge>{props.content}</Badge>
      </div>
      {isAuthed ? (
        <div>
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
                  parentNumber={props.content}
                />
              </PopoverContent>
            </Popover>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const operationSchema = z.union([
  z.object({
    number: z.number(),
    operator: z.union([z.literal('+'), z.literal('-'), z.literal('*')])
  }),
  z.object({
    number: z
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
    resolver: zodResolver(operationSchema)
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
          <Input
            type="hidden"
            value={operation}
            {...register('operator')}
            disabled
          />
        </div>
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
