// app/routes/resources.posts.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';
import { commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  // user と session を受け取る
  const { user, session } = await requireAuthenticatedUser(request);

  // どのレスポンスでも使えるように、ヘッダーを先に作っておく
  const headers = {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  };
  
  const formData = await request.formData();
  
  const title = (formData.get('title') as string | null)?.trim();
  const content = (formData.get('content') as string | null)?.trim();

  // 入力のバリデーション
  if (!title || !content) {
    return redirect('/posts/new?error=missingFields');
  }

  // 200文字以上の入力を拒否
  if (title.length > 200 ) {
    return redirect('/posts/new?error=tooLongTitle');
  }
  if (content.length > 1000) {
    return redirect('/posts/new?error=tooLongContent');
  }

  try {
    // 新しい投稿を作成
    await postRepository.create({
      title: title,
      content: content,
      authorId: user.id,
    });

    // 成功した時のリダイレクトにもヘッダーを付ける
    return redirect('/posts', headers);
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);

    // エラーレスポンスの時も、ちゃんとヘッダーを付けてあげる
    const errorHeaders = new Headers(headers.headers);
    errorHeaders.set('Content-Type', 'application/json');
    const body = JSON.stringify({ error: 'Failed to create post' });
    return new Response(body, { status: 500, headers: errorHeaders });
  }
};
