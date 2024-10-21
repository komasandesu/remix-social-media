// app/routes/components/PostItem.tsx
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { User } from '.prisma/client';
import PostOptions from './PostOptions';
import { useSyncExternalStore } from 'react';

// 型定義
type PostItemProps = {
  id: number;
  parentId: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: User;
  userId: string; // 現在のユーザーID
  postId?: number; // （オプション）親投稿ID（リプライの場合）
};

export default function PostItem({
    id,
    parentId,
    title,
    content,
    createdAt,
    authorId,
    author,
    userId,
}: PostItemProps) {
    // const formattedDate = new Date(createdAt).toLocaleString();
    const formattedDate = useSyncExternalStore(
        () => () => {},
        () => new Date(createdAt).toLocaleString(), // クライアント側の値
        () => '~' // SSR用の仮の値
    );

    return (
        <div className="mb-6 border border-gray-300 rounded-lg shadow-md p-4 bg-white">
            <h1 className="text-2xl font-bold mb-2 text-black">{title}</h1>
            <p className="text-gray-700 mb-4">{content}</p>
            <p className="text-gray-500">
                投稿者: 
                <Link to={`/profile/${author?.name}`} className="text-blue-600 hover:underline ml-1">
                {author?.name || '不明'}
                </Link>
            </p>
            <p className="text-gray-500">投稿日時: {formattedDate}</p>
            <div className="flex items-center space-x-4 mt-2">
                <FavoriteButton PostId={id} />
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