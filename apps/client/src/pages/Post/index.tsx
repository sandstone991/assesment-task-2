import { Post } from '@/components/Post';
import { client } from '@/lib/client';
import { ApiPost } from '@/lib/interface';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

export const PostPage = () => {
  const postId = useLocation().pathname.split('/').pop();
  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = client.get(`posts/${postId}`);
      return response.json() as Promise<ApiPost>;
    }
  });
  return (
    <div className="p-4">
      {postQuery.data && (
        <Post
          date={postQuery.data.createdAt}
          id={postQuery.data.id}
          selfNumber={postQuery.data.number}
          user={postQuery.data.user}
          key={postQuery.data.id}
        />
      )}
    </div>
  );
};
