module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
  },
  'extends': 'airbnb',
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module',
  },
  'globals': {
    'chrome': false,
  },
  'rules': {
    'max-len': 'off',
    'no-use-before-define': 'off',
    'arrow-body-style': 'off',
    'object-shorthand': 'off',
    'no-console': 'error',
    'jsx-a11y/label-has-for': ['error', {
      'components': ['Label'],
      'required': {
        'some': ['nesting', 'id'],
      },
      'allowChildren': false,
    }],
    'react/prop-types': 'off',
  },
};
