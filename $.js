var $event = [];

function NodeArray() {
	Array.apply(this, arguments);
};

NodeArray.prototype = Object.create(Array.prototype);
NodeArray.prototype.constructor = NodeArray;

NodeArray.prototype.concat = function() {
	var temp = new NodeArray();
	Array.prototype.forEach.call(this, function(v, i) {
		temp.push(v);
	});
	Array.prototype.forEach.call(arguments, function(v, i) {
		if(v instanceof Array) {
			Array.prototype.forEach.call(v, function(value, index) {
				temp.push(value);
			})
		} else {
			temp.push(v);
		}
	});
	return temp;
}

NodeArray.prototype.forEach = function(func) {
	return Array.prototype.forEach.call(this, func);
}

NodeArray.prototype.filter = function(func) {
	var temp = new NodeArray();
	var tempArray = Array.prototype.filter.call(this, func);
	tempArray.forEach(function(v, i) {
		temp.push(v);
	});
	return temp;
}

NodeArray.from = function() {
	return Array.from.apply(NodeArray, arguments);
}

var __whenReady = (function() {
	var funcs = [];	// 保存所有需要执行的方法
	var ready = false;	// 页面准备完毕之后，修改为true

	// 当文档处理完毕，调用事件处理程序
	function handler(e) {
		// 如果执行过了，直接返回
		if(ready) {
			return;
		}

		// 如果发生过readysyayechange事件，但是状态不为complete，那么文档没有准备好
		if(e.type === "readystatechange" && document.readyState !== "complete") {
			return;
		}

		// 运行所有注册函数
		for(var i = 0; i < funcs.length; i++) {
			funcs[i].call(document);
		}

		// 设置ready为true,并移除所有方法
		ready = true;
		funcs = null;
	}

	// 为接收到的任何事件注册处理程序
	if(document.addEventListener) {
		document.addEventListener("DOMContentLoaded", handler, false);
		document.addEventListener("readystatechange", handler, false);
		document.addEventListener("load", handler, false);
	} else if(document.attachEvent) {	// 处理ie兼容
		document.attachEvent("onreadystatechange", handler);
		document.attachEvent("onload", handler);
	}

	// 返回__whenReady函数
	return function __whenReady(f) {
		if(ready) {
			f.call(document);
		} else {
			funcs.push(f);
		}
	}
}());

var $ = function(e) {
	if(e instanceof Function) {
		// 此处onload之前还有一个DOMContentLoaded,应该多次处理
		// window.onload = (window.onload || function() {}).after(e);
		// return ;
		__whenReady(e);
	}
	var temp = new NodeArray();
	if(e instanceof Node || e instanceof NodeArray) {
		return e;
	}
	if(e) {
		Array.prototype.forEach.call(document.querySelectorAll(e), function(v, i) {
			temp.push(v);
		});
	}
	return temp;
}

Function.prototype.before = function(func) {
	var _self = this;
	return function() {
		if(func.apply(this, arguments) === false) {
			return false;
		}
		return _self.apply(this, arguments);
	}
}

Function.prototype.after = function(func) {
	var _self = this;
	return function() {
		var ret = _self.apply(this, arguments);
		if(ret === false) {
			return false;
		}
		func.apply(this, arguments);
		return ret;
	}
}

NodeArray.prototype.eq = function(i) {
	return this[i];
}

