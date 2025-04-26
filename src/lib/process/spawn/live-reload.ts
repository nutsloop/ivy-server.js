import type { Path } from '@nutsloop/ivy-cross-path';

import cluster from 'node:cluster';

import { LiveReloadConf, routing, RoutingValue } from '../../server/routing.js';

const sse_pid: ( number | undefined )[] = [];

export async function live_reload( invoked_flag: RoutingValue, sse_config_data: LiveReloadConf | undefined, path: Path ): Promise<void> {

  if( invoked_flag && cluster.isPrimary ){

    const sse_config = new Map();
    sse_config.set( 'cors_port', routing.get( 'port' ) );

    if( sse_config_data === null ){
      sse_config.set( 'host', routing.get( 'address' ) );
      sse_config.set( 'port', 6553 );
    }

    if( sse_config_data !== null && sse_config_data ){

      if( sse_config_data.has( 'host' ) ){
        sse_config.set( 'host', sse_config_data.get( 'host' ) );
      }
      else{
        sse_config.set( 'host', routing.get( 'address' ) );
      }
      if( sse_config_data.has( 'port' ) ){
        sse_config.set( 'port', sse_config_data.get( 'port' ) );
      }
      else{
        sse_config.set( 'port', 6553 );
      }
    }

    routing.set( 'live-reload-conf', sse_config );

    const sse_wrk = [
      path.dirname( new URL( import.meta.url ).pathname ),
      '..',
      '..',
      'live-reload',
      'wrk.js'
    ];

    cluster.setupPrimary( {
      exec: path.resolve( ...sse_wrk ),
      args: [ ... sse_config ].flat()
    } );

    sse_pid.push( cluster.fork().process.pid );

    cluster.on( 'fork', ( Worker ) => {

      if( sse_pid.includes( Worker.process.pid ) ){
        process.stdout.write( ` ${'|'.red()}${'   sse'.red().underline()}(${ Worker.id }) ${Worker.process.pid}` );
        process.stdout.write( ` listening on ${ sse_config.get( 'host' ).magenta() }:` );
        process.stdout.write( `${ sse_config.get( 'port' ).toFixed().yellow() }\n` );
      }
    } );

  }
}
