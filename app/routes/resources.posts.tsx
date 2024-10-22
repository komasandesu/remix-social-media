import { json, redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const formData = await request.formData();
  
  // 型ガードを使用して値を取得
  const title = formData.get('title') as string | null;
  const content = formData.get('content') as string | null;

  // 入力のバリデーション
  if (!title || !content) {
    return json({ error: 'タイトルとコンテンツは必須です。' }, { status: 400 });
  }

  try {
    // 新しい投稿を作成
    await postRepository.create({
      title: title,
      content: content,
      authorId: user.id,
    });

    // 投稿一覧ページにリダイレクト
    return redirect('/posts'); 
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);
    return json({ error: '投稿の作成に失敗しました' }, { status: 500 });
  }
};
