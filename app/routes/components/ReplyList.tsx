// app/routes/components/ReplyList.tsx
import { User } from '.prisma/client';
import PostItem from './PostItem';

// 型定義
type Reply = {
  id: number;
  parentId: number;
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
    <div className="mt-4 border-t border-gray-300 pt-4">
      <h2 className="text-2xl font-bold mb-4">リプライ</h2>
      <ul className="space-y-4">
        {replies.map((reply) => (
          <PostItem
            key={reply.id}
            id={reply.id}
            parentId={reply.parentId}
            title={reply.title}
            content={reply.content}
            createdAt={reply.createdAt}
            authorId={reply.authorId}
            author={reply.author}
            userId={userId}
            postId={postId} // 親投稿IDを渡す
          />
        ))}
      </ul>
    </div>
  );
}