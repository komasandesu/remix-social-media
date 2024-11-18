// app/services/auth.server.ts
import { redirect } from '@remix-run/node';
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { PrismaClient } from "@prisma/client"; // Prisma クライアントを使ってログインする
import { User } from ".prisma/client";


import { FormStrategy } from "remix-auth-form"; // フォーム戦略のインポート

const prisma = new PrismaClient(); // Prisma クライアントのインスタンスを作成

import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function login(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
}

// 新しいパスワードを設定する関数を追加
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

// Authenticator インスタンスの作成、ジェネリックには User 型を指定
export let authenticator = new Authenticator<User>(sessionStorage);

// FormStrategy を使って、フォーム認証をセットアップ
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email") as string;
    let password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    let user = await login(email, password);
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    return user;
  }),
  "user-pass" // ストラテジーの名前を指定
);

// 共通認証処理の関数を追加
export async function requireAuthenticatedUser(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect('/login');
  }
  return user;
}

// ユーザーがログインしていない場合に null を返す関数を追加
export async function getAuthenticatedUserOrNull(request: Request): Promise<User | null> {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return null; // ユーザーが認証されていない場合は null を返す
  }
  return user;
}