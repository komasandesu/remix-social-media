// app/routes/posts.$postId.tsx
import { useSyncExternalStore } from 'react';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { postRepository } from '~/models/post.server';

import { requireAuthenticatedUser } from '~/services/auth.server';

import ReplyForm from './components/ReplyForm';
import ReplyList from './components/ReplyList';
import PostItem from './components/PostItem';
import { favoriteRepository } from '~/models/favorite.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireAuthenticatedUser(request); // ユーザー情報を取得
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

    // 投稿のメインアイテムのお気に入り情報を取得
    const isFavorite = await favoriteRepository.isFavorite({ PostId: postId, userId: user.id });
    const favoriteCount = await favoriteRepository.countFavorites(postId);

    // 各リプライに対するお気に入り情報を取得
    const repliesWithFavoriteInfo = await favoriteRepository.postsWithFavoriteData(post.replies, user.id);

    return json({
      post: { ...post, replies: repliesWithFavoriteInfo },
      user,
      initialIsFavorite: isFavorite,
      initialFavoriteCount: favoriteCount,
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
        userId={user.id}
        initialIsFavorite={initialIsFavorite} // 初期のお気に入り状態
        initialFavoriteCount={initialFavoriteCount} // 初期のお気に入り数
      />
      </article>

      <ReplyList replies={post.replies} postId={post.id} userId={user.id} />
      <ReplyForm postId={post.id}/>
    </div>
  );
}