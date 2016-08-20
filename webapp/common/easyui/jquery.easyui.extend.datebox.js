/**
 * Created by zhuwei on 2016/4/27.
 */

/*重写datebox日期类型转换和展示方法(yyyy-mm-dd)
 * */
(function ($) {
    var defaults = $.extend({}, $.fn.datebox.defaults, {
        formatter: function(date){
            return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
        },
        parser: function(date){
            return new Date(Date.parse(date.replace(/-/g,"/")));
        }
    });
    $.extend($.fn.datebox.defaults, defaults);
})(jQuery);
