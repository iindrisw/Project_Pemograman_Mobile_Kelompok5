// Data produk bersama: dipakai Menu dan halaman detail.
// Nanti tinggal diganti dengan data dari backend.
const IMG_SOURDOUGH = 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800';
const IMG_CROISSANT = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800';
const IMG_BREAD = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800';
const IMG_TART = 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800';

export const PRODUCTS = [
  {
    id: '101',
    name: 'Classic Sourdough',
    category: 'Bread',
    price: '$6.50',
    image: IMG_SOURDOUGH,
    description:
      'A slow-fermented country loaf with a crackling, caramelised crust and a soft, tangy crumb. Baked fresh every morning from our 8-year-old starter.',
    ingredients: ['Wheat flour', 'Water', 'Sourdough starter', 'Sea salt'],
    weight: '500 g',
    prepTime: 'Baked this morning',
  },
  {
    id: '102',
    name: 'Classic Butter Croissant',
    category: 'Pastries',
    price: '$3.50',
    image: IMG_CROISSANT,
    description:
      'Golden, shatteringly crisp layers wrapped around a tender, honeycomb centre. Made with real butter and laminated by hand over two days.',
    ingredients: ['Wheat flour', 'Butter', 'Milk', 'Sugar', 'Yeast', 'Sea salt'],
    weight: '90 g',
    prepTime: 'Best eaten warm',
  },
  {
    id: '103',
    name: 'Chocolate Sourdough',
    category: 'Bread',
    price: '$5.25',
    image: IMG_BREAD,
    description:
      'Our sourdough dough folded with dark chocolate chunks and a little cocoa. Rich and slightly tangy, wonderful toasted with salted butter.',
    ingredients: ['Wheat flour', 'Dark chocolate', 'Cocoa', 'Sourdough starter', 'Sea salt'],
    weight: '450 g',
    prepTime: 'Baked this morning',
  },
  {
    id: '104',
    name: 'Lemon Tart',
    category: 'Cakes',
    price: '$4.75',
    image: IMG_TART,
    description:
      'Buttery shortcrust filled with a silky, bright lemon curd. Sweet, sharp and just the right amount of zing.',
    ingredients: ['Wheat flour', 'Butter', 'Lemon', 'Eggs', 'Sugar'],
    weight: '120 g',
    prepTime: 'Chill before serving',
  },
];

export const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
