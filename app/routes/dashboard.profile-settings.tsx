// app/routes/dashboard.profile-settings.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { requireAuthenticatedUser } from "~/services/auth.server";
import { prisma } from "../models/db.server";
import bcrypt from 'bcrypt';
import { Form, useActionData } from '@remix-run/react';
import { commitSession } from "~/services/session.server";

interface ActionData {
  success?: string;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  // user と一緒に session を受け取る
  const { user, session } = await requireAuthenticatedUser(request);

  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!userData) {
    return { error: "ユーザー情報が見つかりません。" };
  }

  // パスワードが変更されている場合は、現在のパスワードを確認
  if (newPassword && !currentPassword) {
    return { error: "現在のパスワードを入力してください。" };
  }

  if (newPassword && !await bcrypt.compare(currentPassword, userData.password)) {
    return { error: "現在のパスワードが正しくありません。" };
  }

  // 更新データの準備
  const updateData: Record<string, any> = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
  
  // 何も変更がない場合は、エラーを返す
  if (Object.keys(updateData).length === 0) {
    return { error: "変更する項目がありません。" };
  }

  // 同じ名前やメールアドレスがすでに存在するかチェック
  if (name || email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(name ? [{ name }] : []),
          ...(email ? [{ email }] : []),
        ],
        NOT: { id: user.id }, // 自分自身のIDは除外
      },
    });
    // ユーザー名が指定されている場合の重複チェック
    if (name) {
      const alphaNumericRegex = /^[a-zA-Z0-9_]+$/; // アンダーバーも許可
      if (!alphaNumericRegex.test(name)) {
        return { error: "ユーザー名はアルファベット、数字、アンダーバーのみ使用できます。" };
      }
      if (existingUser && existingUser.name === name) {
        return { error: "この名前は既に登録されています。" };
      }
    }

    // メールアドレスの重複チェック
    if (email && existingUser && existingUser.email === email) {
      return { error: "このメールアドレスは既に登録されています。" };
    }
  }

  // ユーザー情報の更新
  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // プロフィール更新後にリダイレクト
  const updatedUser = {
    ...user,
    name: updateData.name || userData.name,
    email: updateData.email || userData.email,
  };

  // セッションを更新
  session.set("user", updatedUser);

  return redirect(`/profile/${updatedUser.name}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Profile() {
  const actionData = useActionData<ActionData>(); // アクションの結果を取得

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      {actionData?.error && (
        <p className="text-red-500">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500">{actionData.success}</p>
      )}
      <Form method="post" className="mt-6">
        <input
          type="text"
          name="name"
          placeholder="名前"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <input
          type="password"
          name="currentPassword"
          placeholder="現在のパスワード"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <input
          type="password"
          name="newPassword"
          placeholder="新しいパスワード（変更する場合）"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          プロフィールを更新する
        </button>
      </Form>
    </div>
  );
}