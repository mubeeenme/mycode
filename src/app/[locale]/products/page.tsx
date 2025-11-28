import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { H1, P } from '@/components/ui/Typography';

const mockProducts = [
  {
    id: '1',
    name: 'Premium Smartphone',
    description: 'Latest flagship smartphone with advanced camera system and powerful processor',
    price: 999,
    currency: 'USD',
    image: '/images/phone1.jpg',
  },
  {
    id: '2',
    name: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds with active noise cancellation',
    price: 199,
    currency: 'USD',
    image: '/images/earbuds.jpg',
  },
  {
    id: '3',
    name: 'Smart Watch',
    description: 'Advanced fitness tracking and health monitoring features',
    price: 399,
    currency: 'USD',
    image: '/images/watch.jpg',
  },
];

export default function ProductsPage() {
  const t = useTranslations('Products');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <H1 className="mb-4">{t('title')}</H1>
            <P className="max-w-2xl mx-auto">
              {t('description')}
            </P>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-neutral-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                    <span className="text-6xl">📱</span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-neutral-900">
                      ${product.price}
                    </span>
                    <Button size="sm">
                      {t('addToCart')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}