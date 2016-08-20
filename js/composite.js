//var staticPath = './webapp';
var window_type = 'open_url';
var condition_obj = {mainTable:search_config.main_type};
var table_header_info=[];
var	config=[];

$(function(){
	changeName();   //更名
	pagination();   //分页
	setTable();      //表格配置
	getTableSetDom();
});
//更改页面显示的标题内容
function changeName(){
	$('#title_name').text(search_config.query_title);
	var type_html = '';
	for(var i=0;i<search_config_arr.length;i++){
		var type = search_config_arr[i];
		type_html += ''
			+'<div id="'+type+'">'
				+'<div>'
					+'<span class="search-title">'+search_config[type+'_title']+'</span>'
						+'<span class="search-add">'
						+'<a class="easyui-linkbutton c1 add-condition" data-options="height:20"><i class="fa fa-plus"></i></a>'
					+'</span>'
				+'</div>'
				+'<ul></ul>'
			+'</div>';
	}
	type_html += '<div class="bottom-btn">'
					+'<a class="easyui-linkbutton c6" id="search_submit">查询</a>'
					+'<a class="easyui-linkbutton c6" id="search_clear">清空</a>'
					+'<a class="easyui-linkbutton c6" id="search_close">关闭</a>'
				+'</div>';
	$('#advanced_box').append(type_html);
	btnEvent();     //按钮事件
}

//表格设置
function setTable(){
	$('#table_setting').off('click').on('click',function(){
		//生成表格配置面板
		$('#set_table_panel').dialog({
			title: '配置显示字段',
			top:200,
			height: 'auto',
			width:800,
			resizable: true,
			modal: true,
			closed: true,
			buttons:[{
				//确定生成表头配置信息,并重新加载表格数据
				text:'确定',
				handler:function(){
					table_header_info = []; //先清空
					$('#selected_ul li').find('div').each(function(index){
						table_header_info[index] = $(this).attr('rel');
					});
					console.log('表头参数:',table_header_info); //参数
					//getTableData();
					$('#set_table_panel').dialog('close');
					ajaxQuery(condition_obj);
				}
			},{
				text:'取消',
				handler:function(){
					$('#set_table_panel').dialog('close');
				}
			}]
		});
		$('#set_table_panel').dialog('open').show();
		//getTableSetDom();
	});

	//拖放排序插件
	$('#selected_ul,#waiting_ul').dragsort({
		dragSelector: "div",
		dragBetween: true,
		//dragEnd: saveOrder,//拖动结束触发函数
		placeHolderTemplate: "<li class='placeHolder'><div></div></li>"
	});
}

// 生成表头配置信息,并实现拖动
function getTableSetDom(){
	$('#selected_ul,#waiting_ul').empty();
	for(var i=0;i<search_config_arr.length;i++){
		config = config.concat(search_config[search_config_arr[i]]);
		table_header_info = table_header_info.concat(search_config[search_config_arr[i]+'_init']);
	}
/*


	var base_info = search_config.base_info;
	var relation_info = search_config.relation_info;

	var base_info_init = search_config.base_info_init;
	var relation_info_init = search_config.relation_info_init;

	var init_arr = (base_info_init).concat(relation_info_init); //默认配置
	table_header_info = init_arr;
	config = (base_info).concat(relation_info);         //所有配置

*/

	var config_arr = getConfigArr(config); //默认配置

	//加载显示的表头数据
	for(var i = 0;i < table_header_info.length;i++){
		var rel_val = table_header_info[i];
		var html_li = '<li><div rel="'+rel_val+'">'+getConfigObj(rel_val,config)['text']+'</div></li>';
		$('#selected_ul').append(html_li);
	}
	//return;
	//加载未显示的表格数据
	for(var i = 0;i < config_arr.length;i++){
		var config_i = config_arr[i];
		var is_exist = $.inArray(config_i, table_header_info);
		//不存在的
		if(is_exist == -1){
			var _html_li = '<li><div rel="'+config_i+'">'+getConfigObj(config_i,config)['text']+'</div></li>';
			$('#waiting_ul').append(_html_li);
		}
	}
}

