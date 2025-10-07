import { createOpenAPI } from 'fumadocs-openapi/server';
import * as path from 'path';

export const openapi = createOpenAPI({
  input: [path.resolve(process.cwd(), 'openapi.yaml')],
});