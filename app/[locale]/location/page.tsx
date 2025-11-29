import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/Breadcrumbs';
import locationContent from '@/content/location.json';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  return {
    title: t('locationTitle'),
    description: await getTranslations({ locale, namespace: 'location' }).then(t => t('description')),
    openGraph: {
      title: t('locationTitle'),
      type: 'website',
    },
  };
}

export default async function LocationPage({ params: { locale } }: { params: { locale: string } }) {
  const content = locationContent[locale as keyof typeof locationContent] || locationContent.en;
  const t = await getTranslations({ locale, namespace: 'location' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ name: t('title') }]} />

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-8">{content.title}</h1>

        <div className="space-y-8">
          {content.locations.map((location, index) => (
            <div key={index} className="border-b last:border-b-0 pb-8 last:pb-0">
              <h2 className="text-2xl font-bold mb-4">{location.name}</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold">Address:</span> {location.address}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{' '}
                  <a href={`tel:${location.phone}`} className="text-primary-600 hover:text-primary-700">
                    {location.phone}
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Hours:</span> {location.hours}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
