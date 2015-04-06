var assert		=require("assert");
var Transpile	=require("../src/transpile.js");
var transpile	=Transpile.transpile;

Transpile.trace(0);
// /*
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

// /*
describe(			"B.  test core words"
	,function(){		/////////////////////

	it(				"B1.  test + numbers ok"
	,function(){assert.deepEqual(	////////////////////////
		transpile([		"3 5 +"
		]).stack,		[8]
	)})
// /*
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
// */
// /*
describe(			"C.  test defining words"
	,function(){		/////////////////////////
// /*
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
// */
// /*
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

	it(				"C7.  nested do i loop"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		"10 1 do cr i 10 1 do dup i * 3 .r loop drop loop"
		]).out,	"\n"+	"  1  2  3  4  5  6  7  8  9\n"+
						"  2  4  6  8 10 12 14 16 18\n"+
						"  3  6  9 12 15 18 21 24 27\n"+
						"  4  8 12 16 20 24 28 32 36\n"+
						"  5 10 15 20 25 30 35 40 45\n"+
						"  6 12 18 24 30 36 42 48 54\n"+
						"  7 14 21 28 35 42 49 56 63\n"+
						"  8 16 24 32 40 48 56 64 72\n"+
						"  9 18 27 36 45 54 63 72 81"
	)})

	it(				"C8.  nested do i j loop"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		"10 1 do cr 10 1 do j i * 3 .r loop loop"
		]).out,	"\n"+	"  1  2  3  4  5  6  7  8  9\n"+
						"  2  4  6  8 10 12 14 16 18\n"+
						"  3  6  9 12 15 18 21 24 27\n"+
						"  4  8 12 16 20 24 28 32 36\n"+
						"  5 10 15 20 25 30 35 40 45\n"+
						"  6 12 18 24 30 36 42 48 54\n"+
						"  7 14 21 28 35 42 49 56 63\n"+
						"  8 16 24 32 40 48 56 64 72\n"+
						"  9 18 27 36 45 54 63 72 81"
	)})

});
// */
// /*
describe(			"D.  nested colon calls"
	,function(){		/////////////////////////

	it(				"D1.  comment in colon"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		": x ( a b -- ) * 3 .r ;"
		]).stack,		[]
	)})

	it(				"D2.  nested colon"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		": x ( a b -- ) * 3 .r ;" // \ print out a*b
				  ,		": y ( a -- ) 10 1 do dup i x loop drop ;"
				  ,		": z ( -- ) 10 1 do cr i y loop ; z"
		]).out,	"\n"+	"  1  2  3  4  5  6  7  8  9\n"+
						"  2  4  6  8 10 12 14 16 18\n"+
						"  3  6  9 12 15 18 21 24 27\n"+
						"  4  8 12 16 20 24 28 32 36\n"+
						"  5 10 15 20 25 30 35 40 45\n"+
						"  6 12 18 24 30 36 42 48 54\n"+
						"  7 14 21 28 35 42 49 56 63\n"+
						"  8 16 24 32 40 48 56 64 72\n"+
						"  9 18 27 36 45 54 63 72 81"
	)})

	it(				"D3.  looping 200000000 times"
	,function(){ assert.deepEqual(	////////////////////
		transpile([		": x 200000000 0 do loop ;" // \ print out a*b
				  ,		"x"
		]).stack, []
	)})

});
// */