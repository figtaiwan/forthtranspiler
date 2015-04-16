
var tracing=0;
if(typeof window==='object'){
  window.pretty=function(jsCode,addLineNo){				// jsCode is an array of strings
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
}
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

	var core=require("./corewords");
	var constructing=require("./constructing");
	var defining=require("./defining");


	//////////////////////////////////////////////////////////////////////////
	/// name list
	//////////////////////////////////////////////////////////////////////////
	var words=require("./words");
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
if(typeof window==='undefined'){
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
}else{
	var addMapping=function(name) {};
	window.words=words;
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
			iTok=0,tokens=line.trim().split(/\s+/);
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
							var M=token.match(/^'(\S*)'$/);
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

if(typeof runtimecode==='undefined'){
	//var runtimecode=require("fs").readFileSync("./src/runtime.js","utf8");
	runtimecode=require("./runtime");

	//console.log(runtimecode)
	//var i=runtimecode.indexOf('='); runtimecode=runtimecode.substr(i+1);
//	console.log('runtimecode',runtimecode)
	//runtimecode=JSON.parse(runtimecode);
}
//runtimecode=runtimecode.join('\n');
var transpile=function(forth) {
	if(typeof forth==='string')
		forth=forth.split(/\r?\n/);
	forth.forEach(function(line){
		if(typeof window==='undefined')
			line=chalk.bold.green(line);
		console.log('trans <-- '+line);
	});
	var jsCode=transpilejs(forth,runtimecode,"test").jsCodes.join('\n');
//	jsCode=pretty(jsCode);
	var code =	"(function(){"		+"\n"
			 +	runtimecode			+"\n"
			 +	jsCode				+"\n"
			 +	"runtime.out=_out;"	+"\n"
			 +	"return runtime;"	+"\n"
			 +	"})()";
	if(tracing) console.log('jsCode:\n'+jsCode)
	if(tracing>1) console.log('code:\n'+code)
	try {
		var res=eval(code);
		if(tracing) console.log('\nresult stack: '+JSON.stringify(res.stack)+'\n');
		if(res.out){
			var T=res.out.split(/\r?\n/).filter(function(t){return t}).map(function(t){
				var m=n=0;
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
var trace=function(flag){
	tracing=flag;
}
if(typeof window==='object'){
	window.Transpile={transpile:transpile,trace:trace};
} else {
	var chalk=require('chalk');
	module.exports  ={transpile:transpile,trace:trace};
}
