/**
 * Created by zhuwei on 2016/3/25.
 */

var current_tab_id = null;
var return_tab_id = null;
var staticPath = 'http://static.jwzh.com:7777/jwzh';

$(function () {
    //加载完成后,发送消息到父框架获取当前TabID和上一个TabID
    if (typeof window_type == 'undefined') {
        try {
            crossRequestParent('getTabIdToIframe()');
        }catch(e) {
            console.log('getTabIdToIframe not defined')
        }
    } else {
        if (window_type != 'open_url') {
            try {
                crossRequestParent('getTabIdToIframe()');
            }catch(e) {
                console.log('getTabIdToIframe not defined')
            }
        }
    }
    //优化页面渲染效果,避免出现easyui渲染过程
    $('body').css('visibility', 'visible');

    //clickWindow();//点击子框架页面document

    //接收父框架的请求
    var iframeWindow = new Messenger('iframe', 'toIframe');
    iframeWindow.listen(
        function (_msg) {
            //console.log('子框架接收到的消息:',_msg);
            var msg = eval('(' + _msg + ')');
            var status = msg.status;
            var content = msg.content;
            if (status == 'run_fn') { //执行函数
                try {
                    eval(content);
                } catch (e) {
                    alert('请确认页面中' + content + '函数是否定义');
                    //console.log('toIframe提示:',content + ' is not a function');
                }
            } else if (status == 'get_tab_id') {
                var content_arr = content.split(',');
                current_tab_id = content_arr[0];
                return_tab_id = content_arr[1];
                //console.log('当前tabID:',current_tab_id,'返回tabID:',return_tab_id);
            } else if (status == 'page_jump') {
                location.href = msg.content;
            } else {
                alert('msg.status err');
            }
        }
    );
});
//点击子框架页面
function clickWindow() {
    $(document).click(function () {
        crossRequestParent('slideUpNav()');
    });
}
//跨域请求父页面(向父框架发送消息)
function crossRequestParent(_msg) {
    var messenger = new Messenger('iframe', 'toParent');
    sendToMain(_msg);
    function sendToMain(msg) {
        messenger.addTarget(window.parent, 'parent');
        messenger.targets['parent'].send(msg);
    }

    return true;
}
//
function pageJump() {
    crossRequestParent('iframJump("' + current_tab_id + '")');
}

/*页面铺满加载中样式
* 1.type: open,打开;close,关闭
* 2.msg : 显示的文字,默认为加载中...
* */
function loading(type,msg){
    var msg = msg || '加载中...';
    var loading_img_url = staticPath +'/framework/default/images/loading.gif';
    var loading_html='<div id="loadingMsk" style="display:none">'
            +'<div class="loadingPage">'
                +'<img src="'+loading_img_url+'" alt="loading">'
                +'<span class="msg">'+msg+'</span>'
            +'</div>'
        +'</div>';
    if($('#loadingMsk').length == 0){
        $('body').append(loading_html);
    }
    if(type == 'open'){
        $('#loadingMsk').fadeIn('fast');
    }else if(type == 'close'){
        $('#loadingMsk').fadeOut('fast').remove();
    }else{
        alert('加载效果处理方式参数错误!');
        return false;
    }
}

//跨域添加Tab
function crossAddTab(tab_title, tab_url, tab_id) {

    //将当前tabID作为下一个tab的返回ID
    var return_tab_id = window.current_tab_id;
    //alert(return_tab_id);
    if (!tab_title || !tab_url || !tab_id) {
        alert('crossAddTab(tab_title,tab_url,tab_id) 缺少必要参数!');
        return false;
    }
    //添加tab时,通过全局获取返回的tab_id,并存放在iframe的DOM属性中
    crossRequestParent("addTab('" + tab_title + "','" + tab_url + "','" + tab_id + "','" + return_tab_id + "')");
}

