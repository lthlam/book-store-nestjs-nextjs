'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session && session.userData) {
      const storedUser = localStorage.getItem('user');
      const sessionUserStr = JSON.stringify(session.userData);
      
      if (storedUser !== sessionUserStr) {
        localStorage.setItem('user', sessionUserStr);
        window.location.href = '/';
      }
    }
  }, [session]);

  return null;
}
