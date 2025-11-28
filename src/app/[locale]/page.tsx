import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                {t('cta.shop')}
              </button>
              <button className="border border-neutral-300 text-neutral-700 px-8 py-3 rounded-lg font-medium hover:bg-neutral-50 transition-colors">
                {t('cta.learn')}
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
              {t('features.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {t('features.international.title')}
                </h3>
                <p className="text-neutral-600">
                  {t('features.international.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {t('features.mobile.title')}
                </h3>
                <p className="text-neutral-600">
                  {t('features.mobile.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {t('features.payments.title')}
                </h3>
                <p className="text-neutral-600">
                  {t('features.payments.description')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}