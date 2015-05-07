var stack=[], _out='';
var runtime={stack:stack,out:_out};
(function(runtime){
/* 00 1          */ stack.push(1);
/* 01 2          */ stack.push(2);
/* 02 3          */ stack.push(3);
/* 03 dup        */ stack.push(3);
/* 04 *          */ stack.push(stack.pop()*stack.pop());
/* 05 dup        */ stack.push(stack[stack.length-1]);
/* 06 .          */ _out+=' '+stack.pop();
/* 07 5          */ stack[stack.length-1]+=5;
/* 08 + +        */ _out+=' '+stack.pop();
/* 10 : x        */ var x=function(){
/* 11   0        */   stack.push(0);
/* 12   9        */   stack.push(9);
/* 13   begin    */   while((function(){
/* 14     ?dup   */     if(stack[stack.length-1])stack.push(stack[stack.length-1]);
/* 15     while  */   })(),stack.pop()){
/* 16     swap   */     var n=stack.length-2, a=stack[n];stack[n++]=stack[n], stack[n]=a;
/* 17     over   */     stack.push(stack[stack.length-2]);
/* 18     +      */     var tos=stack.pop();stack.push(stack.pop()+tos);
/* 19     swap   */     var n=stack.length-2, a=stack[n];stack[n++]=stack[n], stack[n]=a;
/* 20     1-     */     stack[stack.length-1]--;
/* 21     repeat */   }
/* 22   .        */   _out+=' '+stack.pop();
/* 23   ;        */ }
/* 24 x          */ x();
runtime.out=_out;
return runtime;
})(runtime)
//# sourceMappingURL=sample.js.map