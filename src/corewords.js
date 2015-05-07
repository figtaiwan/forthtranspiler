"use strict";
if(typeof module==='object')
	var state=require('./state');
//////////////////////////////////////////////////////////////////////////
/// forth core words
//////////////////////////////////////////////////////////////////////////
var core={};
core._dup=function _dup() { /// dup ( n -- n n )
	// 20150405 sam, keep name in function so that later can be shown
	state.codegen.push(
		"stack.push(stack[stack.length-1]);"
	);
}
core._drop=function _drop() { /// drop ( n -- )
	state.codegen.push(
		"stack.pop();"
	);
}
core._swap=function _swap() { /// swap ( a b -- b a )
	// 20150405 sam
	state.codegen.push(
		"var n=stack.length-2, a=stack[n];"+
		"stack[n++]=stack[n], stack[n]=a;"
	);
}
core._rot=function _rot() { /// rot ( a b c-- b c a )
	// 20150405 sam
	state.codegen.push(
		"var n=stack.length-3, a=stack[n];"+
		"stack[n++]=stack[n], stack[n++]=stack[n], stack[n]=a;"
	);
}
core._dashrot=function _dashrot() { /// -rot ( a b c-- c a b )
	// 20150405 sam
	state.codegen.push(
		"var n=stack.length-1, c=stack[n];"+
		"stack[n--]=stack[n], stack[n--]=stack[n], stack[n]=c;"
	);
}
core._multiply=function _multiply() { /// * ( a b -- a*b )
	state.codegen.push(
		"stack.push(stack.pop()*stack.pop());"
	);
}
core._plus=function _plus() { /// + ( a b -- a+b )
	state.codegen.push(
		"var tos=stack.pop();"+
		"stack.push(stack.pop()+tos);"
	);
}
core._div=function _div() { /// / ( a b -- a/b )
	state.codegen.push(
		"var tos=stack.pop();"+
		"stack.push(stack.pop()/tos);"
	);
}
core._dot=function _dot() { /// . ( n -- )
	state.codegen.push(
		"_out+=' '+stack.pop();"
	);
}
core._dotr=function _dotr() { /// .r ( n m -- )
	// print n right-justified in m-digits
	state.codegen.push(
		"var m=stack.pop(),n=stack.pop().toString();"+
		"while(n.length<m)n=' '+n;_out+=n;"
	);
}
core._cr=function _cr() { /// . ( -- )
	state.codegen.push(
		"_out+='\\n';"
	);
}
core._minus=function _minus() { /// - ( a b -- a-b )
	vcodegen.push(
		"var tos=stack.pop();"+
		"stack.push(stack.pop()-tos);"
	);
}
core._do=function _do() { /// do ( lmt bgn -- )
	state.rDepth++; var rDepth=state.rDepth;
	state.codegen.push(
		"var _B"+rDepth+"=stack.pop(),"+ 					// bgn
		    "_L"+rDepth+"=stack.pop(),"+ 					// lmt
		    "_R=_L"+rDepth+"-_B"+rDepth+",\n    "+ 			// rng
			"_D"+rDepth+"=_R/Math.abs(_R);"+ 				// dlt
			"_L"+rDepth+"-=(1-_D"+rDepth+")/2;\n  "+ 		// lmt adjusted if lmt<bgn
				
		"for(var _i"+rDepth+"=_B"+rDepth+";"+ 				// set idx=bgn
				
			"(_L"+rDepth+"-_i"+rDepth+")*_D"+rDepth+">0;"+	// check if reach lmt
				
			"_i"+rDepth+"+=_D"+rDepth+"){");				// idx+=dlt
}
core._loop=function _loop() { /// loop ( -- )
	state.codegen.push(
		"}"
	),state.rDepth--;
}
core._plusLoop=function _plusLoop() { /// +loop ( n -- )
	var rDepth=state.rDepth;
	state.codegen.push(
		"_i"+rDepth+"+=stack.pop()-_D"+rDepth+";\n}"
	),state.rDepth--;
}
core._i=function _i() { /// - ( -- i )
	state.codegen.push(
		"stack.push(_i"+state.rDepth+");"
	);
}
core._j=function _j() { /// - ( -- i )
	state.codegen.push(
		"stack.push(_i"+(state.rDepth-1)+");"
	);
}
core._for=function _for() { /// for ( n -- )
	state.rDepth++; var rDepth=state.rDepth;
	state.codegen.push(
		"var _i"+rDepth+"=stack.pop()+1;"+
		"while(--_i"+rDepth+">=0){"
	);
}
core._next=function _next() { /// next ( -- )
	state.rDepth--;
	state.codegen.push(
		"}"
	);
}
core._oneplus=function _oneplus() { /// 1+ ( n -- n+1 )
	state.codegen.push(
		"stack[stack.length-1]++;"
	);
}
core._if=function _if() { /// if ( flag -- )
	state.codegen.push(
		'if(stack.pop()){'
	);
}
core._else=function _else() { /// else ( -- )
	state.codegen.push(
		'}else{'
	);
}
core._then=function _then() { /// then ( -- )
	state.codegen.push(
		'}'
	);
}
core._words=function _words() {
	var w=Object.keys(words), nw=w.length, x=Object.keys(defined), nx=x.length;
	var t=JSON.stringify(nw+' primitives\n'+w.join(' ')+'\n'+nx+' extra defined'+(nx?'\n'+x.join(' '):''));
	state.codegen.push(
		'_out+='+t+';'
	);
}
core._over=function _over() { // over ( a b -- a b a )
	state.codegen.push(
		'stack.push(stack[stack.length-2]);'
	);
}
core._qdup=function _qdup() { // ?dup ( 0 -- 0 | n -- n n )
	state.codegen.push(
		'if(stack[stack.length-1])stack.push(stack[stack.length-1]);'
	);
}
core._begin=function _begin() { // begin ( -- )
	state.codegen.push(
		'while((function(){'
	);
}
core._while=function _while() { // while ( flag -- )
	state.codegen.push(
		'})(),stack.pop()){'
	);
}
core._oneminus=function _oneminus() { /// 1- ( n -- n-1 )
	state.codegen.push(
		"stack[stack.length-1]--;"
	);
}
core._repeat=function _repeat() { // repeat ( -- )
	state.codegen.push(
		'}'
	);
}
if(typeof module==='object'){
	module.exports=core,
	global.code=core;
}else{
	window.code=core;
}