import { z, type TypeOf } from 'zod';
import { PrismaClient } from '@prisma/client';
import xss from 'xss';

const prisma = new PrismaClient()

export async function getAnswers() {
    return await prisma.answer.findMany({
        include: {
            question: true,
        },
    });
}

export async function getAnswersByCategory(slug: string) {
    const category = await prisma.categories.findUnique({
      where: { slug },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });
  
    if (!category) return [];
  
    const answers = category.questions.flatMap((question) =>
      question.answers.map((answer) => ({
        id: answer.id,
        text: answer.text,
        correct: answer.correct,
        questionId: question.id,
        questionText: question.text,
      }))
    );
  
    return answers;
  }
  
