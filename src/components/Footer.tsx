'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/components/ui/Link';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4">MobileStore</h3>
            <p className="text-neutral-400 mb-4">
              {t('Header.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <span className="text-xl">📘</span>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <span className="text-xl">🐦</span>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <span className="text-xl">📷</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/smartphones" className="text-neutral-400 hover:text-white transition-colors">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/tablets" className="text-neutral-400 hover:text-white transition-colors">
                  Tablets
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="text-neutral-400 hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-neutral-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-neutral-400 hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-neutral-400 hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            {t('Footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm transition-colors">
              {t('Footer.privacy')}
            </Link>
            <Link href="/terms" className="text-neutral-400 hover:text-white text-sm transition-colors">
              {t('Footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}