var Transpile	=require("../src/transpile.js");
var transpile	=Transpile.transpile;
var trace		=Transpile.trace;
var chalk		=require('chalk');
var tinyCLI=function tinyCLI(){
	var readline = require('readline');
	var rl = readline.createInterface(process.stdin, process.stdout);
	rl.setPrompt('>');
	rl.prompt();
	rl.on('line', function(line) {
	  switch(line.trim()) {
	    case 'hello':
	      console.log('world!');
	      break;
	    default:
		  try{transpile(line);}
		  catch(e){console.log(chalk.bold.yellow(e))}
	      break;
	  }
	  rl.prompt();
	}).on('close', function() { // pressing ^C will exit this tinyCLI
	  console.log('Have a great day!');
	  process.exit();
	});
}
tinyCLI();