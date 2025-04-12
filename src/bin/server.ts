#!/usr/bin/env -S node
import { entry_point } from '../lib/logic.js';

// this is the actual executable file.

await entry_point().catch( ( error ) => {
  console.error( '[server] fatal error:', error );
  process.exit( 1 );
} );
