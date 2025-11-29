'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ProductFiltersProps {
  brands: string[];
  priceRange: { min: number; max: number };
}

export default function ProductFilters({ brands, priceRange }: ProductFiltersProps) {
  const t = useTranslations('products');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrands(Array.isArray(brandParam) ? brandParam : [brandParam]);
    }
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    params.delete('brand');
    selectedBrands.forEach(brand => params.append('brand', brand));

    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }

    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    const query = searchParams.get('query');
    const sort = searchParams.get('sort');
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (sort) params.set('sort', sort);
    router.push(`/products?${params.toString()}`);
    setIsOpen(false);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h2 className="text-lg font-semibold">{t('filters')}</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-primary-600 hover:text-primary-700"
          aria-expanded={isOpen}
          aria-label="Toggle filters"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4 hidden md:block">{t('filters')}</h2>

      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        <div>
          <h3 className="font-medium mb-3">{t('brand')}</h3>
          <div className="space-y-2">
            {brands.map(brand => (
              <label key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">{t('priceRange')}</h3>
          <div className="space-y-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder={`${t('minPrice')} ($${priceRange.min})`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min={priceRange.min}
              max={priceRange.max}
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder={`${t('maxPrice')} ($${priceRange.max})`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t('applyFilters')}
          </button>
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('clearFilters')}
          </button>
        </div>
      </div>
    </div>
  );
}
