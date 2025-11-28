'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/components/ui/Link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const t = useTranslations('Navigation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('products'), href: '/products' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-neutral-900">
              MobileStore
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                {t('cart')}
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center">
                <span
                  className={`bg-neutral-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                  }`}
                ></span>
                <span
                  className={`bg-neutral-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`bg-neutral-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                  }`}
                ></span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-neutral-200"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}