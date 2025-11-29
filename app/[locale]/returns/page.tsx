import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/Breadcrumbs';
import returnsContent from '@/content/returns.json';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: t('returnsTitle'),
    description: await getTranslations({ locale, namespace: 'returns' }).then(t => t('description')),
    openGraph: {
      title: t('returnsTitle'),
      type: 'website',
    },
  };
}

export default async function ReturnsPage({ params: { locale } }: { params: { locale: string } }) {
  const content = returnsContent[locale as keyof typeof returnsContent] || returnsContent.en;
  const t = await getTranslations({ locale, namespace: 'returns' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: t('title') }]} />

      <article className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
        <p className="text-gray-600 mb-8">Last Updated: {content.lastUpdated}</p>

        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-bold mb-3">{section.heading}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
