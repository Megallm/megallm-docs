import { createOpenAPI } from 'fumadocs-openapi/server';
import path from 'path';

async function test() {
  try {
    console.log('Creating OpenAPI instance...');
    const openapi = createOpenAPI({
      input: [path.resolve(process.cwd(), 'openapi.yaml')],
    });

    console.log('Getting schemas...');
    const schemas = await openapi.getSchemas();

    console.log('Schemas loaded successfully!');
    console.log('Keys:', Object.keys(schemas));

    // Check if schemas have dereferenced property
    for (const [key, schema] of Object.entries(schemas)) {
      console.log(`\nSchema ${key}:`);
      console.log('  Has dereferenced:', !!schema.dereferenced);
      console.log('  Has bundled:', !!schema.bundled);

      if (schema.dereferenced) {
        console.log('  Paths:', Object.keys(schema.dereferenced.paths || {}));

        // List all operation IDs
        console.log('\nOperation IDs:');
        for (const [pathKey, pathItem] of Object.entries(schema.dereferenced.paths || {})) {
          for (const [method, operation] of Object.entries(pathItem)) {
            if (operation && typeof operation === 'object' && 'operationId' in operation) {
              console.log(`  - ${operation.operationId} (${method.toUpperCase()} ${pathKey})`);
            }
          }
        }
      }
    }

    // Test getAPIPageProps with document
    console.log('\nTesting getAPIPageProps with document...');
    const props = openapi.getAPIPageProps({
      document: path.resolve(process.cwd(), 'openapi.yaml'),
      operations: ['createChatCompletion']
    });
    console.log('Props keys:', Object.keys(props));

    // Resolve document promise if needed
    if (props.document && typeof props.document.then === 'function') {
      const doc = await props.document;
      console.log('Document resolved:', !!doc);
      console.log('Document has dereferenced:', !!doc?.dereferenced);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();