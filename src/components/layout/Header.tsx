import React from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/Button';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Input } from '@/components/ui/Input';
import { useTranslation } from 'next-i18next';

interface HeaderProps {
  onCartClick: () => void;
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onCartClick,
  onMenuClick,
  isMenuOpen,
}) => {
  const { t } = useTranslation('common');
  const { totalItems } = useCartStore();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleCartClick = () => {
    setIsCartOpen(true);
    onCartClick();
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 lg:hidden"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex-shrink-0 ml-2 lg:ml-0">
                <h1 className="text-xl font-bold text-gray-900">ShopHub</h1>
              </div>
            </div>

            {/* Search - Hidden on mobile */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search */}
              <div className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* User Account */}
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Account</span>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="sm" onClick={handleCartClick}>
                <ShoppingCart className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-3">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onCheckout={handleCheckout}
      />
    </>
  );
};