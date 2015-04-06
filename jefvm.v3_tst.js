/////////////////////
// jefvm.v3_tst.js //
/////////////////////
function tst(vm) {
	function confirmOutputResult(title,jeforthCode,outputResult){
		vm.exec.apply(vm,[jeforthCode]);
		vm.equal.apply(vm,[title,vm.lastTob,outputResult]);
	}
	vm.tests=0, vm.passed=0;
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 1 for decimal integer number input',
						'123 . -10 . cr',
						'123 -10 ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 2 for real number input',
						'4.56 . cr',
						'4.56 ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 3 for hexadecimal integer number input',
						'$41 . cr',
						'65 ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 4 for double quote string input',
						'"abc" . "def 123" . cr',
						'abc def 123 ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 5 for single quote string input (no spaces in string)',
						"'ghi' . cr",
						'ghi ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 6 for "type" (no extra space)',
						'5 type 2 . 5 . cr',
						"52 5 ");
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 7 for adding string and number)',
						'"abc def" '+"'ghi' + 2.23 0.23 - 3 * 2 / + . cr",
						'abc defghi3 ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 8 for printing number as hexdecimal',
						'128 hex . cr decimal',
						'80 ');
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 9 for decoding hexdecimal number',
						'hex 100 decimal . cr',
						"256 ");
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 10 for printing number as binary',
						'11 binary . decimal cr',
						"1011 ");
//////////////////////////////////////////////////////////////////////////////////////////// v1
	confirmOutputResult('test 11 for printing number right justified',
						'5 3 .r 10 3 .r 15 3 .r cr',
						'  5 10 15');
//////////////////////////////////////////////////////////////////////////////////////////// v2
	vm.cArea=[ 0, vm.nameWord['doLit'], 3, vm.nameWord['.r'], vm.nameWord['exit'] ];
	vm.addWord('t',1);
	confirmOutputResult('test 12 for composing and executing a simple word',
						'5 t 10 t 15 t cr',
						'  5 10 15');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 13 for defining and executing a simple word',
						': x 3 .r ; 5 x 10 x 15 x cr',
						'  5 10 15');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 14 for defining a word running for-next loop',
						': z 9 for r@ . next ; z cr',
						'9 8 7 6 5 4 3 2 1 0 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 15 for defining another word running for-next loop',
						': t1 8 for dup 9 r@ - * 3 .r next drop ; 3 t1 cr',
						'  3  6  9 12 15 18 21 24 27');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 16 for defining a word printing 9x9 table',
						': t2 8 for 9 r@ - t1 cr next ; t2',
						'  9 18 27 36 45 54 63 72 81');
//////////////////////////////////////////////////////////////////////////////////////// v2
	var addr=vm.cArea.length;
	var compiled=[  vm.nameWord['zBranch'], 5, vm.nameWord['doLit'], "non-zero",
					vm.nameWord[ 'branch'], 3, vm.nameWord['doLit'], "zero",
					vm.nameWord[   'exit']
				 ];
	vm.cArea=vm.cArea.concat(compiled);
	vm.addWord.apply(vm,['t17',addr]);
	confirmOutputResult('test 17 for composing and executing a word to check if zero or not',
						'0 t17 . 5 t17 . cr',
						'zero non-zero ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	addr= vm.cArea.length;
	vm.exec .apply(vm,[': t18 if "non-zero" else "zero" then ;']);
	vm.equal.apply(vm,['test 18 for checking a word of same compiled code',
		JSON.stringify(vm.cArea.slice(addr)),
		JSON.stringify(compiled)]);
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 19 for executing the word to check if zero or not',
						'0 t18 . 5 t18 . cr',
						'zero non-zero ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 20 for defining a word running begin-again loop',
						': t20 begin dup . 1- ?dup 0= if exit then again ; 9 t20 cr',
						'9 8 7 6 5 4 3 2 1 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 21 for defining a word running begin-until loop',
						': t21 begin dup . 1- ?dup 0= until ; 9 t21 cr',
						'9 8 7 6 5 4 3 2 1 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 22 for defining a word running begin-while-repeat loop',
						': t22 begin ?dup while dup . 1- repeat ; 9 t22 cr',
						'9 8 7 6 5 4 3 2 1 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 23 for checking mod',
						'10 3 mod . cr',
						'1 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 24 for checking /mod',
						'10 3 /mod . . cr',
						'3 1 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 25 for running interpretive begin-until loop',
						'3 begin dup . 1 - ?dup 0= until cr',
						'3 2 1 ');
//////////////////////////////////////////////////////////////////////////////////////// v2
	confirmOutputResult('test 26 for interpretive for-next to print 9x9 table',
						'8 for 9 i - 8\n  for dup 9 i - * 3 .r \n  next cr drop\nnext',
						'  9 18 27 36 45 54 63 72 81');
//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.showTst.apply(vm,['total tests '+vm.tests+' passed '+vm.passed]);
///////////////////////////////////////////////////////////////////////////////////////////
}
if(typeof module!='undefined')
	module.exports=tst;
else
	tst(vm);