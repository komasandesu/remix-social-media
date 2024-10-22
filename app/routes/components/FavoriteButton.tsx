// app/routes/components/FavoriteButton.tsx
import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

interface FavoriteButtonProps {
  PostId: number;
}

// サーバーからのレスポンスの型定義
interface FavoriteResponse {
  isFavorite: boolean;
  favoriteCount: number;
}

interface ToggleFavoriteResponse {
  success: boolean;
  added: boolean;
  favoriteCount: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ PostId }) => {
  const fetcher = useFetcher<FavoriteResponse | ToggleFavoriteResponse>();
  const [isFavorite, setIsFavorite] = useState<boolean | null>(null);
  const [favoriteCount, setFavoriteCount] = useState<number | null>(null);

  // 初期データを取得するための fetcher の使用
  useEffect(() => {
    const fetchInitialData = async () => {
      const response = await fetch(`/resources/favorite?PostId=${PostId}`);
      const data: FavoriteResponse = await response.json();
      setIsFavorite(data.isFavorite);
      setFavoriteCount(data.favoriteCount);
    };
    fetchInitialData();
  }, [PostId]); // PostId の変更時にのみデータを再取得

  // fetcher.data の変更を監視し、状態を更新
  useEffect(() => {
    if (fetcher.data && 'isFavorite' in fetcher.data) {
      setIsFavorite(fetcher.data.isFavorite);
      setFavoriteCount(fetcher.data.favoriteCount);
    } else if (fetcher.data && fetcher.data.success) {
      setIsFavorite(fetcher.data.added);
      setFavoriteCount(fetcher.data.favoriteCount);
    }
  }, [fetcher.data]);

  const handleFavoriteClick = () => {
    fetcher.submit(
      { PostId: PostId.toString() },
      { method: 'POST', action: '/resources/favorite' }
    );
  };

  return (
    <button
      onClick={handleFavoriteClick}
      className={`flex items-center space-x-2 p-2 rounded-full ${
        isFavorite ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}
      disabled={fetcher.state === 'submitting'}
    >
      <span className="text-lg">
        {isFavorite ? '★' : '☆'}
      </span>
      <span className="text-sm">
        {favoriteCount}
      </span>
    </button>
  );
};

export default FavoriteButton;
