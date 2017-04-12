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
1.首先实始化html框架。
2.获取data-options