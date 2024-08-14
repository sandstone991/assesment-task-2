import { createRoot } from 'react-dom/client';
import './assets/global.css';
import { Singin } from './pages/Signin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SignUp } from './pages/Signup';
import { Home } from './pages/Home';
import { PostPage } from './pages/Post';
const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/signin',
    element: <Singin />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/post/:id',
    element: <PostPage />
  },
  {
    path: '*',
    element: <div>Not Found</div>
  }
]);
root.render(
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <RouterProvider router={router}></RouterProvider>
  </QueryClientProvider>
);
