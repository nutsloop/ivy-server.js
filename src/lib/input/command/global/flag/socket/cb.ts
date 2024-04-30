import type { CallBackGlobalFlagAsync } from '@ivy-industries/input';

import { Path } from '@ivy-industries/cross-path';
import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { routing } from '../../../../../server/routing.js';
import { socket } from '../../../../../socket/socket.js';
const path = new Path();

export const socket_cb: CallBackGlobalFlagAsync = async ( threads?: number ): Promise<void> => {

  routing.set( 'socket', true );

  if( cluster.isPrimary ) {

    const socketConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'socketConfig.js' ] ) ).catch( () => false );
    if( typeof socketConfigFile === 'string' ){

      await socket( socketConfigFile, threads || cpus().length / 2 );
    }
    else{
      process.stderr.write( 'No socketConfig.js file found.' );
      process.exit( 1 );
    }
  }
};
