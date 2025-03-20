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
