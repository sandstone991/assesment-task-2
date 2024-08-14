import { SignInForm } from '@/components/SignInForm';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Singin = () => {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthed) {
      navigate('../');
    }
  }, [isAuthed, navigate]);
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <SignInForm />
    </div>
  );
};
