const path = require('path');
const ejsToJs = require('./ejs-to-js');
const minifier = require('./minify');

let rootDir = path.resolve(__dirname, '../');
let publicDir = rootDir + '/public';


console.log("Converting ejs to Js");
const convert = ejsToJs(rootDir + '/views', rootDir + '/public/build');

console.log("BUILD STARTED");

async function build() {
    const minifyEjsFiles = await minifier(publicDir + '/build');
    
    const minifyJsFiles = await minifier(publicDir + '/js');
    
    const minifyCssFiles = await minifier(publicDir + '/css');
    
    console.log("---- BUILD SUCCESS -----");
}


build();