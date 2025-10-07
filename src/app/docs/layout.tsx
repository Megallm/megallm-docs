import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const layoutProps = {
    tree: source.pageTree,
    ...baseOptions(),
    children,
  } as any; // Type assertion workaround for TypeScript issue

  return <DocsLayout {...layoutProps} />;
} 