//跨域关闭标签
function crossCloseTab(return_fn_name) {
    //关闭标签时,直接获取上一级tabID(返回TabID);
    //var return_tab_id = window.return_tab_id;
    //console.log('切换回去tabID:',return_tab_id);
    if (return_fn_name) {
        crossRequestParent("closeTabRefreshOther('" + return_tab_id + "','" + return_fn_name + "')");
    } else {
        crossRequestParent("closeTabRefreshOther('" + return_tab_id + "')");
    }
}

//改变按钮移入icon的样式
function changeLinkButtonIcon() {
    var oldClass;
    $(".l-btn").hover(
        function () {
            var tmp = $(this).find('.l-btn-icon').attr('class');
            var disNum = $(this).attr('class').indexOf('l-btn-disabled');
            if (tmp && disNum == -1) {
                var pos = tmp.indexOf('icon-');
                var str = tmp.substring(pos);
                oldClass = str;
                $(this).find('.l-btn-icon').removeClass(str).addClass(str + "-hover");
            }

        },
        function () {
            var tmp = $(this).find('.l-btn-icon').attr('class');
            var disNum = $(this).attr('class').indexOf('l-btn-disabled');
            if (tmp && disNum == -1) {
                var str = tmp.substring(tmp.indexOf('icon-'));
                $(this).find('.l-btn-icon').removeClass(str).addClass(oldClass);
            }
        }
    )
}
//添加slider滑块两端圆圈方法
function sliderEndsCircle() {
    var sliderItem = $(".easyui-slider");//所有的滑块组件
    var slider = $('.slider');//获得滑块组件

    for (var i = 0; i < sliderItem.length; i++) {
        var mode = $(sliderItem[i]).slider('options').mode;//获取滑块的方向
        if (mode == 'h') {//横向滑块
            var strL = '<div class="ends-circle ends-circle-l"><span></span></div>';
            var strR = '<div class="ends-circle ends-circle-r"><span></span></div>';
            $(slider[i]).prepend(strL);
            $(slider[i]).prepend(strR);
        } else if (mode == 'v') {//垂直滑块
            var strT = '<div class="ends-circle ends-circle-t"><span></span></div>';
            var strB = '<div class="ends-circle ends-circle-b"><span></span></div>';
            $(slider[i]).prepend(strT);
            $(slider[i]).prepend(strB);
        }
    }
}
//格式化日期显示
function formatDate() {
    $('.easyui-datebox').datebox({
        formatter: function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        },
        parser: function (date) {
            if (date == "" || date == "null" || date == null || date == undefined) {
                return new Date();
            }
            return new Date(Date.parse(date.replace(/-/g, "/")));
        }
    })
}

/*combobox点击输入框是否直接弹出下拉框
 * 1.box_id:组件Id
 * 2.bool:是否执行点击就下拉
 * 3.不传参数则执行整个页面所有组件,点击就下拉
 * */
function clickShowPanel(box_id, bool) {
    if (box_id) {
        if (bool) {
            $('#' + box_id).next().on('click.showPanel', function () {
                if($(this).hasClass('inputReadonly') || $(this).hasClass('textbox-readonly')){
                    $(this).prev().combobox("hidePanel");
                }else{
                    $(this).prev().combobox("showPanel");
                }
            });
        } else {
            $('#' + box_id).next().on('click.showPanel', function () {
                $(this).prev().combobox("hidePanel");
            });
        }
    } else {
        $(".combo").on('click.showPanel', function () {
            if($(this).hasClass('inputReadonly') || $(this).hasClass('textbox-readonly')){
                $(this).prev().combobox("hidePanel");
            }else{
                $(this).prev().combobox("showPanel");
            }
        });
    }

}

//判断两个数组中是否存在相同的值
function arrSame(arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
        if ($.inArray(arr1[i], arr2) != -1) {
            return true;
        }
    }
    return false;
}

/*js本地图片预览，兼容ie[6-9]、火狐、Chrome17+、Opera11+、Maxthon3
 * 1.fileObj:file类型的input对象(使用原生JS方法获取)
 * 2.imgPreviewId:img的id
 * 3.divPreviewId:包装img的div的id
 **/
