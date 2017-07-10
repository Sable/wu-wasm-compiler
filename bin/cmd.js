#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp');
var concat = require('gulp-concat');
var MultiStream = require('multistream');
var exec = require('child_process').exec;

if (argv._[0] === 'help' || argv.h || argv.help
|| (process.argv.length <= 1 && process.stdin.isTTY)) {
    return fs.createReadStream(__dirname + '/usage.txt')
        .pipe(process.stdout)
        .on('close', function () { process.exit(1) })
    ;
}
//Add core files
var core_files = checkArgs(argv,'c');

//Add libraries files
var libraries = checkArgs(argv,'l');

//add runner files
var runner_files = checkArgs(argv,'r');


//add compile flags files
var compilation_flags = checkArgs(argv,'f');

//Joining files
core_files = core_files.concat(libraries).concat(runner_files).join(" ");
var emscriptenCompilerCmd = `emcc -O2 ${core_files} -s WASM=1 -o wasm.js -s EXPORTED_FUNCTIONS="['_main']"  -s ALLOW_MEMORY_GROWTH=1  `;// --pre-js ${path.join(__dirname,'../runner.js' )} `;

//Append flags
if(argv.f) emscriptenCompilerCmd+= argv.f.join(" ");

//Add include directories
var include_directories = checkArgs(argv,'i');
if(argv.i) emscriptenCompilerCmd = appendPathsWithPrefix(emscriptenCompilerCmd, include_directories, "-I");



var inputs = [];
exec(emscriptenCompilerCmd, function(error, stdout, stderr) {
  // command output is in stdout
  if(error)
  {
        console.log('Error building benchmark:', error);
        process.exit(1);
  }
  inputs.push(path.join(__dirname, '../runner.js'));  
  inputs.push('wasm.js');
  inputs.push(path.join(__dirname, '../exports.js'));
  gulp.src(inputs).pipe(concat("runner.js")||process.stdout).pipe(gulp.dest('./')||process.stdout);
});

function checkArgs(argv,flag)
{
    var arr = [];
    if(argv[flag])
    {
        if (typeof argv[flag] === 'string') {
        arr = [argv[flag]];
        } else {
            arr = argv[flag];
        }
    }
    return arr;    
}

function appendPathsWithPrefix(emsCommand, paths, prefix)
{
    if(paths)
    {
        if(typeof paths == 'string')
        {
                emsCommand = `${emsCommand} ${prefix}${paths} `;
        }else{
            paths.forEach((file)=>{
                emsCommand = `${emsCommand} ${prefix}${file} `;
            });
        }
    }
    return emsCommand;
}

