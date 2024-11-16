// app/routes/components/PostOptions.tsx
import { useState } from 'react';
import PostEditForm from './PostEditForm';
import ReplyForm from './ReplyForm';
import DeleteButton from './PostDeleteButton';

interface PostOptionsProps {
    postId: number;
    parentId: number | null;
    authorId: string; // 投稿者のID
    currentUserId: string; // 現在のユーザーのID
    title?: string;    // タイトルを追加
    content?: string;  // コンテンツを追加
}

const PostOptions: React.FC<PostOptionsProps> = ({ postId, parentId, authorId, currentUserId, title, content }) => {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isReplyModalOpen, setEditReplyOpen] = useState(false);
    const [isOptionsOpen, setOptionsOpen] = useState(false);


    const toggleEditModal = () => {
        setEditModalOpen((prev) => !prev);
    };

    const toggleReplyModal = () => {
        setEditReplyOpen((prev) => !prev);
    };

    const toggleOptions = () => {
        setOptionsOpen((prev) => !prev); // メニューの開閉状態を切り替える
    };

    return (
        <div className="relative">
            <div className="inline-flex items-center space-x-4">
                {/* オプションボタン */}
                <button
                    onClick={toggleOptions}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </button>

                {/* オプションメニュー: 必要に応じて表示 */}
                {isOptionsOpen && (
                    <div className="absolute top-full mt-2 right-0 flex space-x-2 bg-white shadow-lg rounded p-2 dark:bg-gray-800 dark:text-white">
                        <button
                            onClick={toggleReplyModal}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            返信
                        </button>

                        {/* 編集・削除: currentUserId === authorId の場合のみ表示 */}
                        {currentUserId === authorId && (
                            <>
                                <button
                                    onClick={toggleEditModal}
                                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                    編集
                                </button>
                                <DeleteButton postId={postId} />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 編集モーダルの表示 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
                    <div className="bg-white p-4 rounded shadow-md dark:bg-gray-800 dark:text-white">
                        <PostEditForm 
                            postId={postId} 
                            initialTitle={title || ""} // デフォルト値を設定
                            initialContent={content || ""} // デフォルト値を設定
                        />
                        <button
                            onClick={toggleEditModal}
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
            {/* 返信モーダルの表示 */}
            {isReplyModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
                    <div className="bg-white p-4 rounded shadow-md dark:bg-gray-800 dark:text-white">
                        {/* 親投稿のIDがない場合は、投稿IDをそのまま使う */}
                        <ReplyForm postId={parentId || postId} onClose={toggleReplyModal} />
                        <button
                            onClick={toggleReplyModal}
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostOptions;
