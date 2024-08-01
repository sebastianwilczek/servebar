#!/usr/bin/env node
import { engine } from "express-handlebars";
import express from "express";
import open from "open";
import fs from "fs";

// Use current directory as the templates directory
const templatesDir = process.cwd();

const servebarDir = "servebar";
const servebarPath = `${templatesDir}/${servebarDir}`;
const servebarDataFileName = "data.json";
const servebarDataFilePath = `${servebarPath}/${servebarDataFileName}`;
const partialsDir = "partials";

// Check if servebar data file exists
const servebarDataFileExists = fs.existsSync(servebarDataFilePath);
if (!servebarDataFileExists) {
  console.warn("\nNo servebar data file found in the servebar directory. Handlebars templates will not be filled with data.");
  console.warn("To serve Handlebars templates, a servebar data JSON file is required in the servebar directory.");
  console.warn("Please create a file named 'data.json' in the 'servebar' directory.");
}

// Read data from servebar data file
const data = servebarDataFileExists ? JSON.parse(fs.readFileSync(servebarDataFilePath)) : {};

// Get all hbs files in the current directory
const templates = []

// Recursively search for hbs files
const searchForHbsFiles = (path) => {
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    const filePath = `${path}/${file}`;
    if (fs.lstatSync(filePath).isDirectory() && !filePath.includes(servebarDir) && !filePath.includes(partialsDir)) {
      searchForHbsFiles(filePath);
    }
    if (filePath.endsWith(".hbs")) {
      templates.push(filePath.replace(`${templatesDir}/`, ""));
    }
  });
};

searchForHbsFiles(templatesDir);

if (templates.length === 0) {
  console.warn("\nNo Handlebars templates found in the current directory. Files will be served statically.");
} else {
  console.log("\nRegistering the following templates:");
  templates.forEach((template) => console.log(`- ${template}`));
}

const app = express();
const port = 3000;

app.engine(".hbs", engine({
  extname: "hbs",
  partialsDir,
  defaultLayout: false,
}));
app.set("view engine", ".hbs");
app.set("views", templatesDir);

(async () => {
  let helpers = [];
  // Check if helpers directory exists
  if (!fs.existsSync(servebarPath)) {
    console.warn("\nNo servebar directory found. No helpers will be registered.");
  } else {
    helpers = await Promise.all(
      fs.readdirSync(servebarPath)
        .filter((file) => file.endsWith(".js"))
        .map(async (helper) => {
          const { default: helperFunction } = await import(`${servebarPath}/${helper}`);
          return helperFunction;
        })
      );
  }

  if (helpers.length === 0) {
    console.warn("\nNo Handlebars helpers found in the current directory. No helpers will be registered.");
  } else {
    console.log("\nRegistering the following helpers:");
  }

  // Map helper functions to be functions of an object
  const helperFunctions = {};
  helpers.forEach((helper) => {
    console.log(`- ${helper.name}`);
    helperFunctions[helper.name] = helper;
  });

  const dataWithHelpers = {
    ...data,
    helpers: helperFunctions,
  };

  const registerView = (viewName, asIndex) => {
    app.get(`/${asIndex ? viewName.replace("index", "") : viewName}`, (req, res) => {
      res.render(viewName, dataWithHelpers);
    });
    // Register view with .html extension
    if (!asIndex) {
      app.get(`/${viewName}.html`, (req, res) => {
        res.render(viewName, dataWithHelpers);
      });
    }
  };

  // Register all templates
  templates.forEach((view) => {
    const viewName = view.replace(".hbs", "");
    registerView(viewName);
    if (viewName.endsWith("index")) {
      registerView(viewName, true);
    }
  });

  // Serve all other files statically
  app.use(express.static(templatesDir));

  app.listen(port, async () => {
    console.log(`\nServing Handlebars at port ${port}.\n`);
    await open(`http://localhost:${port}`);
  });
})();
