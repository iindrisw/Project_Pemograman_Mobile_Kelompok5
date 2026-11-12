import { parseHarga } from '../lib/produk';

export const SEARCH_CATEGORIES = ['Bread', 'Pastries', 'Cakes', 'Drinks'];

export const EMPTY_SEARCH_CRITERIA = {
  minPrice: '',
  maxPrice: '',
  minStock: '',
  maxStock: '',
  category: 'All',
  orderedOnly: false,
};

export const normalizeMenuText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const normalizeCategory = (value) => {
  const category = normalizeMenuText(value);
  if (category === 'pastry' || category === 'pastries') return 'pastry';
  if (category === 'cake' || category === 'cakes') return 'cake';
  if (category === 'bread' || category === 'breads') return 'bread';
  if (category === 'drink' || category === 'drinks') return 'drink';
  return category;
};

const parseBoundary = (value) => {
  if (value === '' || value == null) return null;
  const digits = String(value).replace(/[^\d]/g, '');
  if (!digits) return null;
  const number = Number(digits);
  return Number.isFinite(number) ? number : null;
};

const matchesRange = (value, min, max) => {
  const lower = parseBoundary(min);
  const upper = parseBoundary(max);
  return (lower === null || value >= lower) && (upper === null || value <= upper);
};

export function filterMenuProducts(products, {
  query = '',
  criteria = EMPTY_SEARCH_CRITERIA,
  orderedProductNames = [],
} = {}) {
  const words = normalizeMenuText(query).split(/\s+/).filter(Boolean);
  const orderedNames = new Set(orderedProductNames.map(normalizeMenuText));

  return (products || []).filter((product) => {
    const searchableText = normalizeMenuText([
      product.name,
      product.category,
      product.description,
    ].filter(Boolean).join(' '));
    if (!words.every((word) => searchableText.includes(word))) return false;

    if (
      criteria.category !== 'All'
      && normalizeCategory(product.category) !== normalizeCategory(criteria.category)
    ) return false;

    if (!matchesRange(parseHarga(product.price), criteria.minPrice, criteria.maxPrice)) {
      return false;
    }

    const stock = Number(product.stok) || 0;
    if (!matchesRange(stock, criteria.minStock, criteria.maxStock)) return false;

    if (criteria.orderedOnly && !orderedNames.has(normalizeMenuText(product.name))) {
      return false;
    }
    return true;
  });
}

export const countActiveSearchFilters = (criteria) => [
  criteria.minPrice,
  criteria.maxPrice,
  criteria.minStock,
  criteria.maxStock,
  criteria.category !== 'All',
  criteria.orderedOnly,
].filter((value) => value !== '' && value !== false).length;
