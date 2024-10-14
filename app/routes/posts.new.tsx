import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { postRepository } from '~/models/post.server';
import { authenticator } from '~/services/auth.server'; // 認証用のサービスをインポート

export const action = async ({ request }: ActionFunctionArgs) => {
  // ログインしていない場合はリダイレクト
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const form = await request.formData();
  const title = form.get('title');
  const content = form.get('content');

  if (typeof title !== 'string' || typeof content !== 'string') {
    throw new Error('Title and content are required');
  }

  // ポストにログインユーザーのIDを紐づけて作成
  await postRepository.create({
    title: title,
    content: content,
    authorId: user.id, // 認証されたユーザーのIDを設定
  });

  return redirect('/posts');
};

export default function PostNew() {
  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">ポスト新規作成</h1>
      <form method="post" className="space-y-4">
        <div>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="title"
            placeholder="タイトル"
            type="text"
          />
        </div>
        <div>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="content"
            placeholder="コンテンツ"
            rows={5}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          type="submit"
        >
          作成する
        </button>
      </form>
    </div>
  );
}