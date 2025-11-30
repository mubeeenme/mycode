import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { NotificationProvider } from '@/components/admin/NotificationProvider';
import '@/styles/globals.css';
import '@/lib/i18n';

function App({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <Component {...pageProps} />
    </NotificationProvider>
  );
}

export default appWithTranslation(App);