Node.prototype.on = function(event, handler) {
	var args = arguments;
	var _this = this;
	if(args.length === 2) {
		var temp = {handler: args[1], bindHandler: args[1], child: null};
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom === _this) {
				_this.addEventListener(args[0], args[1]);
				if(!$event[i][args[0]]) {
					$event[i][args[0]] = [];
				}
				$event[i][args[0]].push(temp);
				return;
			}
		}
		_this.addEventListener(args[0], args[1]);
		$event.push({dom: _this});
		if(!$event[i][args[0]]) {
			$event[i][args[0]] = [];
		}
		$event[i][args[0]].push(temp);
	} else if(args.length === 3) {
		var temp = {handler: args[2], bindHandler: null, child: args[1]};
		var tempHandler = function(e) {
			var tempDom = $(_this).find(args[1]);
			tempDom.forEach(function(v, i) {
				if(e.target === v || ~v.find('*').indexOf(e.target)) {
					args[2].call(v, e);
				}
			});
		}
		temp.bindHandler = tempHandler;
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom === _this) {
				_this.addEventListener(args[0], tempHandler);
				if(!$event[i][args[0]]) {
					$event[i][args[0]] = [];
				}
				$event[i][args[0]].push(temp);
				return;
			}
		}
		this.addEventListener(args[0], tempHandler);
		$event.push({dom: this});
		if(!$event[i][args[0]]) {
			$event[i][args[0]] = [];
		}
		$event[i][args[0]].push(temp);
	}
	return;
}

NodeArray.prototype.on = function() {
	var args = arguments;
	this.forEach(function(v, i) {
		v.on.apply(v, args);
	})
}

Node.prototype.off = function() {
	var _this = this;
	var args = arguments;
	if(args.length === 0) {
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom === _this) {
				for(var m in $event[i]) {
					if($event[i][m] instanceof Array) {
						$event[i][m].forEach(function(value, index) {
							_this.removeEventListener(m, value.bindHandler);
						});
						$event[i][m].length = 0;
					}
				}
			}
		}
	} else if(args.length === 1) {
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom === _this) {
				for(var m in $event[i]) {
					if(args[0] === m) {
						$event[i][m].forEach(function(value, index) {
							_this.removeEventListener(args[0], value.bindHandler);
						});
						$event[i][m].length = 0;
					}
				}
			}
		}
	} else if(args.length === 2) {
		if(args[1] instanceof Function) {
			for(var i = 0; i < $event.length; i++) {
				if($event[i].dom === _this) {
					if(!$event[i][args[0]]) {
						return;
					}
					for(var j = 0; j < $event[i][args[0]].length; j++) {
						if($event[i][args[0]][j].handler === args[1]) {
							_this.removeEventListener(args[0], $event[i][args[0]][j].bindHandler);
							$event[i][args[0]].splice(j, 1);
						}
					}
					return;
				}
			}
		} else {
			for(var i = 0; i < $event.length; i++) {
				if($event[i].dom === _this) {
					for(var m in $event[i]) {
						if(args[0] === m) {
							$event[i][m].forEach(function(value, index) {
								if(value.child === args[1]) {
									_this.removeEventListener(args[0], value.bindHandler);
									delete $event[i][m][index];
								}
							});
							var tempEvent = [];
							for(var t = 0; t < $event[i][m].length; t++) {
								if($event[i][m][t] !== undefined) {
									tempEvent.push($event[i][m][t]);
								}
							}
							$event[i][m] = tempEvent;
						}
					}
				}
			}
		}
	} else if(args.length === 3) {
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom === _this) {
				if(!$event[i][args[0]]) {
					return;
				}
				for(var j = 0; j < $event[i][args[0]].length; j++) {
					if($event[i][args[0]][j].handler === args[2] && $event[i][args[0]][j].child === args[1]) {
						_this.removeEventListener(args[0], $event[i][args[0]][j].bindHandler);
						$event[i][args[0]].splice(j, 1);
					}
				}
				return;
			}
		}
	}
}

NodeArray.prototype.off = function() {
	var args = arguments;
	this.forEach(function(v, i) {
		v.off.apply(v, args);
	})
}

Node.prototype.trigger = function(e) {
	var event = document.createEvent('HTMLEvents');
	event.initEvent(e, true, false);
	this.dispatchEvent(event);
}

NodeArray.prototype.trigger = function(e) {
	var event = document.createEvent('HTMLEvents');
	event.initEvent(e, true, false);
	this.forEach(function(v, i) {
		v.dispatchEvent(event);
	})
}

