	//////////////////////////////////////////////////////////////////////////
	/// constructing words for opCodes
	//////////////////////////////////////////////////////////////////////////
	var core=require("./corewords");
	var constructing={};
	constructing._doLit=function _doLit(n,nextOpc) { /// doLit ( -- n )
		n=JSON.stringify(n);
		if(nextOpc){
			if 	   (nextOpc==core._dup)
				iOpCode++,codegen.push(
					"stack.push("+n+");"
				), codegen.push(
					"stack.push("+n+");"
				);
			else	if (nextOpc==core._plus)
				iOpCode++,codegen.push(
					"stack[stack.length-1]+="+n+";"
				);
			else	if (nextOpc==core._minus)
				iOpCode++,codegen.push(
					"stack[stack.length-1]-="+n+";"
				);
			else	if (nextOpc==core._multiply	)
				iOpCode++,codegen.push(
					"stack[stack.length-1]*="+n+";"
				);
			else
				codegen.push(
					"stack.push("+n+");"
				); /// no extra advance
		} else
				codegen.push(
					"stack.push("+n+");"
				); /// no extra advance
	}
	constructing._setValue=function _setValu(name) { /// setVal('v') ( n -- )
		codegen.push(
			"constructing._"+name+"=stack.pop();"
		);
		return 1;
	}
	constructing._putValue=function _putValu(name) { /// putVal('v') ( n -- )
		codegen.push(
			name+"=stack.pop();"
		);
		return 1;
	}
	constructing._getValue=function _getValue(name) { /// v ( -- n )
		codegen.push(
			"stack.push("+name+");"
		);
		return 1;
	}
	constructing._newName, xt; // globle variables
	constructing._setColon=function _setColon(name){ /// : <name> ( -- )
		codegen.push(
			"constructing._"+name+"=function(){"
		);
	}
	constructing._endColon=function _endColon(){ /// ; ( -- )
		codegen.push(
			"}"
		);
	}
	constructing._runColon=function _runColon(name){ /// <name> ( ... )
		codegen.push(
			name+"();"
		);
	}
	var	_backslash=function _backslash() { /// '\' ( -- )
		cmd+=' '+line.substr(iCol[iTok])
		iTok=tokens.length;
		showOpInfo('');
	}
	var	_parenth=function _parenth() { /// '(' ( -- )
		constructing._i=iCol[iTok];
		while(iTok<tokens.length&&!tokens[iTok].match(/\)$/)) iTok++; iTok++;
		cmd+=' '+line.substring(i,iCol[iTok]);
		showOpInfo('');
	}
	constructing._setCode=function _runCode(code){ /// <name> ( ... )
		codegen.push(
			code
		);
	}
	constructing._runCode=function _runCode(name){ /// <name> ( ... )
		codegen.push(
			name+"();"
		);
	}
	constructing._plustoValue=function _plustoValu(name) { /// plustoValue('v') ( n -- )
		codegen.push(
			name+"+=stack.pop();"
		);
		return 1;
	}
	constructing._seeDefined=function _seeDefined(name) { /// _seeDefined(name) ( -- )
		constructing._t=words[name];
		if(t)
			t=JSON.stringify(t.xt.toString());
		else if(t=defined[name])
			t=name;
		codegen.push(
			'_out+='+t+';'
		);
	}

module.exports=constructing;