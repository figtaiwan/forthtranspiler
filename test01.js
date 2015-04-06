var stack=[], _out='';
var x=function(){
	stack.push(stack.pop()*stack.pop());
	stack.push(3);
	var m=stack.pop(),n=stack.pop().toString();
	while(n.length<m)n=' '+n;_out+=n;
}
var y=function(){
	stack.push(10);
	stack.push(1);
	var _B0=stack.pop(),_L0=stack.pop(),_R=_L0-_B0,
	_D0=_R/Math.abs(_R);_L0-=(1-_D0)/2;
	for(var _i0=_B0;(_L0-_i0)*_D0>0;_i0+=_D0){
		stack.push(stack[stack.length-1]);
		stack.push(_i0);
		x();
	}
	stack.pop();
}
var z=function(){
	stack.push(10);
	stack.push(1);
	var _B0=stack.pop(),_L0=stack.pop(),_R=_L0-_B0,
	_D0=_R/Math.abs(_R);_L0-=(1-_D0)/2;
	for(var _i0=_B0;(_L0-_i0)*_D0>0;_i0+=_D0){
		_out+='\n';
		stack.push(_i0);
		y();
	}
}
z();
console.log(_out);