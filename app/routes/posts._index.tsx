// app/routes/posts._index.tsx
import { Post } from '.prisma/client';

import { json, SerializeFrom, LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { postRepository } from '../models/post.server';

import PostCard from './components/PostCard';
import PostForm from './components/PostForm';


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
      <PostForm />

      <div className="flex flex-col space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={{ 
              ...post, 
              createdAt: new Date(post.createdAt), 
              updatedAt: new Date(post.updatedAt) // updatedAtもDateに変換
            }} 
          />
        ))}
      </div>
    </div>
  );
}