module.exports = {
  rootDir: './',
  projects: ['<rootDir>'],
  verbose: true,
  testURL: 'http://localhost:8008/',
  setupFiles: ['<rootDir>/tests/setupJest.js'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  moduleNameMapper: {
    // Jest doesn't care about styles, twig, images, fonts, etc
    '\\.(twig|md|yml|yaml|css|scss|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/tests/unit/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
