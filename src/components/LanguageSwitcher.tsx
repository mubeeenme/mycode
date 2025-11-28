'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLanguage('en')}
        className="text-sm"
      >
        {t('english')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchLanguage('zh')}
        className="text-sm"
      >
        {t('chinese')}
      </Button>
    </div>
  );
}