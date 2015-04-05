var tracing=0;
var transpilejs=function(forthCodes,runtime,inputfn,outputfn) {
// forthCodes: forth source codes
//    runtime: the source code of predefined runtime enviroment
//    inputfn: the file name of forth source codes
//   outputfn: the file name of javascript source codes
	if(tracing) console.log('\nforthCodes:',JSON.stringify(forthCodes));
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
		codegen.push("console.log(stack.pop());");
	}
	var _minus=function _minus() { /// - ( a b -- a-b )
		codegen.push("var tos=stack.pop();stack.push(stack.pop()-tos);");
	}

	//////////////////////////////////////////////////////////////////////////
	/// constructing words for opCodes
	//////////////////////////////////////////////////////////////////////////
	var _doLit=function _doLit(n) { /// doLit ( -- n )
		n=JSON.stringify(n);
		var adv=1, nextOpc=opCodes[iOpCode+1];
		if(nextOpc){
			if 	   (nextOpc==_dup		)
				codegen.push("stack.push("+n+");"), codegen.push("stack.push("+n+");");
			else	if (nextOpc==_plus		)
				codegen.push("stack[stack.length-1]+="+n+";");
			else	if (nextOpc==_minus	)
				codegen.push("stack[stack.length-1]-="+n+";");
			else	if (nextOpc==_multiply	)
				codegen.push("stack[stack.length-1]*="+n+";");
			else
				codegen.push("stack.push("+n+");"), adv=0; /// no extra advance
		} else
				codegen.push("stack.push("+n+");"), adv=0; /// no extra advance
		return adv;
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
	var _setDo=function _setDo(){ /// do ( lmt bgn -- )
		codegen.push("var bgn=stack.pop(), lmt=stack.pop(); for(var i=bgn; i<lmt; i++){");
	}
	var _setLoop=function _setLoop(){ /// loop ( -- )
		codegen.push("}");
	}
	var _setPlusLoop=function _setPlusLoop(){ /// +loop ( n -- )
		codegen.push("i+=stack.pop()-1; }");
	}
	var _setI=function _setI(){ /// i ( -- i )
		codegen.push("stack.push(i);");
	}
	//////////////////////////////////////////////////////////////////////////
	/// defining words
	//////////////////////////////////////////////////////////////////////////
	var cmd='';
	var _value=function _value(){ /// value <newName> ( n -- )
		newName=nextToken();
		if(newName) {
			cmd+=' '+newName;
			eval('xt=function(){_setValue("'+newName+'")}');
			if(tracing) showOpInfo('_setValue("'+newName+'")');
			opCodes.push( xt ); // we define newName to setValue
			addMapping('value '+newName), jsline++;
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
			addMapping(': '+newName), jsline++;
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
	var _do=function _do(){ /// do ( lmt bgn -- )
		eval('xt=function(){_setDo()}');
		if(tracing) showOpInfo('_setDo()');
		opCodes.push( xt ); // setDo for range of index i
		addMapping(token), jsline++;
	}
	var _loop=function _loop(){ /// loop ( -- )
		eval('xt=function(){_setLoop()}');
		if(tracing) showOpInfo('_setLoop()');
		opCodes.push( xt ); // setDo for range of index i
		addMapping(token), jsline++;
	}
	var _plusloop=function _plusloop(){ /// +loop ( n -- )
		eval('xt=function(){_setPlusLoop()}');
		if(tracing) showOpInfo('_setPlusLoop()');
		opCodes.push( xt ); // setDo for range of index i
		addMapping(token), jsline++;
	}
	var _i=function _i(){ /// loop ( -- )
		eval('xt=function(){_setI()}');
		if(tracing) showOpInfo('_setI()');
		opCodes.push( xt ); // setDo for range of index i
		addMapping(token), jsline++;
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
	, "-"		: {xt:_minus	,defining:0} /// -				( a b -- a-b )
	, ";"		: {xt:_semicolon,defining:1} /// ;				( -- )
	, ":"		: {xt:_colon	,defining:1} /// :		<name>	( -- )
	, "value"	: {xt:_value	,defining:1} /// value	<name>	( n -- )
	, "to"		: {xt:_to		,defining:1} /// to		<name>	( n -- ) /// sam 21050405
	, "do"		: {xt:_do		,defining:1} /// do				( lmt bgn -- ) /// sam 21050405
	, "loop"	: {xt:_loop		,defining:1} /// loop			( -- ) /// sam 21050405
	, "+loop"	: {xt:_plusloop	,defining:1} /// +loop			( n -- ) /// sam 21050405
	, "i"		: {xt:_i		,defining:1} /// i				( -- i ) /// sam 21050405
	}
	
	//////////////////////////////////////////////////////////////////////////
	/// tools
	//////////////////////////////////////////////////////////////////////////
	var nextToken=function(){
		token=undefined;
		if(iTok<tokens.length){
			var i=iTok, j=iCol[i];
			token=tokens[iTok++];
			if(tracing) console.log('\tcol '+(j<10?'0':'')+j+' token '+i+': '+JSON.stringify(token));
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
		console.log('\t\t\t\topCode '+opCodes.length+': '+msg);
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
			if(tracing) console.log('\tline '+i+': '+JSON.stringify(line));
			iCol=[];
			iTok=0;
			line.replace(/\S+/g,function(token,j){ iCol[iTok++]=j; }); // iCol for each token
			iTok=0,tokens=line.split(/\s+/);
			cmd='';
			while(checkNextToken()!==undefined){
				forthncol=iCol[iTok]+1;
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
	var i=0;

	//////////////////////////////////////////////////////////////////////////
	/// transpiling loop to generat jsCodes next
	//////////////////////////////////////////////////////////////////////////
	while(i<opCodes.length){
		var adv=0;
		if (typeof opCodes[i]=="function") {
			adv=opCodes[i]( opCodes[i+1] ) || 0;
		} else {
			adv=_doLit(opCodes[i],opCodes[i+1]);
		}
		if (adv) i+=adv;
		i++;
	}
	return {jsCodes:codegen,sourcemap:sourcemap,opCodes:opCodes};
}

var runtimecode	=require("fs").readFileSync("./src/runtime.js","utf8");
var transpile=function(forth) {
	var trans=transpilejs(forth,runtimecode,"test");
	var code =	"(function(){"				+"\n"
			 +	runtimecode					+"\n"
			 +	trans.jsCodes.join("\n")	+"\n"
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
	try {
		var res=eval(code);
		if(tracing) console.log('\nresult stack: '+JSON.stringify(res.stack)+'\n');
	}
	catch(e) { console.log(e) }
	return res;
}
var trace=function(flag){
	tracing=flag;
}
module.exports={transpile:transpile,trace:trace};
