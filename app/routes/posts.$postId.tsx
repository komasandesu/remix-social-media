// app/routes/posts.$postId.tsx
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useLocation } from '@remix-run/react';
import { postRepository } from '~/models/post.server';

import { getAuthenticatedUserOrNull, requireAuthenticatedUser } from '~/services/auth.server';

import ReplyForm from './components/ReplyForm';
import ReplyList from './components/ReplyList';
import PostItem from './components/PostItem';
import { favoriteRepository } from '~/models/favorite.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getAuthenticatedUserOrNull(request); // ユーザー情報を取得
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

    // 投稿の createdAt を成形
    const formattedPostDate = new Date(post.createdAt).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // 投稿のメインアイテムのお気に入り情報を取得
    const isFavorite = user?.id ? await favoriteRepository.isFavorite({ PostId: postId, userId: user?.id || null }) : false;
    const favoriteCount = await favoriteRepository.countFavorites(postId);

    // posts にお気に入りデータを追加し、createdAt を JST で成形
    const repliesWithFavoriteInfo = (await favoriteRepository.postsWithFavoriteData(post.replies, user?.id || null)).map(post => ({
      ...post,
      createdAt: new Date(post.createdAt).toLocaleString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    }));

    return new Response(JSON.stringify({
      post: { 
        ...post, 
        createdAt: formattedPostDate,
        replies: repliesWithFavoriteInfo },
      user,
      initialIsFavorite: isFavorite,
      initialFavoriteCount: favoriteCount,
    }), {
      headers: { "Content-Type": "application/json" }
    });
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
        initialIsFavorite={post.initialIsFavorite} // 初期のお気に入り状態
        initialFavoriteCount={post.initialFavoriteCount} // 初期のお気に入り数
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