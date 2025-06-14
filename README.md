// Motorcycle Parts Management System – Backend

The backend for the Motorcycle Parts Management System. It includes API endpoints for managing products, categories, suppliers, inventory, sales, and orders.
---

// Project Structure

backend/
 routes
 uploads
 db.js
 index.js
 .env #
 package.json
 server.js


// 1. Clone the Repository

```bash
git clone https://github.com/macjanquilang123/https://github.com/macjanquilang123/Development-of-Motorcycle-Shop-Inventory-Management1.git

// 2. Install Backend Dependencies

```bash
npm install

// 3. Configure Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=motorcycle_parts_db
PORT=5000
JWT_SECRET=mysecretkey123
REACT_APP_API_URL=http://localhost:5000

// 4. Set Up the MySQL Database

```bash
mysql -u root -p motorcycle_parts_db < database/motorcycle_parts_db.sql


// 5. Start the Backend Server

```bash
npm run dev



// Motorcycle Parts Management System – frontend

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```