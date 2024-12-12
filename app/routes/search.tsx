// app/routes/search.tsx
import { Outlet } from "@remix-run/react";
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Header from './components/Header';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const user = session.get("user");
  return new Response(JSON.stringify({ user }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export default function search() {
  const { user } = useLoaderData<{ user: { name: string | null } | null }>();

  return (
    <div className="container mx-auto p-4 mt-16">
      <Header path="posts" title="ホーム" username={user?.name || null} />
      <Outlet />
    </div>
  );
}
