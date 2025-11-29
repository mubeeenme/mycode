import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/Breadcrumbs';
import contactContent from '@/content/contact.json';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: t('contactTitle'),
    description: await getTranslations({ locale, namespace: 'contact' }).then(t => t('description')),
    openGraph: {
      title: t('contactTitle'),
      type: 'website',
    },
  };
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const content = contactContent[locale as keyof typeof contactContent] || contactContent.en;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: t('title') }]} />

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
        <p className="text-gray-600 mb-8">{content.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{t('email')}</h2>
              <a href={`mailto:${content.email}`} className="text-primary-600 hover:text-primary-700">
                {content.email}
              </a>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t('phone')}</h2>
              <a href={`tel:${content.phone}`} className="text-primary-600 hover:text-primary-700">
                {content.phone}
              </a>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{t('address')}</h2>
              <p className="text-gray-700">{content.address}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Business Hours</h2>
              <p className="text-gray-700">{content.hours}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">{t('send')}</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {t('name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  {t('message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