function PreviewImage(fileObj, imgPreviewId, divPreviewId) {
    //fileObj.value = ""; //清空选中文件
    var allowExtention = ".jpg,.bmp,.gif,.png"; //允许上传文件的后缀名document.getElementById("hfAllowPicSuffix").value;
    var extention = fileObj.value.substring(fileObj.value.lastIndexOf(".") + 1).toLowerCase();
    var browserVersion = window.navigator.userAgent.toUpperCase();
    if (allowExtention.indexOf(extention) > -1) {
        if (fileObj.files) {//HTML5实现预览，兼容chrome、火狐7+等
            if (window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById(imgPreviewId).setAttribute("src", e.target.result);
                };
                reader.readAsDataURL(fileObj.files[0]);
            } else if (browserVersion.indexOf("SAFARI") > -1) {
                alert("不支持Safari6.0以下浏览器的图片预览!");
            }
        } else if (browserVersion.indexOf("MSIE") > -1) {
            if (browserVersion.indexOf("MSIE 6") > -1) {//ie6
                document.getElementById(imgPreviewId).setAttribute("src", fileObj.value);
            } else {//ie[7-9]
                fileObj.select();
                if (browserVersion.indexOf("MSIE 9") > -1)
                    fileObj.blur(); //不加上document.selection.createRange().text在ie9会拒绝访问
                var newPreview = document.getElementById(divPreviewId + "New");
                if (newPreview == null) {
                    newPreview = document.createElement("div");
                    newPreview.setAttribute("id", divPreviewId + "New");
                    newPreview.style.width = document.getElementById(imgPreviewId).width + "px";
                    newPreview.style.height = document.getElementById(imgPreviewId).height + "px";
                    newPreview.style.border = "solid 1px #d2e2e2";
                }
                newPreview.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src='" + document.selection.createRange().text + "')";
                var tempDivPreview = document.getElementById(divPreviewId);
                tempDivPreview.parentNode.insertBefore(newPreview, tempDivPreview);
                tempDivPreview.style.display = "none";
            }
        } else if (browserVersion.indexOf("FIREFOX") > -1) {//firefox
            var firefoxVersion = parseFloat(browserVersion.toLowerCase().match(/firefox\/([\d.]+)/)[1]);
            if (firefoxVersion < 7) {//firefox7以下版本
                document.getElementById(imgPreviewId).setAttribute("src", fileObj.files[0].getAsDataURL());
            } else {//firefox7.0+
                document.getElementById(imgPreviewId).setAttribute("src", window.URL.createObjectURL(fileObj.files[0]));
            }
        } else {
            document.getElementById(imgPreviewId).setAttribute("src", fileObj.value);
        }
    } else {
        alert("仅支持" + allowExtention + "为后缀名的文件!");
        fileObj.value = ""; //清空选中文件
        if (browserVersion.indexOf("MSIE") > -1) {
            fileObj.select();
            document.selection.clear();
        }
        fileObj.outerHTML = fileObj.outerHTML;
    }
    return fileObj.value;    //返回路径
};

/*日期起始时间小于结束日期,并且只能小于等于今天(开始时间框ID,结束时间框ID)
 * 1.start_id : 开始时间的datebox ID
 * 2.end_id : 结束时间的datebox ID
 * */
function ltToday(start_id, end_id) {
    $('#' + start_id).datebox({
        onSelect: function () {
            clickShowPanel(end_id, true);
            var st = new Date($('#' + start_id).datebox('getValue'));
            $('#' + end_id).datebox({
                disabled: false
            }).datebox('calendar').calendar({
                validator: function (date) {
                    var _date = date.getTime() / 1000;
                    var _st = st.getTime() / 1000;
                    var _now = (new Date()).getTime() / 1000;
                    return (_date + 3600 * 24) >= _st && _date <= _now;
                }
            });
        }
    }).datebox('calendar').calendar({
        validator: function (date) {
            var now = new Date();
            return date <= now;
        }
    });
}


/*普通form提交,依赖easyui
 * 1.form_id : 表单ID
 * 2.call_back : 提交成功后的回调函数处理
 * 3.url : 提交表单地址,默认为form上的action属性
 * */
