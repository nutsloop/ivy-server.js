import { CallBackFlag } from '@nutsloop/ivy-input';

import { routing } from '../../../../../server/routing.js';

export const log_request_headers_cb: CallBackFlag = (): void => {

  routing.set( 'log-request-headers', true );
};
