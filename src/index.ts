import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCategories, getCategorySlug, createCategory, changeCategory, deleteCategory, validateCategory } from './categories.db.js';
import { getQuestions, getQuestionsByCategory, deleteQuestion, createQuestion, validateQuestion } from './questions.db.js';

const app = new Hono();

app.get('/', (c) => {

  const data = {
    "hello": "Verkefni 3"
  }
  return c.json(data)
});

app.get('/categories', async (c) => {
  const limit = Number(c.req.query('limit')) || 10;
  const offset = Number(c.req.query('offset')) || 0;

  const categories = await getCategories(limit, offset);
  return c.json(categories)
});

app.get('/categories/:slug', async (c) => {
  const { slug } = c.req.param();
  const category = await getCategorySlug(slug);
  if (!category) {
    return c.json({ error: "Flokkur ekki fundinn" }, 404);
  }
  return c.json(category);
});


app.post('/category', async (c) => {
  let categoryToCreate: unknown;
  try {
    categoryToCreate = await c.req.json();
    console.log(categoryToCreate);
  } catch (e) {
    return c.json({ error: 'invalid json' }, 400)
  }

  const validCategory = validateCategory(categoryToCreate)

  if (!validCategory.success) {
    return c.json({ error: 'invalid data', errors: validCategory.error.flatten() }, 400)
  }

  const createdCategory = await createCategory(validCategory.data)

  return c.json(createdCategory, 201)
})


app.patch('/category/:slug', async (c) => {
  const { slug } = c.req.param();
  const body = await c.req.json();

  if (!body.name) {
    return c.json({ error: "Nafn flokks vantar" }, 400);
  }
  const updateCategory = changeCategory(slug, body.name);
  if (!updateCategory) {
    return c.json({ error: "Flokkur ekki fundinn" }, 404)
  }

  return c.json(updateCategory, 200)
});



app.delete('/category/:slug', async (c) => {
  const { slug } = c.req.param();
  const success = await deleteCategory(slug);

  if (!success) {
    return c.json({ error: "Flokkur ekki fundinn" }, 404)
  }

  return c.body(null, 204)
});

app.get('/questions', async (c) => {
  const questions = await getQuestions();
  return c.json(questions);
})


app.get('/categories/:slug/questions', async (c) => {
  const { slug } = c.req.param();
  const questions = await getQuestionsByCategory(slug);

  if (questions.length === 0) {
    return c.json({ error: "Engar spurningar fundust fyrir þennan flokk" }, 404);
  }

  return c.json(questions)
})

app.post('/categories/:slug/question', async (c) => {
  try {
    const { slug } = c.req.param();
    const body = await c.req.json();

    const validation = validateQuestion({ ...body, categorySlug: slug });

    if (!validation.success) {
      return c.json({ error: "Ógild gögn", errors: validation.error.flatten() }, 400);
    }


    const newQuestion = await createQuestion(slug, validation.data.text);

    if (!newQuestion) {
      return c.json({ error: "Flokkur fannst ekki" }, 404);
    }

    return c.json(newQuestion, 201);
  } catch (e) {
    console.error("Villa kom upp:", e);
    return c.json({ error: "Villa í gagnagrunni" }, 500);
  }
})



serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
});
