import { Path } from '@ivy-industries/cross-path';
import { writeFile } from 'fs/promises';

// @ts-expect-error: @allowed
import type { LogConfig } from './index.js';

const path = new Path();
const log_path = path.resolve( ...[ process.cwd(), 'log' ] );
const log_filename = `${log_path}/log.txt`;

const logConfig: LogConfig = {
  callback: async ( log: string[] ): Promise<void> => {
    await writeFile( log_filename, `${log.join( '|' )}\n`, {
      flag: 'a'
    } ).catch( ( error ) => {
      process.stderr.write( error.message );
      process.exit( 1 );
    } );
  },
  init: async () => {
    const log_directory = await path.isValid( log_path ).catch( () => false );
    if( log_directory === false ) {
      await path.mkdir( log_path ).catch( ( error ) => {
        process.stderr.write( error.message );
        process.exit( 1 );
      } );
    }
  }
};

export default logConfig;
