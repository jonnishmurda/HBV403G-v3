import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import xss from 'xss';

const prisma = new PrismaClient();


export const QuestionSchema = z.object({
    text: z.string().min(5, "Spurning verður að hafa að minnsta kosti 5 stafi").max(1024, "Spurning má hafa að mesta lagi 1024 stafir"),
    categorySlug: z.string().optional()
});



/**
 * 
 * @returns Sækir spurningum
 */
export async function getQuestions() {
    return await prisma.question.findMany({
        include: {
            category: true,
            answers: true,
        },
    });
}

/**
 * 
 * @param slug Flokkur
 * @returns Sækir spurningar frá flokki
 */
export async function getQuestionsByCategory(slug: string) {
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

    return category.questions.map((question) => ({
        id: question.id,
        text: question.text,
        answers: question.answers.map((answer) => ({
            id: answer.id,
            text: answer.text,
            correct: answer.correct,
        })),
    }));
}


/**
 * 
 * @param categorySlug Flokkur
 * @param text Spurning fyrir flokkinn
 * @returns Bætir við spurningu í viðeigandi flokk
 */
export async function createQuestion(categorySlug: string, text: string) {
    console.log("🔎 Looking for category:", categorySlug);

    const category = await prisma.categories.findUnique({
        where: { slug: categorySlug },
    });

    if (!category) {
        console.error("❌ Category not found:", categorySlug);
        return null;
    }

    console.log("✅ Category found:", category.id, category.name);

    const sanitizedText = xss(text);

    const newQuestion = await prisma.question.create({
        data: {
            text: sanitizedText,
            categoryId: category.id,
        },
    });

    console.log("✅ New Question Created:", newQuestion);
    return newQuestion;
}


/**
 * 
 * @param id 
 * @returns Eyða spurningu
 */
export async function deleteQuestion(id: number) {
    const question = await prisma.question.findUnique({
        where: { id },
    });

    if (!question) return false;

    await prisma.question.delete({
        where: { id },
    });
    return true;
}

export function validateQuestion(questionToValidate: unknown) {
    return QuestionSchema.safeParse(questionToValidate);
}