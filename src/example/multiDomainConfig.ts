
import type { Routing, MultiDomainConfig } from '../index.ts';

const Domain = new Map();
Domain.set( '0.0.0.0:3002', {
  name: 'simonedelpopolo.com',
  www_root: '0',
  redirect_to_https: false
} );

const MultiDomainConfig: MultiDomainConfig = {
  domain_list: Domain,
  callback: async( routing:Routing ) => {
    routing.set( 'multi-domain', MultiDomainConfig.domain_list );
  }

};

export default MultiDomainConfig;
