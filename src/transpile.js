var tracing=0;
var transpilejs=function(forthCodes,runtime,inputfn,outputfn) {
// forthCodes: forth source codes
//    runtime: the source code of predefined runtime enviroment
//    inputfn: the file name of forth source codes
//   outputfn: the file name of javascript source codes
	if(tracing>1) console.log('\nforthCodes:',JSON.stringify(forthCodes));
	var lines=forthCodes;
	if(typeof(lines)=='string') lines=forthCodes.split(/\r?\n/);
	var tokens=[], opCodes=[], defined={}, iCol=[];
	var iLin=0, iTok=0, iOpCode=0;
	var line='', token, opCode;

	//////////////////////////////////////////////////////////////////////////
	// forth core words
	//////////////////////////////////////////////////////////////////////////
	var _dup=function _dup() { /// dup ( n -- n n ) // 20150405 sam, keep name in function so that later can be shown
		codegen.push("stack.push(stack[stack.length-1]);");
	}
	var _drop=function _drop() { /// drop ( n -- )
		codegen.push("stack.pop();");
	}
	var _swap=function _swap() { /// swap ( a b -- b a ) // 20150405 sam
		codegen.push("var n=stack.length-2, a=stack[n]; stack[n++]=stack[n], stack[n]=a;");
	}
	var _rot=function _rot() { /// rot ( a b c-- b c a ) // 20150405 sam
		codegen.push("var n=stack.length-3, a=stack[n]; stack[n++]=stack[n], stack[n++]=stack[n], stack[n]=a;");
	}
	var _dashrot=function _dashrot() { /// -rot ( a b c-- c a b ) // 20150405 sam
		codegen.push("var n=stack.length-1, c=stack[n]; stack[n--]=stack[n], stack[n--]=stack[n], stack[n]=c;");
	}
	var _multiply=function _multiply() { /// * ( a b -- a*b )
		codegen.push("stack.push(stack.pop()*stack.pop());");
	}
	var _plus=function _plus() { /// + ( a b -- a+b )
		codegen.push("var tos=stack.pop();stack.push(stack.pop()+tos);");
	}
	var _dot=function _dot() { /// . ( n -- )
		codegen.push("_out+=' '+stack.pop();");
	}
	var _dotr=function _dotr() { /// .r ( n m -- ) /// print n right-justified with m-digits
		codegen.push("var m=stack.pop(),n=stack.pop().toString();while(n.length<m)n=' '+n;_out+=n;");
	}
	var _cr=function _cr() { /// . ( -- )
		codegen.push("_out+='\\n';");
	}
	var _minus=function _minus() { /// - ( a b -- a-b )
		codegen.push("var tos=stack.pop();stack.push(stack.pop()-tos);");
	}
	var rDepth=-1;
	var _do=function _do() { /// do ( lmt bgn -- )
		rDepth++;
		codegen.push(
			"var _B"+rDepth+"=stack.pop(),"+
			    "_L"+rDepth+"=stack.pop(),"+
			    "_R=_L"+rDepth+"-_B"+rDepth+",\n\t\t"+
				"_D"+rDepth+"=_R/Math.abs(_R);"+
				"_L"+rDepth+"-=(1-_D"+rDepth+")/2;\n\t\t"+
			"for(var _i"+rDepth+"=_B"+rDepth+";"+
				"(_L"+rDepth+"-_i"+rDepth+")*_D"+rDepth+">0;"+
				"_i"+rDepth+"+=_D"+rDepth+"){");
	}
	var _loop=function _loop() { /// loop ( -- )
		codegen.push("}"),rDepth--;
	}
	var _plusLoop=function _plusLoop() { /// +loop ( n -- )
		codegen.push("_i"+rDepth+"+=stack.pop()-_D"+rDepth+";\n\t\t}"),rDepth--;
	}
	var	_i=function _i() { /// - ( -- i )
		codegen.push("stack.push(_i"+rDepth+");");
	}
	var	_j=function _j() { /// - ( -- i )
		codegen.push("stack.push(_i"+(rDepth-1)+");");
	}
	var _for=function _for() { /// for ( n -- )
		rDepth++;
		codegen.push(
			"var _i"+rDepth+"=stack.pop()+1;"+
			"while(--_i"+rDepth+">=0){");
	}
	var _next=function _next() { /// next ( -- )
		rDepth--;
		codegen.push("}");
	}

	//////////////////////////////////////////////////////////////////////////
	/// constructing words for opCodes
	//////////////////////////////////////////////////////////////////////////
	var _doLit=function _doLit(n,nextOpc) { /// doLit ( -- n )
		n=JSON.stringify(n);
		if(nextOpc){
			if 	   (nextOpc==_dup		)
				iOpCode++,codegen.push("stack.push("+n+");"), codegen.push("stack.push("+n+");");
			else	if (nextOpc==_plus		)
				iOpCode++,codegen.push("stack[stack.length-1]+="+n+";");
			else	if (nextOpc==_minus	)
				iOpCode++,codegen.push("stack[stack.length-1]-="+n+";");
			else	if (nextOpc==_multiply	)
				iOpCode++,codegen.push("stack[stack.length-1]*="+n+";");
			else
				codegen.push("stack.push("+n+");"); /// no extra advance
		} else
				codegen.push("stack.push("+n+");"); /// no extra advance
	}
	var _setValue=function _setValu(name) { /// setVal('v') ( n -- )
		codegen.push("var "+name+"=stack.pop();")
		return 1;
	}
	var _putValue=function _putValu(name) { /// putVal('v') ( n -- )
		codegen.push(name+"=stack.pop();")
		return 1;
	}
	var _getValue=function _getValue(name) { /// v ( -- n )
		codegen.push("stack.push("+name+");");
		return 1;
	}
	var newName, xt; // globle variables
	var _setColon=function _setColon(name){ /// : <name> ( -- )
		codegen.push("var "+name+"=function(){");
	}
	var _endColon=function _endColon(){ /// ; ( -- )
		codegen.push("}");
	}
	var _runColon=function _runColon(name){ /// <name> ( ... )
		codegen.push(name+"();");
	}
	var	_backslash=function _backslash() { /// '(' ( -- )
		cmd+=' '+line.substr(iCol[iTok])
		iTok=tokens.length;
		showOpInfo('');
	}
	var	_parenth=function _parenth() { /// '(' ( -- )
		var i=iCol[iTok];
		while(iTok<tokens.length&&!tokens[iTok].match(/\)$/)) iTok++; iTok++;
		cmd+=' '+line.substring(i,iCol[iTok]);
		showOpInfo('');
	}
	//////////////////////////////////////////////////////////////////////////
	/// defining words
	//////////////////////////////////////////////////////////////////////////
	var cmd, at;
	var _value=function _value(){ /// value <newName> ( n -- )
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
	var _to=function _to(){ /// to <valueName> ( n -- )
		var valueName=nextToken();
		eval('xt=function(){_putValue("'+valueName+'")}');
		if(tracing) showOpInfo('_putValue("'+valueName+'")');
		opCodes.push( xt ); // we use valueName to putValue
		addMapping('to '+valueName), jsline++;
	}
	var _colon=function _colon(){ /// : <name> ( -- )
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
	var _semicolon=function _semicolon(){ /// ; ( -- )
		eval('xt=function(){_endColon()}');
		if(tracing) showOpInfo('_endColon()');
		opCodes.push( xt ); // endColon to end colon defintion
		addMapping(token), jsline++;
		eval('newXt=function(){_runColon("'+newName+'")}');
		defined[newName]=newXt; // then use newName to runColon
	}
	//////////////////////////////////////////////////////////////////////////
	/// name list
	//////////////////////////////////////////////////////////////////////////
	var words =
	{ "dup"		: {xt:_dup		,defining:0} /// dup			( n -- n n )
	, "drop"	: {xt:_drop		,defining:0} /// drop			( n -- )
	, "swap"	: {xt:_swap		,defining:0} /// swap			( a b -- b a ) /// sam 21050405
	, "rot"		: {xt:_rot		,defining:0} /// rot			( a b c -- b c a ) /// sam 21050405
	, "-rot"	: {xt:_dashrot	,defining:0} /// -rot			( a b c -- c b a ) /// sam 21050405
	, "*"		: {xt:_multiply	,defining:0} /// *				( a b -- a*b )
	, "+"		: {xt:_plus		,defining:0} /// +				( a b -- a+b )
	, "."	 	: {xt:_dot		,defining:0} /// .				( n -- )
	, ".r"	 	: {xt:_dotr		,defining:0} /// .r				( n m -- )
	, "cr"	 	: {xt:_cr		,defining:0} /// cr				( -- )
	, "-"		: {xt:_minus	,defining:0} /// -				( a b -- a-b )
	, ";"		: {xt:_semicolon,defining:1} /// ;				( -- )
	, ":"		: {xt:_colon	,defining:1} /// :		<name>	( -- )
	, "value"	: {xt:_value	,defining:1} /// value	<name>	( n -- )
	, "to"		: {xt:_to		,defining:1} /// to		<name>	( n -- ) /// sam 21050405
	, "do"		: {xt:_do		,defining:0} /// do				( lmt bgn -- ) /// sam 21050406
	, "loop"	: {xt:_loop		,defining:0} /// loop			( -- ) /// sam 21050406
	, "+loop"	: {xt:_plusLoop	,defining:0} /// +loop			( n -- ) /// sam 21050406
	, "i"		: {xt:_i		,defining:0} /// i				( -- i ) /// sam 21050406
	, "j"		: {xt:_j		,defining:0} /// j				( -- j ) /// sam 21050406
	, "("		: {xt:_parenth	,defining:1} /// (				( -- ) /// sam 21050406
	, "\\"		: {xt:_backslash,defining:1} /// \				( -- ) /// sam 21050406
	, "for"		: {xt:_for		,defining:0} /// for			( n -- ) /// sam 21050406
	, "next"	: {xt:_next		,defining:0} /// next			( -- ) /// sam 21050406
	}
	
	//////////////////////////////////////////////////////////////////////////
	/// tools
	//////////////////////////////////////////////////////////////////////////
	var nextToken=function(){
		token=undefined;
		if(iTok<tokens.length){
			var i=iTok, j=iCol[i];
			token=tokens[iTok++];
			if(tracing>1) console.log('\tcol '+(j<10?'0':'')+j+' token '+i+': '+JSON.stringify(token));
		}
		return token;
	}
	var checkNextToken=function(){
		var token=undefined;
		if(iTok<tokens.length)
			token=tokens[iTok];
		return token;
	}

	var SourceMapGenerator=require("source-map").SourceMapGenerator;
	var sourcemap=new SourceMapGenerator({file:outputfn||inputfn+"js"});

	var addMapping=function(name) {
		//console.log(name,codegen.length+1,forthnline,forthncol)
		sourcemap.addMapping({
		  generated: {
		    line: jsline,
		    column: 1
		  },
		  source: inputfn,
		  original: {
		    line: forthnline,
		    column: forthncol
		  },
		  name: name
		});
	}
	var showOpInfo=function(msg){
		if(tracing) console.log('\t'+at+' '+JSON.stringify(cmd)+(msg?'\n\t\t\topCode '+opCodes.length+': '+msg:''));
	}

	//////////////////////////////////////////////////////////////////////////
	/// transpiling loop to generat opCodes first
	//////////////////////////////////////////////////////////////////////////
	var forth2js=function(lines){
		opCodes=[];
		defined={};
		if(tracing) console.log('\ntranspiling:');
		for (var i=0;i<lines.length;i++) {
			forthnline=i+1; 
			line=lines[i];
			if(tracing) console.log('\tline '+i+' '+JSON.stringify(line));
			iCol=[];
			iTok=0;
			line.replace(/\S+/g,function(token,j){ iCol[iTok++]=j; }); // iCol for each token
			iTok=0,tokens=line.split(/\s+/);
			while(checkNextToken()!==undefined){
				forthncol=iCol[iTok]+1;
				at='  at '+iCol[iTok];
				cmd=token=nextToken();
				var xt=defined[token];
				if (xt) {
					if(tracing) showOpInfo(xt.toString().match(/\{(\S+)\}/)[1]);
					opCodes.push(xt);
					addMapping(token), jsline++;
				} else {
					var w=words[token];
					if (w) {
						xt=w.xt;
						if(w.defining)
							xt(); // execute defining word directly
						else {
							if(tracing) showOpInfo(xt.toString().match(/function\s+(\S+)\s+/)[1]);
							opCodes.push(xt);
							addMapping(token), jsline++;	//assuming only generate one js source line
						}
					} else {
						var n=(parseFloat(token));
						if (isNaN(n)) {
							var M=token.match(/^'(\S+)'$/);
							if (M) {
								var str=M[1];
								if(tracing) showOpInfo(JSON.stringify(str));
								opCodes.push(str);
								addMapping(token), jsline++;
							} else {
								throw "unknown word:"+token;
							}
						} else {
							if(tracing) showOpInfo(n)
							opCodes.push(n);
							addMapping(token), jsline++;
						}
					} // end if (w)
				} // end if (def)
			} // end while (checkNextToken()!==undefined)
		}
		return opCodes;
	}
	var jsline=runtime.length;     //generated javascript code line count, for source map
	var codegen=[];                //generated javsacript code
	var forthnline=0,forthncol=0;  //line and col of forth source code

	var opCodes=forth2js(lines);
	if(tracing>1){
		console.log('opCodes:');
		opCodes.forEach(function(f,i){
			var s=f.toString(), m=s.match(/function\s?(\S*\(\))\s*\{([^}]+)/);
			console.log(i+' '+(m?m[1]==='()'?m[2]:m[1]:JSON.stringify(s)));
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
			_doLit(opCode,opCodes[iOpCode+1]);
		}
		iOpCode++;
	}
	return {jsCodes:codegen,sourcemap:sourcemap,opCodes:opCodes};
}

var runtimecode	=require("fs").readFileSync("./src/runtime.js","utf8");
var transpile=function(forth) {
	var trans=transpilejs(forth,runtimecode,"test");
	var code =	"(function(){"				+"\n"
			 +	runtimecode					+"\n"
			 +	trans.jsCodes.join("\n")	+"\n"
			 +	"runtime.out=_out;"			+"\n"
			 +	"return runtime;"			+"\n"
			 +	"})()";
	var indent='\t';
	var jsCode=trans.jsCodes.map(function(line,i){
		if(line.match(/^\s*\}/)){
			indent=indent.substr(0,indent.length-1);
		}
		var adjust='\t'+i+indent+line;
		if(line.match(/\{\s*$/)){
			indent+='\t'
		}
		return adjust;
	}).join('\n');
	if(tracing) console.log('jsCode:\n'+jsCode)
	if(tracing>1) console.log('code:\n'+code)
	try {
		var res=eval(code);
		if(tracing) console.log('\nresult stack: '+JSON.stringify(res.stack)+'\n');
		if(tracing&&res.out) console.log('out: '+res.out);
	}
	catch(e) { console.log(e) }
	return res;
}
var trace=function(flag){
	tracing=flag;
}
module.exports={transpile:transpile,trace:trace};
