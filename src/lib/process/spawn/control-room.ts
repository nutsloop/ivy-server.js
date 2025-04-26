import type { Path } from '@nutsloop/ivy-cross-path';

import cluster from 'node:cluster';

import { main } from '../../control/room.js';

export async function control_room( invoked_flag: boolean | undefined, path: Path ): Promise<void> {

  if( invoked_flag && cluster.isPrimary ){

    const controlRoomConfig = await path.isFile( path.resolve( ...[ process.cwd(), 'controlRoomConfig.js' ] ) ).catch( () => false );
    if( typeof controlRoomConfig === 'string' ){

      await main( controlRoomConfig, path );
    }
    else{
      process.stderr.write( 'No controlRoom.js file found.' );
      process.exit( 1 );
    }
  }
}
