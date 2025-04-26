import type { Path } from '@nutsloop/ivy-cross-path';

import cluster from 'node:cluster';

import { main } from '../../socket/socket.js';

export async function socket( invoked_flag: boolean | undefined, path: Path ): Promise<void> {

  if( invoked_flag && cluster.isPrimary ){

    const socketConfigFile = await path.isFile( path.resolve( ...[ process.cwd(), 'socketConfig.js' ] ) ).catch( () => false );
    if( typeof socketConfigFile === 'string' ){

      await main( socketConfigFile, path );
    }
    else{
      process.stderr.write( 'No socketConfig.js file found.' );
      process.exit( 1 );
    }
  }

}
