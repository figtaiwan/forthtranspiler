"use strict";
var state=require('./state');
var core=require("./corewords");	/// forth core words
var tools=require("./tools");	/// basic tools used in construnctiog
var constructing=require("./constructing");	/// constructing words for opCodes
//////////////////////////////////////////////////////////////////////////
/// defining words
//////////////////////////////////////////////////////////////////////////
var defining={};
var cmd, at;
defining._value=function _value(){ /// value <newName> ( n -- )
	var newName=tools.nextToken();
	if(newName) {
		state.cmd+=' '+newName;
		eval('xt=function(){constructing._setValue("'+newName+'")}');
		if(state.tracing) tools.showOpInfo('_setValue("'+newName+'")');
		state.opCodes.push( xt ); // we define newName to setValue
		tools.addMapping(state.cmd), state.jsline++;
		eval('xt=function(){constructing._getValue("'+newName+'")}');
		if(typeof window==='object')
			window.defined[state.newName]=xt;
		else
			global.defined[state.newName]=xt; // then use newName to getValue
	//	console.log('defined['+newName+']:'+xt)
	} else
		throw 'need newName for "value" at line '+iLin+' column '+iCol[iTok];
}
defining._to=function _to(){ /// to <valueName> ( n -- )
	var valueName=tools.nextToken();
	if(valueName) {
		state.cmd+=' '+valueName;
		eval('xt=function(){constructing._putValue("'+valueName+'")}');
		if(state.tracing) tools.showOpInfo('constructing._putValue("'+valueName+'")');
		state.opCodes.push( xt ); // we use valueName to putValue
		tools.addMapping(state.cmd), state.jsline++;
	} else
		throw 'need valueName for "to" at line '+iLin+' column '+iCol[iTok];
}
var xt;
defining._colon=function _colon(){ /// : <name> ( -- )
	var newName=state.newName=tools.nextToken();
	if(newName) {
		state.cmd+=' '+newName; 
		eval('xt=function(){constructing._setColon("'+newName+'")}');
		if(state.tracing)
			tools.showOpInfo('_setColon("'+newName+'")');
		state.opCodes.push( xt ); // setColon to begin colon defintion
		tools.addMapping(state.cmd), state.jsline++;
	} else
		throw 'need newName for ":" at line '+iLin+' column '+iCol[iTok];
}
defining._semicolon=function _semicolon(){ /// ; ( -- )
	var xt;
	eval('xt=function(){constructing._endColon()}');
	if(state.tracing) tools.showOpInfo('_endColon()');
	state.opCodes.push( xt ); // endColon to end colon defintion
	tools.addMapping(state.cmd), state.jsline++;
	var newXt;
	eval('newXt=function(){constructing._runColon("'+state.newName+'")}');
	if(typeof window==='object')
			window.defined[state.newName]=newXt;
		else
			global.defined[state.newName]=newXt; // then use newName to runColon
}
defining._code=function _code() { /// code <name> <function> end-code ( -- )
	var newName=tools.nextToken(), iLin=state.iLin, lines=state.lines, line=lines[iLin], _k=state.iCol[state.iTok];
	var _j, _f, newXt;
	if(!newName)
		throw 'missing code name at line '+state.iLin+' column '+_k;
	state.cmd+=' '+newName+' ', _f='';
	while((_j=line.indexOf('end-code'))<0){
		_f+=line.substring(_k)+'\n',_k=0;
		if(++iLin<lines.length)line=lines[iLin];
	};
	if(_j<0)
		throw "\"code "+newName+"\" needs \"end-code\" to close at line "+iLin+" column "+line.length;
	if(!_k) state.line=line, state.iLin=iLin;
	_f+=line.substring(_k,_j);
	state.cmd+=_f+line.substr(_j,8);
	_f='constructing._setCode("var '+newName+'=function '+newName+'(){'+_f.trim()+'}")';
	tools.showOpInfo(_f);
	eval('newXt=function(){'+_f+'}');
	state.opCodes.push( newXt ); // to end colon defintion
	tools.addMapping(state.cmd), state.jsline++;
	if(!_k){
		state.line=line, state.iLin=iLin;
		var iCol=[],iTok=0; line.replace(/\S+/g,function(tkn,col){iCol[iTok++]=col});
		state.iCol=iCol, state.tokens=line.split(/\s+/);
	}
	state.iTok=state.tokens.indexOf('end-code')+1;
	eval('newXt=function(){constructing._runCode("'+newName+'")}');
	if(typeof window==='object')
			window.defined[state.newName]=newXt;
		else
			global.defined[state.newName]=newXt; // then use newName to runCode
}
defining._plusto=function _plusto(){ /// +to <valueName> ( n -- )
	var valueName=tools.nextToken(), xt;
	if(valueName) {
		state.cmd+=' '+valueName;
		eval('xt=function(){constructing._plustoValue("'+valueName+'")}');
		if(state.tracing) tools.showOpInfo('_plustoValue("'+valueName+'")');
		state.opCodes.push( xt ); // we use valueName to putValue
		tools.addMapping(state.cmd), state.jsline++;
	} else
		throw 'need valueName for "+to" at line '+iLin+' column '+iCol[iTok];
}
defining._see=function _see(){ /// see <valueName> ( -- )
	var name=tools.nextToken(), xt, str='_seeDefined("'+name+'")';
	if(name) {
		state.cmd+=' '+name;
		if(state.tracing) tools.showOpInfo(str);
		eval('xt=function(){constructing.'+str+'}');
		state.opCodes.push( xt );
		tools.addMapping(state.cmd), state.jsline++;
	} else
		throw 'need name for "see" at line '+iLin+' column '+iCol[iTok];
}
defining._backslash=function _backslash() { /// '\' ( -- )
	var names=sourcemap._names._array;
	names[names.length-1]+=' '+state.lines[state.forthnline-1].substr(state.iCol[state.iTok-1]);
	state.iTok=state.tokens.length;
	tools.showOpInfo('');
}
defining._parenth=function _parenth() { /// '(' ( -- )
	var names=sourcemap._names._array;
	var _i=state.iCol[state.iTok-1], str=state.lines[state.forthnline-1].substr(_i);
	if((_i=str.indexOf(')'))<0)
		throw 'need right parenthesis to match "(" at line '+iLin+' column '+iCol[iTok];
	names[names.length-1]+=' '+str.substr(0,_i+1);
	state.iTok+=str.substring(2,_i+1).split(/\s+/).length;
	tools.showOpInfo('');
}
module.exports=defining;