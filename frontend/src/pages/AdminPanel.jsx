import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');

  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    categoryId: '',
    origin: 'Brasil',
    published: true
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      axios.get('/api/products?published=all'),
      axios.get('/api/categories')
    ]);
    setProducts(productsRes.data);
    setCategories(categoriesRes.data);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.title || !productForm.link) {
      return showMessage('Preencha título e link');
    }

    try {
      if (editingId) {
        await axios.put(`/api/admin/products/${editingId}`, productForm);
        showMessage('Produto atualizado');
      } else {
        await axios.post('/api/admin/products', productForm);
        showMessage('Produto criado');
      }

      setProductForm({
        title: '',
        description: '',
        image: '',
        link: '',
        categoryId: '',
        origin: 'Brasil',
        published: true
      });

      setEditingId(null);
      loadData();

    } catch {
      showMessage('Erro ao salvar');
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm('Deletar produto?')) return;

    await axios.delete(`/api/admin/products/${_id}`);
    showMessage('Deletado');
    loadData();
  };

  const handleEdit = (p) => {
    setProductForm(p);
    setEditingId(p._id); // 🔥 CORREÇÃO AQUI
  };

  return (
    <div className="container">
      <h2>Painel Admin</h2>

      {message && <div className="success">{message}</div>}

      <form onSubmit={handleSubmit} className="admin-panel">
        <input
          placeholder="Título"
          value={productForm.title}
          onChange={e => setProductForm({ ...productForm, title: e.target.value })}
        />

        <textarea
          placeholder="Descrição"
          value={productForm.description}
          onChange={e => setProductForm({ ...productForm, description: e.target.value })}
        />

        <input
          placeholder="Imagem URL"
          value={productForm.image}
          onChange={e => setProductForm({ ...productForm, image: e.target.value })}
        />

        <input
          placeholder="Link"
          value={productForm.link}
          onChange={e => setProductForm({ ...productForm, link: e.target.value })}
        />

        <select
          value={productForm.categoryId}
          onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
        >
          <option value="">Categoria</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <button type="submit">
          {editingId ? 'Atualizar' : 'Adicionar'}
        </button>
      </form>

      <div className="products-grid">
        {products.map(p => (
          <div key={p._id} className="product-card">
            <h3>{p.title}</h3>

            <button onClick={() => handleEdit(p)}>Editar</button>

            <button onClick={() => handleDelete(p._id)}>
              Excluir
            </button>
          </div>
        ))}
      </div>

      <button onClick={onLogout}>Sair</button>
    </div>
  );
}