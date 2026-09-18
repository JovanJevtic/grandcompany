tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        // Display: heavy grotesk set in caps, the way the Ponos cover is set
        display: ['"Montserrat"', 'Impact', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        script: ['"Pinyon Script"', 'Georgia', 'serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
      },
      colors: {
        canvas: '#F1ECE4',  // gypsum cream, the page ground
        surface: '#FBF8F3', // cards and panels, a shade warmer than the page
        well: '#E6E0D5',    // wells behind product drawings
        ink: '#191817',     // text
        deep: '#262320',    // the dark sections
        deeper: '#100F0E',  // footer and cover overlays
        muted: '#6B655D',   // secondary text
        line: '#191817',    // hairlines (used at low opacity)
        steel: '#274C77',   // partner prices and B2B signals
        tint: '#E2E7EE',    // steel wash
        // Material and status colours
        ochre: '#A8792A',
        sage: '#4E7A55',
        brick: '#A8432F',
      },
      maxWidth: {
        page: '1440px',
        text: '62ch',
      },
      letterSpacing: {
        label: '0.14em',
      },
    },
  },
};