Node.prototype.appendNode = function(dom) {
	var _this=  this;
	if(typeof dom != "object") {
		this.html(this.html() + dom);
	} else if(dom instanceof NodeArray) {
		dom.forEach(function(v, i) {
			_this.appendNode(v);
		});
	} else if(dom instanceof Node) {
		this.appendChild(dom);
	}
}

NodeArray.prototype.appendNode = function(dom) {
	this.forEach(function(v, i) {
		v.appendNode(dom);
	});
}

Node.prototype.find = function(e) {
	var temp = new NodeArray();
	if(e) {
		Array.prototype.forEach.call(this.querySelectorAll(e), function(v, i) {
			temp.push(v);
		});
	}
	return temp;
}

NodeArray.prototype.find = function(e) {
	var temp = new NodeArray();
	if(e.length) {
		this.forEach(function(v, i) {
			temp = temp.concat(v.find(e));
		})
	}
	return temp;
}

Node.prototype.parent = function() {
	return this.parentNode;
}

NodeArray.prototype.parent = function() {
	var temp = new NodeArray();
	this.forEach(function(v, i) {
		temp.push(v.parent());
	});
	temp = NodeArray.from(new Set(temp));
	return temp;
}

Node.prototype.parents = function() {
	var temp = new NodeArray();
	function findParent(dom) {
		if(dom === $('body').eq(0)) {
			return;
		}
		temp.push(dom.parent());
		findParent(dom.parent());
	}
	findParent(this);
	return temp;
}

NodeArray.prototype.parents = function() {
	var temp = new NodeArray();
	this.forEach(function(v, i) {
		temp = temp.concat(v.parents());
	});
	temp = NodeArray.from(new Set(temp));
	return temp;
}

Node.prototype.child = function() {
	if(!arguments.length) {
		return NodeArray.from(this.children);
	} else {
		var temp = new NodeArray();
		var temp1 = NodeArray.from(this.children);
		var temp2 = NodeArray.from(this.find(arguments[0]));
		for(var i = 0; i < temp1.length; i++) {
			for(var j = 0; j < temp2.length; j++) {
				if(temp1[i] === temp2[j]) {
					temp.push(temp1[i]);
				}
			}
		}
		return temp;
	}
}

NodeArray.prototype.child = function() {
	var args = arguments;
	var temp = new NodeArray();
	if(!args.length) {
		this.forEach(function(v, i) {
			temp = temp.concat(v.child());
		});
	} else {
		this.forEach(function(v, i) {
			temp = temp.concat(v.child(args[0]));
		});
	}
	return temp;
}

Node.prototype.index = function() {
	return this.parent().child().indexOf(this);
}

NodeArray.prototype.index = function() {
	if(!this.length) {
		return -1;
	}
	return this.eq(0).parent().child().indexOf(this.eq(0));
}

Node.prototype.html = function() {
	if(!arguments.length) {
		return this.innerHTML;
	} else {
		this.innerHTML = arguments[0];
		return this;
	}
}

NodeArray.prototype.html = function() {
	if(!this.length) {
		if(!arguments.length) {
			return undefined;
		} else {
			return new NodeArray();
		}
	}
	if(!arguments.length) {
		return this.eq(0).innerHTML;
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.innerHTML = args[0];
		})
		return this;
	}
}

