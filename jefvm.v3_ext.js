function ext(vm) {
//////////////////////////////////////////////////////////////////////////////////////// tools
	vm.equal=function equal(tag,value,expected){ var t; // asure value is exactly equal to expected
	  vm.tests++;
	  if(value===expected)
	    vm.passed++, vm.showTst.apply(vm,[tag+' ok']);
	  else{
	    var tv=typeof value, te=typeof expected;
	    t='??? '+tag+' value:'+value+' not equal to expected:'+expected
	    vm.showErr.apply(vm,[t]);
	    if(tv==='string')
	      t='val len '+value.length+': '+value.split('').map(function(c){
	        return c.charCodeAt(0).toString(16);
	      }).join(' '), vm.showErr.apply(vm,[t]);
	    if(te==='string')
	      t='exp len '+expected.length+': '+expected.split('').map(function(c){
	        return c.charCodeAt(0).toString(16);
	      }).join(' '), vm.showErr.apply(vm,[t]);
	  }
	}
	vm.trm=function trm(x){ // ignore all space, \t, or \n in string x
	    var y='';
	    for(var i=0;i<x.length;i++){
	        var c=x.charAt(i);
	        if(c!==' '&&c!=='\t'&&c!=='\n')y+=c;
	    }
	    return y;
	}
///////////////////////////////////////////////////////////////////////////////////////////////
	vm.showWords=function(){
		var nw=vm.words.length;
		var primitives=[], colons=[];
		vm.words.forEach(function(w,i){
			if(w){	var type=typeof w.xt, name=i+' '+w.name;
				if(type==='function') primitives.push(name);
				else if(type==='number') colons.push(name);
			}
		});
		var np=primitives.length, nc=colons.length, ni=nw-np-nc;
		vm.cr(nw+' words ('+
			np+' primitives '+
			nc+' colons '+
			ni+' ignores');
		vm.type.apply(vm,['primitives:']);
		primitives.forEach(function(w){
			if(vm.tob.length+w.length+1>80)vm.cr.apply(vm,[]);
			vm.type.apply(vm,[' '+w]);
		});
		if(vm.tob)vm.cr.apply(vm,[]);
		vm.type.apply(vm,['colons:']);
		colons.forEach(function(w){
			if(vm.tob.length+w.length+1>80)vm.cr.apply(vm,[]);
			vm.type.apply(vm,[' '+w]);
		});
		if(vm.tob)vm.cr.apply(vm,[]);
	};
	vm.seeColon=function seeColon(addr){
	  var ip=addr,prevName='',codeLimit=0;
	  do {
	    var s=ip, w=vm.cArea[ip++];
	    s+=': ', n=typeof w==='object'?w.name:'';
	    if(n){ var x=w.xt, t=typeof x;
	      s+=n.replace(/</g,'&lt;')+(t==='function'?' primitive':t==='number'?(' colon at '+x):'');
	    } else {
	      if((prevName==='branch' || prevName==='zBranch')){
	        if(w>0)
	          codeLimit=Math.max(codeLimit,ip+w);
	        s+='(to '+(ip+w)+') ';
	      }
	      s+=w;
	    }
	    vm.cr.apply(vm,[s]);
	    prevName=n;
	  } while((codeLimit && ip<codeLimit) || n!=='exit');
	};
	vm.seeWord=function seeWord(w){
		var o= typeof o==='string'?vm.nameWord[w]:w;
		if(typeof o==='object'){
	      var n=o.name, x=o.xt, t=typeof x, i=o.immediate?'immediate':'';
			if(t==='function'){
				vm.cr.apply(vm,[n+' primitive '+i]),vm.cr.apply(vm,[x.toString().replace(/</g,'&lt;')]);
			} else if(t==='number' && x%1===0){
				vm.cr.apply(vm,[n+' colon '+i]),vm.seeColon.apply(vm,[x]);
			}else{
				vm.cr.apply(vm,[n+' xt='+x+' ?????']);
			}
		}else{
			vm.cr.apply(vm,[w+' ?????']);
		}
	};
	vm.seeArray=function seeArray(arr){
		var old=vm.cArea; addr=old.length;
		vm.cArea=vm.cArea.concat(arr);
		vm.seeColon.apply(vm,[addr]);
		vm.cArea=old;
	};
	vm.see=function see(x){
		var o=x||vm.nextToken.apply(vm,[]);
		var t=typeof o;
		if(t==='number' && o%1===0){
			vm.seeColon.apply(vm,[o]);
		} else if(t==='object'){
			vm.seeWord.apply(vm,[o]);
		} else if(t==='string'){
			vm.seeWord.apply(vm,[vm.nameWord[o]]);
		} else {
			vm.cr.apply(vm,[o+' ?????']);
		}
	};
//////////////////////////////////////////////////////////////////////////////////////// tools
	vm.addWord.apply(vm,['code'   ,vm.code]);
	vm.addWord.apply(vm,['doLit'  ,vm.doLit]);																//	v2
	vm.addWord.apply(vm,['exit'   ,vm.exit ]);																//	v2
	vm.addWord.apply(vm,['words'  ,vm.showWords]);
	vm.addWord.apply(vm,['see'    ,vm.see]);
	vm.addWord.apply(vm,['type'   ,vm.type]);
	vm.addWord.apply(vm,['cr'     ,vm.cr]);
//////////////////////////////////////////////////////////////////////////////////////////// v1
	vm.addWord.apply(vm,[  '.'	  ,function(){vm.type.call(this),vm.type.apply(this,[" "]);}]);
	vm.addWord.apply(vm,[  '+'	  ,function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()+b);}]);
	vm.addWord.apply(vm,[  '-'	  ,function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()-b);}]);
	vm.addWord.apply(vm,[  '*'	  ,function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()*b);}]);
	vm.addWord.apply(vm,[  '/'	  ,function(){var b=vm.dStack.pop();vm.dStack.push(vm.dStack.pop()/b);}]);
	vm.addWord.apply(vm,[ '1+'	  ,function(){var s=vm.dStack; s[s.length-1]++;}]);
	vm.addWord.apply(vm,[ '1-'	  ,function(){var s=vm.dStack; s[s.length-1]--;}]);
	vm.addWord.apply(vm,[ '2+'	  ,function(){var s=vm.dStack; s[s.length-1]+=2;}]);
	vm.addWord.apply(vm,[ '2-'	  ,function(){var s=vm.dStack; s[s.length-1]-=2;}]);
	vm.addWord.apply(vm,[ '2*'	  ,function(){var s=vm.dStack; s[s.length-1]*=2;}]);
	vm.addWord.apply(vm,[ '2/'	  ,function(){var s=vm.dStack; s[s.length-1]/=2;}]);
	vm.addWord.apply(vm,[ '2%'	  ,function(){var s=vm.dStack; s[s.length-1]%=2;}]);
	vm.addWord.apply(vm,[ 'mod'	  ,function(){var s=vm.dStack, d=s.pop(); s[s.length-1]%=d;}]);
	vm.addWord.apply(vm,['/mod'	  ,function(){
		var s=vm.dStack, t=s.length-1,n=t-1,sn=s[n],st=s[t],r=s[n]=sn%st; s[t]=(sn-r)/st;}]);
	vm.addWord.apply(vm,['and'	  ,function(){vm.dStack.push(vm.dStack.pop()&vm.dStack.pop());}]);
	vm.addWord.apply(vm,['or' 	  ,function(){vm.dStack.push(vm.dStack.pop()|vm.dStack.pop());}]);
	vm.addWord.apply(vm,['xor'	  ,function(){vm.dStack.push(vm.dStack.pop()^vm.dStack.pop());}]);
	vm.addWord.apply(vm,['hex'    ,function(){vm.base=16;}]);
	vm.addWord.apply(vm,['decimal',function(){vm.base=10;}]);
	vm.addWord.apply(vm,['binary' ,function(){vm.base= 2;}]);
	vm.addWord.apply(vm,['.r'	  ,function(){
		var m=vm.dStack.pop(),n=""+vm.dStack.pop();vm.type.apply(vm,["         ".substr(0,m-n.length)+n]);}]);
