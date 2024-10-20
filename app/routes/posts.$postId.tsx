// app/routes/posts.$postId.tsx
import { useSyncExternalStore } from 'react';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { postRepository } from '~/models/post.server';

import { requireAuthenticatedUser } from '~/services/auth.server';

import FavoriteButton from './components/FavoriteButton';
import ReplyForm from './components/ReplyForm';
import PostOptions from './components/PostOptions';
import ReplyList from './components/ReplyList';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireAuthenticatedUser(request); // ユーザー情報を取得
  const postId = params.postId ? parseInt(params.postId, 10) : null;
  if (!postId) {
    throw new Response("Not Found", { status: 404 });
  }
  try {
    const post = await postRepository.findPostWithAuthorAndReplies(postId);
    return json({ post, user }); // 投稿とユーザー情報を返す
  } catch (error) {
    throw new Response("Post Not Found", { status: 404 });
  }
};


export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireAuthenticatedUser(request);

  const formData = new URLSearchParams(await request.text());
  const title = formData.get('title'); // タイトルを取得
  const content = formData.get('content');
  const postId = parseInt(params.postId || '', 10); // postIdをparamsから取得
  const authorId = user.id; // 現在のユーザーのIDを設定してください

  if (!title || !content || isNaN(postId)) {
    throw new Response("Invalid Data", { status: 400 });
  }

  await postRepository.createReply({ title, content, authorId, parentId: postId });

  return redirect(`/posts/${postId}`);
};



export default function PostShow() {
  const { post, user } = useLoaderData<typeof loader>();

  // クライアント側でISO形式の日付をローカル形式に変換
  // const formattedDate = new Date(post.createdAt).toLocaleString();

  // useSyncExternalStoreを使用してSSRとクライアント間の不一致を解消
  const now = useSyncExternalStore(
    () => () => {},
    () => new Date(post.createdAt).toLocaleString(), // クライアント側の値
    () => '~' // SSR用の仮の値
  );

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <nav className="mb-4 flex justify-between">
        <Link to="/" className="text-blue-500 hover:underline">ホーム</Link>
        <Link to="/posts" className="text-blue-500 hover:underline">一覧に戻る</Link>
      </nav>
      
      <article className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.content}</p>
        {/* 投稿者情報を表示 */}
        <p className="text-gray-500 mb-2">投稿者: {post.author.name}</p>
        {/* 投稿時間を表示 */}
        <p className="text-gray-500">投稿日時: {now}</p>
        <div className="flex items-center space-x-4 mt-2">
          <FavoriteButton 
            PostId={post.id}
          />
          <PostOptions 
            postId={post.id} 
            authorId={post.authorId} 
            currentUserId={user.id}
            title={post.title}
            content={post.content}
          />
        </div>
      </article>

      <ReplyList replies={post.replies} postId={post.id} userId={user.id} />
      <ReplyForm postId={post.id}/>
    </div>
  );
}
