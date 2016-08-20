//f.statusText
function setuErrorHandler(msg,errFun){
    if(!msg.responseText){
        errFun(msg);
    }
    var errorJsonStr=msg.responseText.match(/var errorInfo=([\w\W]+);/)[1];
    if(errorJsonStr!=undefined){
        var errorJson=eval('('+errorJsonStr+')');
        console.log('errorJson:',errorJson);
        //自定义状态处理方式
        if(errorJson.errorCode=="-202"){
            crossRequestParent('reLogin()');
            window.parent.crossRequestParent('reLogin()');
            //window.top.location.href="../loginpage";
        }else{

            //window.top.location.href="../loginpage";
            //alert(errorJson.message);
        }
    }else{
        errFun(msg);
    }
}
function postQuery(action, data, sucFun, errFun) {
    var loader;
    try{
        loader = layer.load();
    }catch (e) {
    }
    for(var key  in data){
        if(typeof(data[key])=="object"){
            data[key]=JSON.stringify(data[key]);
        }
    }
    if(errFun==undefined){
        errFun=function(){};

    }
    var errCallBack=function(msg){
        setuErrorHandler(msg,errFun);
    }

    var sucCallBack = function(result){
        sucFun(result);
    };

    $.ajax({
        url:action,// 跳转到 action
        data:data,
        type:'post',
        cache:false,
        dataType:'json',
        success:sucCallBack,
        error : errCallBack
    });

}