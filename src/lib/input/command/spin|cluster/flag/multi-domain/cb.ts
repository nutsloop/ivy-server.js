import { isFile, isValid } from '@nutsloop/ivy-cross-path';
import { CallBackFlagAsync } from '@nutsloop/ivy-input';

import type { MultiDomainConfig } from '../../../../../server/dispacher.js';

import { routing } from '../../../../../server/routing.js';

export const multi_domain_cb: CallBackFlagAsync<string> = async ( data: string ): Promise<void> => {


  const absolute_path = await isValid( ...[ process.cwd(), data || '' ] )
    .catch( error => error );

  if ( absolute_path instanceof Error ) {
    throw new Error( `--multi-domain path: [${absolute_path.message.red()}] is not valid.` );
  }

  const multi_domain_file = await isFile( `${absolute_path}/multiDomainConfig.js` )
    .catch( error => error );

  if( multi_domain_file instanceof Error ) {
    throw new Error( `--multi-domain path to file descriptor: [${multi_domain_file.message.red()}] is not valid.` );
  }

  const multi_domain_config: MultiDomainConfig = ( await import( multi_domain_file ) ).default;
  await multi_domain_config.callback( routing );
};
