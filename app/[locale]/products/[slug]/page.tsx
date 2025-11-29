import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { getProductBySlug, getReviews } from '@/lib/api';
import { formatPrice, generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/utils';
import ImageGallery from '@/components/ImageGallery';
import StarRating from '@/components/StarRating';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { locale, slug } }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Quality Products Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params: { locale, slug } }: ProductPageProps) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviewsResult = await getReviews(product.id);
  const t = await getTranslations({ locale, namespace: 'products' });

  const productJsonLd = generateProductJsonLd(product);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('title'), href: '/products' },
            { name: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div>
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <StarRating rating={product.rating} size="lg" showNumber />
              <span className="ml-2 text-gray-600">
                ({product.reviewCount} <ReviewsText />)
              </span>
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-primary-600">
                {formatPrice(product.price, locale)}
              </p>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold"><BrandText />:</span> {product.brand}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold"><CategoryText />:</span> {product.category}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold"><AvailabilityText />:</span>{' '}
                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock > 0 ? <InStockText /> : <OutOfStockText />}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2"><DescriptionText /></h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              <button
                className="w-full px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={product.stock === 0}
              >
                <AddToCartText />
              </button>
              <button className="w-full px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                <AddToWishlistText />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-12 mb-12">
          <h2 className="text-2xl font-bold mb-6"><SpecificationsText /></h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">{key}</td>
                    <td className="px-6 py-4 text-gray-700">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <ReviewList
                reviews={reviewsResult.data}
                totalReviews={reviewsResult.total}
                currentPage={reviewsResult.page}
                totalPages={reviewsResult.totalPages}
                locale={locale}
              />
            </div>
            <div>
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewsText() {
  const t = useTranslations('productDetail');
  return <>{t('reviews')}</>;
}

function BrandText() {
  const t = useTranslations('productDetail');
  return <>{t('brand')}</>;
}

function CategoryText() {
  const t = useTranslations('productDetail');
  return <>{t('category')}</>;
}

function AvailabilityText() {
  const t = useTranslations('productDetail');
  return <>{t('availability')}</>;
}

function InStockText() {
  const t = useTranslations('products');
  return <>{t('inStock')}</>;
}

function OutOfStockText() {
  const t = useTranslations('products');
  return <>{t('outOfStock')}</>;
}

function DescriptionText() {
  const t = useTranslations('productDetail');
  return <>{t('description')}</>;
}

function AddToCartText() {
  const t = useTranslations('common');
  return <>{t('addToCart')}</>;
}

function AddToWishlistText() {
  const t = useTranslations('productDetail');
  return <>{t('addToWishlist')}</>;
}

function SpecificationsText() {
  const t = useTranslations('productDetail');
  return <>{t('specifications')}</>;
}
