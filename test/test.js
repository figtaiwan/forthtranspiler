var assert		=require("assert");
var Transpile	=require("../src/transpile.js");
var transpile	=Transpile.transpile;
//Transpile.trace(2);

describe(			"A.  test literals"
	,function(){		///////////////////

	it(				"A1.  test integers ok"
	,function(){assert.deepEqual(	//////////////////////
		transpile(	"0 . 1 . 23 . -4 . 56789 ."
		).out,		" 0 1 23 -4 56789"
	)})

	it(				"A2.  test floats ok"
	,function(){assert.deepEqual(	//////////////////////
		transpile(	"0.1 . -2.3 . -4.5e6 ."
		).out,		" 0.1 -2.3 -4500000"
	)})

	it(				"A3.  test strings ok"
	,function(){assert.deepEqual(	//////////////////////
		transpile(	"'0.1' . 'abc' . 'deFghi' ."
		).out,		" 0.1 abc deFghi"
	)})

});

describe(			"B.  test core words"
	,function(){		/////////////////////

	it(				"B1.  test + numbers ok"
	,function(){assert.deepEqual(	////////////////////////
		transpile(	"3 5 + ."
		).out,		" 8"
	)})

	it(				"B2.  test - numbers ok"
	,function(){ assert.deepEqual(	////////////////////////
		transpile(	"5 3 - ."
		).out,		" 2"
	)})

	it(				"B3.  test + strings ok"
	,function(){ assert.deepEqual(	////////////////////////
		transpile(	"'3' 5 + ."
		).out,		" 35"
	)})

	it(				"B4.  test dup * ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"3.5 dup * ."
		).out,		" 12.25"
	)})

	it(				"B5.  test swap drop ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"3 5 swap drop ."
		).out,		" 5"
	)})

	it(				"B6.  test rot -rot ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"1 2 3 rot swap -rot . . ."
		).out,		" 1 2 3"
	)})

});

describe(			"C.  test defining words"
	,function(){		/////////////////////////

	it(				"C1.  test value to ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"5 value a 3 a + to a 2 a + ."
		).out,		" 10"
	)})
			
	it(				"C2.  test : ; ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile(	": x 5 + ; 3 x ."
		).out,		" 8"
	)})

	it(				"C3.  test do loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile(	"0 10 1 do i + loop ." // sum( 1, 2, ,,, 8, 9 )
		).out,		" 45"
	)})

	it(				"C4.  another way to test do loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile(	"0 1 9 do i + loop ." // sum( 9, 8, ... 2, 1 )
		).out,		" 45"
	)})

	it(				"C5.  test do +loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile(	"0 1 9 do i + -1 +loop ." // sum( 9, 8, ... 2, 1 )
		).out,		" 45"
	)})

	it(				"C6.  another way test do i +loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile(	"0 10 1 do i + 2 +loop ." // sum( 1, 3, 5, 7, 9 )
		).out,		" 25"
	)})

	it(				"C7.  nested do i loop"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"4 1 do i 4 1 do dup i * 3 .r loop cr drop loop"
		).out,		"  1  2  3\n  2  4  6\n  3  6  9\n"
	)})

	it(				"C8.  nested do i j loop"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"4 1 do 4 1 do j i * 3 .r loop cr loop"
		).out,		"  1  2  3\n  2  4  6\n  3  6  9\n"
	)})

});

describe(			"D.  nested colon calls"
	,function(){		/////////////////////////

	it(				"D1.  comment in colon"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	": x ( a b -- ) * 3 .r ; 2 3 x"
		).out,		"  6"
	)})

	it(				"D2.  nested colon"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	": x ( a b -- ) * 3 .r ;\n: y ( a -- ) 4 1 do dup i x loop drop ;\n: z ( -- ) 4 1 do i y cr loop ; z"
		).out,		"  1  2  3\n  2  4  6\n  3  6  9\n"
	)})

	it(				"D3.  looping 40000000 times"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	": x 40000000 0 do 1+ loop ;\n0 x ."
		).out	  ,	" 40000000"
	)})

});

describe(			"E.  for next"
	,function(){		/////////////////////////

	it(				"E1.  for next ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"0 9 for i dup . + next ."
		).out,		" 9 8 7 6 5 4 3 2 1 0 45"
	)})

	it(				"E2.  for next ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"0 4000000 for 1 + next ."
		).out,		' 4000001'
	)})

	it(				'E3.  if then for zero ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"'' 0 if 'non-' + then 'zero' + 0 .r"
		).out,		'zero'
	)})

	it(				'E4.  if then for non-zero ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	" '' 1 if 'non-' + then 'zero' + 0 .r"
		).out,		'non-zero'
	)})

	it(				'E5.  if else then for zero ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"0 if 'non-zero' else 'zero' then 0 .r"
		).out,		'zero'
	)})

	it(				'E6.  if else then for non-zero ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"1 if 'non-zero' else 'zero' then 0 .r"
		).out,		'non-zero'
	)})

	it(				'E7.  if else then in colon for zero ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	": x if 'non-zero' else 'zero' then 0 .r ; 0 x"
		).out,		'zero'
	)})

	it(				'E8.  if else then in colon for non-zero ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	": x if 'non-zero' else 'zero' then 0 .r ; 1 x"
		).out,		'non-zero'
	)})

	it(				'E9.  code ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile("code x stack.push(stack[stack.length-1]); end-code\n2 x \\ x is nothing but 'dup'\n. ."
		).out,		' 2 2'
	)})

	it(				'E10.  +to ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"0 value x \\ set x\n10 for i +to x next \\ add to x\nx . \\ print x"
		).out,		' 55'
	)})

	it(				'E11.  see ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"123 value x\nsee x"
		).out,		'123'
	)})

	it(				'E12.  see ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"see x"
		).out,		'undefined'
	)})

	it(				'E13.  see ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"see ."
		).out,		'function _dot() { /// . ( n -- )\r\n\tstate.codegen.push(\r\n\t\t"_out+=\' \'+stack.pop();"\r\n\t);\r\n}'
	)})

	it(				'E14.  words ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"words"
		).out,		"39 primitives\ndup drop swap rot -rot * + . .r cr - ; : value to do loop +loop i j ( \\ for next 1+ if else then code +to see words / begin ?dup while over 1- repeat\n0 extra defined"
	)})

	it(				'E15.  words ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	"1 value one\n: two 2 ;\nsee one cr see two cr\nwords"
		 ).out,		"1\nfunction (){\nstack.push(2);\n}\n39 primitives\ndup drop swap rot -rot * + . .r cr - ; : value to do loop +loop i j ( \\ for next 1+ if else then code +to see words / begin ?dup while over 1- repeat\n2 extra defined\none two"
	)})

	it(				'E16.  begin ?dup while over repeat ok'
	,function(){ assert.deepEqual(	////////////////////
		transpile(	": x 0 9 begin ?dup while swap over + swap 1- repeat . ; x"
		 ).out,		" 45"
	)})

});
