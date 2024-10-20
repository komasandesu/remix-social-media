// app/components/Header.tsx
import { Link } from '@remix-run/react';

const Header: React.FC<{ path: string; title: string; username: string | null }> = ({ path, title, username }) => {
  return (
    <header className="mb-6 flex items-center justify-between">
      <Link to="/" className="text-blue-500 hover:underline">
        スタート
      </Link>
      <Link to={`/${path}`} className="text-blue-500 hover:underline">
        <h1 className="text-2xl font-bold">{title}</h1>
      </Link>
      <Link to={`/profile/${username}`} className="text-blue-600 hover:underline ml-1">
        プロフィール
      </Link>
    </header>
  );
};

export default Header;
