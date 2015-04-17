stack=[],_out='';
stack.push(0);
stack.push(9);
while((function(){
if(stack[stack.length-1])stack.push(stack[stack.length-1]);
)(),stack.pop()){
var n=stack.length-2, a=stack[n];stack[n++]=stack[n], stack[n]=a;
stack.push(stack[stack.length-2]);
var tos=stack.pop();stack.push(stack.pop()+tos);
var n=stack.length-2, a=stack[n];stack[n++]=stack[n], stack[n]=a;
stack.push(1);
}
_out+=' '+stack.pop();