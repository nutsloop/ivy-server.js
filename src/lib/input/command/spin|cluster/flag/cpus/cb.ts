import type { CallBackFlag } from '@nutsloop/ivy-input';

import * as os from 'node:os';

import { routing } from '../../../../../server/routing.js';

export const cpus_cb: CallBackFlag = ( cpus: number ): void => {

  if( ! routing.get( 'ease-cluster' ) && os.cpus().length < cpus ){

    process.stderr.write( `cpus number above ${ os.cpus().length }. use \`ivy-server --ease-cluster cluster --cpus=${ cpus }\`\n this will not override system settings.` );
    process.exit( 126 );
  }

  routing.set( 'cpus', cpus );
};
