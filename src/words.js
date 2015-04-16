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
	, "1+"		: {xt:_oneplus	,defining:0} /// 1+				( n -- n+1 )
	, "if"		: {xt:_if		,defining:0} /// if				( flag -- )
	, "else"	: {xt:_else		,defining:0} /// else			( -- )
	, "then"	: {xt:_then		,defining:0} /// then			( -- )
	, "code"	: {xt:_code		,defining:1} /// code <name> <jsStatement> end-code ( -- )
	, "+to"		: {xt:_plusto	,defining:1} /// +to <name>		( n -- )
	, "see"		: {xt:_see		,defining:1} /// see <name>		( -- )
	, "words"	: {xt:_words	,defining:0} /// words			( -- )
	}
module.exports=words;