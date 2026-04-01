import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    clientId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      clientId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    clientId?: string;
  }
}