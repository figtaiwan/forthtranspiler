//////////////////////////////////////////////////////////////////////////
// forth core words
//////////////////////////////////////////////////////////////////////////
var core={};
core._dup=function _dup() { /// dup ( n -- n n )
	// 20150405 sam, keep name in function so that later can be shown
	codegen.push(
		"stack.push(stack[stack.length-1]);"
	);
}
core._drop=function _drop() { /// drop ( n -- )
	codegen.push(
		"stack.pop();"
	);
}
core._swap=function _swap() { /// swap ( a b -- b a )
	// 20150405 sam
	codegen.push(
		"var n=stack.length-2, a=stack[n];"+
		"stack[n++]=stack[n], stack[n]=a;"
	);
}
core._rot=function _rot() { /// rot ( a b c-- b c a )
	// 20150405 sam
	codegen.push(
		"var n=stack.length-3, a=stack[n];"+
		"stack[n++]=stack[n], stack[n++]=stack[n], stack[n]=a;"
	);
}
core._dashrot=function _dashrot() { /// -rot ( a b c-- c a b )
	// 20150405 sam
	codegen.push(
		"var n=stack.length-1, c=stack[n];"+
		"stack[n--]=stack[n], stack[n--]=stack[n], stack[n]=c;"
	);
}
core._multiply=function _multiply() { /// * ( a b -- a*b )
	codegen.push(
		"stack.push(stack.pop()*stack.pop());"
	);
}
core._plus=function _plus() { /// + ( a b -- a+b )
	codegen.push(
		"var tos=stack.pop();"+
		"stack.push(stack.pop()+tos);"
	);
}
core._dot=function _dot() { /// . ( n -- )
	codegen.push(
		"_out+=' '+stack.pop();"
	);
}
core._dotr=function _dotr() { /// .r ( n m -- )
	// print n right-justified with m-digits
	codegen.push(
		"var m=stack.pop(),n=stack.pop().toString();"+
		"while(n.length<m)n=' '+n;_out+=n;"
	);
}
core._cr=function _cr() { /// . ( -- )
	codegen.push(
		"_out+='\\n';"
	);
}
core._minus=function _minus() { /// - ( a b -- a-b )
	codegen.push(
		"var tos=stack.pop();"+
		"stack.push(stack.pop()-tos);"
	);
}
var rDepth=-1;
core._do=function _do() { /// do ( lmt bgn -- )
	rDepth++;
	codegen.push(
		"core._B"+rDepth+"=stack.pop(),"+ 					// bgn
		    "_L"+rDepth+"=stack.pop(),"+ 					// lmt
		    "_R=_L"+rDepth+"-_B"+rDepth+",\n    "+ 			// rng
			"_D"+rDepth+"=_R/Math.abs(_R);"+ 				// dlt
			"_L"+rDepth+"-=(1-_D"+rDepth+")/2;\n  "+ 		// lmt adjusted if lmt<bgn
				
		"for(core._i"+rDepth+"=_B"+rDepth+";"+ 				// set idx=bgn
				
			"(_L"+rDepth+"-_i"+rDepth+")*_D"+rDepth+">0;"+	// check if reach lmt
				
			"_i"+rDepth+"+=_D"+rDepth+"){");				// idx+=dlt
}
core._loop=function _loop() { /// loop ( -- )
	codegen.push(
		"}"
	),rDepth--;
}
core._plusLoop=function _plusLoop() { /// +loop ( n -- )
	codegen.push(
		"_i"+rDepth+"+=stack.pop()-_D"+rDepth+";\n}"
	),rDepth--;
}
var	_i=function _i() { /// - ( -- i )
	codegen.push(
		"stack.push(_i"+rDepth+");"
	);
}
var	_j=function _j() { /// - ( -- i )
	codegen.push(
		"stack.push(_i"+(rDepth-1)+");"
	);
}
core._for=function _for() { /// for ( n -- )
	rDepth++;
	codegen.push(
		"core._i"+rDepth+"=stack.pop()+1;"+
		"while(--_i"+rDepth+">=0){"
	);
}
core._next=function _next() { /// next ( -- )
	rDepth--;
	codegen.push(
		"}"
	);
}
core._oneplus=function _oneplus() { /// 1+ ( n -- n+1 )
	codegen.push(
		"stack[stack.length-1]++;"
	);
}
core._if=function _if() { /// if ( flag -- )
	codegen.push(
		'if(stack.pop()){'
	);
}
core._else=function _else() { /// else ( -- )
	codegen.push(
		'}else{'
	);
}
core._then=function _then() { /// then ( -- )
	codegen.push(
		'}'
	);
}
core._words=function _words() {
	var w=Object.keys(words), nw=w.length, x=Object.keys(defined), nx=x.length;
	var t=JSON.stringify(nw+' primitives\n'+w.join(' ')+'\n'+nx+' extra defined'+(nx?'\n'+x.join(' '):''));
	codegen.push(
		'_out+='+t+';'
	);
}


module.exports=core;