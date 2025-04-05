import { Path } from '@nutsloop/ivy-cross-path';
import { CallBackFlagAsync } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const to_index_html_cb: CallBackFlagAsync = async (): Promise<void> => {

  const path = new Path();
  if( ! path.isFile( routing.get( 'www-root' ) + '/index.html' ) ){
    throw new Error( `--to-index-html: [${ routing.get( 'www-root' ) + '/index.html' }] is not valid.` );
  }
  routing.set( 'to-index-html', true );
};
