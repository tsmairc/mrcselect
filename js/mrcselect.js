/**
 * 1、引用
 * 需要引用base.css,style.css,jquery.js
 * 
 * 2、样例
 * <div class="inp-select inp-size-s mr10"  data-options="attr_code:'ABILITY_STATUS',blank_value:'-1',blank_name:'--请选择--'"  id="query_type" style="width: 100px;">
 * $("#query_type").mrcselect();或$(".inp-select").mrcselect();
 */ 

(function($) {
	//定义jquery的扩展方法dselect
	$.fn.mrcselect = function(options, params) {
		var $this = this;
		//执行方法
		if (typeof options == "string") {
			if (!$this.data("mrcselect")) {
				//没初始化，不执行
				return null;
			}
			var method = $.fn.mrcselect.methods[options];
			if ($.isFunction(method)) {
				return method($this, params);
			}
			return null;
		}
		options = options || {};
		var attrCodes = [];
		var async = $.fn.mrcselect.defaults.async;
		$this.each(function() {
			// 初始化select
			var _self = $(this);
			// _self.addClass("inp-select").addClass("mr10");
			var width = _self.get(0).style.width;
			if (!width) {
				_self.css({
					width: "auto"
				});
			}
			var html = [];
			html.push("<div class='inp-select-tit' style='padding: 0 15px 0 5px;'>");
			html.push("    <label name='selected_item'></label>");
			html.push("    <i class='inp-select-ico'></i>");
			html.push("</div>");
			html.push("<div class='inp-select-list'>");
			html.push("    <ul></ul>");
			html.push("</div>");
			_self.html(html.join(""));
			$(document).click(function() {
				$(".inp-select-list").hide();
			});
			//从data-options中获取attr_code、blank_value、blank_name属性
			var s = $.trim(_self.attr("data-options"));
			var dataOptions = {};
			if (s) {
				if (s.substring(0, 1) != "{") {
					s = "{" + s + "}";
				}
				dataOptions = (new Function("return " + s))();
			}
			var _options = $.extend({}, dataOptions, options);
			//根据属性初始化
			var data = _self.data("mrcselect");
			if (data) {
				data.options = $.extend(data.options, _options);
				_options = data.options;
			} else {
				//覆盖默认属性
				_options = $.extend({}, $.fn.mrcselect.defaults, _options);
				_self.data("mrcselect", {
					options: _options
				});
			}
			// 初始化下拉框数据结构
			if (_options.attr_code) {
				//先从本地缓存中取，没有再从服务器取
				var attrValues = localStorage.getItem(_options.attr_code);
				if (attrValues != null) {
					$.fn.mrcselect.methods.loadData(_self, attrValues);
				} else {
					//把attr_code记录下来，后面一次加载所有的attr_value
					attrCodes.push(_options.attr_code);
				}
			}
			//页面自定义下拉值
			//格式：data-options="attr_values:[{attr_value: 'T', attr_value_name: '是'},{attr_value: 'F', attr_value_name: '否'}]"
			else if (_options.attr_values) {
				$.fn.mrcselect.methods.loadData(_self, _options.attr_values);
			}
			else if (_options.blank_value != undefined) {
				_self.data("select_box_items").push({
					attr_value: _options.blank_value,
					attr_value_name: _options.blank_name
				});
			}
			async = _options.async;
		});
		//这里应该改为用ajax方式，我这里仅演示
		if (attrCodes.length > 0) {
			//一次性加载所有attr_value，减少前后端的交互
			if (async) {
				var resultData = {abc:[{attr_value: 'T', attr_value_name: '是'},{attr_value: 'F', attr_value_name: '否'}]};
				for(var attr_code in resultData){
					localStorage.setItem(attr_code, resultData[attr_code]);
						$this.each(function() {
							var _self = $(this);
							var options = $.fn.mrcselect.methods.options(_self);
							if (attr_code == options.attr_code) {
								$.fn.mrcselect.methods.loadData(_self, resultData[attr_code]);
							}
						});
				}
			}
			else {
				//使用同步的方式加载，防止setValue方法在数据返回前执行
				var resultData = {abc:[{attr_value: 'T', attr_value_name: '是'},{attr_value: 'F', attr_value_name: '否'}]};
				for(var attr_code in resultData){
					localStorage.setItem(attr_code, resultData[attr_code]);
						$this.each(function() {
							var _self = $(this);
							var options = $.fn.mrcselect.methods.options(_self);
							if (attr_code == options.attr_code) {
								$.fn.mrcselect.methods.loadData(_self, resultData[attr_code]);
							}
						});
				}
			}
		}
		return $this;
	};
	$.fn.mrcselect.methods = {
		/**dselect插件属性*/
		options: function(jq) {
			return jq.eq(0).data("mrcselect").options || {};
		},
		/**设置选中的值，value可以是值或index*/
		setValue: function(jq, value) {
			jq.each(function() {
				var _self = $(this);
				var item;
				if (typeof(value) === "string") {
					$.each(_self.data("select_box_items"), function(i, element) {
						if (element.attr_value == value) {
							item = element;
							return false;
						}
					});
				} else if ($.isNumeric(value)) {
					item = _self.data("select_box_items")[value];
				}
				if (item != undefined) {
					_self.find("label[name=selected_item]").text(item.attr_value_name);
					_self.find("label[name=selected_item]").attr("value", item.attr_value);
					_self.data("old_value", $.fn.mrcselect.methods.getValue(_self));
				}
			});
		},
		/**获取选中的值*/
		getValue: function(jq) {
			return jq.eq(0).find("label[name=selected_item]").attr("value");
		},
		/**获取选中项的文本名称*/
		getName: function(jq) {
			return jq.eq(0).find("label[name=selected_item]").text();
		},
		/**获取下拉框的值，返回：[{attr_value: "1", attr_value_name: "a"},{attr_value: "2", attr_value_name: b"}]*/
		getData: function(jq) {
			var data = [];
			var options = $.fn.mrcselect.methods.options(jq) || {};
			$.each(jq.eq(0).data("select_box_items"), function(i, element) {
				var attr_value = element.attr_value;
				var attr_value_name = element.attr_value_name;
				if (options.blank_value != undefined && options.blank_value == attr_value) {
					return true;
				}
				data.push({
					attr_value: attr_value,
					attr_value_name: attr_value_name
				});
			});
			return data;
		},
		/**加载下拉框数据，参数: [{attr_value: "xx", attr_value_name: "oo"}]*/
		loadData: function(jq, data) {
			if ($.isArray(data)) {
				$.fn.mrcselect.methods.remove(jq);
				jq.each(function() {
					var _self = $(this);
					var options = $.fn.mrcselect.methods.options(_self) || {};
					if (options.blank_value != undefined) {
						_self.data("select_box_items").push({
							attr_value: options.blank_value,
							attr_value_name: options.blank_name
						});
					}
					var attrValues = [];
					$.each(data, function(i, element) {
						_self.data("select_box_items").push({
							attr_value: element.attr_value,
							attr_value_name: element.attr_value_name
						});
					});
					$.each(_self.data("select_box_items"), function(i, element) {
						_self.find("ul").append("<li class='inp-select-item' value='" + element.attr_value + "'>" + element.attr_value_name + "</li>");
					});
					$.fn.mrcselect.methods.setValue(_self, 0);
					$.fn.mrcselect.methods.enable(_self);
				});
			}
		},
		/**删除下拉框的值*/
		remove: function(jq, params) {
			jq.each(function() {
				var _self = $(this);
				if (params == undefined) {
					//清空所有option
					_self.data("select_box_items", []);
					_self.find("label[name=selected_item]").text("");
					_self.find("label[name=selected_item]").attr("value", "");
					_self.find("ul").empty();
					return true;
				}
				if (typeof(params) === "string") {
					//删除某个value的option
					var index;
					$.each(_self.data("select_box_items"), function(i, element) {
						if (element.attr_value == params) {
							index = i;
							return false;
						}
					});
					if (index != undefined) {
						_self.data("select_box_items").splice(index, 1);
						_self.find("li").eq(index).remove();
					}
				} else if ($.isNumeric(params)) {
					//删除某个index的option
					_self.data("select_box_items").splice(params, 1);
					_self.find("li").eq(params).remove();
				} else if ($.isArray(params)) {
					//数组参数，可以是value数组或index数组
					var indexs = [];
					var values = [];
					$.each(params, function(i, element) {
						if (typeof(element) === "string") {
							values.push(element);
						} else if ($.isNumeric(element)) {
							indexs.push(element);
						}
					});
					if (indexs.length > 0) {
						$.each(indexs, function(i, index) {
							values.push(_self.data("select_box_items")[index].attr_value);
						});
					}
					if (values.length > 0) {
						$.each(values, function(i, value) {
							var _index;
							$.each(_self.data("select_box_items"), function(index, element) {
								if (element.attr_value == value) {
									_index = index;
									return false;
								}
							});
							if (_index != undefined) {
								_self.data("select_box_items").splice(_index, 1);
								_self.find("li").eq(_index).remove();
							}
						});
					}
				}
				$.fn.mrcselect.methods.setValue(_self, 0);
			});
		},
		/**使下拉框不可用*/
		disable: function(jq) {
			jq.each(function() {
				var _self = $(this);
				_self.find(".inp-select-tit").attr("disabled", "disabled").off('click');
				_self.find(".inp-select-item").attr("disabled", "disabled").off('click');
			});
		},
		/**使下拉框可用*/
		enable: function(jq) {
			jq.each(function() {
				var _self = $(this);
				_self.find(".inp-select-tit").off('click');
				_self.find(".inp-select-item").off('click');
				_self.find(".inp-select-tit").removeAttr("disabled").on('click', function(e) {
					// div单击事件
					e.stopPropagation();
					_self.find(".inp-select-list").toggle();
				});
				_self.find(".inp-select-item").removeAttr("disabled").on('click', function() {
					// 下拉框单击事件
					_self.find(".inp-select-list").hide();
					_self.find("label").text($(this).text()).attr("value", $(this).attr("value"));
					var old_value = _self.data("old_value");
					var new_value = $.fn.mrcselect.methods.getValue(_self);
					if (old_value != new_value && $.isFunction(_self.data("mrcselect").options.onChange)) {
						_self.data("mrcselect").options.onChange(old_value, new_value);
						_self.blur();
					}
					_self.data("old_value", $.fn.mrcselect.methods.getValue(_self));
				});
			});
		}
	};
	//默认属性
	$.fn.mrcselect.defaults = $.extend({}, {
		attr_code: "",
		blank_value: undefined,
		blank_name: "",
		async: false,
		onChange: function(old_value, new_value) {}
	});
})(jQuery);
