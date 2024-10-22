// app/routes/components/PostCard.tsx
import { Link } from "@remix-run/react";
import FavoriteButton from '~/routes/components/FavoriteButton';
import { Post } from '.prisma/client';
import { useSyncExternalStore } from "react";

type PostCardProps = {
  post: Post;
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const formattedCreatedDate = useSyncExternalStore(
        () => () => {},
        () => {
            const date = new Date(post.createdAt);
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // 24時間制にする場合
            });
        },
        () => '~' // SSR用の仮の値
    );

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <Link 
                to={`/posts/${post.id}`} 
                className="block text-xl font-semibold text-blue-600 hover:underline mb-2"
            >
                {post.title}
            </Link>
            <p className="text-gray-600 mb-4">
                {formattedCreatedDate}
            </p>
            <p className="text-gray-700 line-clamp-3 mb-4">
                {post.content} {/* 投稿の内容の一部を表示 */}
            </p>
            <div className="flex justify-between items-center">
                <FavoriteButton PostId={post.id} />
            </div>
        </div>
    );
};

export default PostCard;
