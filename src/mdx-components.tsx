import defaultMdxComponents from 'fumadocs-ui/mdx';
import { APIPage } from 'fumadocs-openapi/ui';
import { openapi } from '@/lib/openapi';
import type { MDXComponents } from 'mdx/types';
import * as path from 'path';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage: (props: any) => <APIPage {...openapi.getAPIPageProps({
      ...props,
      document: path.resolve(process.cwd(), 'openapi.yaml')
    })} />,
    ...components,
  };
}
