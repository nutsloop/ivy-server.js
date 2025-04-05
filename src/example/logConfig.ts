import { Path } from '@nutsloop/ivy-cross-path';
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
  // example on how to pass the arguments to the init function based on init_args.
  init: async ( string: string, number: number ) => {

    // showing the way to pass the arguments to the init function.
    console.log( string, number );

    const log_directory = await path.isValid( log_path ).catch( () => false );

    if( log_directory === false ) {
      await path.mkdir( log_path ).catch( ( error ) => {
        process.stderr.write( error.message );
        process.exit( 1 );
      } );
    }
  },
  // example on how to pass the arguments to the init function.
  init_args: [ 'args example for the logConfig init function', 42 ]
};

export default logConfig;
