import type { RequestData, Route } from './routing.js';
import type { RoutingIncomingMessage } from './routing/routing-incoming-message.js';
import type { RoutingServerResponse } from './routing/routing-server-response.js';

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

  if( multi_domain.size > 0 && ! ServerResponse.listener_error ){
    if ( multi_domain.has( request_host ) ){
      ServerResponse.multi_domain = true;
      const domain = multi_domain.get( request_host );

      ServerResponse.www_root = routing.get( 'www-root' ) + '/' + domain.www_root;

      if( domain.redirect_to_https && ! secure ){
        process.stdout.write( `redirect -> '${request_host}' => has been sent.\n` );
        ServerResponse.redirect = true;
        ServerResponse.redirect_to = `https://${request_host}${url}`;
      }

      redirect( ServerResponse );
    }
  }

  if( routing.get( 'redirect' ).length > 0 && ! ServerResponse.listener_error && ! ServerResponse.multi_domain ){

    const canonical = routing.get( 'redirect' );
    const redirect_to_https = routing.get( 'redirect-to-https' );
    const is_canonical = request_host === canonical;

    if( is_canonical && redirect_to_https && ! secure ){
      process.stdout.write( `redirect -> '${request_host}' => has been sent.\n` );
      ServerResponse.redirect = true;
      ServerResponse.redirect_to = `https://${canonical}${url}`;
    }

    if( ! is_canonical && redirect_to_https && ! secure ){
      process.stdout.write( `redirect -> '${request_host}' => has been sent.\n` );
      ServerResponse.redirect = true;
      ServerResponse.redirect_to = `https://${canonical}${url}`;
    }

    if ( ! is_canonical && ! redirect_to_https && ! secure ) {
      ServerResponse.redirect = true;
      ServerResponse.redirect_to = `http://${canonical}${url}`;
    }

    if ( ! is_canonical && secure ) {
      ServerResponse.redirect = true;
      ServerResponse.redirect_to = `https://${canonical}${url}`;
    }

    redirect( ServerResponse );
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
