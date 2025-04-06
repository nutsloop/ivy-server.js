
import type { Routing, MultiDomainConfig, DomainConfig, } from '../index.ts';

const Domain: DomainConfig = new Map();
Domain.set( [ '0.0.0.0:3002' ], {
  www_root: '0',
  redirect_to: 'simonedelpopolo.com',
  redirect_to_https: false
} );

const MultiDomainConfig: MultiDomainConfig = {
  domain_list: Domain,
  callback: async( routing:Routing ) => {
    routing.set( 'multi-domain', MultiDomainConfig.domain_list );
  }

};

export default MultiDomainConfig;
