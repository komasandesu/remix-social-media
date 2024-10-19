import FavoriteButton from './FavoriteButton';
import DeleteButton from './PostDeleteButton';
import { User } from '.prisma/client';

// 型定義
type Reply = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: User;
};

export default function ReplyList({
  replies,
  postId,
  userId,
}: {
  replies: Reply[];
  postId: number;
  userId: string;
}) {
  if (!replies || replies.length === 0) {
    return <p>リプライはまだありません。</p>; // リプライがない場合の表示
  }

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold">リプライ</h2>
      <ul className="list-disc ml-6">
        {replies.map((reply) => (
          <li key={reply.id} className="mb-2">
            <h3 className="text-lg font-semibold">{reply.title}</h3>
            <p className="text-gray-700">{reply.content}</p>
            <p className="text-gray-500">投稿者: {reply.author?.name || '不明'}</p>
            <FavoriteButton PostId={reply.id} />
            {/* 現在のユーザーとリプライの著者が一致する場合に削除ボタンを表示 */}
            {reply.authorId === userId && (
              <DeleteButton postId={reply.id} redirectTo={`/posts/${postId}`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
