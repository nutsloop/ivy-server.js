export function uint8( data: number | string ): Promise<Uint8Array> {

  return new Promise( ( resolve, reject ) => {

    if ( typeof data === 'string' ) {
      const utf8encoder = new TextEncoder();
      resolve( utf8encoder.encode( data ) );
    }
    else if ( typeof data === 'number' ) {

      if ( data < 0 || data > 255 || ! Number.isInteger( data ) ) {
        reject( 'Number must be an integer within the range of 0 to 255' );
      }

      resolve( new Uint8Array( [ data ] ) );
    }
    else {
      reject( new TextEncoder().encode( 'Invalid data type' ) );
    }
  } );
}
