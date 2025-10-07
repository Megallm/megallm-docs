import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Book } from 'lucide-react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import Image from 'next/image';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
            <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
              src="/logo.png"
              alt="MegaLLM Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl">MegaLLM</span>
          </div>
        </>
      ),
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        icon: <Book className="h-4 w-4" />,
      },
      {
        text: 'Dashboard',
        url: 'https://megallm.io',
        icon: <GitHubLogoIcon className="h-4 w-4" />,
        external: true,
      },
    ],
  };
}