function normalSubmit(form_id, call_back, url) {
    var submit_form = $('#' + form_id);
    var submit_url = url || submit_form.action;
    submit_form.form('submit', {
        url: submit_url,
        onSubmit: function () {
            var isValid = $(this).form('validate');
            return isValid;	// 返回false终止表单提交
        },

        success: function (data) {
            var json = eval('(' + data + ')');
            formTips(json, call_back, 'tips');
        },
        error: function (data) {
            resetToken();
            console.log('submit ajax error');
        }
    });
}
/*提交form时,对反馈信息的处理
 * 1.json:为success中返回的json格式数据(非json格式请转换)
 * 2.success_fn:成功后需要执行的函数名称,不传值则默认弹框显示json.message
 * 3.type : 如何执行success_fn,不传参直接调用;传递tips,则提示信息后延迟1秒后执行
 * 3.返回信息格式 {"message":"{\"xxzb.xbdm\":\"【性别】不能为空\",\"xxzb.zjhm\":\"【证件号码】不能为空\"}","status":"error"}
 * */
function formTips(json, success_fn, type) {
    //console.log('添加返回参数:',json);
    //console.log('参数:',success_fn,type);
    if (json.status == 'success') {
        if (success_fn) {
            try {
                var fn = eval(success_fn);
                if (type == 'tips' && json.message) {
                    $.messager.show({
                        title: '提示信息',
                        msg: json.message
                    });
                    setTimeout(function () {
                        fn(json);
                    }, 1000);
                } else {
                    fn(json);
                }
            } catch (e) {
                alert('请确认函数success_fn,是否存在');
            }
        } else {
            $.messager.show({
                title: '提示信息',
                msg: json.message
            })
        }
    } else {
        resetToken();
        if (data.status == 308) {
            $.messager.alert({
                title: '提示信息',
                msg: '数据处理中，请耐心等待！',
                top: 200
            });
        } else if (json.message && json.message.indexOf('{') == -1) {   //系统异常错误抛出
            $.messager.alert({
                title: '提示信息',
                msg: json.message,
                top: 200
            });
        } else {
            var message = eval("(" + json.message + ")");
            var message_arr = [];
            var field_arr = [];
            var i = 0;
            for (var k in message) {
                message_arr[i] = message[k];
                field_arr[i] = k;
                i++;
            }
            if (message_arr[0]) {
                //focus定位错误信息位置,并提示
                $.messager.alert({
                    title: '提示信息',
                    msg: message_arr[0],
                    top: 200,
                    onClose: function () {
                        $('input[textboxname="' + field_arr[0] + '"] + span > input').focus();
                        $('textarea[name="' + field_arr[0] + '"]').focus();
                    }
                });
            }
        }
    }
}
/*图片通过form上传方法
 * 1.form_id:提交的表单的id
 * 2.callback_fn:提交成功之后的回调函数
 **/
function submitImg(form_id, callback_fn) {
    var img_input = $("#" + form_id + " input[type=file]");
    if (img_input.val() == '') {
        $.messager.alert('添加失败', '请添加图片!');
        return false;
    } else if (!/.(gif|jpg|jpeg|png|GIF|JPG|png|PNG)$/.test(img_input.val())) {
        $.messager.alert('上传失败', '图片类型必须是.gif,jpeg,jpg,png中的一种');
        return false;
    } else {
        $("#" + form_id).ajaxSubmit({
            success: function (data) {
                var json = eval('(' + data + ')');
                if (json.status == 'success') {
                    if ((typeof callback_fn) == 'function') {
                        callback_fn();
                    } else {
                        $.messager.show({
                            title: '提示信息',
                            msg: '图片上传成功'
                        });
                    }
                    img_input.val('');
                } else {
                    $.messager.alert('上传失败', data);
                }
            },
            error: function () {
                $.messager.alert('上传失败', 'submitImg ajaxsubmit err');
            }
        });
    }
}


