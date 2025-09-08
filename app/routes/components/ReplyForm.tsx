// app/routes/components/ReplyForm.tsx
import { Form } from '@remix-run/react';
import { useState } from 'react';

interface ReplyFormProps {
  postId: number;
  redirectTo?: string;
  onClose?: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ postId, redirectTo, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // フォームが送信された後にタイトルとコンテンツを空にする
    setTitle('');
    setContent('');
    if (onClose) {
      onClose();
    }
  };

  return (
    <Form
      action={`/resources/replies`} // ルートからの相対パスで正しい
      method="post"
      className="mt-4"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        name="title"
        required
        className="w-full border dark:border-gray-300 dark:text-gray-300 rounded p-2"
        placeholder="タイトルを入力..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        name="content"
        rows={4}
        required
        className="w-full border dark:border-gray-300 dark:text-gray-300 rounded p-2 mt-2"
        placeholder="リプライを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="redirectTo" value={redirectTo || `/posts/${postId}`} />
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-2 dark:text-gray-300"
      >
        リプライを送信
      </button>
    </Form>
  );
};

export default ReplyForm;
