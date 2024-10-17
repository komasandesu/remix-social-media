import { Post } from '.prisma/client';

import { json, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { postRepository } from '../models/post.server';

import { authenticator } from '~/services/auth.server';

import FavoriteButton from '~/routes/components/FavoriteButton';
import { favoriteRepository } from '../models/favorite.server';


type PostWithFavorite = SerializeFrom<Post> & { 
  isFavorite: boolean; 
  favoriteCount: number; // お気に入り数を追加
};

export const loader = async ({ request }: { request: Request }) => {
  const user = await authenticator.isAuthenticated(request);

  const substringPosts = await postRepository.findAllWithFavorites(user?.id);

  // 各投稿のお気に入り数を取得
  const postsWithFavoriteCount = await Promise.all(
    substringPosts.map(async (post) => {
      const favoriteCount = await favoriteRepository.countFavorites(post.id);
      return {
        ...post,
        favoriteCount,
      };
    })
  );

  return json({ posts: postsWithFavoriteCount, user });
};

type PostType = SerializeFrom<Post>;

export default function PostIndex() {
  const { posts, user } = useLoaderData<{ 
    posts: PostWithFavorite[], 
    user: { id: string } | null 
  }>();
  
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <Link to='/' className="text-blue-500 hover:underline">
          ホーム
        </Link>
        <h1 className="text-2xl font-bold mt-4">ポスト</h1>
      </header>

      <Link 
        to='new' 
        className="inline-block mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
      >
        ポストを作成する
      </Link>

      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.id} className="flex items-center justify-between">
            <Link 
              to={`/substring_posts/${post.id}`} 
              className="text-lg text-blue-500 hover:underline"
            >
              {post.title}
            </Link>
            <FavoriteButton 
              initialIsFavorite={post.isFavorite}
              initialFavoriteCount={post.favoriteCount}
              PostId={post.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}