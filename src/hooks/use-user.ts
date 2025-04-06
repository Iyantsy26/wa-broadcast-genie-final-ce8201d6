
import { useState } from 'react';

type User = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
};

// This is a temporary mock implementation
export const useUser = () => {
  const [user] = useState<User | null>({
    id: 'temp-user-id',
    name: 'Demo User',
    email: 'demo@example.com'
  });

  return {
    user,
    loading: false,
    error: null
  };
};
