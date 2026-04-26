import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ onLogout, password }) {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Form states
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    categoryId: '',
    origin: 'Brasil',
    published: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    origin: 'Brasil'
  });

  const [importLinks, setImportLinks] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products?published=all'),
        axios.get('/api/categories')
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      showMessage('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.link || !productForm.categoryId) {
      showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      const payload = { ...productForm, password };
      if (editingId) {
        await axios.put(`/api/admin/products/${editingId}`, payload);
        showMessage('Produto atualizado com sucesso');
      } else {
        await axios.post('/api/admin/products', payload);
        showMessage('Produto adicionado com sucesso');
      }
      setProductForm({
        title: '',
        description: '',
        image: '',
        link: '',
        categoryId: '',
        origin: 'Brasil',
        published: false
      });
      setEditingId(null);
      loadData();
    } catch (error) {
      showMessage('Erro ao salvar produto', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      showMessage('Digite o nome da categoria', 'error');
      return;
    }

    try {
      await axios.post('/api/admin/categories', { ...categoryForm, password });
      showMessage('Categoria adicionada com sucesso');
      setCategoryForm({ name: '', origin: 'Brasil' });
      loadData();
    } catch (error) {
      showMessage('Erro ao adicionar categoria', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await axios.delete(`/api/admin/products/${id}`, { data: { password } });
      showMessage('Produto deletado com sucesso');
      loadData();
    } catch (error) {
      showMessage('Erro ao deletar produto', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setProductForm(product);
    setEditingId(product.id);
    setActiveTab('products');
  };

  const handleImportLinks = async (e) => {
    e.preventDefault();
    const links = importLinks.split('\n').filter(l => l.trim());
    
    if (links.length === 0) {
      showMessage('Cole pelo menos um link', 'error');
      return;
    }

    try {
      const response = await axios.post('/api/admin/import-links', { links, password });
      const successful = response.data.filter(r => r.success).length;
      showMessage(`${successful} de ${links.length} links importados com sucesso`);
      setImportLinks('');
      loadData();
    } catch (error) {
      showMessage('Erro ao importar links', 'error');
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Sem categoria';
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '30px', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Painel Administrativo</h2>
          <button className="btn-primary" style={{ background: '#dc3545' }} onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      {message && (
        <div className={messageType === 'error' ? 'error' : 'success'}>
          {message}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
        <button
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categorias
        </button>
        <button
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Importar Links
        </button>
      </div>

      {/* TAB: PRODUTOS */}
      {activeTab === 'products' && (
        <div>
          <div className="admin-panel">
            <h3>{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Descrição do produto"
                />
              </div>
              <div className="form-group">
                <label>URL da Imagem</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="form-group">
                <label>Link de Afiliado *</label>
                <input
                  type="url"
                  value={productForm.link}
                  onChange={(e) => setProductForm({ ...productForm, link: e.target.value })}
                  placeholder="https://seu-link-afiliado.com"
                />
              </div>
              <div className="form-group">
                <label>Categoria *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Origem</label>
                <select
                  value={productForm.origin}
                  onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                >
                  <option value="Brasil">Brasil</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={productForm.published}
                  onChange={(e) => setProductForm({ ...productForm, published: e.target.checked })}
                  id="published"
                />
                <label htmlFor="published" style={{ margin: 0 }}>Publicado</label>
              </div>
              <button type="submit" className="btn-primary">
                {editingId ? 'Atualizar' : 'Adicionar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: '#6c757d', marginTop: '10px' }}
                  onClick={() => {
                    setEditingId(null);
                    setProductForm({
                      title: '',
                      description: '',
                      image: '',
                      link: '',
                      categoryId: '',
                      origin: 'Brasil',
                      published: false
                    });
                  }}
                >
                  Cancelar
                </button>
              )}
            </form>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3>Produtos ({products.length})</h3>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhum produto adicionado</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Categoria</th>
                    <th>Origem</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>{getCategoryName(product.categoryId)}</td>
                      <td>{product.origin}</td>
                      <td>{product.published ? '✅ Publicado' : '⏸️ Rascunho'}</td>
                      <td>
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', marginRight: '5px' }}
                          onClick={() => handleEditProduct(product)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: CATEGORIAS */}
      {activeTab === 'categories' && (
        <div>
          <div className="admin-panel">
            <h3>Nova Categoria</h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Nome da Categoria</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Eletrônicos"
                />
              </div>
              <div className="form-group">
                <label>Origem</label>
                <select
                  value={categoryForm.origin}
                  onChange={(e) => setCategoryForm({ ...categoryForm, origin: e.target.value })}
                >
                  <option value="Brasil">Brasil</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">
                Adicionar Categoria
              </button>
            </form>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3>Categorias ({categories.length})</h3>
            {categories.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhuma categoria</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>{cat.origin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: IMPORTAR LINKS */}
      {activeTab === 'import' && (
        <div className="admin-panel">
          <h3>Importar Links de Afiliados</h3>
          <form onSubmit={handleImportLinks}>
            <div className="form-group">
              <label>Cole os links (um por linha):</label>
              <textarea
                value={importLinks}
                onChange={(e) => setImportLinks(e.target.value)}
                placeholder="https://link1.com&#10;https://link2.com&#10;https://link3.com"
                style={{ minHeight: '150px' }}
              />
            </div>
            <button type="submit" className="btn-primary">
              Importar Links
            </button>
          </form>
          <p style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
            💡 O sistema extrairá automaticamente o título e criará um produto para cada link.
            Você poderá editar os detalhes depois.
          </p>
        </div>
      )}
    </div>
  );
}
