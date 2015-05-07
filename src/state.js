"use strict";
var state=	{inputfn:""
			,outputfn:""
			,tokens:[]
			,iTok:0
			,iCol:{}
			,opCode:[]
			,defined:{}
			,lines:[]
			,iLin:0
			,iOpCode:0
			,codegen:[]
			,line:''
			,cmd:''
			,jsline:0
			,rDepth:-1
			}
if(typeof module==='object'){
	module.exports=state,
	global.state=state;
}else{
	window.state=state;
}