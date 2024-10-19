// app/routes/posts.$postId.tsx
import { useSyncExternalStore } from 'react';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { postRepository } from '~/models/post.server';

import { requireAuthenticatedUser } from '~/services/auth.server';

import FavoriteButton from './components/FavoriteButton';
import ReplyForm from './components/ReplyForm';

// 型定義
type Reply = {
  id: number
  title: string;
  content: string;
  createdAt: string;
  authorId: string
};

// type Post = {
//   id: number;
//   title: string;
//   content: string;
//   createdAt: string;
//   author: {
//     name: string;
//   };
//   parentId: number | null; // 親投稿ID
//   replies: Reply[]; // リプライの配列
// };

export const loader: LoaderFunction = async ({ params }) => {
  const postId = params.postId ? parseInt(params.postId, 10) : null;
  if (!postId) {
    throw new Response("Not Found", { status: 404 });
  }
  try {
    const post = await postRepository.findPostWithAuthorAndReplies(postId);
    return json(post);
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



function ReplyList({ replies }: { replies: Reply[] }) {
  if (!replies || replies.length === 0) {
    return <p>リプライはまだありません。</p>; // リプライがない場合の表示
  }
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold">リプライ</h2>
      <ul className="list-disc ml-6">
        {replies.map((reply) => (
          <li key={reply.id} className="mb-2"> 
            <h3 className="text-lg font-semibold">{reply.title}</h3>
            <p className="text-gray-700">{reply.content}</p>
            <p className="text-gray-500">投稿者: {reply.authorId}</p>
            <FavoriteButton 
              PostId={reply.id}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}



export default function PostShow() {
  const post = useLoaderData<typeof loader>();

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
        <FavoriteButton 
          PostId={post.id}
        />
      </article>

      <Form action="delete" method="post" className="mt-6">
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
        >
          削除
        </button>
      </Form>
      <ReplyList replies={post.replies} />
      <ReplyForm postId={post.id}/>
    </div>
  );
}
