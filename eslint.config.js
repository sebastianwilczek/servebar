const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    "languageOptions": {
      "ecmaVersion": "latest",
      "sourceType": "commonjs",
      "globals": {
        ...globals.node
      }
    },
    "files": [
      "**/*.js"
    ],
    "rules": {
      "indent": [
        "error",
        2
      ],
      "linebreak-style": [
        "error",
        "unix"
      ],
      "quotes": [
        "error",
        "double"
      ],
      "semi": [
        "error",
        "always"
      ]
    }
  }
];
