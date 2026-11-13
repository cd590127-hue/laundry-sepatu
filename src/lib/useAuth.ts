'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser, User } from '@/lib/store';

export function useAuth(requiredRole?: User['role'] | User['role'][]) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = currentUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(u.role)) {
        router.replace(`/${u.role}`);
        return;
      }
    }
    setUser(u);
    setReady(true);
  }, [router, requiredRole]);

  return { user, ready };
}
