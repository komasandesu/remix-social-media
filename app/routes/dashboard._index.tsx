// app/routes/dashboard.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { prisma } from "../models/db.server"; // Prismaのインポート
import { Form, Link, useLoaderData, useActionData  } from '@remix-run/react';

interface ActionData {
  success?: string;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  return userData;
}

export default function Dashboard() {
  const user = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();


  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
        {user ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              {user.name}さん、ようこそ！
            </h2>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">作成日: {user.createdAt}</p>

            {/* パスワード変更用画面へのリンク */}
            <Link to="/dashboard/profile-settings" className="text-blue-600 hover:underline">
              プロフィールを編集する
            </Link>

          </div>
        ) : (
          <p className="text-red-500">ユーザー情報が見つかりません。</p>
        )}
        
        {/* ログアウトボタン */}
        <Form action="/logout" method="post" className="mt-6">
          <button
            type="submit"
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        </Form>
      </div>
    </div>
  );
}