//根据字段名获取配置信息
function getConfigObj(field,config){
	for(var i= 0,len=config.length;i<len;i++){
		if(config[i]['field'] == field ){
			return config[i];
		}
	}
	return null;
}
//根据字段名获取字段数组
function getConfigArr(config){
	var arr = [];
	for(var i= 0,len=config.length;i<len;i++){
		arr.push(config[i]['field']);
	}
	return arr;
}

//初始按钮事件
function btnEvent(){
	//$('#advanced_box').hide();
	//点击搜索图标(普通查询)
	$('.easyui-linkbutton').linkbutton();
	$('#search_all').click(function(){
		var keywords = $.trim($('#keywords').val());
		if(keywords == ''){
			$.messager.alert('提示','请输入关键字!','warning',function(){
				$('#keywords').next().find('input').focus();
			});
			return false;
		}else{
			delete condition_obj.query;
			condition_obj.key = keywords;
			condition_obj.option = 'all';
			condition_obj.start = 0;
			condition_obj.limit = 5;
			$('#pagination').pagination({
				pageNumber:1,
				pageSize:5
			});
			ajaxQuery(condition_obj);
		}
		//console.log(keywords,condition_obj);
	});
	//点击高级
	$('#advanced').click(function(){
		var _this = $(this);
		if(_this.find('.fa').hasClass('fa-angle-double-down')){
			$('#advanced_box').fadeIn(function(){
				_this.find('.fa').removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
			});
		}else{
			$('#advanced_box').fadeOut(function(){
				_this.find('.fa').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
			});
		}
		$('#advanced_box .add-condition').off('click').on('click',function(){
			var type = $(this).parent().parent().parent().attr('id');
			addCondition(type);
			//console.log(1,type);
		});
	});
	//点击查询(高级查询)
	$('#search_submit').click(function(){
		var null_status = 0;
		var query = [];
		for(var i=0;i<search_config_arr.length;i++){
			query.push(getBaseInfoObj(search_config_arr[i]));
		}
		condition_obj.query = query;
		condition_obj.option = 'ad';
		condition_obj.key = '';
		condition_obj.start = 0;
		condition_obj.limit = 5;
		$.each(condition_obj.query,function(index){
			var this_obj = condition_obj.query[index];
			if((this_obj.condition).length > 0){
				null_status = 1;
			}
		});
		if(null_status == 0){
			$.messager.alert('提示','查询条件为空,请输入查询条件!','warning');
		}else{
			//pagination();
			$('#pagination').pagination({
				pageNumber:1,
				pageSize:5
			});
			ajaxQuery(condition_obj);
		}
	});
	//点击清空
	$('#search_clear').click(function(){
		//移除添加查询条件
		$('#advanced_box li[condition_type="add"]').remove();
		//清除查询条件的值
		clearInput('condition');
	});
	//点击关闭
	$('#search_close').click(function(){$('#advanced_box').fadeOut(function(){
		$('#advanced').find('.fa').removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
	});});
	//点击全选
	$('#all_select').click(function(){
		if($(this).prop('checked')){
			$('#result_table').datagrid('checkAll');
		}else{
			$('#result_table').datagrid('uncheckAll');
		}
	});
	//详情事件(事件委托)
	$('#table_content').on('click','.details',function(){
		gotoDetail($(this));
	});

	//创建查询条件输入框
	for(var i=0;i<search_config_arr.length;i++){
		createSearchInput(search_config_arr[i]);
	}
	//初始化查询结果表格
	creatDatagrid();
}

//初始化表格
function creatDatagrid(){

	$('#result_table').datagrid({
		showHeader:false,
		fitColumns:true,
		pagination:false,
		striped: true,
		singleSelect: true,
		nowrap: true,
		scrollbarSize: 0,
		selectOnCheck: false,
		checkOnSelect: false,
		fit: false,
		columns:[[
			{field: 'ID',title:'check',align:'center',width:10, checkbox: true},
			{field:'HJD_XZQHDMMC',title:'描述',align:'center',width:80,formatter:tableContent},
			{field:'handle',title:'操作',align:'center',width:10,formatter:tableHandle}
		]]
	});
}

