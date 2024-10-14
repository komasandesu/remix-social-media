import { SubstringPost } from '.prisma/client';

import { json, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { substringPostRepository } from '../models/substring_post.server';

export const loader = async () => {
  const substringPosts = await substringPostRepository.findAll();

  return json(substringPosts);
};

type SubstringPostType = SerializeFrom<SubstringPost>;

export default function SubstringPostIndex() {
  const substringPosts: SubstringPostType[] = useLoaderData();
  
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <Link to='/' className="text-blue-500 hover:underline">
          ホーム
        </Link>
        <h1 className="text-2xl font-bold mt-4">ポスト</h1>
      </header>

      <Link 
        to='new' 
        className="inline-block mb-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
      >
        ポストを作成する
      </Link>

      <ul className="space-y-2">
        {substringPosts.map((substringPost: SubstringPostType) => (
          <li key={substringPost.id}>
            <Link 
              to={`/substring_posts/${substringPost.id}`} 
              className="block text-lg text-blue-500 hover:underline"
            >
              {substringPost.mainSubject}の{substringPost.specificPart}の部分
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}