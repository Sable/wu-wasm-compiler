#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

var gulp = require('gulp');
var concat = require('gulp-concat');
var exec = require('child_process').exec;

if (argv._[0] === 'help' || argv.h || argv.help
|| (typeof argv.c === 'undefined' && typeof argv.r === 'undefined')
|| (process.argv.length <= 1 && process.stdin.isTTY)) {
    return fs.createReadStream(__dirname + '/usage.txt')
        .pipe(process.stdout)
        .on('close', function () { process.exit(1) });
}
//Add core files
var core_files = checkArgs(argv,'c') || [];
core_files  = core_files.concat(checkArgs(argv,'r'));
//Add Include directories
var include_directories = checkArgs(argv,'i');

//Add libraries files
var libraries = checkArgs(argv,'l');

//add precompiled files
var precompiled_files = checkArgs(argv,'p');

//get compilation flags
var compilation_flags = checkArgs(argv,'f');

//Joining files
core_files = core_files.concat(libraries).join(" ");
var emscriptenCompilerCmd = `emcc -O2 ${core_files} -W  -s ASSERTIONS=1 -s WASM=1 -o c-wasm.js -s EXPORTED_FUNCTIONS="['_main']"  -s ALLOW_MEMORY_GROWTH=1 `;// --pre-js ${path.join(__dirname,'../runner.js' )} `;
//if(argv.m) emscriptenCompilerCmd+= ` -s TOTAL_MEMORY=${argv.m} `;


//Append include directories
emscriptenCompilerCmd = appendPathsWithPrefix(emscriptenCompilerCmd, include_directories, "-I");

//Append compilation flags 
emscriptenCompilerCmd = appendCompilationFlags(emscriptenCompilerCmd, compilation_flags);

//Append precompiled files
emscriptenCompilerCmd = appendFilePathsWithPrefix(emscriptenCompilerCmd, precompiled_files, "--preload-file ");

var inputs = [];
exec(emscriptenCompilerCmd, function(error, stdout, stderr) {
  // command output is in stdout
  if(error)
  {
        console.log('Error compiling to WASM: ', error);
        process.exit(1);
  }
  inputs.push(path.join(__dirname, '../runner.js'));  
  inputs.push('c-wasm.js');
  inputs.push(path.join(__dirname, '../exports.js'));
  gulp.src(inputs).pipe(concat(argv.o)||process.stdout).pipe(gulp.dest('./')||process.stdout);
});

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

function appendCompilationFlags(emsCommand, flags)
{
    if(flags)
    {
        if(typeof flags == 'string')
        {
                emsCommand = `${emsCommand} ${flags} `;
        }else{
            flags.forEach((flag)=>{
                flag = (flag === 'c99')? '-std=c99':flag;
                emsCommand = `${emsCommand} ${flag} `;
            });
        }
    }
    return emsCommand;
}

function checkArgs(argv,flag)
{
    var arr;
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

function appendFilePathsWithPrefix(emsCommand, paths, prefix)
{
    if(paths)
    {
        if(typeof paths == 'string')
        {
                //var filename = paths.substring(paths.lastIndexOf('/')+1,paths.length);
                emsCommand = `${emsCommand} ${prefix}${paths}@${paths} `;
        }else{
            paths.forEach((file)=>{
                //var filename = file.substring(file.lastIndexOf('/')+1,file.length);
                emsCommand = `${emsCommand} ${prefix}${file}@${file} `;
            });
        }
    }
    return emsCommand;
}