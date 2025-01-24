import { set_cli_info_specification } from '@ivy-industries/input';

import { globals } from './command/global/index.js';
import { spin_cluster } from './command/spin|cluster/index.js';

/**
 * Defines the server CLI and sets all the defined commands and flags.
 */
export async function definition(): Promise<void> {

  // todo: set the global specification version for every commit
  set_cli_info_specification( {
    description: 'nutsloop ivy-server',
    github: 'https://github.com/nutsloop/ivy-server.js',
    name: 'ivy-server',
    npmjs: 'https://www.npmjs.com/~nutsloop',
    usage: 'ivy-server [--global-flag=[options]] <command> [--flag=[options]]',
    version: '1.0.0-alpha.20',
    website: 'https://github.com/sponsors/nutsloop'
  } );

  // set the global flags
  await globals();

  // spin cluster commands
  await spin_cluster();
}
