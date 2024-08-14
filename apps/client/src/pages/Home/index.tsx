import { Post } from '@/components/Post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useIsStillAuthed } from '@/hooks/useIsStillAuthed';
import { AuthedClient, client } from '@/lib/client';
import { ApiPost } from '@/lib/interface';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const createPostSchema = z.object({
  number: z.coerce.number()
});

type FormData = z.infer<typeof createPostSchema>;

export const Home = () => {
  useIsStillAuthed();
  const isAuthed = useAuth();
  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await client.get('posts');
      return (await response.json()) as ApiPost[];
    }
  });
  const createPostMutation = useMutation({
    onMutate: async (data: FormData) => {
      try {
        await AuthedClient.post('posts', { json: data });
      } catch (e) {
        console.error(e);
      }
    }
  });
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(createPostSchema)
  });
  const navigate = useNavigate();
  return (
    <div>
      <div className="w-full h-20">
        {!isAuthed ? (
          <>
            <Button variant="outline" asChild>
              <Link to="../signin" className="p-4">
                Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="../signup" className="p-4">
                Sign Up
              </Link>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              navigate(0)
            }}
            className="p-4"
          >
            Sign Out
          </Button>
        )}
      </div>
      <div className="p-4">
        {isAuthed && (
          <form
            onSubmit={handleSubmit((data) => {
              createPostMutation.mutate(data);
            })}
          >
            <div className="grid gap-2"></div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor={`number`}>
                Number
              </Label>
              <Input
                id={`number`}
                placeholder="Enter a number"
                type="number"
                disabled={createPostMutation.isPending}
                {...register('number')}
              />
              {errors?.number && (
                <p className="px-1 text-xs text-red-600">
                  {errors.number.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="p-2"
              disabled={createPostMutation.isPending}
            >
              Submit
            </Button>
          </form>
        )}
        <div className="grid gap-10">
          {postsQuery.data?.map((post) => (
            <Post
              selfNumber={post.number}
              date={post.createdAt}
              key={post.id}
              id={post.id}
              user={post.user.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