/*自定义的Url弹框方法
 * 1.options : 对象参数(各项配置)
 * 2.btn_diy : 数组参数(自定义按钮操作)
 * */
function openUrlForm(options, btn_diy) {

    //参数使用说明(子页面能够调用父页面的事件函数)
    /*openUrlForm({
     id: 'dlg_id', //自定义ID,防止重复添加DOM
     url: '2.html', //需要放入弹框的页面URL,此页面中设置好form属性,自动提交第一个form
     title: '表单提交', //模态框标题
     width: 800,        //模态框宽度
     height: 600,        //模态框高度
     }, []);*/


    //只创建一次DIV
    if ($('#' + options.id).length == 0) {
        var dlg_div = $('<div id="' + options.id + '"></div>').css({
            overflow: 'hidden'
        });
        var iframe = $('<iframe id="' + options.id + '_iframe" name="' + options.id + '_iframe"  frameborder="0"></iframe>').css({
            width: '100%',
            height: '100%',
        });
        $('body').append(dlg_div);
        dlg_div.append(iframe);
    } else {
        var dlg_div = $('#' + options.id);
    }
    var default_btn = [{
        text: '保存',
        handler: function () {
            var form = $(window.frames[options.id + '_iframe'].document).find('form');
            //console.log(form[0]);
            if (form.length > 0) {
                $(form[0]).form('submit', {
                    onSubmit: function () {
                        var isValid = $(form[0]).form('validate');
                        //console.log(isValid);
                        return isValid; // 返回false终止表单提交*/
                    },
                    success: function (data) {
                        //console.log(data);
                        //dlg_div.dialog('close');
                    },
                    error: function () {
                        console.log('ajax err');
                    }
                });
            } else {
                $.messager.alert('提示', '未获取表单信息', 'warning');
            }
        }
    }, {
        text: '重置',
        handler: function () {
            var form = $(window.frames[options.id + '_iframe'].document).find('form');
            if (form.length > 0) {
                $(form[0]).form('reset');
            } else {
                $.messager.alert('提示', '未获取表单信息', 'warning');
            }
        }
    }, {
        text: '关闭',
        handler: function () {
            dlg_div.dialog('close');
        }
    }];

    var _buttons = btn_diy || default_btn;
    var _width = options.width || '90%';
    var _title = options.title || '弹框标题';
    var _height = options.height || 'auto';
    var blank_height = _height;
    if (blank_height == 'auto') {
        blank_height = dlg_div.height();
        if (blank_height > 0) {
            setCookie(dlg_id + 'dialog_height', blank_height);
        } else {
            blank_height = parseInt(getCookie(dlg_id + 'dialog_height'));
        }
        blank_height = blank_height + 200;
    }
    var surplus_height_ = window.innerHeight - _height;
    var self_top = 0;
    if (surplus_height_ > 0) {
        self_top = parseInt(surplus_height_ / 2);
    }
    //var _top = options.top || self_top;   //如果需要强行定制高度,使用此项设置
    var _top = self_top; //自适应高度
    dlg_div.dialog({
        modal: true,
        title: _title,
        width: _width,
        height: _height,
        top: _top,
        //buttons: _buttons,   //打开url的弹框暂时不使用面板按钮
        onBeforeOpen: function () {
            $('#' + options.id + '_iframe').prop('src', options.url);
        }
    });
    //弹框高度自适应
    dlg_div.dialog('move', {top: $(document).scrollTop() + _top});
    dlg_div.dialog('open');
}


/*自定义的div弹框方法
 * 1.options : 对象参数(各项配置)
 * 2.btn_diy : 数组参数(自定义按钮操作)
 * */
