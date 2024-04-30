import { Path } from '@ivy-industries/cross-path';
import { CallBackArgvData, CallBackAsync } from '@ivy-industries/input';
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { routing } from '../../../server/routing.js';

type SpinClusterData =
  CallBackArgvData<'address' | 'exec', string > &
  CallBackArgvData<'cpus' | 'port', number > &
  CallBackArgvData<'https',
    Map<'cert' | 'dhparam' | 'key', string> | null >;

const server_pid = [];

export const spin_cluster_cb: CallBackAsync = async ( data: SpinClusterData, spin: boolean ): Promise<void> => {

  if( spin ){

    await server( data );
  }
  else {

    const path = new Path();
    routing.set( 'cluster', true );

    if ( cluster.isPrimary ) {

      process.stdout.write( `ivy-server ${ process.pid } is running\n` );
      const path_to_ivy_server_exec = [
        path.dirname( new URL( import.meta.url ).pathname ),
        '..',
        '..',
        '..',
        '..',
        'bin',
        'server.js'
      ];

      const clusterSetup = new Map();
      clusterSetup.set( 'nCPUS', data.get( 'cpus' ) || cpus().length / 2 );
      clusterSetup.set( 'exec', data.get( 'exec' ) || path.resolve( ...path_to_ivy_server_exec ) );

      cluster.setupPrimary( {
        args: process.argv,
        exec: clusterSetup.get( 'exec' ),
      } );

      for ( let i = 0; i < clusterSetup.get( 'nCPUS' ); i ++ ) {
        server_pid.push( cluster.fork().process.pid );
      }

      cluster.on( 'exit', ( Worker, code, signal ) => {

        if( server_pid.includes( Worker.process.pid ) ){

          server_pid.splice( server_pid.indexOf( Worker.process.pid ), 1 );
          process.stdout.write( `worker -> ${ Worker.id } died with code [${code}] & signal[${ signal }]\n` );
          cluster.fork();
        }
      } );

      cluster.on( 'listening', ( _Worker, _address ) => {} );

      cluster.on( 'online', ( _Worker ) => {} );
      cluster.on( 'fork', ( _Worker ) => {
        if( server_pid.includes( _Worker.process.pid ) ){
          process.stdout.write( ` ${'|'.red()}${'   wrk'.red().underline()}(${ _Worker.id }) ${_Worker.process.pid}` );
          process.stdout.write( ` listening on ${ routing.get( 'address' ).magenta() }:` );
          process.stdout.write( `${ routing.get( 'port' ).toFixed().yellow() }\n` );
        }
      } );

      cluster.on( 'message', ( _worker, _message ) => {} );
    }
    else if( cluster.isWorker ){

      await server( data );
    }
  }
};

async function server( data: SpinClusterData ): Promise<void> {

  const address: string = data.get( 'address' ) || '0.0.0.0';
  const port: number = data.get( 'port' ) || 3001;

  if( data.get( 'https' ) === null || data.get( 'https' ) ){

    await ( await import( '../../../server/type/https.js' ) )
      .https( port, address, data.get( 'https' ) );

  }
  else{

    await ( await import( '../../../server/type/http.js' ) )
      .http( port, address );
  }
}
