//@ts-expect-error @allowed
import blessed from 'blessed';

const screen = blessed.screen( { smartCSR: true } );

const logBox = blessed.box( {
  label: 'Connections',
  border: { type: 'line' },
  scrollable: true,
  alwaysScroll: true,
  style: {
    fg: 'white',
    border: { fg: 'cyan' }
  }
} );

screen.append( logBox );
screen.render();

screen.key( [ 'q', 'C-c' ], () => process.exit( 0 ) );

function addClientLog( text: string ) {
  logBox.pushLine( text );
  logBox.setScrollPerc( 100 );
  screen.render();
}

export { addClientLog, screen };
