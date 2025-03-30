import type { Worker } from 'node:cluster';

const counter: 1[] = [];

export function process_listener( Worker: Worker, data: {counter: number} ) {

  if( data?.counter ){
    counter.push( 1 );
    process.stdout.write( `(${Worker.id})(${data.counter.toString()})[${counter.length.toString()}]\n` );
  }
}
