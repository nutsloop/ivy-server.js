export function destructuring_certs_path( certs_path: Map<'cert'|'dhparam'|'key', string> ): IterableIterator<string> | string[]{

  return certs_path?.values() ||
  [ `${process.cwd()}/certs/key.pem`, `${process.cwd()}/certs/cert.pem`, `${process.cwd()}/certs/dhparam.pem` ];
}
