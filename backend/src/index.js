import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// ================== CONFIG ==================
const app = express();
const PORT = process.env.PORT || 10000;

// 🔥 SUA CONEXÃO MONGODB (já corrigida)
mongoose.connect('mongodb+srv://admin:Santos123%21@cluster0.o8yfaf0.mongodb.net/afiliashop?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('🔥 MongoDB conectado'))
  .catch(err => console.error('❌ Erro MongoDB:', err));

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// ================== MODELS ==================
const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
  categoryId: String,
  origin: String,
  published: Boolean,
  createdAt: String
});

const CategorySchema = new mongoose.Schema({
  name: String,
  origin: String
});

const Product = mongoose.model('Product', ProductSchema);
const Category = mongoose.model('Category', CategorySchema);

// ================== ROTAS ==================

// 🔹 HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 🔹 LISTAR PRODUTOS
app.get('/api/products', async (req, res) => {
  try {
    const { category, origin } = req.query;

    let filter = { published: true };

    if (category && category !== 'all') {
      filter.categoryId = category;
    }

    if (origin && origin !== 'all') {
      filter.origin = origin;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// 🔹 LISTAR CATEGORIAS
app.get('/api/categories', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// 🔹 CRIAR CATEGORIA
app.post('/api/admin/categories', async (req, res) => {
  const { name, origin } = req.body;

  const newCategory = await Category.create({ name, origin });

  res.json(newCategory);
});

// 🔹 CRIAR PRODUTO
app.post('/api/admin/products', async (req, res) => {
  try {
    const { title, description, image, link, categoryId, origin, published } = req.body;

    const newProduct = await Product.create({
      title,
      description,
      image,
      link,
      categoryId,
      origin,
      published: published || false,
      createdAt: new Date().toISOString()
    });

    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// 🔹 EDITAR PRODUTO
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

// 🔹 DELETAR PRODUTO
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

// 🔹 IMPORTAR LINKS
app.post('/api/admin/import-links', async (req, res) => {
  try {
    const { links } = req.body;

    const results = [];

    for (const link of links) {
      try {
        const url = new URL(link);
        const title = url.hostname.split('.')[0].toUpperCase();

        const product = await Product.create({
          title,
          description: `Produto de ${url.hostname}`,
          image: `https://via.placeholder.com/300?text=${title}`,
          link,
          categoryId: null,
          origin: 'Brasil',
          published: false,
          createdAt: new Date().toISOString()
        });

        results.push({ success: true, product });

      } catch {
        results.push({ success: false, link });
      }
    }

    res.json(results);

  } catch {
    res.status(500).json({ error: 'Erro ao importar' });
  }
});

// ================== START ==================
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});