import type { CallBackFlag } from '@ivy-industries/input';

import { routing } from '../../../../../server/routing.js';

export const port_cb: CallBackFlag = ( port: string ): void => {

  if( ! routing.get( 'ease' ) && Number( port ) < 1024 ){
    process.stderr.write( `Port number below 1024 requires root privileges. use \`ivy-server --ease spin --port=${port}\`\n this will not override system settings.` );
    process.exit( 125 );
  }
  routing.set( 'port', Number( port ) );
};
