"use strict";
var state=require('./state');
//////////////////////////////////////////////////////////////////////////
/// tools
//////////////////////////////////////////////////////////////////////////
var tools={};
var token;
tools.checkNextToken=function(){
	var tokens=state.tokens, iTok=state.iTok, iCol=state.iCol, j;
	token=undefined;
	if(iTok<tokens.length)
		token=tokens[iTok];
	return token;
}
tools.nextToken=function(){
	var tokens=state.tokens, iTok=state.iTok, iCol=state.iCol, j;
	token=undefined;
	if(iTok<tokens.length){
		token=tokens[iTok];
		if(state.tracing>1){
			j=iCol[iTok];
			console.log('\tcol '+(j<10?'0':'')+j+' token '+iTok+': '+JSON.stringify(token));
		}
		state.iTok=iTok+1;
	}
	return token;
}
tools.showOpInfo=function(msg){
	if(state.tracing) console.log('\t'+state.at+' '+JSON.stringify(state.cmd)+(msg?'\n\t\t\topCodes '+state.opCodes.length+': '+msg:''));
}
tools.pretty=function(jsCode,addLineNo){				// jsCode is an array of strings
	if(typeof jsCode==='string')
		jsCode=jsCode.trim().split(/\s*\r?\n\s*/);	// if jsCode is string, breaks into lines
	var indent='';
	return jsCode.map(function(L,i){				// each line L could include \n
		if(addLineNo){
			var no=i.toString();
			no=('0'.substr(0,2-no.length)+no);		// 2-digit
			L='/*'+no+'*/ '+L;
		}
	    return L;
	}).join('\n').replace(/(\/\*\d+\*\/)?([^\r\n]+)/g,function(line,i){
		var m=line.match(/(\/\*\d+\*\/)?([^\r\n]+)/), m1=m[1]||'    ', m2=m[2];
		if(m2.match(/^\s*(\}|\))/)){
			indent=indent.substr(0,indent.length-2);
		}
		line=m1+indent+m2.replace(/\t/g,'\\t');
		if(m2.match(/(\{|\()\s*(\/\/.*)?$/)){
			indent+='  '
	    }
	    return line;
	});
}
var SourceMapGenerator=require("source-map").SourceMapGenerator;

var sourcemap=new SourceMapGenerator({file:state.outputfn||state.inputfn+"js"});
tools.addMapping=function(name) {
	//console.log(name,codegen.length+1,forthnline,forthncol)
	sourcemap.addMapping({
	  generated: {
	    line: state.jsline,
	    column: 1
	  },
	  source: state.inputfn,
	  original: {
	    line: state.forthnline,
	    column: state.forthncol
	  },
	  name: name
	});
}
module.exports=tools;