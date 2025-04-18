import { readFile } from 'node:fs/promises';

import { catcher } from '../exception/catcher.js';

export async function destructuring_certs_path(
  certs_path: Map<'cert' | 'dhparam' | 'key', string> | undefined,
): Promise<Buffer<ArrayBufferLike>[]> {

  const defaults = [
    `${process.cwd()}/certs/key.pem`,
    `${process.cwd()}/certs/cert.pem`,
    `${process.cwd()}/certs/dhparam.pem`
  ];

  const certs_paths = Array.from( certs_path?.values?.() || defaults );

  const [ key_path, cert_path, dhparam_path ] = certs_paths;

  const [ key, cert, dhparam ] = await Promise.all( [
    readFile( key_path ).catch( catcher ),
    readFile( cert_path ).catch( catcher ),
    readFile( dhparam_path ).catch( catcher )
  ] );

  const error_messages = [
    key instanceof Error ? key.message.red() : `${key_path} found`.green(),
    cert instanceof Error ? cert.message.red() : `${cert_path} found`.green(),
    dhparam instanceof Error ? dhparam.message.red() : `${dhparam_path} found`.green()
  ];

  if ( key instanceof Error || cert instanceof Error || dhparam instanceof Error ) {
    throw new Error( `secure server couldn't start because of certificates:\n\n${error_messages.join( `\n${'-'.repeat( 120 ).white()}\n` )}\n` );
  }

  return [ key, cert, dhparam ];
}
