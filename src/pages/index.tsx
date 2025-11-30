import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartPage } from '@/components/cart/CartPage';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { ShoppingCart, Package, Truck, Shield } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation('common');
  const { addItem } = useCartStore();
  const [currentView, setCurrentView] = useState<'home' | 'cart' | 'checkout'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock products for demonstration
  const mockProducts = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      inventory: 10,
      sku: 'WH-001',
    },
    {
      id: '2',
      name: 'Smart Watch Pro',
      price: 349.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
      inventory: 5,
      sku: 'SW-002',
    },
    {
      id: '3',
      name: 'Laptop Stand Adjustable',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
      inventory: 20,
      sku: 'LS-003',
    },
    {
      id: '4',
      name: 'Mechanical Keyboard RGB',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1598928424272-9e66b5ce8f41?w=300&h=300&fit=crop',
      inventory: 0,
      sku: 'KB-004',
    },
  ];

  const handleAddToCart = async (product: any) => {
    await addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sku: product.sku,
      inventory: product.inventory,
    });
  };

  const handleCartClick = () => {
    setCurrentView('cart');
  };

  const handleCheckout = () => {
    setCurrentView('checkout');
  };

  const handleOrderComplete = () => {
    setCurrentView('home');
  };

  const handleCancel = () => {
    setCurrentView('home');
  };

  if (currentView === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onCartClick={handleCartClick}
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
        />
        <CartPage
          onCheckout={handleCheckout}
          onBack={() => setCurrentView('home')}
        />
        <Footer />
      </div>
    );
  }

  if (currentView === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onCartClick={handleCartClick}
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
        />
        <CheckoutFlow
          onComplete={handleOrderComplete}
          onCancel={handleCancel}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartClick={handleCartClick}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to ShopHub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Discover amazing products with seamless checkout experience
            </p>
            <div className="space-x-4">
              <Button size="lg" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop Now
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Fast Shipping</h3>
              <p className="text-sm text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Secure Payment</h3>
              <p className="text-sm text-gray-600">Multiple payment options available</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Quality Products</h3>
              <p className="text-sm text-gray-600">Curated selection of premium items</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-sm text-gray-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Check out our most popular items
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className={`text-sm ${
                      product.inventory > 5 ? 'text-green-600' : 
                      product.inventory > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.inventory > 5 ? 'In Stock' : 
                       product.inventory > 0 ? `Only ${product.inventory} left` : 'Out of Stock'}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                    disabled={product.inventory === 0}
                  >
                    {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;