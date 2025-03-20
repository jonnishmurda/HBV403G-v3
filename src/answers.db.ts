import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import xss from 'xss';

const prisma = new PrismaClient()

const AnswerSchema = z.object({
  text: z.string().min(1, "Svar verður að innihalda texta").max(1024, "Svar má hafa að mesta lagi 1024 stafi"),
  correct: z.boolean(),
});

export function validateAnswer(answerToValidate: unknown) {
  return AnswerSchema.safeParse(answerToValidate);
}


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

/**
 * @param questionId ID spurningarinnar
 * @param text Texti svarsins
 * @param correct Hvort þetta sé rétt svar
 * @returns Býr til svar
 */
export async function createAnswer(questionId: number, text: string, correct: boolean) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) return null;

  const sanitizedText = xss(text);

  return await prisma.answer.create({
    data: {
      text: sanitizedText,
      correct,
      questionId: question.id,
    },
  });
}

