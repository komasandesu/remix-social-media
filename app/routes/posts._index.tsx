// app/routes/posts._index.tsx
import { Post } from '.prisma/client';

import { json, SerializeFrom, LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { postRepository } from '../models/post.server';

import FavoriteButton from '~/routes/components/FavoriteButton';
// import { requireAuthenticatedUser } from '~/services/auth.server';


export const loader: LoaderFunction = async ({ request }) => {
  // 投稿データを取得する
  // const user = await requireAuthenticatedUser(request);

  const Posts = await postRepository.findAllWithoutReplies();
  return json({ posts: Posts });

  // return json({ posts: Posts, user: user });
};

type PostType = SerializeFrom<Post>;

export default function PostIndex() {
  const { posts } = useLoaderData<{ posts: PostType[] }>();
  // const { posts, user } = useLoaderData<{ posts: PostType[]; user: { name: string } | null }>();
  
  return (
    <div className="container mx-auto p-4">
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