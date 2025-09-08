// app/routes/posts.$postId.tsx
import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
import { postRepository } from '~/models/post.server';
import { favoriteRepository } from '~/models/favorite.server';
import { getAuthenticatedUserOrNull, requireAuthenticatedUser } from '~/services/auth.server';
import { commitSession } from '~/services/session.server';


import ReplyForm from './components/ReplyForm';
import ReplyList from './components/ReplyList';
import PostItem from './components/PostItem';

export const loader: LoaderFunction = async ({ request, params }) => {
  // user と session を受け取る(ユーザーがいなくてもsessionは返ってくる)
  const { user, session } = await getAuthenticatedUserOrNull(request);
  const postId = params.postId ? parseInt(params.postId, 10) : null;

  if (!postId) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const post = await postRepository.findPostWithAuthorAndReplies(postId);

    // 投稿が返信である場合は親ポストにリダイレクト
    if (post.parentId) {
      return redirect(`/posts/${post.parentId}`);
    }

    const formattedPostDate = new Date(post.createdAt).toLocaleString("ja-JP", { /* ... */ });

    // 投稿のメインアイテムのお気に入り情報を取得
    const [isFavorite, favoriteCount] = await Promise.all([
      user?.id ? favoriteRepository.isFavorite({ PostId: postId, userId: user?.id || null }) : Promise.resolve(false),
      favoriteRepository.countFavorites(postId)
    ]);
    
    const repliesWithFavoriteInfo = (await favoriteRepository.postsWithFavoriteData(post.replies, user?.id || null)).map(p => ({
      ...p,
      createdAt: new Date(p.createdAt).toLocaleString("ja-JP", { /* ... */ }),
    }));

    // レスポンスを返す時に、セッションを更新するヘッダーを付ける
    const body = JSON.stringify({
      post: { 
        ...post, 
        createdAt: formattedPostDate,
        replies: repliesWithFavoriteInfo 
      },
      user, // user オブジェクトか null がここに入る
      initialIsFavorite: isFavorite,
      initialFavoriteCount: favoriteCount,
    });

    const headers = new Headers({ "Content-Type": "application/json" });
    headers.set("Set-Cookie", await commitSession(session));

    return new Response(body, { headers });

  } catch (error) {
    throw new Response("Post Not Found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  // こちらは認証が必須
  const { user, session } = await requireAuthenticatedUser(request);

  const formData = new URLSearchParams(await request.text());
  const title = formData.get('title');
  const content = formData.get('content');
  const postId = parseInt(params.postId || '', 10);
  const authorId = user.id;

  if (!title || !content || isNaN(postId)) {
    throw new Response("Invalid Data", { status: 400 });
  }

  await postRepository.createReply({ title, content, authorId, parentId: postId });

  // リダイレクトの時も、ちゃんとヘッダーを付けてセッションを更新
  return redirect(`/posts/${postId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  });
};

export default function PostShow() {
  const { post, user, initialIsFavorite, initialFavoriteCount } = useLoaderData<typeof loader>();

  // クエリパラメータからエラーメッセージを取得
  const location = useLocation();
  const errorType = new URLSearchParams(location.search).get('error');
  let errorMessage = '';

  switch (errorType) {
    case 'missingFields':
      errorMessage = 'タイトルと内容の両方が必要です。';
      break;
    case 'tooLongTitle':
      errorMessage = 'タイトルは 200 文字未満である必要があります。';
      break;
    case 'tooLongContent':
      errorMessage = '内容は 1000 文字未満である必要があります。';
      break;
    default:
      errorMessage = '';
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <article className="mb-6">
        {/* PostItemコンポーネントを使用して投稿を表示 */}
      <PostItem
        id={post.id}
        parentId={post.parentId}
        title={post.title}
        content={post.content}
        createdAt={post.createdAt}
        authorId={post.authorId}
        authorName={post.author.name}
        userId={user?.id || null}
        initialIsFavorite={initialIsFavorite} // 初期のお気に入り状態
        initialFavoriteCount={initialFavoriteCount} // 初期のお気に入り数
      />
      </article>

      <ReplyList replies={post.replies} postId={post.id} userId={user?.id || null} />
      {/* エラーメッセージの表示 */}
      {errorMessage && (
        <div className="error-message" style={{ color: 'red' }}>
          {errorMessage}
        </div>
      )}
      <ReplyForm postId={post.id}/>
    </div>
  );
}