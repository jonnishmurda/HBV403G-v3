import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function seedDatabase() {
    try {
        const jsData = JSON.parse(fs.readFileSync('prisma/js.json', 'utf-8'));
        const htmlData = JSON.parse(fs.readFileSync('prisma/html.json', 'utf-8'));
        const cssData = JSON.parse(fs.readFileSync('prisma/css.json', 'utf-8'));

        await insertQuestions(jsData);
        await insertQuestions(htmlData);
        await insertQuestions(cssData);

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function insertQuestions(data: { title: string; questions: any[] }) {
    const category = await prisma.categories.findUnique({
        where: { name: data.title },
    });

    if (!category) {
        console.error(`❌ Category "${data.title}" not found. Skipping.`);
        return;
    }

    for (const question of data.questions) {
        if (!question.question || !question.answers) {
            console.warn(`⚠️ Skipping invalid question:`, question);
            continue;
        }

        const createdQuestion = await prisma.Question.create({
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

            await prisma.Answer.create({
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
