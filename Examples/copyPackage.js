const path = require('path');
const fs = require('fs-extra');
const rimraf = require('rimraf');

function copy(source, destination) {
  console.log(`Cleaning "${destination}"`);
  rimraf(destination, () => {
    console.log(`Copying "${source}" to "${destination}"`);
    fs.copy(source, destination, (err) => {
      if (err) console.error(err);
    });
  });
}

copy(
  '../src',
  'node_modules/react-navigation-fluid-transitions/src',
);

copy(
  '../index.js',
  'node_modules/react-navigation-fluid-transitions/index.js',
);
