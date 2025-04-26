import { CallBackArgvData, CallBackAsync } from '@nutsloop/ivy-input';

import type { LiveReloadConf } from '../../../server/routing.js';

import { main } from '../../../process/main.js';

type SpinClusterThis = Map<'this', unknown> &
  Map<'command-identifier', string>;

type SpinClusterData =
  CallBackArgvData<'address' | 'exec', string > &
  CallBackArgvData<'control-room' | 'log', boolean > &
  CallBackArgvData<'cpus' |
    'log-persistent' |
    'port' |
    'socket', number > &
  CallBackArgvData<'http2' | 'https',
    Map<'cert' | 'dhparam' | 'key', string> | null > &
  CallBackArgvData<'live-reload', LiveReloadConf >;

export const spin_cluster_cb: CallBackAsync<SpinClusterData, [spin:boolean]> = async function spin_cluster( this: SpinClusterThis, data: SpinClusterData ): Promise<void> {

  await main( this.get( 'command-identifier' ) as 'spin'|'cluster', data )
    .catch( console.error );

};
