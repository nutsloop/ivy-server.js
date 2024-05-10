// @ts-expect-error: @allowed
import type { ControlRoomConfig } from './';

const config: ControlRoomConfig = {
  hostname: '10.0.0.2',
  port: parseInt( '5666' )
};

export default config;
