//////////////////////////////////////////////////////////////////////////
/// defining words
//////////////////////////////////////////////////////////////////////////
var defining={};
var cmd, at;
defining._value=function _value(){ /// value <newName> ( n -- )
	newName=nextToken();
	if(newName) {
		cmd+=' '+newName;
		eval('xt=function(){_setValue("'+newName+'")}');
		if(tracing) showOpInfo('_setValue("'+newName+'")');
		opCodes.push( xt ); // we define newName to setValue
		addMapping(cmd), jsline++;
		eval('xt=function(){_getValue("'+newName+'")}');
		defined[newName]=xt; // then use newName to getValue
	//	console.log('defined['+newName+']:'+xt)
	} else
		throw 'need newName for "value" at line '+iLin+' column '+iCol[iTok];
}
defining._to=function _to(){ /// to <valueName> ( n -- )
	var valueName=nextToken();
	eval('xt=function(){_putValue("'+valueName+'")}');
	if(tracing) showOpInfo('_putValue("'+valueName+'")');
	opCodes.push( xt ); // we use valueName to putValue
	addMapping('to '+valueName), jsline++;
}
defining._colon=function _colon(){ /// : <name> ( -- )
	newName=nextToken();
	if(newName) {
		cmd+=' '+newName;
		eval('xt=function(){_setColon("'+newName+'")}');
		if(tracing) showOpInfo('_setColon("'+newName+'")');
		opCodes.push( xt ); // setColon to begin colon defintion
		addMapping(cmd), jsline++;
	} else
		throw 'need newName for ":" at line '+iLin+' column '+iCol[iTok];
}
defining._semicolon=function _semicolon(){ /// ; ( -- )
	eval('xt=function(){_endColon()}');
	if(tracing) showOpInfo('_endColon()');
	opCodes.push( xt ); // endColon to end colon defintion
	addMapping(token), jsline++;
	eval('newXt=function(){_runColon("'+newName+'")}');
	defined[newName]=newXt; // then use newName to runColon
}
defining._code=function _code() { /// code <name> <function> end-code ( -- )
	var newName=nextToken(), _j, _k, _f;
	if(_j<0)
		throw 'to code "'+_newName+'" need end-code at line '+iLin+' column '+iCol[iTok];
	defining._k=iCol[iTok];
	cmd+=' '+newName+' ', _f='';
	while((_j=line.indexOf('end-code'))<0){
		_f+=line.substring(k)+'\n',_k=0;
		if(++iLin<lines.length)line=lines[iLin];
	};
	if(_j<0)
		throw "\"code "+newName+"\" needs \"end-code\" to close at line "+iLin+" column "+line.length;
	_f+=line.substring(_k,_j);
	cmd+=_f+line.substr(_j,8);
	_f='_setCode("var '+newName+'=function '+newName+'(){'+_f.trim()+'}")';
	showOpInfo(_f);
	eval('newXt=function(){'+_f+'}');
	opCodes.push( newXt ); // endColon to end colon defintion
	addMapping(token), jsline++;
	if(!_k){
		iCol=[],iTok=0;
		iCol=line.replace(/\S+/g,function(tkn,col){iCol[iTok++]=col});
		tokens=line.split(/\s+/);
	}
	iTok=tokens.indexOf('end-code')+1;
	eval('newXt=function(){_runCode("'+newName+'")}');
	defined[newName]=newXt; // then use newName to runCode
}
defining._plusto=function _plusto(){ /// +to <valueName> ( n -- )
	var valueName=nextToken();
	eval('xt=function(){_plustoValue("'+valueName+'")}');
	if(tracing) showOpInfo('_plustoValue("'+valueName+'")');
	opCodes.push( xt ); // we use valueName to putValue
	addMapping('+to '+valueName), jsline++;
}
defining._see=function _see(){ /// see <valueName> ( -- )
	var name=nextToken(), str='_seeDefined("'+name+'")';
	eval('xt=function(){'+str+'}');
	if(tracing) showOpInfo(str);
	opCodes.push( xt );
	addMapping('see '+name), jsline++;
}
module.exports=defining;