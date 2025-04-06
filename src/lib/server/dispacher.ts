import type { Routing } from './routing.js';

export interface Domain{
  www_root: string;
  redirect_to: string;
  redirect_to_https: boolean;
}

export type DomainConfig = Map<string[], Domain>;

/**
 * This interface defines the configuration for multi domain setup.
 */
export interface MultiDomainConfig{
  domain_list: DomainConfig;
  callback: ( routing: Routing ) => Promise<void> | void;
}
