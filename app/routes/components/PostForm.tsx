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
        action={`/resources/posts`} // 投稿用のアクションURL
            method="post"
            className="mb-4"
            onSubmit={handleSubmit}
        >
            <textarea
                name="title"
                required
                className="w-full border rounded p-2"
                placeholder="タイトルを入力..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                name="content"
                rows={2}
                required
                className="w-full border rounded p-2 mt-2"
                placeholder="コンテンツを入力..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-2"
            >
                投稿する
            </button>
        </Form>
    );
};

export default PostForm;
