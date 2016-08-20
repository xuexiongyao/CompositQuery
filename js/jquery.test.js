//对象级别插件编写
;(function($){
    $.fn.extend({
        border : function(options){
            //设置默认属性
            options = $.extend({
                width : '1px',
                line : 'solid',
                color : '#000'
            },options);
            this.css('border',options.width+' '+options.line+' '+options.color);
            return this;
        },
        bgc : function(options){
            //设置默认属性
            options = $.extend({
                color : '#000'
            },options);
            this.css('background-color',options.color);
            return this;
        }
    });
})(jQuery);

//类级别的插件
;(function(){
    $.extend({
        openLoading : function(options){
            options = $.extend({
                type : 'open',
                msg : '正在加载,请稍候....'
            },options);
            var loading_img_url = staticPath + '/framework/default/images/loading.gif';
            var loading_html='<div id="loadingMsk" style="display:none">'
                +'<div class="loadingPage">'
                +'<img src="'+loading_img_url+'" alt="loading">'
                +'<span class="msg">'+options.msg+'</span>'
                +'</div>'
                +'</div>';
            if($('#loadingMsk').length == 0){
                $('body').append(loading_html);
            }
            if(options.type == 'open'){
                $('#loadingMsk').fadeIn('fast');
            }else if(options.type == 'close'){
                $('#loadingMsk').fadeOut('fast').remove();
            }else{
                alert('加载效果处理方式参数错误!');
                return false;
            }
        }
    });
})(jQuery);