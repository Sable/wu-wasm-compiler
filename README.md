# wu-wasm-compiler

The wu-wasm-compiler uses Emscripten to compile LLVM code to WASM. This process happens by initially  using clang, to compile a source language like c, c++  to LLVM,and then using the emscripten compiler.
 Make sure Emscripten is installed and globally available via `$emcc `.

For more information follow: [Emscripten - Getting Started](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) 
