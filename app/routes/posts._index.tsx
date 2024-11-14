// app/routes/posts._index.tsx
import { Post } from '.prisma/client';

import { json, SerializeFrom, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { postRepository } from '../models/post.server';

import PostCard from './components/PostCard';
import PostForm from './components/PostForm';
import { useEffect, useRef, useState } from 'react';
import { favoriteRepository } from '~/models/favorite.server';
import { authenticator } from '~/services/auth.server';


export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = 20;

  const posts = await postRepository.findInfiniteScrollWithoutReplies(page, limit);
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return { error: "ユーザーが認証されていません。" };
  }

  // posts にお気に入りデータを追加し、createdAt を JST で成形
  const postsWithFavoriteData = (await favoriteRepository.postsWithFavoriteData(posts, user.id)).map(post => ({
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

  const hasNextPage = posts.length === limit;
  return json({ posts: postsWithFavoriteData, hasNextPage });
};


type PostType = SerializeFrom<Post> & {
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
};

export default function PostIndex() {
  const { posts: initialPosts, hasNextPage: initialHasNextPage } = useLoaderData<{ posts: PostType[], hasNextPage: boolean }>();
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const observerRef = useRef<HTMLDivElement>(null);
  const [loadingDelay, setLoadingDelay] = useState(false); // 読み込み遅延用の状態

  const loadMorePosts = async () => {
    if (!hasNextPage || loading || loadingDelay) return; // 次のページがないか、読み込み中または遅延中なら何もしない

    setLoading(true);
    setLoadingDelay(true); // 読み込み遅延開始
    const res = await fetch(`/posts?_data=routes/posts._index&page=${page}`);
    const data = await res.json();

    if (data.posts.length > 0) {
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setPage(page + 1);
      setHasNextPage(data.hasNextPage);
    } else {
      setHasNextPage(false);
    }

    setLoading(false);
    setTimeout(() => {
      setLoadingDelay(false); // 遅延を解除
    }, 1000); // 1秒の遅延
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasNextPage && entry.intersectionRatio > 0.95) {
        loadMorePosts();
      }
    }, {
      threshold: 0.95,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasNextPage, loading, loadingDelay]); // loadingDelayを依存配列に追加

  return (
    <div className="container mx-auto p-4">
      <PostForm />
      <div className="flex flex-col space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            id={post.id}
            parentId={post.parentId}
            title={post.title}
            content={post.content}
            createdAt={post.createdAt}
            initialIsFavorite={post.initialIsFavorite} // 初期のお気に入り状態
            initialFavoriteCount={post.initialFavoriteCount} // 初期のお気に入り数
          />
        ))}
      </div>
      <div ref={observerRef} className="loading-spinner">
        {loading && hasNextPage && <p>Loading...</p>}
      </div>
    </div>
  );
}