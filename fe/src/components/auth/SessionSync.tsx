'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session && session.accessToken) {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== session.accessToken) {
        localStorage.setItem('token', session.accessToken);
        localStorage.setItem('user', JSON.stringify(session.userData));
        
        // Force a page refresh to update all components that rely on localStorage
        window.location.href = '/';
      }
    }
  }, [session]);

  return null;
}
