var assert		=require("assert");
var Transpile	=require("../src/transpile.js");
var transpile	=Transpile.transpile;

Transpile.trace(true);
describe(			"A.  test literals"
	,function(){		///////////////////

	it(				"A1.  test integers ok"
	,function(){assert.deepEqual(	//////////////////////
		transpile([		"0 1 23 -4 56789"
		]).stack,		[0,1,23,-4,56789]
	)})

	it(				"A2.  test floats ok"
	,function(){assert.deepEqual(	//////////////////////
		transpile([		"0.1 -2.3 -4.5e6"
		]).stack,		[0.1,-2.3,-4.5e6]
	)})

	it(				"A3.  test strings ok"
	,function(){assert.deepEqual(	//////////////////////
		transpile([		"'0.1' 'abc' 'deFghi'"
		]).stack,		['0.1','abc','deFghi']
	)})

});

describe(			"B.  test core words"
	,function(){		/////////////////////

	it(				"B1.  test + numbers ok"
	,function(){assert.deepEqual(	////////////////////////
		transpile([		"3 5 +"
		]).stack,		[8]
	)})

	it(				"B2.  test - numbers ok"
	,function(){ assert.deepEqual(	////////////////////////
		transpile([		"5 3 -"
		]).stack,		[2]
	)})

	it(				"B3.  test + strings ok"
	,function(){ assert.deepEqual(	////////////////////////
		transpile([		"'3' 5 +"
		]).stack,		["35"]
	)})

	it(				"B4.  test dup * ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		"3.5 dup *"
		]).stack,		[12.25]
	)})

	it(				"B5.  test swap drop ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		"3 5 swap drop"
		]).stack,		[5]
	)})

	it(				"B6.  test rot -rot ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		"1 2 3 rot swap -rot"
		]).stack,		[3,2,1]
	)})

});

describe(			"C.  test defining words"
	,function(){		/////////////////////////

	it(				"C1.  test value to ok"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		"5 value a 3 a + to a 2 a +"
		]).stack,		[10]
	)})
			
	it(				"C2.  test : ; ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile([		": x 5 + ; 3 x"
		]).stack,		[8]
	)})

	it(				"C3.  test do loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile([		"0 10 1 do i + loop" // sum( 1, 2, ,,, 8, 9 )
		]).stack,		[45]
	)})

	it(				"C4.  another way to test do loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile([		"0 1 9 do i + loop" // sum( 9, 8, ... 2, 1 )
		]).stack,		[45]
	)})

	it(				"C5.  test do +loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile([		"0 1 9 do i + -1 +loop" // sum( 9, 8, ... 2, 1 )
		]).stack,		[45]
	)})

	it(				"C6.  another way test do i +loop ok"
	,function(){ assert.deepEqual(	//////////////////
		transpile([		"0 10 1 do i + 2 +loop" // sum( 1, 3, 5, 7, 9 )
		]).stack,		[25]
	)})
			
});