Node.prototype.css = function() {
	var px = ['top', 'left', 'right', 'bottom', 'marginTop', 'marginRight', 'marginLeft', 'marginBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'width', 'height'];
	if(!arguments.length) {
		return null;
	}
	if(arguments.length === 1) {
		return this.style[arguments[0]];
	}
	if(arguments[0] instanceof Object) {
		for(var i in arguments[0]) {
			var _css = i.replace(/-./g, function(a) {
				return a[1].toUpperCase();
			});
			if(~px.indexOf(_css) && !~(arguments[0][i].toString().indexOf('px'))) {
				this.style[_css] = arguments[0][i] + 'px';
			} else {
				this.style[_css] = arguments[0][i];
			}
		}
	} else {
		var _css = arguments[0].replace(/-./g, function(a) {
			return a[1].toUpperCase();
		})
		if(~px.indexOf(_css) && !~(arguments[1].toString().indexOf('px'))) {
			this.style[_css] = arguments[1] + 'px';
		} else {
			this.style[_css] = arguments[1];
		}
	}
	return this;
}

NodeArray.prototype.css = function() {
	if(!this.length) {
		return this;
	}
	var args = arguments;
	this.forEach(function(v, i) {
		v.css.apply(v, args);
	});
	return this;
}

Node.prototype.attr = function() {
	if(!arguments.length) {
		return null;
	} else if(arguments.length === 1) {
		return this.getAttribute(arguments[0]);
	} else {
		this.setAttribute(arguments[0], arguments[1]);
		return this;
	}
}

NodeArray.prototype.attr = function() {
	if(!arguments.length) {
		return null;
	} else if(arguments.length === 1) {
		return this.eq(0).getAttribute(arguments[0]);
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.setAttribute(args[0], args[1]);
		});
		return this;
	}
}

Node.prototype.removeAttr = function() {
	this.removeAttribute(arguments[0]);
}

NodeArray.prototype.removeAttr = function() {
	var args = arguments;
	this.forEach(function(v, i) {
		v.removeAttr(args[0]);
	});
}

Node.prototype.val = function() {
	if(!arguments.length) {
		return this.value;
	} else {
		this.value = arguments[0];
		return this;
	}
}

NodeArray.prototype.val = function() {
	if(!arguments.length) {
		return this.eq(0).value;
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.value = args[0];
		})
		return this;
	}
}

Node.prototype.siblings = function() {
	var temp;
	if(!arguments.length) {
		temp = this.parent().child();
	} else {
		temp = this.parent().child(arguments[0]);
	}
	if(~temp.indexOf(this)) {
		temp.splice(temp.indexOf(this), 1);
	}
	return temp;
}

NodeArray.prototype.siblings = function() {
	var temp = new NodeArray();
	if(!arguments.length) {
		this.forEach(function(v, i) {
			temp = temp.concat(v.siblings());
		})
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			temp = temp.concat(v.siblings(args[0]));
		})
	}
	return temp;
}

Node.prototype.addClass = function($class) {
	this.classList.add($class);
	return this;
}

NodeArray.prototype.addClass = function($class) {
	this.forEach(function(v, i) {
		v.addClass($class);
	});
	return this;
}

Node.prototype.removeClass = function($class) {
	this.classList.remove($class);
	return this;
}

NodeArray.prototype.removeClass = function($class) {
	this.forEach(function(v, i) {
		v.removeClass($class);
	});
	return this;
}

Node.prototype.hasClass = function($class) {
	return this.classList.contains($class);
}

NodeArray.prototype.hasClass = function($class) {
	for(var i = 0; i < this.length; i++) {
		if(this[i].hasClass($class)) {
			return true;
		}
	}
	return false;
}

Node.prototype.toggleClass = function($class) {
	this.classList.toggle($class);
	return this;
}

NodeArray.prototype.toggleClass = function($class) {
	this.forEach(function(v, i) {
		v.toggle($class);
	});
	return this;
}

Node.prototype.offset = function() {
	return this.getBoundingClientRect();
}

NodeArray.prototype.offset = function() {
	return this.eq(0).getBoundingClientRect();
}

Node.prototype.position = function() {
	return {left: this.offsetLeft, top: this.offsetTop};
}

NodeArray.prototype.position = function() {
	return this.eq(0).position();
}

Node.prototype.after = function(text) {
	this.insertAdjacentHTML('afterend', text);
	return this;
}

NodeArray.prototype.after = function(text) {
	this.forEach(function(v, i) {
		v.after(text);
	});
	return this;
}

Node.prototype.before = function(text) {
	this.insertAdjacentHTML('beforebegin', text);
	return this;
}

NodeArray.prototype.before = function(text) {
	this.forEach(function(v, i) {
		v.before(text);
	});
	return this;
}

