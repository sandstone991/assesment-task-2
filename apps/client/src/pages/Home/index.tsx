import { Post } from '@/components/Post';
import { useIsStillAuthed } from '@/hooks/useIsStillAuthed';

export const Home = () => {
  useIsStillAuthed();
  return (
    <div className="p-4">
      <Post id="1" user="ali" content={5} date={'2024-2-1'} commentCount={10} />
    </div>
  );
};
