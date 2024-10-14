// app/routes/register.tsx
import { Form, redirect, useActionData } from "@remix-run/react";
import { prisma } from "~/models/db.server"; // Prismaの設定をインポートする
import bcrypt from "bcrypt";
import type { ActionFunctionArgs } from "@remix-run/node"; // 型をインポート

interface ActionData {
    error?: string;
}


// 新規登録のアクション関数を追加
export async function action({ request }: ActionFunctionArgs) {
    const formData = new URLSearchParams(await request.text());
    const name = formData.get("name"); // name フィールドを取得
    const email = formData.get("email");
    const password = formData.get("password");

    // null チェックを追加
    if (!name || !email || !password) {
        return { error: "名前、メールアドレス、パスワードは必須です。" };
    }

    // ユーザーが既に存在するか確認
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { error: "このメールアドレスは既に登録されています。" };
    }

    // 名前の重複を確認
    const existingUserByName = await prisma.user.findUnique({ where: { name } });
    if (existingUserByName) {
        return { error: "この名前は既に使用されています。" }; // 名前の重複エラーを返す
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザーを作成
    await prisma.user.create({
        data: {
        name, // name を追加
        email,
        password: hashedPassword,
        },
    });

    return redirect("/login"); // 登録後にログインページへリダイレクト
}


export default function Register() {
    const actionData = useActionData<ActionData>(); // actionData を取得
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="container mx-auto p-6 max-w-lg bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-4 text-center ">新規登録</h1>
                {actionData?.error && <p className="text-red-500 mb-4 text-center">{actionData.error}</p>} {/* エラーメッセージを表示 */}
                
                <Form method="post" action="/register" className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="名前"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="メールアドレス"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        name="password"
                        required
                        placeholder="パスワード"
                        autoComplete="new-password"
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                    >
                        登録する
                    </button>
                </Form>
            </div>
        </div>
    );
}