function openDivForm(options, btn_diy) {
    /*参数使用说明举例
     openDivForm({
        id: 'div_id', //页面上div的id,将div设置为display:none,在div中设置好form属性,自动提交第一个form
        title: '表单提交',
        width: 800,
        height: 200,
        top: 200,
        beforeSubmit: function () {
        }, //return false,阻止提交
        afterSubmit: function (data) {
        }, //提交成功,data为返回的数据
        onClose: function () {
        },             //关闭时提交的函数
    }, [                     //以下为按钮添加配置,不传值为默认,传递[]时,清除所有按钮
        {
            text: '确定',
            handler: function () {
                $('#div_id').dialog('close');
            }
        }, {
            text: '关闭',
            handler: function () {
                $('#div_id').dialog('close');
            }
        },
    ]);*/
    var dlg_id = options.id;
    var dlg_div = $('#' + dlg_id);
    var defualt_beforeSubmit = function () {
        //验证表单
        var isValid = $(this).form('validate');
        return isValid; // 返回false终止表单提交
    };
    var default_afterSubmit = function (data) {
        if (data) {
            dlg_div.dialog('close');
        }
    };
    var beforeSubmit = options.beforeSubmit || defualt_beforeSubmit;
    var afterSubmit = options.afterSubmit || default_afterSubmit;

    var default_btn = [{
        text: '保存',
        handler: function () {
            var form = dlg_div.find('form');
            var submitUrl = options.url || form.action;
            if (form.length > 0) {
                $(form[0]).form('submit', {
                    url: submitUrl,
                    onSubmit: beforeSubmit,
                    success: afterSubmit
                });
            } else {
                $.messager.alert('提示', '无法获取表单元素,无法提交', 'warning');
            }
        }
    }, {
        text: '重置',
        handler: function () {
            var form = dlg_div.find('form');
            if (form.length > 0) {
                $(form[0]).form('reset');
            } else {
                $.messager.alert('提示', '无法获取表单元素,无法提交', 'warning');
            }
        }
    }, {
        text: '关闭',
        handler: function () {
            dlg_div.dialog('close');
        }
    }];
    var _buttons = btn_diy || default_btn;
    var _title = options.title || '弹框';
    var _width = options.width || 800;
    var _height = options.height || 'auto';
    var _left = options.left || null;
    var blank_height = _height;
    if (blank_height == 'auto') {
        blank_height = dlg_div.height();
        if (blank_height > 0) {
            setCookie(dlg_id + 'dialog_height', blank_height);
        } else {
            blank_height = parseInt(getCookie(dlg_id + 'dialog_height'));
        }
        blank_height = blank_height + 160;
    }

    var surplus_height_ = window.innerHeight - blank_height;
    var self_top = 0;
    if (surplus_height_ > 0) {
        self_top = parseInt(surplus_height_ / 2);
    }
    var _top = options.top || self_top;   //如果需要强行定制高度,使用此项设置,不输入自适应
    //var _top = self_top; //自适应高度
    dlg_div.dialog({
        cache: true,
        modal: true,
        novalidate: true,  //验证表单元素
        title: _title,
        width: _width,
        height: _height,
        top: _top,
        left: _left,
        buttons: _buttons,
        onClose: options.onClose
    });
    dlg_div.dialog('move', {top: $(document).scrollTop() + _top});
    dlg_div.show().dialog('open');
}

/*去除input效果
 * 1.bool:true启用编辑效果和样式,false禁用编辑效果并清除样式
 * 2.border_class:禁用编辑时给输入框添加的样式class
 * 3.box_class:给需要禁用或启用的组件添加样式,不传值则对整个页面有效
 * 4.重新初始化组件会导致value变化,必须修改
 * */
