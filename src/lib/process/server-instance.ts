// MARK: server instantiation.
import type { SpinClusterData } from './main.js';

export async function server_instance( data: SpinClusterData ): Promise<void> {

  const address: string = data.get( 'address' ) || '0.0.0.0';
  const port: number = data.get( 'port' ) || 3001;

  if( data.get( 'https' ) === null || data.get( 'https' ) ){
    const httpsConfig = data.get( 'https' );
    // Convert null to undefined to match the expected type
    const config = httpsConfig === null ? undefined : httpsConfig;

    await ( await import( '../server/type/https.js' ) )
      .https( port, address, config );

  }
  else{

    await ( await import( '../server/type/http.js' ) )
      .http( port, address );
  }
}
