import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, '../../data/products.json');
const ADMIN_PASSWORD = 'S@nt0s970321';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Garantir que pasta data existe
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar dados
function initializeData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      categories: [
        { id: '1', name: 'Eletrônicos', origin: 'Brasil' },
        { id: '2', name: 'Beleza', origin: 'Brasil' },
        { id: '3', name: 'Moda', origin: 'Internacional' }
      ],
      products: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { categories: [], products: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Autenticação simples
function verifyPassword(password) {
  return password === ADMIN_PASSWORD;
}

// ===== ROTAS =====

// GET: Listar produtos públicos
app.get('/api/products', (req, res) => {
  const data = readData();
  const { category, origin } = req.query;
  
  let products = data.products.filter(p => p.published);
  
  if (category && category !== 'all') {
    products = products.filter(p => p.categoryId === category);
  }
  
  if (origin && origin !== 'all') {
    products = products.filter(p => p.origin === origin);
  }
  
  res.json(products);
});

// GET: Listar categorias
app.get('/api/categories', (req, res) => {
  const data = readData();
  res.json(data.categories);
});

// POST: Admin - Criar categoria
app.post('/api/admin/categories', (req, res) => {
  const { password, name, origin } = req.body;
  
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Senha inválida' });
  }
  
  const data = readData();
  const newCategory = {
    id: Date.now().toString(),
    name,
    origin
  };
  
  data.categories.push(newCategory);
  writeData(data);
  
  res.json(newCategory);
});

// POST: Admin - Adicionar produto
app.post('/api/admin/products', (req, res) => {
  const { password, title, description, image, link, categoryId, origin, published } = req.body;
  
 // if (!verifyPassword(password)) {
 //   return res.status(401).json({ error: 'Senha inválida' });
 // }
  
  const data = readData();
  const newProduct = {
    id: Date.now().toString(),
    title,
    description,
    image,
    link,
    categoryId,
    origin,
    published: published || false,
    createdAt: new Date().toISOString()
  };
  
  data.products.push(newProduct);
  writeData(data);
  
  res.json(newProduct);
});

// PUT: Admin - Editar produto
app.put('/api/admin/products/:id', (req, res) => {
  const { password, title, description, image, link, categoryId, origin, published } = req.body;
  
 // if (!verifyPassword(password)) {
  //  return res.status(401).json({ error: 'Senha inválida' });
 // }
  
  const data = readData();
  const productIndex = data.products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  
  data.products[productIndex] = {
    ...data.products[productIndex],
    title,
    description,
    image,
    link,
    categoryId,
    origin,
    published
  };
  
  writeData(data);
  res.json(data.products[productIndex]);
});

// DELETE: Admin - Deletar produto
app.delete('/api/admin/products/:id', (req, res) => {
  const { password } = req.body;
  
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Senha inválida' });
  }
  
  const data = readData();
  data.products = data.products.filter(p => p.id !== req.params.id);
  writeData(data);
  
  res.json({ success: true });
});

// POST: Admin - Importar links
app.post('/api/admin/import-links', (req, res) => {
  const { password, links } = req.body;
  
  if (!verifyPassword(password)) {
    return res.status(401).json({ error: 'Senha inválida' });
  }
  
  const data = readData();
  const results = [];
  
  links.forEach(link => {
    try {
      const url = new URL(link);
      const title = url.hostname.split('.')[0].toUpperCase();
      
      const product = {
        id: Date.now().toString() + Math.random(),
        title,
        description: `Produto de ${url.hostname}`,
        image: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(title),
        link,
        categoryId: data.categories[0]?.id || '1',
        origin: 'Brasil',
        published: false,
        createdAt: new Date().toISOString()
      };
      
      data.products.push(product);
      results.push({ success: true, product });
    } catch (e) {
      results.push({ success: false, link, error: 'Link inválido' });
    }
  });
  
  writeData(data);
  res.json(results);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Inicializar e rodar
initializeData();

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
