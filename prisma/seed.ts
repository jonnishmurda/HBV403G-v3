import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Chat aðstoð við að setja inn spurningarnar í gagnagrunninn!
 */
async function seedDatabase() {
    try {
        const jsData = JSON.parse(fs.readFileSync('data/js.json', 'utf-8'));
        const htmlData = JSON.parse(fs.readFileSync('data/html.json', 'utf-8'));
        const cssData = JSON.parse(fs.readFileSync('data/css.json', 'utf-8'));

        await insertQuestions(jsData);
        await insertQuestions(htmlData);
        await insertQuestions(cssData);
    } catch (error) {
        console.error("error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function insertQuestions(data: { title: string; questions: any[] }) {
    const category = await prisma.categories.findUnique({
        where: { name: data.title },
    });

    if (!category) {
        console.error(`Category "${data.title}" not found. Skipping.`);
        return;
    }

    for (const question of data.questions) {
        if (!question.question || !question.answers) {
            continue;
        }

        const createdQuestion = await prisma.question.create({
            data: {
                text: question.question,
                categoryId: category.id,
            },
        });

        for (const answer of question.answers) {
            if (!answer.answer || typeof answer.correct !== "boolean") {
                console.warn(`⚠️ Skipping invalid answer:`, answer);
                continue;
            }

            await prisma.answer.create({
                data: {
                    text: answer.answer,
                    correct: answer.correct,
                    questionId: createdQuestion.id,
                },
            });
        }
    }
}

seedDatabase();