function editSwitch(bool, border_class, box_class) {
    var _border_class = border_class || 'clear-border';
    var box = $('.val');
    if (box_class) {
        box = $('.' + box_class);
    }

    //启用编辑
    if (bool) {
        /*后面完善
         $('.combo').on('click.showPanel',function(){
         $(this).prev().combobox("showPanel");
         });
         */
        box.each(function () {
            var _this = $(this);

            //show“*”
            _this.prev().find('i').show();

            if (_this.hasClass('easyui-combobox')) {
                _this.combobox({readonly: false}).next().removeClass(_border_class);//移除样式还原边框
            } else if (_this.hasClass('easyui-textbox')) {
                _this.textbox({readonly: false}).next().removeClass(_border_class);
            } else if (_this.hasClass('easyui-datebox')) {
                _this.datebox({readonly: false}).next().removeClass(_border_class);
            } else if (_this.hasClass('easyui-datetimebox')) {
                _this.datetimebox({readonly: false}).next().removeClass(_border_class);
            } else if (_this.hasClass('easyui-combotree')) {
                _this.combotree({readonly: false}).next().removeClass(_border_class);
            } else if (_this.hasClass('easyui-validatebox')) {
                _this.validatebox({readonly: false}).next().removeClass(_border_class);
            }
            _this.next().find('span.textbox-addon').show();//显示按钮
        });
    } else {
        //$('.combo').off('click.showPanel'); //后面完善
        box.each(function () {
            var _this = $(this);

            //清除“*”
            _this.prev().find('i').hide();

            if (_this.hasClass('easyui-combobox')) {
                _this.combobox({readonly: true}).next().addClass(_border_class);//添加样式取消边框
            } else if (_this.hasClass('easyui-textbox')) {
                _this.textbox({readonly: true}).next().addClass(_border_class);
            } else if (_this.hasClass('easyui-datebox')) {
                _this.datebox({readonly: true}).next().addClass(_border_class);
            } else if (_this.hasClass('easyui-datetimebox')) {
                _this.datetimebox({readonly: true}).next().addClass(_border_class);
            } else if (_this.hasClass('easyui-combotree')) {
                _this.combotree({readonly: true}).next().addClass(_border_class);
            } else if (_this.hasClass('easyui-validatebox')) {
                _this.validatebox({readonly: true}).next().addClass(_border_class);
            }
            _this.next().find('span.textbox-addon').hide();//隐藏按钮
        });
    }
}

/*表单修改,只提交点击过的input框(easyui组件)
 * 1.页面加载完成时执行方法1(页面DOM记录点击状态)
 * 2.在表单提交之前执行方法2(获取页面点击状态,将未点击的input设置disabled,并判断返回是否有修改)
 * 3.必须提交的input,添加属性sb_status="1"
 * */
//1.记录FORM中input的提交状态
function markInputStatus(form_id) {
    $('#' + form_id + ' span.textbox').off('click').on('click', function () {
        var input_module = $(this).prev();  //组件input
        if (input_module.hasClass('readonly') == false || input_module.attr('sb_status' != '1')) {
            var textboxname = input_module.attr('textboxname'); //获取组件name
            input_module.attr('sb_status', 1);
        }
    });

}

//2.提交之前更改input的disable状态,并判断返回是否有修改
function changeInputStatus(form_id) {
    var i = 0;
    $('#' + form_id + ' span.textbox').each(function () { //所有上传到后台的隐藏输入框
        //处理组件下面的input
        var input_module = $(this).prev();  //组件input
        if (input_module.attr('sb_status') != 1) {
            input_module.next().find('input').prop("disabled", true);
        } else {
            input_module.next().find('input').prop("disabled", false);
            i++;
        }
    });
    if (i >= 1) {
        return true;
    } else {
        console.log('未能获取一个修改项');
        return false;
    }
}

/*combobox下拉菜单中,只显示中文描述,不显示代码
 * 1.combox_id : combobox组件ID
 * */
function setComboxOnlyText(combox_id) {
    $('#' + combox_id).combobox({
        formatter: function (row) {
            var opts = $(this).combobox('options');
            return row[opts.textField];
        }
    });
}
/*使用url弹框中的页面关闭方法
 * 1.dialog_id:打开窗口的dialogDIV的id
 * 2.msg:关闭后的提示信息
 * 3.fn_name:关闭后执行父框架中函数名
 * */
function closeWindow(dialog_id, msg, fn_name) {
    window.parent.$('#' + dialog_id, window.parent.document).dialog('close');
    if (msg) {
        window.parent.$.messager.show({
            title: '提示',
            msg: msg
        });
    }
    if (fn_name) {
        window.parent.return_fn[fn_name]();
    }
}

