import { PrismaClient } from '@prisma/client';
import { SubstringPost } from '.prisma/client';
// import { SubstringPost, PrismaClient } from '../../node_modules/.prisma/client';


const prisma = new PrismaClient();

class SubstringPostRepository {
  async create(params: { mainSubject: string; specificPart: string; authorId: string }) {
    const { mainSubject, specificPart, authorId } = params;
    if (!mainSubject || !specificPart) throw new Error('Title and content are required');
    return prisma.substringPost.create({
      data: {
        mainSubject,
        specificPart,
        authorId, // authorIdをdataに追加
      },
    });
  }

  async find(params: { id: number }) {
    const SubstringPost = await prisma.substringPost.findUnique({ where: { id: params.id } });
    if (!SubstringPost) {
      throw new Error(`SubstringPost with id ${params.id} not found`);
    }
    return SubstringPost;
  }

  async findAll(): Promise<SubstringPost[]> {
    return prisma.substringPost.findMany();
  }

  async delete(params: { id: number }) {
    return prisma.substringPost.delete({
      where: { id: params.id },
    });
  }

  // 投稿とその著者情報を取得するメソッドを追加
  async findWithAuthor(params: { id: number }) {
    const substringPost = await prisma.substringPost.findUnique({
      where: { id: params.id },
      include: {
        author: true, // authorリレーションを含めて取得
      },
    });

    if (!substringPost) {
      throw new Error(`SubstringPost with id ${params.id} not found`);
    }
    return substringPost;
  }
}

const substringPostRepository = new SubstringPostRepository();
export { substringPostRepository };