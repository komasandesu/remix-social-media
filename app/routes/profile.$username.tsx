// app/routes/profile.$username.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/models/db.server";
import { useLoaderData, Link, Form } from '@remix-run/react';
import { json } from "@remix-run/node";
import { postRepository } from "~/models/post.server"; // 追加
import { useSyncExternalStore } from "react";
import { requireAuthenticatedUser } from "~/services/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const { username } = params;
  
    // ログインユーザーを取得
    const user = await requireAuthenticatedUser(request);
  
    // ユーザー名からユーザー情報を取得
    const profileUser = await prisma.user.findUnique({
      where: { name: username },
    });
  
    if (!profileUser) {
      throw new Response("User not found", { status: 404 });
    }
  
    // ユーザーの投稿を取得
    const posts = await postRepository.findByUserId(profileUser.id);
  
    return json({ user, profileUser, posts }); // ログインユーザー情報も返す
  }
  

  export default function UserProfile() {
    const { user, profileUser, posts } = useLoaderData<typeof loader>();
  
    const formattedDate = useSyncExternalStore(
      () => () => {},
      () => new Date(profileUser.createdAt).toLocaleString(), // クライアント側の値
      () => '~' // SSR用の仮の値
    );
  
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-black">{profileUser.name}さんのプロフィール</h1>
          <div className="space-y-4">
            <p className="text-gray-600">Email: {profileUser.email}</p>
            <p className="text-gray-600">作成日: {formattedDate}</p>
  
            {/* プロフィール編集へのリンクを追加 */}
            {user.id === profileUser.id && ( // 自分のプロフィールの場合のみ表示
              <Link to="/profile/settings" className="text-blue-600 hover:underline">
                プロフィールを編集する
              </Link>
            )}

          </div>

          {/* ログアウトボタン */}
            <Form action="/logout" method="post" className="mt-6">
            <button
                type="submit"
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
            >
                ログアウト
            </button>
            </Form>
        </div>
      
        {/* ユーザーの投稿一覧を表示 */}
        <h2 className="text-xl font-semibold mt-6">投稿一覧</h2>
        <ul className="space-y-2">
          {posts.length > 0 ? (
            posts.map((post) => (
              <li key={post.id} className="border-b pb-2">
                <Link to={`/posts/${post.id}`} className="text-blue-600 hover:underline">
                  {post.title}
                </Link>
                <p className="text-sm text-gray-500">{post.createdAt}</p>
              </li>
            ))
          ) : (
            <p className="text-gray-500">まだ投稿がありません。</p>
          )}
        </ul>
      </div>
    );
  }