import { isFile, isValid } from '@ivy-industries/cross-path';
import { CallBackFlagAsync } from '@nutsloop/ivy-input';
import { readFile } from 'node:fs/promises';

import type { MultiDomainConfig } from '../../../../../server/dispacher.js';

import { routing } from '../../../../../server/routing.js';

export const multi_domain_cb: CallBackFlagAsync = async ( data: string ): Promise<void> => {


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

  const read_domain_list: string = await readFile( multi_domain_file, { encoding: 'utf-8' } );
  if( read_domain_list.length === 0 ) {

    let message = `descriptor file must be filled with at least one domain.\n`;
    message += 'it is a JSON object with a domain as key and a directory as value.\n';
    message += `key pair of "domain.com" -> "directory".\n`;
    message += `example:\n`;
    message += `  {"domain1.com":"dir_domain1","domain2.com":"dir_domain2"}\n`;

    throw new Error( `--multi-domain: [${multi_domain_file}] is empty.\n ${message}` );
  }

  const multi_domain_config: MultiDomainConfig = ( await import( multi_domain_file ) ).default;

  multi_domain_config.domain_list.forEach( ( domain ) => {
    if( routing.get( 'secure' ) && domain.redirect_to_https ){
      throw new Error( `redirect_to_https is not allowed when server is HTTPS already.` );
    }
  } );

  await multi_domain_config.callback( routing );
};
