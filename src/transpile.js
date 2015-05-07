"use strict";
if(typeof module==='object'){
	var state=require('./state'); /// all global variables used
	var words=require("./words"); /// name list of all primitive words
	var tools=require("./tools"); /// all tool function defined
	var constructing=require("./constructing");	/// constructing words for opCodes
}
state.tracing=0;

var forth2op=function(lines){ /// transpile lines of forth codes, return lines of op codes
	var opCodes=state.opCodes=[], defined=global.defined={}, iCol, iTok, line, token;
	if(state.tracing) console.log('\ntranspiling:');
	//////////////////////////////////////////////////////////////////////////
	/// transpiling loop to generat opCodes first
	//////////////////////////////////////////////////////////////////////////
	for (var i=0;i<lines.length;i++) {
		state.line=line=lines[i];	/// for each line of forth codes
		if(line==='')continue;
		state.forthnline=i+1; /// as sorcemap of forth line
		if(state.tracing) console.log('\tline '+i+' '+JSON.stringify(line)); /// tracing info
		iCol=[], iTok=0;
		line.replace(/\S+/g,function(tkn,j){
			iCol[iTok++]=j;
		});//generate iCol for each token
		state.iCol=iCol;
		state.iTok=0, state.tokens=line.trim().split(/\s+/);
		while(tools.checkNextToken()!==undefined){
			state.forthncol=iCol[state.iTok]+1;
			state.at='  at '+iCol[state.iTok];
			state.cmd=token=tools.nextToken();
			var xt=global.defined[token];
			if (xt) { //// 待查01 words 之外定義的 暫緩
				if(state.tracing)
					tools.showOpInfo(xt.toString().match(/\{(\S+)\}/)[1]);
				state.opCodes.push(xt);
				tools.addMapping(token), state.jsline++;
			} else {
				var w=words[token];
				if (w) {
					xt=w.xt;
					if(w.defining)
						xt(); ////  待查02 defining words 問題大大
					else { ///  一般 words
						if(state.tracing)
							tools.showOpInfo(xt.toString().match(/function\s+(\S+)\s+/)[1]);
						state.opCodes.push(xt);
						tools.addMapping(token), state.jsline++;	//assuming only generate one js source line
					}
				} else {
					var n=(parseFloat(token));
					if (isNaN(n)) {
						var M=token.match(/^'(\S*)'$/);
						if (M) { //  單引號不含空格的字串
							var str=M[1];
							if(state.tracing)
								tools.showOpInfo(JSON.stringify(str));
							state.opCodes.push(str);
							tools.addMapping(token), state.jsline++;
						} else { 
							var msg="unknown word:"+token+" at line "+state.forthnline+" col "+state.forthncol;
							console.log(msg);
							throw msg;
						}
					} else { //  數字
						if(state.tracing)
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
var op2js=function(opCodes){
	//////////////////////////////////////////////////////////////////////////
	/// transpiling loop to generat jsCodes next
	//////////////////////////////////////////////////////////////////////////
	state.iOpCode=0;
	while(state.iOpCode<opCodes.length){
		var opCode=opCodes[state.iOpCode]; 
		if (typeof opCode=="function") opCode();
		else constructing._doLit(opCode,opCodes[state.iOpCode+1]);
		state.iOpCode++;
	}
	return state.codegen;
}
var showOpCode=function(opCodes, runtime){
	console.log('opCodes:'); var n=runtime.length+1;
	opCodes.forEach(function(f,i){
		var s=f.toString(), m=s.match(/function\s?(\S*\(\))\s*\{([^}]+)/), n=i+runtime.length+1;
		console.log((n<10?'0':'')+n+' '+(m?m[1]==='()'?m[2]:m[1]:JSON.stringify(s)));
	})
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
	state.jsline=runtime.length;   //generated javascript code line count, for source map
	var codegen=state.codegen=[];                //generated javsacript code
	var forthnline=0,forthncol=0;  //line and col of forth source code
	var opCodes=state.opCodes=forth2op(lines);
	if(state.tracing>1) showOpCode(opCodes, runtime);
	var jsCodes=op2js(opCodes);
	return {jsCodes:jsCodes,sourcemap:state.sourcemap,opCodes:opCodes};
}

var runtimecode=require("./runtime");
var Transpile={};
Transpile.transpile=function(forth,inputfn,outputfn) {
	if(typeof module==='object')tools.newMapping();
	if(typeof forth==='string')
		forth=forth.trim().split(/\r?\n/);
	forth.forEach(function(line){
		if(typeof window==='undefined')
			line=chalk.bold.green(line);
		console.log('// trans <-- '+line);
	});
	var test=transpilejs(forth,runtimecode,inputfn);
	var jsCodes=test.jsCodes;
	var sourcemap=test.sourcemap;
	var jsCode=jsCodes.map(function(line,i){
		var x=typeof sourcemap==='object'?('/* '+sourcemap._names._array[i]+' */ '):'';
		return x+line;
	});
	jsCode=tools.pretty(jsCode.join('\n'));
	var code =	runtimecode.join('\n')	+"\n"
			 +	"(function(runtime){"	+"\n"
			 +	jsCode					+"\n"
			 +	"runtime.out=_out;"		+"\n"
			 +	"return runtime;"		+"\n"
			 +	"})(runtime)";
	if(state.tracing>1)console.log('\njsCodes:\n'+code)
	return {js:code, sourcemap:sourcemap};
}
Transpile.trace=function(flag){
	state.tracing=flag;
}
if(typeof module==='object'){
	var chalk=require('chalk');
	module.exports=Transpile,
	global.Transpile=Transpile;
} else {
	window.Transpile=Transpile; // 
}