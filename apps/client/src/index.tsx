import { createRoot } from 'react-dom/client';
import './assets/global.css';
import { Singin } from './pages/Signin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
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
    element: <Signup />
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
