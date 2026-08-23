// pages/dashboard.tsx
import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';

type Props = {
  user?: {
    email?: string | null;
    name?: string | null;
  };
};

export default function DashboardPage({ user }: Props) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || user?.email || 'User'}!</p>
      <p>This page is protected and only visible to authenticated users.</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = (req.cookies && req.cookies.token) ? req.cookies.token : null;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = { email: decoded?.email || null, name: decoded?.name || null };
    return { props: { user } };
  } catch (err) {
    console.error('JWT verification failed', err);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
