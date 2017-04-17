(function(scope) {
	var TestSelect = Base.extend({
		constructor: function(config) {},
		init: function() {
			var me = this;
			me.initSelect();
		},
		//初始化API列表
		initSelect : function() {
			$(".inp-select").mrcselect();
		}
	});
	window.testSelect = new TestSelect();
}(window));
$(function() {
	testSelect.init();
});
