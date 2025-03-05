import { z, type TypeOf } from 'zod';
import { PrismaClient } from '@prisma/client';
import xss from 'xss';

const prisma = new PrismaClient()

const CategorySchema = z.object({
    id: z.number(),
    name: z.string().min(3, 'Titill verður að hafa að minnsta kosti 3 stafi').max(1024, 'Mesta lagi 1024 stafir'),
    slug: z.string()
});

const CategoryToCreateSchema = z.object({
    name: z.string().min(3, 'Titill verður að hafa að minnsta kosti 3 stafi').max(1024, 'Mesta lagi 1024 stafir'),
});

type Category = z.infer<typeof CategorySchema>;
type CategoryToCreate = z.infer<typeof CategoryToCreateSchema>;


/**
 * 
 * @param limit Hámark gagna
 * @param offset 
 * @returns Sækir gögn /categories
 */
export async function getCategories(limit: number, offset: number): Promise<Array<Category>> {
    const categories = await prisma.categories.findMany();
    return categories
}

/**
 * 
 * @param slug Nafn flokks
 * @returns Skilar /:slug flokki
 */
export async function getCategorySlug(slug: string) {
    const category = await prisma.categories.findUnique({
        where: { slug }
    });
    return category;
}

/**
 * 
 * @param categoryToCreate Nafn flokks sem búa á til
 * @returns Býr til nýjan flokk í /categories
 */
export async function createCategory(categoryToCreate: CategoryToCreate): Promise<Category> {
    const sanitizedName = xss(categoryToCreate.name)

    const createdCategory = await prisma.categories.create({
        data: {
            name: sanitizedName,
            slug: sanitizedName.toLowerCase().replace(/\s+/g, '-'),
        }
    });

    return createdCategory;
}


export async function changeCategory(slug: string, name: string) {
    return await prisma.categories.update({
        where: { slug },
        data: {
            name: name,
            slug: name.toLowerCase().replace(/\s+/g, "-")
        },
    });
}


/**
 * 
 * @param slug Nafn flokks
 * @returns Eyðir flokki úr gagnagrunni
 */
export async function deleteCategory(slug: string): Promise<boolean> {


    const category = await prisma.categories.findFirst({
        where: { slug }
    });
    if (!category) {
        return false;
    }

    await prisma.categories.delete({
        where: { id: category.id }
    });

    return true
}

/**
 * 
 * @param categoryToValidate Nafn flokks sem þarf að staðfesta
 * @returns staðfesta að flokkur sé gildur
 */
export function validateCategory(categoryToValidate: unknown) {
    const result = CategoryToCreateSchema.safeParse(categoryToValidate);
    return result;
}