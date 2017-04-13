## mrcselect是一个jquery的select控件
### 控件依赖于jquery1.7以上
### 下面介绍控件的用法
*具体html代码
```html
<div class="inp-select inp-size-s mr10"  
data-options="attr_code:'TEST_CODE',blank_value:'-1',blank_name:'--请选择--'"  
id="myselect" style="width: 100px;">
```
*具体javascrpit
```javascript
$("#myselect").zselect();
```

### 控件的实现思路
1.首先实始化html框架。<br/>
2.获取jquery对象中的data-options，再与控件中已经定义好的data.options合并，再$().data("mrczselect", options);<br/>
3.再根据options中的attr_code，从LocalStorage中获取初始化数据。
4.localStorage不存在数据，则去服务器获取数据。

### 控件方法介绍
options:<br/>
获取当前控件初始化的参数<br/>
setValue:<br/>
设置选中的值，value可以是值或index<br/>
