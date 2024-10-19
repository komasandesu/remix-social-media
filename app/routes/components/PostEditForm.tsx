// app/routes/components/PostEditForm.tsx
import { Form } from '@remix-run/react';
import { useState, useEffect } from 'react';

interface PostEditFormProps {
  postId: number;
  initialTitle: string;
  initialContent: string;
  redirectTo?: string;
}

const PostEditForm: React.FC<PostEditFormProps> = ({ postId, initialTitle, initialContent, redirectTo }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
  
    useEffect(() => {
      setTitle(initialTitle);
      setContent(initialContent);
    }, [initialTitle, initialContent]);
  
    return (
      <Form
        action={`/resources/edit`}  // ルートを "resources.edit" に変更
        method="post"
        className="mt-4"
      >
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="redirectTo" value={redirectTo || `/posts/${postId}`} />
        <input
          type="text"
          name="title"
          required
          className="w-full border rounded p-2"
          placeholder="タイトルを入力..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          name="content"
          rows={4}
          required
          className="w-full border rounded p-2 mt-2"
          placeholder="内容を入力..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition mt-2"
        >
          投稿を編集
        </button>
      </Form>
    );
  };
  
  export default PostEditForm;
