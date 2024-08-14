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
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const userAuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});
type FormData = z.infer<typeof userAuthSchema>;

export function SignInForm({ className, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema)
  });
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: 'Success',
        description: location.state.message
      });
    }
  }, [location.state]);
  const loginMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await client.post('auth/login', { json: formData });
        if (response.ok) {
          const data = (await response.json()) as {
            accessToken: string;
            refreshToken: string;
            user: { id: number; name: string; email: string };
          };
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('../', {
            state: {
              message: 'You have successfully signed in'
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
          loginMutation.mutate(data);
        })}
      >
        <div className="grid gap-2 ">
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
              disabled={loginMutation.isPending}
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
              disabled={loginMutation.isPending}
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
            disabled={loginMutation.isPending}
          >
            Sign In
          </button>
          <Link  to="../signup">
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
}
