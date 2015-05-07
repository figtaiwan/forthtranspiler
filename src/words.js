"use strict";
if(typeof module==='object'){
	var core=require("./corewords");	/// forth core words
	var constructing=require("./constructing");	/// constructing words
	var defining=require("./defining");	/// defining words
}
//////////////////////////////////////////////////////////////////////////
/// name list
//////////////////////////////////////////////////////////////////////////
var words =
{ "dup"		: {xt:    core._dup		 ,defining:0} /// dup			( n -- n n )
, "drop"	: {xt:    core._drop	 ,defining:0} /// drop			( n -- )
, "swap"	: {xt:    core._swap	 ,defining:0} /// swap			( a b -- b a )
, "rot"		: {xt:    core._rot		 ,defining:0} /// rot			( a b c -- b c a )
, "-rot"	: {xt:    core._dashrot	 ,defining:0} /// -rot			( a b c -- c b a )
, "*"		: {xt:    core._multiply ,defining:0} /// *				( a b -- a*b )
, "+"		: {xt:    core._plus	 ,defining:0} /// +				( a b -- a+b )
, "."	 	: {xt:    core._dot		 ,defining:0} /// .				( n -- )
, ".r"	 	: {xt:    core._dotr	 ,defining:0} /// .r			( n m -- )
, "cr"	 	: {xt:    core._cr		 ,defining:0} /// cr			( -- )
, "-"		: {xt:    core._minus	 ,defining:0} /// -				( a b -- a-b )
, ";"		: {xt:defining._semicolon,defining:1} /// ;				( -- )
, ":"		: {xt:defining._colon	 ,defining:1} /// :		<name>	( -- )
, "value"	: {xt:defining._value	 ,defining:1} /// value	<name>	( n -- )
, "to"		: {xt:defining._to		 ,defining:1} /// to	<name>	( n -- )
, "do"		: {xt:    core._do		 ,defining:0} /// do			( lmt bgn -- )
, "loop"	: {xt:    core._loop	 ,defining:0} /// loop			( -- )
, "+loop"	: {xt:    core._plusLoop ,defining:0} /// +loop			( n -- )
, "i"		: {xt:    core._i		 ,defining:0} /// i				( -- i )
, "j"		: {xt:    core._j		 ,defining:0} /// j				( -- j )
, "("		: {xt:defining._parenth	 ,defining:1} /// (				( -- )
, "\\"		: {xt:defining._backslash,defining:1} /// \				( -- )
, "for"		: {xt:    core._for		 ,defining:0} /// for			( n -- )
, "next"	: {xt:    core._next	 ,defining:0} /// next			( -- )
, "1+"		: {xt:    core._oneplus	 ,defining:0} /// 1+			( n -- n+1 )
, "if"		: {xt:    core._if		 ,defining:0} /// if			( flag -- )
, "else"	: {xt:    core._else	 ,defining:0} /// else			( -- )
, "then"	: {xt:    core._then	 ,defining:0} /// then			( -- )
, "code"	: {xt:defining._code	 ,defining:1} /// code <name> <jsStatement> end-code ( -- )
, "+to"		: {xt:defining._plusto	 ,defining:1} /// +to <name>	( n -- )
, "see"		: {xt:defining._see		 ,defining:1} /// see <name>	( -- )
, "words"	: {xt:    core._words	 ,defining:0} /// words			( -- )
, "/"		: {xt:    core._div		 ,defining:0} /// /				( a b -- a/b )
, "begin"	: {xt:    core._begin	 ,defining:0} /// begin			( -- )
, "?dup"	: {xt:    core._qdup	 ,defining:0} /// ?dup			( 0 -- 0 | n -- n n )
, "while"	: {xt:    core._while	 ,defining:0} /// while			( flag -- )
, "over"	: {xt:    core._over	 ,defining:0} /// over			( a b -- a b a )
, "1-"		: {xt:    core._oneminus ,defining:0} /// 1-			( n -- n-1 )
, "repeat"	: {xt:    core._repeat	 ,defining:0} /// repeat		( -- )
}
if(typeof module==='object'){
	module.exports=words,
	global.words=words;
}else{
	window.words=words;
}