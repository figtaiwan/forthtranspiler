var _stk=[], _out='';
var runtime={stk:_stk,out:_out};
/* : x      */ var x=function(){
/*   0      */   _stk.push(0);
/*   9      */   _stk.push(9);
/*   begin  */   while((function(){
/*     ?dup */     if(_stk[_stk.length-1])_stk.push(_stk[_stk.length-1]);
/*   while  */   })(),_stk.pop()){
/*     swap */     var n=_stk.length-2, a=_stk[n];_stk[n++]=_stk[n], _stk[n]=a;
/*     over */     _stk.push(_stk[_stk.length-2]);
/*     +    */     var tos=_stk.pop();_stk.push(_stk.pop()+tos);
/*     swap */     var n=_stk.length-2, a=_stk[n];_stk[n++]=_stk[n], _stk[n]=a;
/*     1-   */     _stk[_stk.length-1]--;
/*   repeat */   }
/*   .      */   _out+=' '+_stk.pop();
/* ;        */ }
/* x        */ x();
runtime.out=_out;

: x 0 9 begin ?dup while swap over + swap 1- repeat . ; x