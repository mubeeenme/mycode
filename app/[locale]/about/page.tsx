import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/Breadcrumbs';
import aboutContent from '@/content/about.json';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: t('aboutTitle'),
    description: await getTranslations({ locale, namespace: 'about' }).then(t => t('description')),
    openGraph: {
      title: t('aboutTitle'),
      type: 'website',
    },
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const content = aboutContent[locale as keyof typeof aboutContent] || aboutContent.en;
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: t('title') }]} />

      <article className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-8">{content.title}</h1>

        <div className="prose prose-lg max-w-none">
          {content.content.map((section, index) => {
            if (section.type === 'heading') {
              return (
                <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                  {section.text}
                </h2>
              );
            }
            if (section.type === 'paragraph') {
              return (
                <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                  {section.text}
                </p>
              );
            }
            if (section.type === 'list') {
              return (
                <ul key={index} className="list-disc list-inside space-y-2 mb-4">
                  {section.items?.map((item, i) => (
                    <li key={i} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>
      </article>
    </div>
  );
}
