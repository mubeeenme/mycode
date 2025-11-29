import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getProducts, getFilterOptions } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import SearchBar from '@/components/SearchBar';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import type { SearchParams } from '@/types';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: t('productsTitle'),
    description: t('productsDescription'),
    openGraph: {
      title: t('productsTitle'),
      description: t('productsDescription'),
      type: 'website',
    },
  };
}

interface ProductsPageProps {
  params: { locale: string };
  searchParams: SearchParams;
}

export default async function ProductsPage({ params: { locale }, searchParams }: ProductsPageProps) {
  const [productsResult, filterOptions] = await Promise.all([
    getProducts(searchParams),
    getFilterOptions(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { name: await getTranslatedText(locale, 'products', 'title') },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <ProductsTitle />
        </h1>
        <SearchBar />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters brands={filterOptions.brands} priceRange={filterOptions.priceRange} />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              <ResultsText total={productsResult.total} />
            </p>
            <SortDropdown />
          </div>

          {productsResult.data.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-600">
                <NoResultsText />
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsResult.data.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>

              {productsResult.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={productsResult.page}
                    totalPages={productsResult.totalPages}
                    searchParams={searchParams}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

async function getTranslatedText(locale: string, namespace: string, key: string) {
  const t = await getTranslations({ locale, namespace });
  return t(key);
}

function ProductsTitle() {
  const t = useTranslations('products');
  return <>{t('title')}</>;
}

function ResultsText({ total }: { total: number }) {
  const t = useTranslations('common');
  return <>{t('showing')} {total} {t('results')}</>;
}

function NoResultsText() {
  const t = useTranslations('common');
  return <>{t('noResults')}</>;
}

function SortDropdown() {
  const t = useTranslations('products');
  
  return (
    <div className="relative">
      <select
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          if (e.target.value) {
            params.set('sort', e.target.value);
          } else {
            params.delete('sort');
          }
          window.location.href = `/products?${params.toString()}`;
        }}
      >
        <option value="">{t('sortBy')}</option>
        <option value="newest">{t('sortNewest')}</option>
        <option value="price-asc">{t('sortPriceLow')}</option>
        <option value="price-desc">{t('sortPriceHigh')}</option>
        <option value="rating">{t('sortRating')}</option>
      </select>
    </div>
  );
}

function Pagination({ currentPage, totalPages, searchParams }: { currentPage: number; totalPages: number; searchParams: SearchParams }) {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams as any);
    params.set('page', page.toString());
    return `/products?${params.toString()}`;
  };

  return (
    <nav className="flex justify-center items-center space-x-2" aria-label="Pagination">
      {currentPage > 1 && (
        <a
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Previous
        </a>
      )}
      
      {pages.map((page) => (
        <a
          key={page}
          href={createPageUrl(page)}
          className={`px-4 py-2 border rounded-lg ${
            page === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </a>
      ))}

      {currentPage < totalPages && (
        <a
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Next
        </a>
      )}
    </nav>
  );
}
