import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCategories } from './categories.db.js'

const app = new Hono()

app.get('/', (c) => {

  const data = {
    "hello": "hono"
  }
  return c.json(data)
})

app.get('/categories', (c) => {
  const limit = Number(c.req.query('limit')) || 10;
  const offset = Number(c.req.query('offset')) || 0;

  const categories = getCategories(limit, offset);
  return c.json(categories)
})

app.get('/categories/:slug', (c) => {
  return c.json([]);
})



serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
