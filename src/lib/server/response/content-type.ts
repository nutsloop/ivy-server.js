export type ContentTypeFileExt = '.cjs' |
  '.css' |
  '.gif' |
  '.htm' |
  '.html' |
  '.ico' |
  '.jpeg' |
  '.jpg' |
  '.js' |
  '.json' |
  '.md' |
  '.mjs' |
  '.mp4' |
  '.png' |
  '.svg' |
  '.txt' |
  '.wav' |
  '.webapp' |
  '.webm' |
  '.webmanifest' |
  '.webp' |
  '.woff' |
  '.woff2' |
  '.xml';

type ContentType = Map< ContentTypeFileExt, string>;
export const CONTENT_TYPE: ContentType = new Map( [
  [ '.cjs', 'text/javascript' ],
  [ '.css', 'text/css' ],
  [ '.gif', 'image/gif' ],
  [ '.htm', 'text/html' ],
  [ '.html', 'text/html' ],
  [ '.ico', 'image/x-icon' ],
  [ '.jpeg', 'image/jpeg' ],
  [ '.jpg', 'image/jpg' ],
  [ '.js', 'text/javascript' ],
  [ '.json', 'application/json' ],
  [ '.md', 'text/markdown' ],
  [ '.mjs', 'text/javascript' ],
  [ '.mp4', 'video/mp4' ],
  [ '.png', 'image/png' ],
  [ '.svg', 'image/svg+xml' ],
  [ '.txt', 'text/plain' ],
  [ '.wav', 'audio/wav' ],
  [ '.webapp', 'application/x-web-app-manifest+json' ],
  [ '.webm', 'video/webm' ],
  [ '.webmanifest', 'application/manifest+json' ],
  [ '.webp', 'image/webp' ],
  [ '.woff', 'font/woff' ],
  [ '.woff2', 'font/woff2' ],
  [ '.xml', 'text/xml' ],
] );
