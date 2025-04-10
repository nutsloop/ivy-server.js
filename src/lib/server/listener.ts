import type { RequestData, Route } from './routing.js';
import type { RoutingIncomingMessage } from './routing/routing-incoming-message.js';
import type { RoutingServerResponse } from './routing/routing-server-response.js';

import { Domain } from './dispacher.js';
import { routing } from './routing.js';

export async function listener<K extends RoutingIncomingMessage>( IncomingMessage: RoutingIncomingMessage, ServerResponse: RoutingServerResponse<K> ): Promise<void> {

  // reset the errors
  ServerResponse.incoming.set( 'error', [] );
  ServerResponse.incoming.set( 'data-error', '' );

  // fix: in some cases the IncomingMessage is not a valid object or it is undefined.
  if( ! IncomingMessage ){

    ServerResponse.listener_error = true;
    const message = 'IncomingMessage is not a valid object';
    const date = new Date().toISOString();
    process.stderr.write( `${date} ${message}\n` );

    ServerResponse.statusCode = 400;
  }

  // double slash in the URL is not allowed
  if( IncomingMessage.url.startsWith( '//' ) ){

    ServerResponse.listener_error = true;
    const message = 'Invalid URL with double slash';
    const date = new Date().toISOString();
    process.stderr.write( `${date} ${message}\n` );

    ServerResponse.statusCode = 400;
  }

  const request_host: string = IncomingMessage.headers.host || <string>IncomingMessage.headers[ ':authority' ] || 'UNKNOWN HOST';
  const secure = routing.get( 'secure' );
  const url = IncomingMessage.url || '/';
  const multi_domain = routing.get( 'multi-domain' );

  const is_acme_challenge =
    url.startsWith( '/.well-known/acme-challenge/' ) &&
    routing.get( 'acme-challenge' ) &&
    ! secure;

  if ( ! is_acme_challenge ) {

    const white_listed: string[] = [];
    const redirect_to: string[] = [];
    let domain_config: Domain = undefined;

    if ( multi_domain.size > 0 && ! ServerResponse.listener_error ) {

      for ( const key of multi_domain.keys() ) {

        if ( key.includes( request_host ) ) {
          domain_config = multi_domain.get( key );
          white_listed.push( request_host );
          if( domain_config.redirect_to.length > 0 ){
            redirect_to.push( domain_config.redirect_to );
          }
          break;
        }
      }

      if ( domain_config !== undefined ) {
        ServerResponse.multi_domain = true;
        let www_root = routing.get( 'www-root' );
        if ( domain_config.www_root.length > 0 ){
          www_root = www_root + '/' + domain_config.www_root;
        }
        ServerResponse.www_root = www_root;

        if( redirect_to.length > 0 ){
          const is_canonical = request_host === redirect_to[ 0 ];
          if( is_canonical && domain_config.redirect_to_https && ! secure ){
            process.stdout.write( `redirect -> '${ request_host }' => has been sent.\n` );
            ServerResponse.redirect = true;
            ServerResponse.redirect_to = `https://${ redirect_to[ 0 ] }${ url }`;
          }

          if( ! is_canonical && domain_config.redirect_to_https && ! secure ){
            process.stdout.write( `redirect -> '${ request_host }' => has been sent.\n` );
            ServerResponse.redirect = true;
            ServerResponse.redirect_to = `https://${ redirect_to[ 0 ] }${ url }`;
          }

          if( ! is_canonical && ! domain_config.redirect_to_https && ! secure ){
            ServerResponse.redirect = true;
            ServerResponse.redirect_to = `http://${ redirect_to[ 0 ] }${ url }`;
          }

          if( ! is_canonical && secure ){
            ServerResponse.redirect = true;
            ServerResponse.redirect_to = `https://${ redirect_to[ 0 ] }${ url }`;
          }
        }

        if( redirect_to.length === 0 && domain_config.redirect_to_https && ! secure ){
          ServerResponse.redirect = true;
          ServerResponse.redirect_to = `https://${ request_host }${ url }`;
        }

        redirect( ServerResponse );
      }
    }

    if ( routing.get( 'redirect' ).length > 0 && ! ServerResponse.listener_error && white_listed.length === 0 ) {

      const canonical = routing.get( 'redirect' );
      const redirect_to_https = routing.get( 'redirect-to-https' );
      const is_canonical = request_host === canonical;

      if ( is_canonical && redirect_to_https && ! secure ) {
        process.stdout.write( `redirect -> '${ request_host }' => has been sent.\n` );
        ServerResponse.redirect = true;
        ServerResponse.redirect_to = `https://${ canonical }${ url }`;
      }

      if ( ! is_canonical && redirect_to_https && ! secure ) {
        process.stdout.write( `redirect -> '${ request_host }' => has been sent.\n` );
        ServerResponse.redirect = true;
        ServerResponse.redirect_to = `https://${ canonical }${ url }`;
      }

      if ( ! is_canonical && ! redirect_to_https && ! secure ) {
        ServerResponse.redirect = true;
        ServerResponse.redirect_to = `http://${ canonical }${ url }`;
      }

      if ( ! is_canonical && secure ) {
        ServerResponse.redirect = true;
        ServerResponse.redirect_to = `https://${ canonical }${ url }`;
      }

      redirect( ServerResponse );
    }
  }

  if( routing.get( 'served-by' ) ){
    ServerResponse.setHeader( 'served-by', routing.get( 'served-by-name' ) );
  }

  const data: RequestData = new Map();
  data.set( 'url_params', IncomingMessage.get() );
  data.set( 'data', await IncomingMessage.post() );
  ServerResponse.incoming.set( 'request', data );

  if( ServerResponse.listener_error ){
    ServerResponse.end();
  }
  else if( ServerResponse.redirect ){
    ServerResponse.end();
  }

  if ( ! ServerResponse.writableEnded ) {

    if ( ServerResponse.routes_active ) {

      await IncomingMessage.route();

      if ( typeof IncomingMessage.route_module === 'function' ) {

        ServerResponse.isRoute = true;
        ServerResponse.route = IncomingMessage.route_module.bind( data ) as Route;
        await ServerResponse.sendRoute( IncomingMessage );

      }
    }

    if ( ! ServerResponse.isRoute ) {

      await ServerResponse.static( IncomingMessage.url.split( '?' )[ 0 ] );
    }
  }

  ServerResponse.close();
}

function redirect<K extends RoutingIncomingMessage>( ServerResponse: RoutingServerResponse<K> ){

  if ( ServerResponse.redirect ){
    ServerResponse.statusCode = 301;
    ServerResponse.setHeader( 'location', ServerResponse.redirect_to );
    ServerResponse.setHeader( 'cache-control', 'no-cache, no-store, must-revalidate' );
    ServerResponse.setHeader( 'pragma', 'no-cache' );
    ServerResponse.setHeader( 'expires', '0' );
    ServerResponse.setHeader( 'content-type', 'text/plain; charset=utf-8' );
    ServerResponse.setHeader( 'content-length', '0' );
    ServerResponse.setHeader( 'connection', 'close' );
  }
}
