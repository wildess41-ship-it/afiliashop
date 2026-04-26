import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedOrigin, setSelectedOrigin] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/categories')
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchOrigin = selectedOrigin === 'all' || product.origin === selectedOrigin;
    const matchSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchOrigin && matchSearch;
  });

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Sem categoria';
  };

  if (loading) {
    return <div className="loading">Carregando produtos...</div>;
  }

  return (
    <div className="container">
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)}>
          <option value="all">Todas as origens</option>
          <option value="Brasil">Brasil</option>
          <option value="Internacional">Internacional</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="loading">Nenhum produto encontrado</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={product.title}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=Sem+Imagem';
                }}
              />
              <div className="product-content">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <span className="product-category">{getCategoryName(product.categoryId)}</span>
                  <span className="product-origin">{product.origin}</span>
                </div>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-btn"
                >
                  Comprar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