//生成查询条件
function createSearchInput(type){
	var init = search_config[type+'_init'];
	var config = search_config[type];
	for(var i=0;i<config.length;i++){
		var config_i = config[i];
		if($.inArray(config_i['field'],init) != -1){
			var search_li = '<li field="'+config_i.field+'" input_type="'+config_i.input+'">'
					+'<span class="pro">'+config_i.text+'</span>'
					+'<input id="'+type+'judge_input'+i+'" class="judge">'
					+'<input id="'+type+'condition_input'+i+'" class="condition">'
					+'</li>';
			$('#advanced_box #'+type+' ul').append(search_li);
			parseInput(config_i,type+'judge_input'+i,type+'condition_input'+i); //初始化input组件
		}
	}
}

//初始化组件
function parseInput(config,judge_id,condition_id){
	//console.log(config,judge_id,condition_id);
	var valid_type = config.valid_type || '';
	var default_value = config.judge_default || '=';
	var multiple = config.multiple || false;
	//判断条件组件初始化
	$('#'+judge_id).combobox({
		editable: false,
		//url: config.judge_dict,
		data: config.judge_dict,
		//method: 'get',
		valueField: 'id',
		textField: 'text',
		panelWidth: 75,
		//required: true,
		width: 75,
		formatter: function (row) {
			var opts = $(this).combobox('options');
			return row[opts.textField];
		}
	});
	//初始化选择条件,并选择
	$('#'+judge_id).combobox('select',default_value);
	$('#'+judge_id).combobox('setValue',default_value);
	//输入条件组件初始化
	var condition_type = config.input;
	if(condition_type == 'combobox'){
		$('#'+condition_id).combobox({
			multiple:multiple,
			url: config.condition_dict,
			// data: config.condition_dict,
			method: 'get',
			valueField: 'id',
			textField: 'text',
			panelWidth: 180,
			width:180,
		});
		clickShowPanel(condition_id, true);
	}else if(condition_type == 'textbox'){
		$('#'+condition_id).textbox({
			panelWidth: 180,
			width:180,
			validType:valid_type
		});
	}else if(condition_type == 'datebox'){
		//日期段的处理?
		//console.log(date_id);
		$('#'+condition_id).datebox({
			panelWidth: 180,
			width:180,
			validType:'date[\'yyyy-MM-dd\']'
		});
	}else if(condition_type == 'combotree'){
		$('#'+condition_id).combotree({
			multiple:multiple,
			url: config.condition_dict,
			// data: config.condition_dict,
			method: 'get',
			valueField: 'id',
			textField: 'text',
			panelWidth: 180,
			width:180,
		});
	}
}

//获取查询条件对象(高级查询)
function getBaseInfoObj(type){
	var query_obj = {};
	var query = [];
	query_obj.type = search_config[type+'_type'];

	//循环获取查询条件
	$('#advanced_box #'+type+' li').each(function(index){
		var $this = $(this);
		var search_data = getSearchData($this);//获取单个查询条件数据
		var field = $this.attr('field');
		var multi_condition = [];
		if(search_data[1]){
			var module_obj = {
				k : field,
				v : search_data[1],
				op : search_data[0]
			};
			query.push(module_obj);
		}
	});
	query_obj.condition = query;
	return query_obj;
}

//获取单个查询条件数据
function getSearchData($this){
	var data_info = [];
	var field = $this.attr('field');
	var input_type = $this.attr('input_type');
	var input = $this.find('.condition');
	data_info[0] = getInputValue($this.find('.judge'),'combobox',false);
	if(data_info[0] == 'null'){ //为空
		data_info[1] = 'null';
	}else{                      //不为空
		data_info[1] = getInputValue(input,input_type,true);
	}
	if(data_info[1] != '' && data_info[1] != null && data_info[1] != undefined){
		//多个条件用空格隔开
		if($.isArray(data_info[1])){
			data_info[1] = data_info[1].join(' ');
		}
		return data_info;
	}else{
		return false;
	}
}

