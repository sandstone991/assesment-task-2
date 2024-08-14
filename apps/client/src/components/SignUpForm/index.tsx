import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { HTTPError } from 'ky';
import { Link, useNavigate } from 'react-router-dom';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const userAuthSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  username: z.string().min(2, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});
type FormData = z.infer<typeof userAuthSchema>;

export function SignUpForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema)
  });
  const signupMutatuion = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await client.post('auth/register', { json: formData });
        if (response.ok) {
          (await response.json()) as {
            accessToken: string;
            refreshToken: string;
            user: { id: number; name: string; email: string };
          };
          navigate('../signin', {
            state: {
              message: 'You have successfully signed up'
            }
          });
        } else {
          const resJson = (await response.json()) as { message: string };
          throw new Error(resJson.message);
        }
      } catch (error) {
        const _err = error as HTTPError;
        if (_err.name === 'HTTPError') {
          const errorJson = await _err.response.json();
          toast({
            title: 'Error',
            description: (errorJson as { message: string }).message,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: 'An error occurred',
            variant: 'destructive'
          });
        }
      }
    }
  });

  return (
    <div
      className={cn('grid gap-6 shadow-md border rounded-md p-5', className)}
      {...props}
    >
      <form
        onSubmit={handleSubmit((data) => {
          signupMutatuion.mutate(data);
        })}
      >
        <div className="grid gap-2 ">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              autoCorrect="off"
              disabled={signupMutatuion.isPending}
              {...register('name')}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              placeholder="johndoe"
              autoComplete="username"
              autoCorrect="off"
              disabled={signupMutatuion.isPending}
              {...register('username')}
            />
            {errors?.username && (
              <p className="px-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={signupMutatuion.isPending}
              {...register('email')}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={signupMutatuion.isPending}
              {...register('password')}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            className={cn(buttonVariants())}
            disabled={signupMutatuion.isPending}
          >
            {signupMutatuion.isPending && <div>Loading</div>}
            Sign Up
          </button>
          <Link to="../signin">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
