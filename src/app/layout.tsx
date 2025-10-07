import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'MegaLLM - Universal AI Platform | 20+ LLMs, One API',
    template: '%s | MegaLLM',
  },
  description: 'Access 20+ AI models from OpenAI, Anthropic, Google, and more through a single API. Switch models instantly, implement automatic fallbacks. The super-API for AI.',
  keywords: ['AI Platform', 'LLM API', 'OpenAI', 'Anthropic', 'Claude', 'GPT-5', 'GPT-4', 'Gemini', 'Grok', 'Multi-model', 'AI Gateway'],
  authors: [{ name: 'MegaLLM Team' }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'MegaLLM - Universal AI Platform',
    description: '20+ AI models, one API. Your super-API for AI.',
    url: 'https://megallm.io',
    siteName: 'MegaLLM',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'MegaLLM Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MegaLLM - Universal AI Platform',
    description: '20+ AI models, one API. Your super-API for AI.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{
            defaultTheme: 'system',
            enableSystem: true,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
