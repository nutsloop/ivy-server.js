import type { Path } from '@nutsloop/ivy-cross-path';

import cluster from 'node:cluster';

import { main } from '../../log/persistent.js';

export async function logger( invoked_flag: boolean | undefined, control_room_is_active: boolean, path: Path ): Promise<void> {

  if( invoked_flag && cluster.isPrimary ){

    const logConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'logConfig.js' ] ) ).catch( () => false );
    if( typeof logConfigFile === 'string' ){

      await main( logConfigFile, control_room_is_active, path );
    }
    else{
      process.stderr.write( 'No logConfig.js file found.' );
      process.exit( 1 );
    }
  }

}
