// app/routes/components/PostItem.tsx
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { User } from '.prisma/client';
import PostOptions from './PostOptions';
import { useSyncExternalStore } from 'react';

// 型定義
type PostItemProps = {
  id: number;
  parentId: number | null;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  userId: string; // 現在のユーザーID
  initialIsFavorite: boolean; // 初期のお気に入り状態
  initialFavoriteCount: number; // 初期のお気に入り数
};

export default function PostItem({
    id,
    parentId,
    title,
    content,
    createdAt,
    authorId,
    authorName,
    userId,
    initialIsFavorite,
    initialFavoriteCount
}: PostItemProps) {

    return (
        <div className="mb-6 border border-gray-300 rounded-lg shadow-md p-4 bg-white">
            <h1
                className="text-2xl font-bold mb-2 text-black break-words"
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
            >
                {title}
            </h1>
            <p
                className="text-gray-700 mb-4 break-words"
                style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            >
                {content}
            </p>
            <p className="text-gray-500">
                投稿者: 
                <Link to={`/profile/${authorName}`} className="text-blue-600 hover:underline ml-1">
                {authorName || '不明'}
                </Link>
            </p>
            <p className="text-gray-500">投稿日時: {createdAt}</p>
            <div className="flex items-center space-x-4 mt-2">
                <FavoriteButton 
                    PostId={id}
                    initialIsFavorite={initialIsFavorite}
                    initialFavoriteCount={initialFavoriteCount}
                />
                <PostOptions 
                    postId={id} 
                    parentId={parentId}
                    authorId={authorId} 
                    currentUserId={userId}
                    title={title}
                    content={content}
                />
            </div>
        </div>
    );
}