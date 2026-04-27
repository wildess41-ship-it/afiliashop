import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 10000;

// ================== MONGODB ==================
mongoose.connect('mongodb+srv://admin:Santos123%21@cluster0.o8yfaf0.mongodb.net/afiliashop?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('🔥 MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// ================== MODELS ==================
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  link: { type: String, required: true },
  categoryId: String,
  origin: { type: String, default: 'Brasil' },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  origin: { type: String, default: 'Brasil' }
});

const Product = mongoose.model('Product', ProductSchema);
const Category = mongoose.model('Category', CategorySchema);

// ================== ROTAS ==================

// HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// LISTAR PRODUTOS
app.get('/api/products', async (req, res) => {
  try {
    const { category, origin } = req.query;

    let filter = { published: true };

    if (category && category !== 'all') filter.categoryId = category;
    if (origin && origin !== 'all') filter.origin = origin;

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// LISTAR CATEGORIAS
app.get('/api/categories', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// CRIAR CATEGORIA
app.post('/api/admin/categories', async (req, res) => {
  const { name, origin } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome obrigatório' });
  }

  const newCategory = await Category.create({
    name,
    origin: origin || 'Brasil'
  });

  res.json(newCategory);
});

// 🔥 CRIAR OU EDITAR (ANTI-DUPLICAÇÃO)
app.post('/api/admin/products', async (req, res) => {
  try {
    const { _id, title, description, image, link, categoryId, origin, published } = req.body;

    if (!title || !link) {
      return res.status(400).json({ error: 'Título e link obrigatórios' });
    }

    // 👉 EDITAR
    if (_id) {
      const exists = await Product.findById(_id);

      if (!exists) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const updated = await Product.findByIdAndUpdate(
        _id,
        {
          title,
          description,
          image,
          link,
          categoryId,
          origin,
          published
        },
        { new: true }
      );

      return res.json(updated);
    }

    // 👉 CRIAR
    const newProduct = await Product.create({
      title,
      description,
      image,
      link,
      categoryId: categoryId || null,
      origin: origin || 'Brasil',
      published: published ?? true
    });

    res.json(newProduct);

  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar produto' });
  }
});

// EDITAR VIA PUT
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Erro ao editar' });
  }
});

// 🔥 DELETE MELHORADO
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ success: true, deleted });

  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

// IMPORTAR LINKS
app.post('/api/admin/import-links', async (req, res) => {
  try {
    const { links } = req.body;
    const results = [];

    for (const link of links) {
      try {
        const url = new URL(link);
        const title = url.hostname.replace('www.', '').split('.')[0].toUpperCase();

        const product = await Product.create({
          title,
          description: `Confira este produto em ${url.hostname}`,
          image: `https://via.placeholder.com/300?text=${title}`,
          link,
          categoryId: null,
          origin: 'Brasil',
          published: true
        });

        results.push({ success: true, product });

      } catch {
        results.push({ success: false, link });
      }
    }

    res.json(results);

  } catch {
    res.status(500).json({ error: 'Erro ao importar links' });
  }
});

// START
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});