import type { Path } from '@nutsloop/ivy-cross-path';

import cluster from 'node:cluster';

import { routing, RoutingValue } from '../../server/routing.js';

const log_pid: ( number | undefined )[] = [];

export async function log( invoked_flag: RoutingValue, path: Path ): Promise<void> {

  if ( invoked_flag && cluster.isPrimary ){
    const log_wrk = [
      path.dirname( new URL( import.meta.url ).pathname ),
      '..',
      '..',
      'log',
      'wrk.js'
    ];

    cluster.setupPrimary( {
      exec: path.resolve( ...log_wrk ),
    } );

    log_pid.push( cluster.fork().process.pid );

    cluster.on( 'fork', ( Worker ) => {

      if( log_pid.includes( Worker.process.pid ) ){
        routing.set( 'log_worker', Worker );
        process.stdout.write( ` ${'|'.red()}${'   log'.red().underline()}(${ Worker.id }) ${Worker.process.pid}\n` );
      }
    } );
  }
}
