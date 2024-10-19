// app/routes/posts._index.tsx
import { Post } from '.prisma/client';

import { json, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { postRepository } from '../models/post.server';

import FavoriteButton from '~/routes/components/FavoriteButton';


export const loader = async () => {
  // 投稿データを取得する
  const Posts = await postRepository.findAllWithoutReplies();

  return json({ posts: Posts });
};

type PostType = SerializeFrom<Post>;

export default function PostIndex() {
  const { posts } = useLoaderData<{ posts: PostType[] }>();
  
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
              to={`/posts/${post.id}`} 
              className="text-lg text-blue-500 hover:underline"
            >
              {post.title}
            </Link>
            <FavoriteButton 
              PostId={post.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}