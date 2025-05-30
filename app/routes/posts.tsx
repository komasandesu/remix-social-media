// app/routes/posts.tsx
import { Outlet } from "@remix-run/react";
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getAuthenticatedUserOrNull } from '~/services/auth.server';
import Header from './components/Header';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getAuthenticatedUserOrNull(request);
  return new Response(JSON.stringify({ user }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default function Posts() {
  const { user } = useLoaderData<{ user: { name: string | null } | null }>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="ホーム" username={user?.name || null} />
      <Outlet />
    </div>
  );
}
