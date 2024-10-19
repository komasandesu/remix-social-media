// app/models/post.server.ts
import { PrismaClient } from '@prisma/client';
import { Post } from '.prisma/client';


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

  async findAllWithoutReplies() {
    const Posts = await prisma.post.findMany({
      where: {
        parentId: null, // 返信ではない投稿のみを取得
      },
    });
  
    return Posts;
  }
  

  async findPostWithAuthorAndReplies(postId: number) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,  // authorリレーションを含めて取得
        replies: true,  // repliesリレーションを含めて取得
      },
    });

    if (!post) {
      throw new Error(`Post with id ${postId} not found`);
    }
    return post;
  }
  

  // リプライの作成
  async createReply(params: { title: string; content: string; authorId: string; parentId: number }) {
    const { title, content, authorId, parentId } = params;
    
    if (!title || !content) throw new Error('Title and content are required');
    
    // 親投稿の存在確認
    const parentPost = await prisma.post.findUnique({
      where: { id: parentId },
    });

    if (!parentPost) throw new Error('Parent post does not exist');

    return prisma.post.create({
      data: {
        title,
        content,
        authorId,
        parentId, // 親投稿のIDを設定
      },
    });
  }

}

const postRepository = new PostRepository();
export { postRepository };