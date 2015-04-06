/*  jefvm.v3.js
	--- Javascript easy Forth (jef or jeforth) virtual machine (vm)
	--- minimalist Forth Implementation in Javascript
	--- MIT license
	2015/01/04	update ms for multi-task by samsuanchen@gmail.com
	2014/10/08	interpretive for-next begin-again begin-until begin-while-repeat
	2014/10/06	add ms as version 3 by samsuanchen@gmail.com
	2014/10/06	add ?dup 0= 1- 
				      if...then, if...else...then,
				      for...next, for aft...then next,
			      	begin...again, begin..until, begin...while...repeat by samsuanchen@gmail.com
	2014/09/26	add ip, data area, and return stack as version 2 by samsuanchen@gmail.com
	2014/09/25	add data stack and number conversion as version 1 by samsuanchen@gmail.com
	2014/09/22	simplifiy to have only code as version 0 by samsuanchen@gmail.com
  2014/09/04  New Version For Espruino Hardware by yapcheahshen@gmail.com
  2012/02/17	add example and modify kernel to be more friendly for education.
  2011/12/23  initial version by yapcheahshen@gmail.com
                equiv to http://tutor.ksana.tw/ksanavm lesson1~8
    TODO: complete eForth core word set
          interface to HTML5 canvas
          port C.H.Ting flag demo for kids
    this is merely a kick off, everyone is welcome to enhance it. */
