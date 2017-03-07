# Query
仿jq框架，实现常用功能
## 实现功能
+ jq选择器$()
+ $(function(){})页面加载完成自动运行
+ $().eq()选择单个元素
+ on,off事件绑定和解绑，trigger手动触发事件
+ appendNode添加元素,允许添加dom元素，字符串，以及dom NodeArray数组
+ find寻找下级元素
+ parent寻找父级元素
+ parents寻找父级及以上元素
+ child寻找子级元素
+ index获取当前元素在父元素中索引
+ html修改或获取元素内容
+ text修改或获取元素文本内容
+ css修改或获取元素内联样式
+ attr修改或获取元素内联属性，removeAttr删除内联属性
+ val修改或获取元素value
+ siblings获取当前元素兄弟元素
+ class操作方法addClass/removeClass/hasClass/toggleClass
+ offset方法提供元素位置
+ filter方法
+ after、before方法插入子元素
+ empty方法置空元素
+ clone方法复制元素
+ next、prev获取相邻元素
+ remove移除当前元素

## 注意内容
+ 选择器获取的内容为自定义数组，但是通过eq获取到的是真正的dom节点，和jq的选择器有本质的不同
+ jq获取子级元素为children，但是该选择器获取子级元素为child
+ on,off已实现事件委托
+ 提供切片方法，Function.prototype.before,Function.prototype.after，可以在方法执行前后无限制累加运行
+ 重写伪数组concat,forEach,from方法，返回NodeArray伪数组对象，选择器获取的元素伪数组可以直接使用
+ filter方法只能传function进行过滤，未实现传字符串进行过滤
+ append因为存在原生方法，所以添加子元素方法为appendNode