Node.prototype.clone = function() {
	return this.cloneNode(true);
}

NodeArray.prototype.clone = function() {
	var temp = new NodeArray();
	this.forEach(function(v, i) {
		temp.push(v.clone());
	});
	return temp;
}

Node.prototype.empty = function() {
	this.innerHTML = '';
	return this;
}

NodeArray.prototype.empty = function() {
	var temp = new NodeArray();
	this.forEach(function(v, i) {
		temp.push(v.empty());
	});
	return temp;
}

Node.prototype.text = function() {
	if(!arguments.length) {
		return this.textContent;
	} else {
		this.textContent = arguments[0];
		return this;
	}
}

NodeArray.prototype.text = function() {
	if(!this.length) {
		if(!arguments.length) {
			return undefined;
		} else {
			return new NodeArray();
		}
	}
	if(!arguments.length) {
		return this.eq(0).textContent;
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.textContent = args[0];
		})
		return this;
	}
}

Node.prototype.next = function() {
	return this.nextElementSibling;
}

NodeArray.prototype.next = function() {
	var temp = new NodeArray();
	this.forEach(function(v, i) {
		var tp = v.next();
		if(tp) {
			temp.push(tp);
		}
	});
	return temp;
}

Node.prototype.prev = function() {
	return this.previousElementSibling;
}

NodeArray.prototype.prev = function() {
	var temp = new NodeArray();
	this.forEach(function(v, i) {
		var tp = v.prev();
		if(tp) {
			temp.push(tp);
		}
	});
	return temp;
}

Node.prototype.removeNode = function() {
	var args = arguments;
	if(args.length === 0) {
		this.remove();
	} else {
		this.find(args[0]).eq(0).remove();
	}
}

NodeArray.prototype.removeNode = function() {
	var args = arguments;
	if(args.length === 0) {
		this.forEach(function(v, i) {
			v.removeNode();
		});
	} else {
		this.forEach(function(v, i) {
			v.removeNode(args[0]);
		});
	}
}

Node.prototype.height = function() {
	if(!arguments.length) {
		var styles = getComputedStyle(this);
		var height = this.offsetHeight;
		var borderTopWidth = parseFloat(styles.borderTopWidth);
		var borderBottomWidth = parseFloat(styles.borderBottomWidth);
		var paddingTop = parseFloat(styles.paddingTop);
		var paddingBottom = parseFloat(styles.paddingBottom);
		return height - borderBottomWidth - borderTopWidth - paddingTop - paddingBottom;
	} else {
		this.css('height', arguments[0]);
	}
}

NodeArray.prototype.height = function() {
	if(!this.length) {
		return null;
	}
	if(!arguments.length) {
		return this.eq(0).height();
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.height(args[0]);
		});
		return this;
	}
}

Node.prototype.width = function() {
	if(!arguments.length) {
		var styles = getComputedStyle(this);
		var width = this.offsetWidth;
		var borderLeftWidth = parseFloat(styles.borderLeftWidth);
		var borderRightWidth = parseFloat(styles.borderRightWidth);
		var paddingLeft = parseFloat(styles.paddingLeft);
		var paddingRight = parseFloat(styles.paddingRight);
		return width - borderLeftWidth - borderRightWidth - paddingLeft - paddingRight;
	} else {
		this.css('width', arguments[0]);
	}
}

NodeArray.prototype.width = function() {
	if(!this.length) {
		return null;
	}
	if(!arguments.length) {
		return this.eq(0).width();
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.width(args[0]);
		});
		return this;
	}
}

