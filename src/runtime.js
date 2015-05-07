var runtimecode=
["var stack=[], _out='';"
,"var runtime={stack:stack,out:_out};"]
if(typeof module==='object'){
	module.exports=runtimecode,
	global.runtimecode=runtimecode;
}else{
	window.runtimecode=runtimecode;
}