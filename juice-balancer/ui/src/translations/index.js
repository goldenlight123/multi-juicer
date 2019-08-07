export default [
  {
    flag: '🇬🇧',
    name: 'English',
    key: 'en',
    messageLoader: () => Promise.resolve({ default: {} }),
  },
  {
    flag: '🇩🇪',
    name: 'German',
    key: 'de-DE',
    messageLoader: () => import('./de-DE'),
  },
];
