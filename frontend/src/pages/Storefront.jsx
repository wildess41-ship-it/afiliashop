import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Storefront() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await axios.get('/api/products');
    setProducts(res.data);
  };

  return (
    <div className="products-grid">
      {products.map(p => (
        <div key={p._id} className="product-card">

          <img
            src={p.image}
            alt={p.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300';
            }}
          />

          <h3>{p.title}</h3>

          <p className="desc">{p.description}</p>

          <a href={p.link} target="_blank" className="buy-btn">
            Comprar
          </a>

        </div>
      ))}
    </div>
  );
}