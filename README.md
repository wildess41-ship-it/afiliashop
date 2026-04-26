# 🛍️ AfiliaShop - Plataforma de Vitrine de Produtos Afiliados

Projeto completo e funcional para rodar localmente no Windows com Node.js.

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Rodar Localmente

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
```

### 3. Acessar

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 🔐 Login Admin

**Senha**: `S@nt0s970321`

## 📋 Funcionalidades

✅ Vitrine pública com produtos  
✅ Filtro por categoria  
✅ Filtro por origem (Brasil/Internacional)  
✅ Busca de produtos  
✅ Painel admin protegido por senha  
✅ Adicionar/editar/remover produtos  
✅ Criar categorias  
✅ Importar produtos por links  
✅ Responsivo (mobile e desktop)  

## 📁 Estrutura

```
affiliate-shop-clean/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── pages/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/               # Node.js + Express
│   └── src/
│       └── index.js
├── shared/                # Utilidades compartilhadas
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Tecnologias

- **Frontend**: React 18 + Vite
- **Backend**: Express.js
- **Armazenamento**: JSON (sem banco de dados)
- **Compatibilidade**: Windows, Mac, Linux

## 📝 Notas

- Dados são salvos em `data/products.json`
- Sem dependências externas de banco de dados
- Projeto pronto para desenvolvimento local
- Todos os arquivos incluídos

## ✅ Testado e Funcional

✓ npm install funciona  
✓ npm run dev funciona  
✓ npm run frontend:dev funciona  
✓ Sem erros de módulo  
✓ Sem imports quebrados  
✓ Windows compatível  

---

**Pronto para usar! 🎉**
