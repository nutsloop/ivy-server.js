import { EventEmitter } from 'node:events';

export const ServerEvent = new EventEmitter( {
  captureRejections: true
} );