function JeForthVM() {
  var error	= 0	;   // flag to abort source code interpreting
	var words	=[0];   // collection of all words (jeforth instructions) defined
	var nameWord={ };	// use nameWord['swap'] to get the word swap
	var ip		= 0 ;   // instruction pointer for running a high level colon definition word		//	v2
	var cArea	=[0];	  // code area to hold high level colon definition				//	v2
	var rStack	=[ ];	// return stack to return from high level colon definition		//	v2
	var dStack	=[ ];	// data stack			
	this.base=10 ;	  // number conversion base										//	v1																			//	v1
	this.uob='';	    // user output buffer 				// 20141209 sam
	this.clear=function(){ // clear data stack									//	v1
		dStack=this.dStack=[];															//	v1
	};
	var cr=this.cr=function(msg){
		var t=this.tob||'';
		this.tob='';
		if(!msg)  this.lastTob=t;	      // use cr(msg) to print out more system message
		else      t+=msg;               // use cr() as normal jeforth word
		this.uob+=(this.uob?'\n':'')+t;	// 20141209 sam
		console.log(t);								  // print t (fixed)
	};
	var intToString=function(t){      // auto converting integer according to this.base
		return typeof(t)==='number' && t%1===0 && this.base!==10 ? t.toString(this.base) : t;
	}
	var type=this.type=function(msg){	// send msg to terminal output buffer
		var a=msg||dStack.pop(), that=this;					// pop from data stack if no msg
		a= Array.isArray(a) ? a.map(function(t){
			return intToString.apply(that,[t])
		}).join(' ') : intToString.apply(that,[a]);	//	v1
		this.tob+=a;									// append t to terminal output buffer
  };
  function showErr(msg){var m=msg;
		if(this.err) m='<'+this.err+'>'+m+'</'+this.err+'>'; cr.apply(this,[m]);
  }
  function showTst(msg){var m=msg;
		if(this.tst) m='<'+this.tst+'>'+m+'</'+this.tst+'>'; cr.apply(this,[m]);
  }
  function showOk (msg){var m=msg;
		if(this.ok ) m='<'+this.ok +'>'+m+'</'+this.ok +'>'; cr.apply(this,[m]);
  }
  function showInp(msg){var m=msg;
		if(this.inp) m='<'+this.inp+'>'+m+'</'+this.inp+'>'; cr.apply(this,[m]);
  }
	function panic(msg){	// clear tob, show error msg, and abort
		showErr(msg),error=msg,this.compiling=0;
	}
  function nextChar(){	// get a char  from tib
    return this.nTib<this.tib.length ? this.tib.charAt(this.nTib++) : '';	// get null if eoi
  }
  function nextToken(){	// get a token from tib
		this.token=''; var c=nextChar.call(this);
    while (c===' '||c==='\t'||c==='\r') c=nextChar.call(this);	// skip white-space
    while (c){
			if(c===' '||c==='\t'||c==='\r'||c==='\n')break;	// break if white-space
			this.token+=c, c=nextChar.call(this);						// pick up none-white-space
		}
		this.c=c;
    return this.token;
  }
  function compile(v) {	// compile v to code area									//	v2
		var c= v===undefined ? this.cArea[this.ip++] : v;									//	v2
		this.cArea.push(c);																//	v2
  }																					//	v2
  function compileCode(name,v) {	// compile named word to code area					//	v2
		var n= name===undefined ? nextToken.call(this) : name;									//	v2
		var w=this.nameWord[n];															//	v2
		compile.apply(this,[w]);																		//	v2
		if(v!==undefined)this.compile.apply(this,[v]);                                                 //	v2
  }																					//	v2
  function resumeCall() {	// resume inner loop interpreting of compiled code			//	v3
		while(this.ip && !this.waiting){													//	v3
			var w=this.cArea[this.ip];														//	v3
			this.ip++, execute.apply(this,[w]);														//	v3
		}																				//	v3
  }																					//	v3
  function call(addr) {	// interpret compiled code at addr of cArea					//	v2
		this.rStack.push(this.ip), this.ip=addr;												//	v2
		resumeCall.call(this);																	//	v3
  }																					//	v2
  function exit() {	// return from colon definition									//	v2
		this.ip=this.rStack.pop();// pop ip from return stack								//	v2
	}																					//	v2
  function execute(w){            // execute or compile a word
		var immediate=w.immediate, compiling=immediate?0:this.compiling;					//	v2
		if(typeof w==='object'){
			if(compiling){																//	v2
				compile.apply(this,[w]);																//	v2
			} else {																	//	v2
				var x=w.xt, t=typeof x;
				if(t==="function"){
					x.call(this);				// execute function x directly
				} else if(t==="number"){												//	v2
					call.apply(this,[x]);
				} else {
					panic.apply(this,['error execute:\t'+w.name+' w.xt='+x+' ????']);// xt undefined
				}
			}																			//	v2
		} else {
          panic.apply(this,['error execute:\t'+w+' ????']);						// w is not a word
		}
  }
  function extData(tkn){
  }
  function extQuotedStr(tkn){
    var c=tkn.charAt(0);
		if(c==='"'){																	//	v1
			var t=this.tib.substr(0,this.nTib-1);												//	v1
			var L=Math.max(t.lastIndexOf(' '),t.lastIndexOf('\n'),t.lastIndexOf('\t'))+1;	// current "	//	v1
			t=this.tib.substr(L+1);										// rest tib		//	v1
			var i=t.indexOf(c);											// next    "	//	v1
			var p=t.charAt(i-1);										// prev char	//	v1
			var n=t.charAt(i+1);											// next char	//	v1
			if(i>=0 && p!=='\\' && (n===' '||n==='\t'||n==='\r'||n==='\n'||n==='')){	//	v1
				this.nTib=L+i+2, t=this.tib.substr(L+1,i);									//	v1
				return t;				// "abc" return string abc ( alow space	)		//	v1
			}																			//	v1
		}																				//	v1
		if(c==="'" && c===tkn.charAt(tkn.length-1)){									//	v1
			return tkn.substr(1,tkn.length-2);		// 'abc' return string abc no space //	v1
		}
		return this.extData.apply(this,[tkn]);
	}
  function extNum(tkn){ var n;
		if(tkn.charAt(0)==='$'){
			n=parseInt(tkn.substr(1),16);
			if('$'+n.toString(16)===tkn) return n;	// hexa decimal integer number
		}
		if(this.base===10){
	    	n=parseFloat(tkn);
			if(n.toString()===tkn) return n; 		// decimal floating number
		} else {
			n=parseInt(tkn,this.base);
			if(n.toString(this.base)===tkn) return n; // any based integer numbe
		}
  }																					//	v1
	function resumeExec(step,resumeDone){		// resume outer source code interpreting loop			//	v3
    this.onDone=resumeDone;
    this.waiting=this.steping||step;                                                                   //  v3
    if(this.ip){																		//	v3
      resumeCall.call(this);		// resume inner compiled code interpreting				//	v3
    }																				//	v3
    var tkn,n;
    do{	this.token=tkn=nextToken.call(this);	// get a token
			if (tkn) {					// break if no more
				var w=nameWord[tkn];	// get word if token is already defined
				if (w)
				  execute.apply(this,[w]);		// execute or compile the word
				else {	n=extNum.apply(this,[tkn]);													//	v1
					if(n===undefined)
						n=extQuotedStr.apply(this,[tkn]);											//	v1
					if(n===undefined)
						n=this.extData.apply(this,[tkn]);												//	v1
					if(n===undefined){													//	v1
						panic.apply(this,["? "+this.token+" undefined"]); return; // token undefined
					}																	//	v1
					if(this.compiling)													//	v2
						compileCode.apply(this,['doLit',n]);											//	v2
	        else																//	v2
						dStack.push(n);													//	v1
				}
			}
		} while(!this.waiting && this.nTib<this.tib.length);
		if(!this.waiting && !this.compiling){
			var ok=' ok';
			if(this.ok)
			  ok=' <'+this.ok+'>'+ok+'</'+this.ok+'>';								//	v3
			cr.apply(this,[ok]);
		}
		if(resumeDone)
			resumeDone();
		var result=this.uob+this.tob;
		this.uob=this.tob='';
		return result;
  }
  var lastCmd='',tasks=[];
  function exec(cmd,step){		// source code interpreting
    if(!cmd) return // 20141216 sam
    if(cmd!==lastCmd)
			lastCmd=cmd, this.cmds.push(cmd), this.iCmd=this.cmds.length;	// for tracing only
		if(this.inp)
		  this.showInp.apply(this,[cmd]);
		else
		  cr.apply(this,['source input '+this.cmds.length+':\n'+cmd]);			// for tracing only
		error=0, this.tib=cmd, this.nTib=0, this.tob=this.uob='';		// 20141209 sam
		resumeExec.apply(this,[step]), this.error=error;					// 20141209 sam	//	v3 
    return this.uob+this.tob;				// return this.uob 	// 20141209 sam
	}
	function addWord(name,xt,immediate){	// 
		var id=words.length, w={name:name,xt:xt,id:id}; words.push(w), nameWord[name]=w;
		if(immediate)w.immediate=1;
		cr.apply(this,['defined '+id+': '+name+(typeof xt==='function'? ' as primitive' : '')]);
	}
	var endCode='end-code';
	function code(){ // code <name> d( -- )	// low level definition as a new word
		var i,t;
		this.newName=nextToken.call(this);
		t=this.tib.substr(this.nTib),i=t.indexOf(endCode),this.nTib+=i+endCode.length;
		if(i<0){
			panic("missing end-code for low level "+this.token+" definition");
			return;
		}
		var txt='('+t.substr(0,i)+')';
		var newXt=eval(txt);//eval(txt);
		addWord.apply(this,[this.newName,newXt]);
	}
	function doLit(){ // doLit ( -- n ) //												//	v2
		this.dStack.push(this.cArea[this.ip++]);												//	v2
	}			
	this.cmds=[];
	this.iCmd=-1;
	this.showErr=showErr;
	this.showTst=showTst;
	this.showOk =showOk ;
	this.showInp=showInp;
	this.panic=panic        ;																//	v2
	this.nextToken=nextToken;																//	v2
	this.compileCode=compileCode;															//	v2
	this.execute=execute    ;																//	v2
	this.compile=compile    ;																	//	v2
	this.nameWord=nameWord  ;																//	v2
	this.ip=ip              ;																//	v2
	this.cArea=cArea        ;																//	v2
	this.rStack=rStack      ;																//	v2
	this.dStack=dStack      ;																//	v1
	this.extData=extData    ;																//	v3
	this.rTimes	= 0 ;	// resume times													//	v3
	this.waiting	= 0 ;	// flag of   waiting mode										//	v3
	this.compiling= 0 ;	// flag of compiling mode										//	v2
	this.resumeExec=resumeExec;                                                           //  v3
	this.tob		=''	;	// initial terminal output buffer
  this.tib		=''	;	// initial terminal  input buffer (source code)
  this.nTib		= 0	;	// offset of tib processed
	this.exec	=exec         ;
	this.words=words        ;
	this.code =code         ;
	this.doLit=doLit        ;
	this.exit =exit         ;
	this.addWord=addWord    ;
}
if (typeof module!="undefined")
	module.exports=JeForthVM;
else
	window.vm=new JeForthVM();
//  vm is now creaded and ready to use.