//提交查询请求
function ajaxQuery(condition_obj){
	//查询成功,展示查询内容
	loading('open','查询中...');
	//console.log(condition_obj);
	console.log(JSON.stringify(condition_obj));
	var condition = JSON.stringify(condition_obj);
	$.ajax({
		url : search_config.url + condition,
		type : 'get',
		dataType : 'json',
		success : function(data){

			console.log('查询结果:',data);
			//加载分页
			$('#pagination').pagination({
				total:data.count
			}).show();
			changeLinkButtonIcon();
			searchResult(data); //展示查询结果
		},
		error:function(e){
			alert('获取数据失败,详情查看console. \n\n接下来展示的为本地测试数据!!!\n');
			console.log(e);

			$('#pagination').pagination({
				total:998
			}).show();
			changeLinkButtonIcon();
			searchResult();
		}
	});

}

//添加查询条件
function addCondition(type){
	console.log(type);
	var config = search_config[type];
	var j = Date.parse(new Date());
	$('#condition_dialog ul').empty();
	for(var i=0;i<config.length;i++){
		var config_i = config[i];
		//未显示的项作为添加项
		//if($.inArray(config.field,module_init) == -1){
		var li_html = '<li module="'+config_i.field+'">'
				+'<label><input type="checkbox"><span>'+config_i.text+'</span></label>'
				+'</li>';
		$('#condition_dialog ul').append(li_html);
		//}
		//console.log(li_html);
	}
	openDivForm({
		id: 'condition_dialog',
		title: '添加查询条件',
		width: 600,
		height: 200,
	}, [
		{
			text: '添加',
			handler: function () {
				$('#condition_dialog').dialog('close');
				var input_checked_arr = [];
				$( "#condition_dialog input:checked").each(function(){
					input_checked_arr.push($(this).parent().parent().attr('module'));
				});
				console.log(input_checked_arr);
				for(var i=0;i<config.length;i++){
					var config_i = config[i];
					//添加勾选的项
					if($.inArray(config_i.field,input_checked_arr) != -1){
						var li_html = '<li field="'+config_i.field+'" multi="'+config_i.multiple+'" input_type="'+config_i.input+'" condition_type="add">'
								+'<span class="pro">'+config_i.text+'</span>'
								+'<input id="'+type+'judge_input_'+j+'" class="judge">'
								+'<input id="'+type+'condition_input_'+j+'" class="condition">'
								+'</li>';
						var $li = $('#advanced_box #'+type+' li[field="'+config_i.field+'"]');
						//相同条件添加到旁边
						if($li.length > 0){
							$li.last().after(li_html);
						}else{
							$('#advanced_box #'+type+' ul').append(li_html);
						}
						//console.log(config);
						parseInput(config_i,type+'judge_input_'+j,type+'condition_input_'+j);
						//$('#judge_input_'+j).combobox({
						// readonly : true
						//});
						j++;
					}
				}
			}
		}, {
			text: '关闭',
			handler: function () {
				$('#condition_dialog').dialog('close');
			}
		}
	]);
}

//加载分页
function pagination(){
	$('#pagination').pagination({
		total:100,
		pageSize:5,
		pageList: [5,10,15,20,30,50],
		onSelectPage:function(pageNumber, pageSize){
			condition_obj.start = (pageNumber-1)*pageSize;
			condition_obj.limit = pageSize;
			console.log(condition_obj);
			ajaxQuery(condition_obj);
		}
	});
}

//查询结果
function searchResult(data){
	loading('close');
	var data = data || search_result_test; //测试数据
	var datagrid_data = {
		rows : data.result,
		total: data.count
	};
	$('#result_table').datagrid('loadData', datagrid_data);
	$('#handle_area').show();
}

//表格内容
function tableContent(val, row, index){
	//console.log(table_header_info,config);
	var test_img = './images/ryzp_test.jpg';
	/*return '<div class="table-content">'
				//'<div class="img-dsc"><img src="'+test_img+'" alt="img"></div>'+
				+'<div class="content-dsc">'
					+'<div class="item"><span class="pro">姓名</span><span class="val">'+row.XT_LRRXM+'</span></div>'
					+'<div class="item"><span class="pro">性别</span><span class="val">'+row.XBDMMC+'</span></div>'
					+'<div class="item"><span class="pro">籍贯</span><span class="val">'+row.JGSSXDMMC+'</span></div>'
					+'<div class="item"><span class="pro">证件类型</span><span class="val">'+row.CYZJDMMC+'</span></div>'
					+'<div class="item"><span class="pro">证件号码</span><span class="val">'+row.ZJHM+'</span></div>'
					+'<div class="item"><span class="pro">现住址</span><span class="val">'+row['ry_ryjzgjxxb'][0]['JZD_DZXZ']+'</span></div>'
				+'</div>'
			+'</div>';*/
	var html  = '<div class="table-content"><div class="content-dsc">';
	for(var i= 0,len=table_header_info.length;i<len;i++){
		var field_i = table_header_info[i];
		var pro_name = getConfigObj(field_i,config)['text'];
		html += '<div class="item"><span class="pro">'+pro_name+'</span><span class="val">'+row[field_i]+'</span></div>';
	}
	html += '</div></div>';
	return html;
}