//////////////////////////////////////////////////////////////////////////////////////////// v2
	vm.addWord.apply(vm,[':'	  ,function(){
		vm.newName=vm.nextToken.apply(vm,[]),vm.newXt=vm.cArea.length,vm.compiling=1;}]);
	vm.addWord.apply(vm,['immediate',function(){vm.words[vm.words.length-1].immediate=1;}]);
	vm.addWord.apply(vm,[';'	  ,function(){
		vm.compileCode.apply(vm,["exit"]),vm.compiling=0;vm.addWord.apply(vm,[vm.newName,vm.newXt]);},'immediate']);
	vm.addWord.apply(vm,['r@'	  ,function(){vm.dStack.push(vm.rStack[vm.rStack.length-1]);}]);
	vm.addWord.apply(vm,['i' 	  ,function(){vm.dStack.push(vm.rStack[vm.rStack.length-1].i);}]);
	vm.addWord.apply(vm,['drop'	  ,function(){vm.dStack.pop();}]);
	vm.addWord.apply(vm,['dup'	  ,function(){vm.dStack.push(vm.dStack[vm.dStack.length-1]);}]);
	vm.addWord.apply(vm,['over'	  ,function(){vm.dStack.push(vm.dStack[vm.dStack.length-2]);}]);
	vm.addWord.apply(vm,['emit'	  ,function(){vm.type.apply(vm,[String.fromCharCode(vm.dStack.pop())]);}]);
	vm.addWord.apply(vm,['>r'	  ,function(){vm.rStack.push(vm.dStack.pop());}]);
	vm.addWord.apply(vm,['?dup'	  ,function () {var s=vm.dStack, d=s[s.length-1]; if(d)s.push(d);}]);
	vm.addWord.apply(vm,['0='	  ,function () {var s=vm.dStack,m=s.length-1; s[m]=!s[m];}]);
	vm.addWord.apply(vm,['for'	  ,function(){
		if(vm.compiling){
			vm.compileCode.apply(vm,[">r"]);
			vm.dStack.push({name:"for",at:vm.cArea.length}); return;
		}
		var nTib=vm.nTib,i=vm.dStack.pop();vm.rStack.push({name:"for",nTib:nTib,i:i});
	},'immediate']);
	vm.addWord.apply(vm,['doNext',function(){
		var i=vm.rStack.pop();
		if(i){vm.rStack.push(i-1),vm.ip+=vm.cArea[vm.ip];}
		else vm.ip++;}]);
	vm.addWord.apply(vm,[  'next',function(){ var o;
	  if(vm.compiling) o=vm.dStack.pop();
	  else o=vm.rStack[vm.rStack.length-1];
	  var t=typeof o;
	  if(t!=="object" || o.name!=="for"){
	    vm.panic.apply(vm,["missing for to match next"]); return;
	  }
	  if(vm.compiling){
	    vm.compileCode.apply(vm,["doNext",o.at-vm.cArea.length-1]); return;
	  }
	  if(--o.i>=0)vm.nTib=o.nTib;
	  else        vm.rStack.pop();
	},'immediate']);
	vm.addWord.apply(vm,['branch'	,function(){vm.ip+=vm.cArea[vm.ip];}]);
	vm.addWord.apply(vm,['zBranch'	,function(){
		if(vm.dStack.pop())vm.ip++; else vm.ip+=vm.cArea[vm.ip];}]);
	vm.addWord.apply(vm,['if',function(){
		if(vm.compiling){
			vm.compileCode.apply(vm,["zBranch",0]);
			vm.dStack.push({name:"if",at:vm.cArea.length-1});return;
		}
		if(vm.dStack.pop())return; // 20141215 sam fixed
		var e=vm.tib.substr(vm.nTib).indexOf("else");
		var t=vm.tib.substr(vm.nTib).indexOf("then");
		if(e>=0){
			if(t && t<e)
				vm.nTib+=t+4; // zbranch to then
			else
				vm.nTib+=e+4; // zbranch to else
		} else if(t>=0)
			vm.nTib+=t+4; // zbranch to then
		else
			vm.panic.apply(vm,["no else or then to match if"]);
	},'immediate']);
	vm.addWord.apply(vm,['else',function () {var t;
	  if(vm.compiling){
	   var o=vm.dStack.pop();t=typeof o;
	   if(t!=="object" || o.name!="if"){
	        vm.panic.apply(vm,["there is no if to match else"]);return;
	   }
	   var i=o.at; vm.compileCode.apply(vm,["branch",0]);
	   vm.dStack.push({name:"else",at:vm.cArea.length-1});
	   vm.cArea[i]=vm.cArea.length-i;return;
	  }
	  t=vm.tib.substr(vm.nTib).indexOf("then");
	  if(t>=0) vm.nTib+=t+4; // branch to then
	  else vm.panic.apply(vm,["there is no then to match else"]);
	},'immediate']);
	vm.addWord.apply(vm,['then',function () {
	  if(!vm.compiling) return;
	  var o=vm.dStack.pop(),t=typeof o, n=o.name;
	  if(t!=="object" || (n!="if" && n!="else" && n!="aft")){
	        vm.panic.apply(vm,["no if, else, aft to match then"]);return;
	  }
	  var i=o.at; vm.cArea[i]=vm.cArea.length-i;
	},'immediate']);
	vm.addWord.apply(vm,['aft',function () {var t;
	  if(vm.compiling){
	   var s=vm.dStack,o=s[s.length-1];t=typeof o;
	   if(t!=="object" || o.name!=="for"){
	        vm.panic.apply(vm,["no for to match aft"]);return;
	   }
	   var i=o.at;
	   vm.compileCode.apply(vm,["zBranch",0]);
	   vm.dStack.push({name:"aft",at:vm.cArea.length-1});
	   return;
	  }
	  t=vm.tib.substr(vm.nTib).indexOf("then");
	  if(t>=0) vm.nTib+=t+4; // branch to then
	  else vm.panic.apply(vm,["there is no then to match aft"]);
	},'immediate']);
	vm.addWord.apply(vm,['begin',function () {
	  if(vm.compiling){
	        vm.dStack.push({name:"begin",at:vm.cArea.length-1});
	        return;
	  }
	  vm.rStack.push({name:"begin",nTib:vm.nTib});
	},'immediate']);
	vm.addWord.apply(vm,['again',function () {    var o;
	  if(vm.compiling)
	        o=vm.dStack.pop();
	  else
	        o=vm.rStack[vm.rStack.length-1];
	  var    t=typeof o;
	  if(t!=="object" || o.name!=="begin"){
	        vm.panic.apply(vm,["no begin to match again"]);
	        return;
	  }
	  if(vm.compiling){
	        var i=o.at;
	        vm.compileCode.apply(vm,[ "branch", i-vm.cArea.length]);
	        return;
	  }
	  vm.nTib=o.nTib;
	},'immediate']);
	vm.addWord.apply(vm,['until',function () {    var o;
	  if(vm.compiling)
	        o=vm.dStack.pop();
	  else
	        o=vm.rStack[vm.rStack.length-1];
	  var    t=typeof o;
	  if(t!=="object" || o.name!=="begin"){
	        vm.panic.apply(vm,["no begin to match until"]);
	        return;
	  }
	  if(vm.compiling){
	        var i=o.at;
	        vm.compileCode.apply(vm,[ "zBranch", i-vm.cArea.length]);
	        return;
	  }
	  if(vm.dStack.pop()) vm.rStack.pop();
	  else vm.nTib=o.nTib;
	},'immediate']);
	vm.addWord.apply(vm,['while',function () {    var s,o,t;
	  s=vm.dStack,o=s[s.length-1],t=typeof o;
	  if(t!=="object" || o.name!=="begin"){
	        vm.panic.apply(vm,["no begin to match while"]);return;
	  }
	  var i=o.at; vm.compileCode.apply(vm,["zBranch",0]);
	  vm.dStack.push({name:"while",at:vm.cArea.length-1});
	},'immediate']);
	vm.addWord.apply(vm,['repeat',function () {
	  var o=vm.dStack.pop(),t=typeof o;
	  if(t!=="object" || o.name!=="while"){
	        vm.panic.apply(vm,["no while to match repeat"]);return;
	  }
	  var i=o.at; o=vm.dStack.pop(),t=typeof o;
	  if(t!=="object" || o.name!=="begin"){
	        vm.panic.apply(vm,["no begin to match repeat"]);return;
	  }
	  vm.compileCode.apply(vm,["branch",o.at-vm.cArea.length]);
	  vm.cArea[i]=vm.cArea.length-i;
	},'immediate']);
