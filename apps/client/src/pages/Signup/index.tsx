import { SignUpForm } from '@/components/SignUpForm';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthed) {
      navigate('../');
    }
  }, [isAuthed, navigate]);
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <SignUpForm />
    </div>
  );
};