//表格操作按钮
function tableHandle(val, row, index){
	return '<div class="table-handle">'+
			'<i class="fa fa-eye details" ryid="'+row.RYID+'"></i>'+
			'<i class="fa fa-edit edit"></i>'+
			'<i class="fa fa-remove "></i>'+
			'</div>';
}

//高度自适应
function selfHeight(){
	var window_h = window.innerHeight;
	var result_box_h = window_h - 100;
	$('#search_result .result').css('max-height',result_box_h + 'px');
	$('#advanced_box .search-condition').css('max-height',result_box_h - 30 + 'px');
}



/****************************************************/



/*条件规则说明(以下为实际查询条件对象)
 * 1.不同的条件字段之间为"与"关系
 * 2.同一个条件字段(同名条件)之间为"或"关系
 * 3,多选条件之间为"或"关系
 * */
var condition = {
	//表名(一)
	base_info:{
		//条件字段(1)
		zjlx:[
			["=",["1","2"]],//同名条件1(多选条件)
			["!=",["3"]],   //同名条件2(单选条件)
			["!=",["5"]]    //同名条件3(单选条件)
		],
		//条件字段(2)
		zjhm:[
			["=","513023198804112546"],
			["in","19852"]],
		//条件字段(3)
		xm:[
			["=","帅雷雷"]
		],
		//条件字段(4)
		xb:[
			//[判断规则,判断条件]
			["=",["1","3","9"]]//多选条件
		],
		//条件字段(5)
		csrq:[
			[">","2016-06-01"], //同名条件1
			["<","2016-07-12"]],//同名条件2

		//排序规则
		sort : 'desc' //desc,asc
	},

	//表名(二)...
	relation_info:{}
};







//搜索返回的结果，采用的是json格式，格式如下:
var t1 = {
	"count": 0,//返回的记录条数
	"took": 21,//搜索所花的时间,单位是毫秒
	"msg": "",//错误信息,为空为正常,内容代表错误提示
	"result": []//真正的结果,是一个数组(或列表)
};

//请求示例
var t2 = {
	"start":0,//查询记录开始条数
	"limit":10,//查询记录分页大小,
	"option":'ad|all',//操作类型，ad为高级查询query字段必填，all为全文检索key字段必填,
	"key":"操作类型为全文检索时必填",
	"sort":"myDate ASC",
	"query": [
		{
			"type": "syrk_syrkxxzb",
			"condition": [
				{
					"op": "<",
					"k": "CSRQ",
					"v": "2016-06-01"
				},//同名条件1
				{
					"op": ">",
					"k": "CSRQ",
					"v": "2016-05-01"
				},//同名条件2
				{
					"op": "=",//同名条件1(多选条件),op可以IN/NI/= 操作符
					"k": "ZJLX ",
					"v": "1,2" //or 关系
				},//同名条件1(多选条件)
				{
					"op": "=",
					"k": "ZJHM ",
					"v": "5130"
				},
				{
					"op": "=",
					"k": "XM",
					"v": "王五"
				}
			]
		},
		{
			"type": "ry_ryjzgjxxb",
			"condition": [
				{
					"op": "=",
					"k": "XT_LRRID",
					"v": "未注销"
				},
				{
					"op": "NL",
					"k": "JZD_XZQHDM",
					"v": ""
				},
				{
					"op": "IN",
					"k": "XT_LRRXM",
					"v": "刘大饼,福忠"
				}
			]
		}
	]
};
//console.log(t2);


