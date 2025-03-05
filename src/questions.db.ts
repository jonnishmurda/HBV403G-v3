import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();


export const QuestionSchema = z.object({
    text: z.string().min(5, "Spurning verður að hafa að minnsta kosti 5 stafi").max(1024, "Spurning má hafa að mesta lagi 1024 stafir"),
    categorySlug: z.string()
})


/**
 * 
 * @returns Sækir spurningum
 */
export async function getQuestions() {
    return await prisma.question.findMany({
        include: {
            category: true,
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
        include: { questions: true },
    });

    if (!category) return [];

    return category.questions;
}

/**
 * 
 * @param categorySlug Flokkur
 * @param text Spurning fyrir flokkinn
 * @returns Bætir við spurningu í viðeigandi flokk
 */
export async function createQuestion(categorySlug: string, text: string) {
    const category = await prisma.categories.findUnique({
        where: { slug: categorySlug },
    });

    if (!category) return null;

    return await prisma.question.create({
        data: {
            text,
            categoryId: category.id,
        },
    });
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