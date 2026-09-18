tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Newsreader"', '"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#F5F5F2',  // page background, a cool gypsum grey
        surface: '#FFFFFF', // cards, header, panels
        well: '#ECEDE9',    // wells behind product drawings
        ink: '#1B1E22',     // text and primary buttons
        muted: '#5A6069',   // secondary text
        steel: '#274C77',   // the one accent: galvanised-steel blue
        tint: '#E4EAF1',    // steel wash for the partner portal
        // Status and material colours
        dusk: '#4F6D8F',
        ochre: '#B7862C',
        sage: '#4E7A55',
        brick: '#A8432F',
      },
      maxWidth: {
        page: '1360px',
      },
    },
  },
};
