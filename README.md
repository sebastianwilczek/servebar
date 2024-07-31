# servebar

[![npm version](https://img.shields.io/npm/v/servebar.svg?style=flat-square)](https://www.npmjs.org/package/servebar)

servebar is a server of static files with support for Handlebars templates.

All files with the `.hbs` extension are served as static HTML using Handlebars. All other files are served as-is.

## Installation

To install servebar, run the following command:

```bash
npm install -g servebar
```

## Usage

Run the following command in the directory you want to serve:

```bash
servebar
```

## Options

Running `servebar` in a directory will serve the files in that directory, without further modification. Handlebars templates are rendered, and partials are included from the `partials` directory, but all variables are empty, and no helpers are included.

To customize the behavior of `servebar`, you can create a `servebar` directory in the directory you want to serve. In this directory, you can create the following files:

- `data.json`: A JSON file with the data to be used in the Handlebars templates.
- `*.js`: Any JavaScript file that exports a function is mounted as a Handlebars helper. The name of the function is used as the name of the helper.

### Example of `data.json`

```json
{
  "title": "My Website",
  "description": "This is my website."
}
```

### Example of a helper

```javascript
const translate = (key) => {
    return `translate("${key}")`;
};

module.exports = translate;
```
