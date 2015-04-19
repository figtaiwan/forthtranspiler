"use strict";
var state=require('./state');
var core=require("./corewords");
//////////////////////////////////////////////////////////////////////////
/// constructing words for opCodes
//////////////////////////////////////////////////////////////////////////
var constructing={};

constructing._doLit=function _doLit(n,nextOpc) { /// doLit ( -- n )
	var names=sourcemap._names._array;
	n=JSON.stringify(n);
	if(nextOpc){
		var iOpCode=state.iOpCode;
		if 	   (nextOpc==core._dup){ 		// Peephole optimization 01 -- n dup
			iOpCode++,state.codegen.push(
				"stack.push("+n+");"
			), state.codegen.push(
				"stack.push("+n+");"
			);
		}else	if (nextOpc==core._plus){ 	// Peephole optimization 02 -- n +
			names[iOpCode]+=names.splice(++iOpCode,1)[0].substr(2),state.codegen.push(
				"stack[stack.length-1]+="+n+";"
			);
		}else	if (nextOpc==core._minus){ 	// Peephole optimization 03 -- n -
			names[iOpCode]+=names.splice(++iOpCode,1)[0].substr(2),state.codegen.push(
				"stack[stack.length-1]-="+n+";"
			);
		}else	if (nextOpc==core._multiply){// Peephole optimization 04 -- n *
			names[iOpCode]+=names.splice(++iOpCode,1)[0].substr(2),state.codegen.push(
				"stack[stack.length-1]*="+n+";"
			);
		}else	if (nextOpc==core._div){ 	// Peephole optimization 05 -- n /
			names[iOpCode]+=names.splice(++iOpCode,1)[0].substr(2),state.codegen.push(
				"stack[stack.length-1]/="+n+";"
			);
		}else{
			state.codegen.push(
				"stack.push("+n+");"
			); /// no extra advance
		}
		state.iOpCode=iOpCode;
	} else
		state.codegen.push(
			"stack.push("+n+");"
		); /// no extra advance
}
constructing._setValue=function _setValu(name) { /// setVal('v') ( n -- )
	state.codegen.push(
		"var "+name+"=stack.pop();"
	);
	return 1;
}
constructing._putValue=function _putValu(name) { /// putVal('v') ( n -- )
	state.codegen.push(
		name+"=stack.pop();"
	);
	return 1;
}
constructing._getValue=function _getValue(name) { /// v ( -- n )
	state.codegen.push(
		"stack.push("+name+");"
	);
	return 1;
}
constructing._setColon=function _setColon(name){ /// : <name> ( -- )
	state.codegen.push(
		"var "+name+"=function(){"
	);
}
constructing._endColon=function _endColon(){ /// ; ( -- )
	state.codegen.push(
		"}"
	);
}
constructing._runColon=function _runColon(name){ /// <name> ( ... )
	state.codegen.push(
		name+"();"
	);
}
constructing._setCode=function _runCode(code){ /// <name> ( ... )
	state.codegen.push(
		code
	);
}
constructing._runCode=function _runCode(name){ /// <name> ( ... )
	state.codegen.push(
		name+"();"
	);
}
constructing._plustoValue=function _plustoValu(name) { /// plustoValue('v') ( n -- )
	state.codegen.push(
		name+"+=stack.pop();"
	);
	return 1;
}
constructing._seeDefined=function _seeDefined(name) { /// _seeDefined(name) ( -- )
	var t=words[name]; // predefined primitive words
	if(t)
		t=JSON.stringify(t.xt.toString());
	else if(t=global.defined[name]) // extra defined words
		t=name;
	state.codegen.push(
		'_out+='+t+';'
	);
}
module.exports=constructing;