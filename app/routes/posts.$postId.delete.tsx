// app/routes/posts.$postId.delete.tsx

import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { postRepository } from '~/models/post.server';

export const action = async ({ params }: ActionFunctionArgs) => {
  if (!params.postId) {
    throw new Response("Not Found", { status: 404 });
  }

  const postId = parseInt(params.postId, 10);
  if (isNaN(postId)) {
    throw new Response("Invalid Post ID", { status: 400 });
  }

  try {
    await postRepository.delete({ id: postId });
    return redirect('/posts');
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Response("Error deleting post", { status: 500 });
  }
};