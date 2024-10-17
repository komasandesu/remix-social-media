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

  // 初期データを取得
  useEffect(() => {
    if (isFavorite === null && favoriteCount === null) {
      // 初回ロード時のみデータをフェッチ
      fetcher.load(`/resources/favorite?PostId=${PostId}`);
    }
  }, [PostId, isFavorite, favoriteCount]); // isFavorite と favoriteCount の初期値が null のときのみロード

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

  // 初期データがロードされるまでローディング表示
  if (isFavorite === null || favoriteCount === null) {
    return <div>Loading...</div>;
  }

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
