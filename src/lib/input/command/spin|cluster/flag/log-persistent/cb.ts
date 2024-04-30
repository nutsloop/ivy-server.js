import { Path } from '@ivy-industries/cross-path';
import { CallBackFlagAsync } from '@ivy-industries/input';
import cluster from 'node:cluster';
import EventEmitter from 'node:events';
import { cpus } from 'node:os';

import { log_persistent } from '../../../../../log/persistent.js';
import { routing } from '../../../../../server/routing.js';

const path = new Path();

export const logEvent = new EventEmitter;

export const log_persistent_cb: CallBackFlagAsync = async ( threads?: number ): Promise<void> => {

  routing.set( 'log-persistent', true );
  if( cluster.isPrimary ) {

    const logConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'logConfig.js' ] ) ).catch( () => false );
    if( typeof logConfigFile === 'string' ){

      await log_persistent( logConfigFile, threads || cpus().length / 2 );
    }
    else{
      process.stderr.write( 'No logConfig.js file found.' );
      process.exit( 1 );
    }
  }
};