//获取对象实例属性的个数
function countObj(obj) {
    var count = 0;
    for (var property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            count++;
        }
    }
    return count;
}

//更新照片src
function updatePicUrl(img_id, src, default_src) {
    $('#' + img_id).prop('src', src).on('error', function () {
        if (default_src) {
            $(this).prop('src', default_src);
        } else {
            alert('请正确填写默认照片路径');
        }
    });
}


/***以下为巡逻盘查获取封面和最后上传图片的方法***/


/**
 * 获取封面图片
 */
function getFmImage(lyid, lybm, add_btn, manage_btn) {
    $.ajax({
        url: basePath + '/zpfjFjxxb/queryList',
        type: 'post',
        dataType: 'json',
        data: {
            lyid: lyid,
            lybm: lybm,
            sffm: '1',
            page: 1,
            rows: 1
        },
        success: function (json) {
            //console.log(json);
            var data = json.rows;
            if (data.length > 0) {
                var src = 'data:image/jpeg;base64,' + data[0]['slt'];
                updatePicUrl('info_pic', src, basePath + '/images/xlpc/person_default.jpg');
                if (add_btn) {
                    add_btn.css('display', 'none');
                }
                if (manage_btn) {
                    manage_btn.css('display', 'block');
                }
            } else {
                getLastUploadImage(lyid, lybm, add_btn, manage_btn);
            }

        },
        error: function () {
            console.log('getSLTInfo ajax err');
        }
    });
}

/**
 * 获取最后上传的图片
 */
function getLastUploadImage(lyid, lybm, add_btn, manage_btn) {
    $.ajax({
        url: basePath + '/zpfjFjxxb/queryList',
        type: 'post',
        dataType: 'json',
        data: {
            lyid: lyid,
            lybm: lybm,
            page: 1,
            rows: 1
        },
        success: function (json) {
            var data = json.rows;
            if (data.length > 0) {
                var src = 'data:image/jpeg;base64,' + data[0]['slt'];
                updatePicUrl('info_pic', src, basePath + '/images/xlpc/person_default.jpg');
                if (add_btn) {
                    add_btn.css('display', 'none');
                }
                if (manage_btn) {
                    manage_btn.css('display', 'block');
                }
            }
        },
        error: function () {
            console.log('getSLTInfo ajax err');
        }
    });
}
//刷新token,防止重复提交
function resetToken() {
    $.ajax({
        url: basePath + '/submitToken/new',
        type: 'get',
        dataType: 'json',
        success: function (json) {
            if (json.token) {
                $("#token").val(json.token);
            }
        },
        error: function () {
            console.log('token reset error!');
        }
    });
}

//combobox下拉显示,只显示textValue
//页面直接引用,并在组件中添加show-text样式
function comboboxShowText(){
    $('.show-text').combobox({
        formatter: function(row){
            var opts = $(this).combobox('options');
            return row[opts.textField];
        }
    });
}
/*统一获取组件的值
 * 1.input:组件对象
 * 2.input_type:组件类型
 * 3.multiple:是否获取去多选值数组结果
 * */
function getInputValue(input,input_type,multiple){
    if(input_type == 'textbox'){
        return input.textbox('getValue');
    }else if(input_type == 'datebox'){
        return input.datebox('getValue');
    }else if(input_type == 'combobox'){
        if(multiple){
            return input.combobox('getValues');
        }else{
            return input.combobox('getValue');
        }
    }else if(input_type == 'combotree'){
        if(multiple){
            return input.combobox('getValues');
        }else{
            return input.combobox('getValue');
        }
    }else{
        alert('请输入正确的组件类型');
    }
}

//批量清除组件数据(已经提取到静态公共js)
function clearInput(input_class){
    $('.'+input_class).each(function(){
        var _this = $(this);
        try{
            _this.combobox('setValue','');
            _this.combobox('select','');
        }catch(e){
            try{
                _this.textbox('setValue','');
            }catch(e){
                try{
                    _this.datebox('setValue','');
                }catch(e){
                    _this.combotree('setValue','');
                }
            }
        }
    })
}
