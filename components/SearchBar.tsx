'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function SearchBar() {
  const t = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?query=${encodeURIComponent(query)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl" role="search">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          aria-label={t('search')}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-6 text-white bg-primary-600 rounded-r-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 transition-colors"
          aria-label={t('search')}
        >
          {t('search')}
        </button>
      </div>
    </form>
  );
}
