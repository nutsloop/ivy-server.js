import { Path } from '@nutsloop/ivy-cross-path';

import type { RequestData, Route } from './routing.js';
import type { RoutingIncomingMessage } from './routing/routing-incoming-message.js';
import type { RoutingServerResponse } from './routing/routing-server-response.js';

import { Domain } from './dispacher.js';
import { routing } from './routing.js';

// experiment
export type IvyPlugin<K extends RoutingIncomingMessage> = {
  plugin: true; // Ensure it always indicates a valid plugin
  entry: ( incoming: RoutingIncomingMessage, response: RoutingServerResponse<K> ) => void | Promise<void>; // Handle asynchronous entries
};

export async function listener<K extends RoutingIncomingMessage>( IncomingMessage: RoutingIncomingMessage, ServerResponse: RoutingServerResponse<K> ): Promise<void> {

  // experiment
  if( routing.get( 'plugins' ).length > 0 ){

    const path = new Path();
    const plugin = routing.get( 'plugins' )[ 0 ];

    let cookie_monster: IvyPlugin<K> | undefined = undefined;
    try {
      const plugin_path = path.resolve( process.cwd(), 'node_modules', `@nutsloop/ivy-${plugin}`, 'index.js' );
      cookie_monster = await import( plugin_path );
      if( cookie_monster?.plugin && cookie_monster?.entry && typeof cookie_monster.entry === 'function' ){
        cookie_monster.entry( IncomingMessage, ServerResponse );
      }
      else{
        console.log( cookie_monster );
        console.error( 'Plugin is not a valid Ivy plugin' );
      }
    }
    catch ( error ) {
      console.error( `Failed to load plugin '@nutsloop/ivy-${plugin}':`, error );
    }

  }

  // reset the errors
  ServerResponse.incoming.set( 'error', [] );
  ServerResponse.incoming.set( 'data-error', '' );
  ServerResponse.incoming.set( 'raw-headers', routing.get( 'log-request-headers' ) ? IncomingMessage.headers : {} );

  // fix: in some cases the IncomingMessage is not a valid object or it is undefined.
  if( ! IncomingMessage ){

    ServerResponse.listener_error = true;
    const message = 'IncomingMessage is not a valid object';
    const date = new Date().toISOString();
    process.stderr.write( `${date} ${message}\n` );

    ServerResponse.statusCode = 400;
  }

  if ( typeof IncomingMessage.url !== 'string' ) {
    ServerResponse.listener_error = true;
    const message = 'IncomingMessage.url is not a string';
    const date = new Date().toISOString();
    process.stderr.write( `${date} ${message}\n` );

    ServerResponse.statusCode = 400;
  }

  let url = IncomingMessage.url;
  // double slash in the URL is not allowed
  if( url && url.startsWith( '//' ) ){

    ServerResponse.listener_error = true;
    const message = 'Invalid URL with double slash';
    const date = new Date().toISOString();
    process.stderr.write( `${date} ${message}\n` );

    ServerResponse.statusCode = 400;
  }

  url = IncomingMessage.url || '/';
  const request_host: string = IncomingMessage.headers.host || <string>IncomingMessage.headers[ ':authority' ] || 'UNKNOWN HOST';
  const secure = routing.get( 'secure' );
  const multi_domain = routing.get( 'multi-domain' );

  const is_acme_challenge =
    url.startsWith( '/.well-known/acme-challenge/' ) &&
    routing.get( 'acme-challenge' ) &&
    ! secure;

  if ( ! is_acme_challenge ) {

    const white_listed: string[] = [];
    const redirect_to: string[] = [];
    let domain_config: Domain | undefined = undefined;

    if ( multi_domain && multi_domain.size > 0 && ! ServerResponse.listener_error ) {

      for ( const key of multi_domain.keys() ) {

        if ( key.includes( request_host ) ) {
          domain_config = multi_domain.get( key );
          if( domain_config ){
            white_listed.push( request_host );
            if ( domain_config.redirect_to.length > 0 ) {
              redirect_to.push( domain_config.redirect_to );
            }
          }
          break;
        }
      }

      if ( domain_config ) {
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

  const served_by = routing.get( 'served-by' );
  const served_by_name = routing.get( 'served-by-name' );
  if( served_by && served_by_name ){
    ServerResponse.setHeader( 'served-by', served_by_name );
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

      await ServerResponse.static( url.split( '?' )[ 0 ] );
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
