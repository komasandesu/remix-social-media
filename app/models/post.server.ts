import { PrismaClient } from '@prisma/client';
import { Post } from '.prisma/client';
// import { Post, PrismaClient } from '../../node_modules/.prisma/client';


const prisma = new PrismaClient();

class PostRepository {
  async create(params: { title: string; content: string; authorId: string }) {
    const { title, content, authorId } = params;
    if (!title || !content) throw new Error('Title and content are required');
    return prisma.post.create({
      data: {
        title,
        content,
        authorId, // authorIdをdataに追加
      },
    });
  }

  async find(params: { id: number }) {
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      throw new Error(`Post with id ${params.id} not found`);
    }
    return post;
  }

  async findAll(): Promise<Post[]> {
    return prisma.post.findMany();
  }

  async delete(params: { id: number }) {
    return prisma.post.delete({
      where: { id: params.id },
    });
  }

  // 投稿とその著者情報を取得するメソッドを追加
  async findWithAuthor(params: { id: number }) {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: true, // authorリレーションを含めて取得
      },
    });

    if (!post) {
      throw new Error(`Post with id ${params.id} not found`);
    }
    return post;
  }

  async findAllWithFavorites(userId?: string) {
    const substringPosts = await prisma.post.findMany({
      include: {
        Favorite: {
          where: {
            userId: userId,
          },
        },
      },
    });

    return substringPosts.map(post => ({
      ...post,
      isFavorite: post.Favorite.length > 0,
    }));
  }
}

const postRepository = new PostRepository();
export { postRepository };