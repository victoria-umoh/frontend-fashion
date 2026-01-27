const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mock product data
const products = [
  { id: 1, name: 'T-Shirt', price: 19.99, image: '/assets/tshirt.jpg' },
  { id: 2, name: 'Jeans', price: 39.99, image: '/assets/jeans.jpg' },
  { id: 3, name: 'Sneakers', price: 59.99, image: '/assets/sneakers.jpg' },
];

// Products API endpoint
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
