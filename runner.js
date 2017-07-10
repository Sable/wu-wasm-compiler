  try{
    var Module = require('./c-wasm.js');
  }catch(e)
  {
    //yolo
  }
  // var mod = (em_module)?em_module:Module;
  var Module = {};
  //Module.arguments = ['-s','11'];
  Module.noInitialRun = true;
  function runner(args)
  {
    args = Array.from(arguments); 
    return new Promise(function(resolve,reject)
    {
      var argo = prepareArgs(args); 
      setTimeout(function() {
          resolve(Module.callMain(convertToString(args)));
          // var mod = (em_module)?em_module:Module;
          // if(mod)resolve(Module.ccall('mainFunc','number',argo.types, argo.vals));
          // else reject('error');
    }, 5000);
    });   
  }

  function prepareArgs(args)
  {
    var argTypes = [];
    var argVals = [];
    args.forEach(function(element) {
      if(typeof element=='string')
      {
        argTypes.push('string');        
        argVals.push(element);
      }else if(typeof element=='number'){
        argTypes.push('number');
        argVals.push(element);
      }
    });
    return {vals:argVals,types:argTypes};
  }
  function convertToString(args)
  {
    return args.map(function(element){
      return String(element);
    });
  }
