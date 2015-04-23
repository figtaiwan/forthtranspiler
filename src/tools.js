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
var spaces=function(n){
	var t=''; while(n--)t+=' ';
	return t;
}
tools.pretty=function(jsCode){				// jsCode is an array of strings
	if(typeof jsCode==='string')
		jsCode=jsCode.trim().split(/\s*\r?\n\s*/);		// if jsCode is string, breaks into array of strings
	var indent='', maxIndent='';
	var M=0;
	jsCode=jsCode.map(function(line,i){
		var m,m1,m2,m3,m4;
		m=line.match(/^\/\*.+?\*\//);
		if(m){
			m=line.match(/^(\/\* \d\d )(.+?)( \*\/)/);
			m1=m[1], m2=m[2], m3=m[3], m4=line.substr(m[0].length);
			var t=indent+m2, n=t.length;
			if(M<n)M=n;
		//	console.log('"'+line+'"',n,M)
		} else m4=line;
		m4=' '+m4.trim().replace(/\n\s*/g,function (t){
			return t+indent+' '; /////////////////// need debugging 
		});
		if(m4.match(/^\s*(\}|\))/)){
			indent=indent.substr(0,indent.length-2);
		}
		line=indent+m4.replace(/\t/g,'\\t');
		if(m)
			line=m1+t+m3+line;
		if(m4.match(/(\{|\()\s*(\/\/.*)?$/)){
			indent+='  ';
			if(indent.length>maxIndent.length)maxIndent=indent;
	    }
	    return line;
//	}).replace(/(\/\* \d\d )?(.+?)?( \*\/)?([^\r\n*/]+)/g,function(m,m1,m2,m3,m4){
	})
	jsCode=jsCode.join('\n');
	jsCode=jsCode.replace(/((\/\* \d\d )(.+?)( \*\/))?([^\r\n*/]+)/g,function(m,m1,m2,m3,m4,m5){
		if(!m1)
			return spaces(M+9)+m5;
		return m2+m3+spaces(M-m3.length)+m4+m5;
	})
	return jsCode;
}
if (typeof window!=="undefined") {
	tools.newMapping=function(){};
	tools.addMapping=function(){};
} else {
	var SourceMapGenerator=require("source-map").SourceMapGenerator;

	tools.newMapping=function() {
		global.sourcemap=new SourceMapGenerator({file:state.outputfn||state.inputfn+"js"});
	}
	tools.addMapping=function(name) {
		var n=sourcemap._names._array.length;
	//	console.log('"'+name+'"','forthCodes line',state.forthnline,'column',state.forthncol,'==>','jsCodes line',state.jsline+1,'column 1');
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
		  name: (n<10?'0':'')+n+' '+name
		});
	}
	
}
global.tools=tools;
module.exports=tools;