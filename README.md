# forthtranspiler
Forth to Javascript Transpiler

convert forth Source code to Javascript with source mapping and unit testing support

    npm i -g browserify watchify 
    watchify index.js -v -o bundle.js
    
    npm i -g mocha
	mocha --watch