// app/components/Header.tsx
import { Link } from '@remix-run/react';

const Header: React.FC<{ path: string; title: string; username: string | null }> = ({ path, title, username }) => {
  return (
    <header className="fixed top-0 left-0 right-0 mb-6 flex items-center justify-between bg-black shadow-md z-10 p-4">
      <Link to="/" className="text-blue-500 hover:underline">
        スタート
      </Link>
      <Link to={`/${path}`} className="text-blue-500 hover:underline">
        <h1 className="text-2xl font-bold">{title}</h1>
      </Link>
      <div className="flex items-center">
        <Link to="/posts/new" className="text-blue-600 hover:underline mr-4">
          投稿する
        </Link>
        <Link to={`/profile/${username}`} className="text-blue-600 hover:underline ml-1">
          プロフィール
        </Link>
      </div>
    </header>
  );
};

export default Header;
