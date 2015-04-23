"use strict";
var state=require('./state'); /// all global variables used
var words=require("./words"); /// name list of all primitive words
var tools=require("./tools"); /// all tool function defined
var constructing=require("./constructing");	/// constructing words for opCodes
var tracing=state.tracing=0;

var forth2op=function(lines){ /// transpile lines of forth codes, return lines of op codes
	var opCodes=state.opCodes=[], defined=global.defined={}, iTok, iCol, line, token;
	var tracing=state.tracing;
	if(tracing) console.log('\ntranspiling:');
	//////////////////////////////////////////////////////////////////////////
	/// transpiling loop to generat opCodes first
	//////////////////////////////////////////////////////////////////////////
	for (var i=0;i<lines.length;i++) {
		state.line=line=lines[i];	/// for each line of forth codes
		state.forthnline=i+1; /// as sorcemap of forth line
		if(tracing) console.log('\tline '+i+' '+JSON.stringify(line)); /// tracing info
		iCol=[],iTok=0,line.replace(/\S+/g,function(tkn,j){iCol[iTok++]=j});//generate iCol for each token
		state.iCol=iCol;
		state.iTok=iTok=0,
		state.tokens=line.trim().split(/\s+/),
		state.tracing=tracing;
		while(tools.checkNextToken()!==undefined){
			state.forthncol=iCol[state.iTok]+1;
			state.at='  at '+iCol[iTok];
			state.cmd=token=tools.nextToken();
			var xt=global.defined[token];
			if (xt) {
				if(tracing)
					tools.showOpInfo(xt.toString().match(/\{(\S+)\}/)[1]);
				state.opCodes.push(xt);
				tools.addMapping(token), state.jsline++;
			} else {
				var w=words[token];
				if (w) {
					xt=w.xt;
					if(w.defining)
						xt(); // execute defining word directly
					else {
						if(tracing)
							tools.showOpInfo(xt.toString().match(/function\s+(\S+)\s+/)[1]);
						state.opCodes.push(xt);
						tools.addMapping(token), state.jsline++;	//assuming only generate one js source line
					}
				} else {
					var n=(parseFloat(token));
					if (isNaN(n)) {
						var M=token.match(/^'(\S*)'$/);
						if (M) {
							var str=M[1];
							if(tracing)
								tools.showOpInfo(JSON.stringify(str));
							state.opCodes.push(str);
							tools.addMapping(token), state.jsline++;
						} else {
							var msg="unknown word:"+token+" at line "+state.forthnline+" col "+state.forthncol;
							console.log(msg);
							throw msg;
						}
					} else {
						if(tracing)
							tools.showOpInfo(n)
						state.opCodes.push(n);
						tools.addMapping(token), state.jsline++;
					}
				} // end if (w)
			} // end if (def)
		} // end while (tools.checkNextToken({tokens:tokens,iTok:iTok,iCol:iCol,tracing:tracing})!==undefined)
	}
	return state.opCodes;
}
var transpilejs=function(forthCodes,runtime,inputfn,outputfn) {
	if(typeof(forthCodes)=='string') forthCodes=forthCodes.split(/\r?\n/);
// forthCodes: forth source codes in lines (an array)
//    runtime: the source code of predefined runtime enviroment
//    inputfn: the file name of forth source codes
//   outputfn: the file name of javascript source codes
	if(state.tracing>1) console.log('\nforthCodes:',JSON.stringify(forthCodes));
	state.inputfn=inputfn, state.outputfn=outputfn;
	var lines=state.lines=forthCodes;
	var tokens=state.tokens=[], opCodes=state.opCodes=[], defined=global.defined={}, iCol=state.iCol=[];
	state.iLin=0, state.iTok=0, state.iOpCode=0;
	var line='', token, opCode;
	state.jsline=runtime.length;     //generated javascript code line count, for source map
	var codegen=state.codegen=[];                //generated javsacript code
	var forthnline=0,forthncol=0;  //line and col of forth source code

	var opCodes=state.opCodes=forth2op(lines);
	if(tracing>1){
		console.log('opCodes:'); var n=runtime.length+1;
		opCodes.forEach(function(f,i){
			var s=f.toString(), m=s.match(/function\s?(\S*\(\))\s*\{([^}]+)/), n=i+runtime.length+1;
			console.log((n<10?'0':'')+n+' '+(m?m[1]==='()'?m[2]:m[1]:JSON.stringify(s)));
		})
	}
	var iOpCode=0;

	//////////////////////////////////////////////////////////////////////////
	/// transpiling loop to generat jsCodes next
	//////////////////////////////////////////////////////////////////////////
	while(iOpCode<opCodes.length){
		var opCode=opCodes[iOpCode];
		if (typeof opCode=="function") {
			opCode();
		} else {
			state.iOpCode=iOpCode;
			constructing._doLit(opCode,opCodes[iOpCode+1]);
			iOpCode=state.iOpCode;
		}
		iOpCode++;
	}
return {jsCodes:state.codegen,sourcemap:state.sourcemap,opCodes:state.opCodes};
}

var runtimecode=require("./runtime");
var Transpile={};
Transpile.transpile=function(forth) {
	tools.newMapping();
	if(typeof forth==='string')
		forth=forth.split(/\r?\n/);
	forth.forEach(function(line){
		if(typeof window==='undefined')
			line=chalk.bold.green(line);
		console.log('trans <-- '+line);
	});
	var jsCodes=transpilejs(forth,runtimecode,"test").jsCodes
	var jsCode=jsCodes.map(function(line,i){
		return '/* '+sourcemap._names._array[i]+' */ '+line;
	});
	jsCode=tools.pretty(jsCode.join('\n'));
	var code =	runtimecode.join('\n')	+"\n"
			 +	"(function(runtime){"	+"\n"
			 +	jsCode					+"\n"
			 +	"runtime.out=_out;"		+"\n"
			 +	"return runtime;"		+"\n"
			 +	"})(runtime)";
	return code;
}

Transpile.runcode=function(jsCode) {
	console.log(tools.pretty(jsCode));
	if(tracing) console.log('jsCode:\n'+jsCode)
	if(tracing>1) console.log('code:\n'+code)
	try {
		var res=eval(code);
		if(tracing) console.log('\nresult stack: '+JSON.stringify(res.stack)+'\n');
		if(res.out){
			var T=res.out.split(/\r?\n/).filter(function(t){return t}).map(function(t){
				var m,n; m=n=0;
				t=t.replace(/\S+/g,function(tkn,col){
					var x='';
					if(col-m>=68)
						x+='\n',m=n;
					else
						n=col;
					return x+tkn
				});
				return t;
			});
			T=T.join('\n').split('\n').map(function(t){
				if(typeof window==='undefined')t=chalk.bold.yellow(t);
				return 'trans --> '+t
			}).join('\n');
			console.log(T);
		}
	}
	catch(e) { console.log(e) }
	return res;
}
Transpile.trace=function(flag){
	tracing=flag;
}
if(typeof window==='undefined'){
	var chalk=require('chalk');
	global.Transpile=Transpile;
} else {
	window.Transpile=Transpile;
}
module.exports=Transpile;