var ajax = function () {

  //默认请求参数
  var _options = {
    url: null,
    type: 'GET',
    data: null,
    dataType: 'text',
    jsonp: 'callback',
    jsonpCallback: 'jsonpCallback',
    async: true,
    cache: true,
    timeout:null,
    contentType: 'application/x-www-form-urlencoded',
    success: null,
    fail: null
  }


  // json转化为字符串
  var _param = function(data) {
    var str = '';
    if( !data || _empty(data)) {
      return str;
    }
    for(var key in data) {
      str += key + '='+ data[key]+'&'
    }
    str = str.slice(0,-1);
    return str;
  }
  //判断对象是否为空
  var _empty = function(obj) {
    for(var key in obj) {
      return false;
    }
    return true;
  }

  var _extend = function(target,options) {
    if( typeof target !== 'object' || typeof options !== 'object' ) {
      return;
    }
    var copy ,clone, name;
    for( name in options ) {
      if(options.hasOwnProperty(name) && !target.hasOwnProperty(name)) {
        target[name] = options[name];
      }
    }
    return target;
  };

  // 自定义text转化json格式
  var parseJSON = function(text) {
    if(typeof text !== 'string') {
      return;
    }
    if( JSON && JSON.parse ) {
      return JSON.parse(text);
    }
    return (new Function('return '+text))();
  }

  // jsonp处理函数
  function _sendJsonpRequest(url,callbackName,succCallback) {

    var script = document.createElement('script');

    script.type="text/javascript";
    script.src=url;

    document.body.appendChild(script);
    // 如果用户自己定义了回调函数，就用自己定义的，否则，调用success函数
    window[callbackName] = window[callbackName] || succCallback;

  }


  return function (options) {

    // 没有传参或者没有url，抛出错误
    if( !options || !options.url ) {
      throw('参数错误！');
    }

    // 继承操作
    _extend(options,_options);
    options.type = options.type.toUpperCase();

    /*jsonp部分，直接返回*/
    if( options.dataType === 'jsonp' ) {
      var jsonpUrl = options.url.indexOf('?') > -1 ? options.url: options.url +
        '?' + options.jsonp+ '=' + options.jsonpCallback;

      _sendJsonpRequest(jsonpUrl,options.jsonpCallback,options.success);

      return;
    }

     //XMLHttpRequest传参无影响
    var xhr = new (window.XMLHttpRequest || ActiveXObject)('Microsoft.XMLHTTP');

    // get搜索字符串
    var search = '';

    // 将data序列化
    var param= _param(options.data)

    if( options.type === 'GET' ) {
      search = (options.url.indexOf('?') > -1 ? '&' : '?') + param;
      if(!options.cache) {
        search += '&radom='+Math.random();
      }

      param = null;
    }

    xhr.open( options.type, options.url + search, options.async );

    xhr.onreadystatechange = function() {
      if( xhr.readyState == 4 ) {
        if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 ) {
          var text = xhr.responseText;
          // json格式转换
          if(options.dataType == 'json') {
              text = parseJSON(text)
          }

          if( typeof options.success === 'function') {

            options.success(text,xhr.status)
          }

        }else {

          if(typeof options.fail === 'function') {
            options.fail('获取失败', 500)
          }

        }
      }
    }

    xhr.setRequestHeader('content-type',options.contentType);
    // get请求时param时null
    xhr.send(param);

    // 如果设置了超时，就定义
    if(typeof options.timeout === 'number') {
      // ie9+
      if( xhr.timeout ) {
        xhr.timeout = options.timeout;
      }else {
        setTimeout(function() {
          xhr.abort();
        },options.timeout)
      }
    }
  }

}()


/*中间件式编程*/
function Middleware(){
  this.cache = [];
  this.options = null;//缓存options
}

Middleware.prototype.use = function(fn){
  if(typeof fn !== 'function'){
    throw 'middleware must be a function';
  }
  this.cache.push(fn);
  return this;
}

Middleware.prototype.next = function(fn){

  if(this.middlewares && this.middlewares.length > 0 ){
    var ware = this.middlewares.shift();
    ware.call(this, this.options, this.next.bind(this));//传入options与next
  }
}
/**
* @param options 数据的入口
* @param next
*/
Middleware.prototype.handleRequest = function(options){
  this.middlewares = this.cache.map(function(fn){//复制
    return fn;
  });
  this.options = options;//缓存数据
  this.next();
}