//////////////////////////////////////////////////////////////////////////////////////////// v3
	vm.msTime=[];
	var doWakeup=function(){
		var time=new Date().getTime()-vm.startTime, T=vm.msTime, n=T.length, i, t;
		for(var i=n-1; i>=0; i--) { t=T[i];
			if(time>=t.wakeup){ T.splice(i,1); break; }
		}
		var msg=t.tib.substr(t.nTib,3);
		vm.tib=t.tib,vm.nTib=t.nTib,vm.tob=t.tob,vm.uob=t.uob,
		vm.dStack=t.dStack,vm.rStack=t.rStack;
	//	msgJef.innerHTML+=new Date().getTime()-vm.startTime+' '+msg+' ';
		vm.resumeExec.apply(vm,[vm.waiting===1?0:vm.waiting]);
	}
	vm.startTime=new Date().getTime();
	vm.addWord.apply(vm,['ms',function (n) {
	  var time=new Date().getTime()-vm.startTime;
	  var m= n===undefined ? vm.dStack.pop() : n;
	  var t={tib:vm.tib,nTib:vm.nTib,tob:vm.tob,uob:vm.uob,
	  	dStack:vm.dStack,rStack:vm.rStack.slice(0), // clone a copy of rStack
	  	wakeup:time+m
	  };
	  vm.waiting=1; t.timeout=setTimeout(doWakeup,m);
	  vm.msTime.push(t);
	}]);
};
if(typeof module!='undefined')
	module.exports=ext;
else
	ext(vm);
