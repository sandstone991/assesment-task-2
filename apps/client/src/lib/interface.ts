export type ApiPost = {
  id: number;
  number: number;
  operation: '+' | '-' | '*' | '/' | null;
  updatedAt: string;
  createdAt: string;
  user: ApiUser;
};

export type ApiUser = {
  id: number;
  email: string;
  name: string;
};
