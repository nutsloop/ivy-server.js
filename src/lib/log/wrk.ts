#!/usr/bin/env -S node

process.argv.splice( 0, 2 );

// TODO: work on the log worker
if( process.argv.length > 2 ){
  process.stderr.write( 'Too many arguments.\n' );
  process.exit( 1 );
}
