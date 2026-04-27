import { useState } from 'react';
import Storefront from './pages/Storefront';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginError, setLoginError] = useState('');

  const ADMIN_PASSWORD = 'S@nt0s970321';

  const handleAdminLogin = (e) => {
    e.preventDefault();

    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminPassword('');
      setShowLoginForm(false);
      setLoginError('');
    } else {
      setLoginError('Senha inválida');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminPassword('');
    setShowLoginForm(false);
  };

  // 🔥 ADMIN LOGADO
  if (isAdmin) {
    return <AdminPanel onLogout={handleAdminLogout} />;
  }

  return (
    <>
      <header>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <div>
              <h1>🛍️ AfiliaShop</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Vitrine de Produtos Afiliados
              </p>
            </div>

            {/* 🔐 BOTÃO ADMIN ESCONDIDO */}
            <div className="nav">
              {window.location.hash === '#admin' && !showLoginForm && (
                <button onClick={() => setShowLoginForm(true)}>
                  Painel Admin
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 🔐 FORM LOGIN */}
      {showLoginForm && (
        <div className="container">
          <div className="admin-panel" style={{ maxWidth: '400px' }}>
            <h2>Login Admin</h2>

            {loginError && (
              <div className="error">{loginError}</div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label>Senha:</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite a senha"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-primary">
                Entrar
              </button>

              <button
                type="button"
                className="btn-primary"
                style={{ background: '#6c757d', marginTop: '10px' }}
                onClick={() => {
                  setShowLoginForm(false);
                  setLoginError('');
                  setAdminPassword('');
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🛍️ VITRINE */}
      {!showLoginForm && <Storefront />}
    </>
  );
}