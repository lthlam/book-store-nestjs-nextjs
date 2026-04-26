import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-secret',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'dummy-fb-id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy-fb-secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account && user.email) {
        try {
          const res = await fetch(`${apiUrl}/users/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              avatar: user.image,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            // We can't use localStorage here because it's server-side
            // But we can attach the token to the user object, which will be stored in the session
            if (user) {
              user.accessToken = data.access_token;
              user.userData = data.user;
            }
            return true;
          }
        } catch (error) {
          console.error('Social login backend error:', error);
        }
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userData = user.userData;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.userData = token.userData;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
