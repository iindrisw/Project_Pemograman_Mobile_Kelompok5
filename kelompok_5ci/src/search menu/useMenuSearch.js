import { useCallback, useMemo, useState } from 'react';
import { ambilRiwayatPesanan } from '../lib/penjualan';
import {
  countActiveSearchFilters,
  EMPTY_SEARCH_CRITERIA,
  filterMenuProducts,
} from './filter';

export default function useMenuSearch(products) {
  const [query, setQuery] = useState('');
  const [criteria, setCriteria] = useState(EMPTY_SEARCH_CRITERIA);
  const [orderedProductNames, setOrderedProductNames] = useState(null);

  const ensureOrderedProducts = useCallback(async () => {
    if (orderedProductNames !== null) return;
    const orders = await ambilRiwayatPesanan();
    const names = orders.flatMap((order) => order.items.map((item) => item.nama));
    setOrderedProductNames(names);
  }, [orderedProductNames]);

  const filteredProducts = useMemo(
    () => filterMenuProducts(products, { query, criteria, orderedProductNames: orderedProductNames || [] }),
    [products, query, criteria, orderedProductNames],
  );

  return {
    query,
    setQuery,
    criteria,
    setCriteria,
    filteredProducts,
    ensureOrderedProducts,
    activeFilterCount: countActiveSearchFilters(criteria),
  };
}
