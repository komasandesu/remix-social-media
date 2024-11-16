// app/routes/components/PostForm.tsx
import { Form } from '@remix-run/react';
import { useState } from 'react';

const PostForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        // フォームが送信された後にタイトルとコンテンツを空にする
        setTitle('');
        setContent('');
    };

    return (
        <Form
            action={`/resources/posts`}
            method="post"
            className="mb-4 p-4 border-2 border-gray-300 rounded-lg shadow-md w-full" 
            onSubmit={handleSubmit}
        >
            <div className="flex items-center mb-4 w-full">
                <textarea
                    name="title"
                    required
                    className="border border-gray-300 rounded p-2 flex-1"
                    placeholder="タイトルを入力..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="flex items-center w-full">
                <textarea
                    name="content"
                    rows={2}
                    required
                    className="border border-gray-300 rounded p-2 flex-1 resize-y"
                    placeholder="コンテンツを入力..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-4"
            >
                投稿する
            </button>
        </Form>
    );
};

export default PostForm;
