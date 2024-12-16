// app/routes/resources.posts.tsx
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { requireAuthenticatedUser } from '~/services/auth.server';
import { postRepository } from '~/models/post.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireAuthenticatedUser(request);
  
  if(user === null){
    return redirect("/login");
  }
  
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

    return redirect('/posts');
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create post' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

