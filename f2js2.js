var fs=require("fs");

var argv=process.argv;
if (argv.length<3) {
	console.log("missing input filename");
	return;
}
var inputfn=argv[2];
var input=fs.readFileSync(inputfn,"utf8").replace(/\r\n/g,"\n").split("\n");

//forth runtime
var outputfn=argv[2].substr(0,argv[2].length-1)+"js";


var transpile=require("./src/transpile").transpile;

var generated=transpile(input,inputfn,outputfn);


var output=generated.js+"\n//# sourceMappingURL="+outputfn+".map";

console.log("output to "+outputfn);
fs.writeFile(outputfn,output,"utf8");
fs.writeFile(outputfn+".map",generated.sourcemap.toString() ,"utf8");