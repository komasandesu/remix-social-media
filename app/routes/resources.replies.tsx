// app/routes/resources.replies.tsx
import { json, redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  const formData = await request.formData();
  
  // 型ガードを使用して値を取得
  const title = formData.get('title') as string | null;
  const content = formData.get('content') as string | null;
  const postId = Number(formData.get('postId'));
  const redirectTo = formData.get('redirectTo') as string | null;
  
  // 入力のバリデーション
  if (!title || !content || isNaN(postId)) {
    return json({ error: 'Invalid data' }, { status: 400 });
  }
  
  try {
    // リプライを作成
    await postRepository.createReply({
      title: title,
      content: content,
      authorId: user.id,
      parentId: postId,
    });
    
    // リダイレクト処理
    return redirect(redirectTo || `/posts/${postId}`); // リダイレクト先を元の投稿ページに設定
  } catch (error) {
    console.error('Failed to create reply:', error);
    return json({ error: 'Failed to create reply' }, { status: 500 });
  }
};
