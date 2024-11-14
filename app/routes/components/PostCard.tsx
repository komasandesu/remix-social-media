// app/routes/components/PostCard.tsx
import { Link } from "@remix-run/react";
import FavoriteButton from '~/routes/components/FavoriteButton';

type PostCardProps = {
    id: number;
    parentId: number | null;
    title: string;
    content: string;
    createdAt: string;
    initialIsFavorite: boolean; // 初期のお気に入り状態
    initialFavoriteCount: number; // 初期のお気に入り数
};

const PostCard: React.FC<PostCardProps> = ({  
    id,
    title,
    content,
    createdAt,
    initialIsFavorite,
    initialFavoriteCount
 }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <Link
                to={`/posts/${id}`}
                className="block text-xl font-semibold text-blue-600 hover:underline mb-2 truncate"
                style={{
                display: 'block',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                maxWidth: '100%', // 必要に応じて調整可能
                }}
            >
                {title}
            </Link>
            <p className="text-gray-600 mb-4">
                {createdAt}
            </p>
            <p className="text-gray-700 line-clamp-3 mb-4">
                {content} {/* 投稿の内容の一部を表示 */}
            </p>
            <div className="flex justify-between items-center">
                {/* FavoriteButton に初期データを渡す */}
                <FavoriteButton 
                    PostId={id}
                    initialIsFavorite={initialIsFavorite}
                    initialFavoriteCount={initialFavoriteCount}
                />
            </div>
        </div>
    );
};

export default PostCard;
