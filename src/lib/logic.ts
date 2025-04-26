import type { CLILogic, ParsedArgv } from '@nutsloop/ivy-input';

import { extends_proto } from '@nutsloop/ivy-ansi';
import { cli, run, set_global_flag_declaration } from '@nutsloop/ivy-input';

import { definition } from './input/definition.js';
extends_proto();

const use_interface: Set<boolean> = new Set();

/**
 * entry point of the server CLI.
 */
export const logic: CLILogic = async ( parsed_argv: ParsedArgv ): Promise<void> => {

  const flag = parsed_argv.get( 'flag' );
  if( use_interface.has( false ) && flag && flag.has( '--exec' ) ){
    throw SyntaxError( '--exec flag is available only when using ivy-server programmatically.\n' +
      'See: https://ivy-server.nutsloop.com/cli.html#exec-flag' );
  }

  await definition().catch( console.error );

  await cli( parsed_argv )
    .catch( console.error );
};

/**
 * entry point of the ivy-server cli.
 */
export async function entry_point( argv: string[] | undefined = undefined, use_interface_switch: boolean = false ): Promise<void> {

  use_interface_switch
    ? use_interface.add( true )
    : use_interface.add( false );

  const global_flag_declaration = new Map();
  global_flag_declaration.set( 'has_global', true );
  global_flag_declaration.set( 'cli_global_identifier_list', [ '--ease', '--ease-cluster' ] );
  global_flag_declaration.set( 'cli_command_identifier_list', [ 'spin', 'cluster' ] );

  set_global_flag_declaration( global_flag_declaration );

  await run( argv || process.argv, logic, 'ivy-server(0)', {
    key_value_pairs_options: true,
    no_warnings: false,
    only_alpha: false,
    parse_json: true,
    show_no_warnings_warn: false,
  } )
    .catch( console.error );
}
