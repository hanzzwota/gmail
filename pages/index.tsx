// pages/index.tsx
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';

export default function Home() {
  // This page should never render for unauthenticated users because of the server-side redirect
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = (req.cookies && req.cookies.token) ? req.cookies.token : null;
  const JWT_SECRET = process.env.JWT_SECRET;

  // If no token, redirect to /login
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Verify JWT server-side (optional but recommended)
  if (!JWT_SECRET) {
    console.error('Missing JWT_SECRET env variable in server');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    jwt.verify(token, JWT_SECRET);
    // Token valid: redirect to dashboard
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  } catch (err) {
    // Invalid token
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
