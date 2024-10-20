// app/models/post.server.ts
import { PrismaClient } from '@prisma/client';
import { Post } from '.prisma/client';


const prisma = new PrismaClient();

class PostRepository {
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

  async delete(params: { id: number, userId: string }) {
    // 1. 投稿を取得して作成者を確認
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });
    if (!post) {
      throw new Error('Post not found');
    }
    // 投稿の作成者と削除をリクエストしたユーザーが一致するか確認
    if (post.authorId !== params.userId) {
      throw new Error('You are not authorized to delete this post');
    }
    await prisma.post.deleteMany({
      where: { parentId: params.id },
    });
    await prisma.favorite.deleteMany({
      where: { PostId: params.id },
    });
    return prisma.post.delete({
      where: { id: params.id },
    });
  }
  
  async update(params: { id: number, title: string, content: string, userId: string }) {
    const { id, title, content, userId } = params;

    // 投稿者が現在のユーザーか確認
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new Error(`Post with id ${id} not found`);
    }

    if (post.authorId !== userId) {
      throw new Error('You are not authorized to edit this post');
    }

    // 投稿のタイトルと内容を更新
    return prisma.post.update({
      where: { id },
      data: { title, content },
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
        author: true,  // 投稿の著者情報を含めて取得
        replies: {
          include: {
            author: true, // リプライの著者情報を含めて取得
          },
        },
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

    // 親投稿がリプライでないことを確認（リプライの場合はparentIdが存在する）
    if (parentPost.parentId) {
      throw new Error('Replies to replies are not allowed');
    }


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