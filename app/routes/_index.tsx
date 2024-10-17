import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix fullstack blog' },
    { name: 'description', content: 'Remix fullstack blog' },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Link to='/posts' className="text-blue-500 hover:underline">
        ポスト一覧
      </Link>
      <Link to='/login' className="text-blue-500 hover:underline mt-4">
        ログイン
      </Link>
    </div>
  );
}