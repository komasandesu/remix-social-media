// app/routes/components/PostOptions.tsx
import { useState } from 'react';
import { Form, useActionData } from '@remix-run/react';
import PostEditForm from './PostEditForm';
import ReplyForm from './ReplyForm';
import DeleteButton from './PostDeleteButton';

interface PostOptionsProps {
    postId: number;
    authorId: string; // 投稿者のID
    currentUserId: string; // 現在のユーザーのID
    title?: string;    // タイトルを追加
    content?: string;  // コンテンツを追加
}

const PostOptions: React.FC<PostOptionsProps> = ({ postId, authorId, currentUserId, title, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isReplyModalOpen, setEditReplyOpen] = useState(false);

    const toggleOptions = () => {
        setIsOpen((prev) => !prev);
    };

    const toggleEditModal = () => {
        setEditModalOpen((prev) => !prev);
    };

    const toggleReplyModal = () => {
        setEditReplyOpen((prev) => !prev);
    };

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        // 確認ダイアログを表示
        const confirmDelete = window.confirm("本当に削除しますか？");
        if (!confirmDelete) {
            event.preventDefault(); // 確認が取れない場合はデフォルトの動作をキャンセル
        }
    };

    return (
        <div>
            <button
                onClick={toggleOptions}
                className="bg-gray-300 text-black py-1 px-2 rounded"
            >
                オプション
            </button>
            {isOpen && (
                <div className="absolute bg-white border rounded shadow-md mt-2">
                    <button 
                        onClick={toggleReplyModal} 
                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                    >
                        返信
                    </button>
                    {/* 現在のユーザーが投稿者の場合のみ編集・削除ボタンを表示 */}
                    {currentUserId === authorId && (
                        <div>
                        <button 
                            onClick={toggleEditModal} 
                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                        >
                            編集
                        </button>
                        <DeleteButton postId={postId} />
                        </div>
                    )}
                </div>
            )}
            {/* 編集モーダルの表示 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-md">
                        <PostEditForm 
                            postId={postId} 
                            initialTitle={title || ""} // デフォルト値を設定
                            initialContent={content || ""} // デフォルト値を設定
                        />
                        <button
                            onClick={toggleEditModal}
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
            {/* 返信モーダルの表示 */}
            {isReplyModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-md">
                        <ReplyForm postId={postId}/>
                        <button
                            onClick={toggleReplyModal}
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
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
