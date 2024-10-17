// app/routes/components/FavoriteButton.tsx
import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

interface FavoriteButtonProps {
  PostId: number;
  initialIsFavorite: boolean;
  initialFavoriteCount: number; // お気に入り数を受け取る
}

// サーバーからのレスポンスの型定義
interface ToggleFavoriteResponse {
  success: boolean;
  added: boolean;
  favoriteCount: number; // お気に入りの最新の件数を返す
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ PostId, initialIsFavorite, initialFavoriteCount }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount); // お気に入りの数を管理
  const fetcher = useFetcher<ToggleFavoriteResponse>();

  // fetcher.dataの変更を監視し、レスポンスを元に状態を更新
  useEffect(() => {
    if (fetcher.data && fetcher.data.success) {
      setIsFavorite(fetcher.data.added);
      setFavoriteCount(fetcher.data.favoriteCount); // お気に入り数も更新
    }
  }, [fetcher.data]);

  const handleFavoriteClick = () => {
    fetcher.submit(
      { PostId: PostId.toString() },
      { method: 'POST', action: '/resources/favorite' }
    );
  };

  return (
    <div className="favorite-button">
      <button
        onClick={handleFavoriteClick}
        className={`p-2 rounded-full ${
          isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}
        disabled={fetcher.state === 'submitting'}
      >
        {isFavorite ? '★' : '☆'}
      </button>
      <p className="favorite-count">
        {favoriteCount} 件のお気に入り
      </p>
    </div>
  );
};

export default FavoriteButton;
