import { useSyncExternalStore } from 'react';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { postRepository } from '~/models/post.server';

export const loader: LoaderFunction = async ({ params }) => {
  const postId = params.postId ? parseInt(params.postId, 10) : null;
  if (!postId) {
    throw new Response("Not Found", { status: 404 });
  }
  try {
    const post = await postRepository.findWithAuthor({ id: postId });
    return json(post);
  } catch (error) {
    throw new Response("Post Not Found", { status: 404 });
  }
};

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
      </article>

      <Form action="delete" method="post" className="mt-6">
        <button
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
        >
          削除
        </button>
      </Form>
    </div>
  );
}
