var $event = [];

function NodeArray() {
	Array.apply(this, arguments);
};

NodeArray.prototype = Object.create(Array.prototype);

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

NodeArray.from = function() {
	return Array.from.apply(NodeArray, arguments);
}

var $ = function(e) {
	if(e instanceof Function) {
		window.onload = (window.onload || function() {}).after(e);
		return ;
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
	for(var i = 0; i < $event.length; i++) {
		if($event[i].dom == this) {
			this.addEventListener(event, handler);
			if(!$event[i][event]) {
				$event[i][event] = [];
			}
			$event[i][event].push(handler);
			return;
		}
	}
	this.addEventListener(event, handler);
	$event.push({dom: this});
	if(!$event[i][event]) {
		$event[i][event] = [];
	}
	$event[i][event].push(handler);
	return;
}

NodeArray.prototype.on = function(event, handler) {
	this.forEach(function(v, i) {
		v.on(event, handler);
	})
}

Node.prototype.off = function(event, handler) {
	var _this = this;
	if(!event) {
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom == this) {
				for(var m in $event[i]) {
					if($event[i][m] instanceof Array) {
						$event[i][m].forEach(function(value, index) {
							_this.removeEventListener(m, value);
						});
						$event[i][m].length = 0;
					}
				}
			}
		}
	} else if(!handler) {
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom == this) {
				for(var m in $event[i]) {
					if(event == m) {
						$event[i][m].forEach(function(value, index) {
							_this.removeEventListener(event, value);
						});
						$event[i][m].length = 0;
					}
				}
			}
		}
	} else {
		for(var i = 0; i < $event.length; i++) {
			if($event[i].dom == this) {
				this.removeEventListener(event, handler);
				if(!$event[i][event]) {
					return;
				}
				for(var j = 0; j < $event[i][event].length; j++) {
					if($event[i][event][j] == handler) {
						$event[i][event].splice(j, 1);
					}
				}
				return;
			}
		}
	}
}

NodeArray.prototype.off = function(event, handler) {
	this.forEach(function(v, i) {
		v.off(event, handler);
	})
}

Node.prototype.append = function(dom) {
	if(typeof dom != "object") {
		this.innerHTML += dom;
	} else if(dom instanceof Node) {
		this.appendChild(dom);
	}
}

NodeArray.prototype.append = function(dom) {
	this.forEach(function(v, i) {
		v.append(dom);
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
		if(dom == $('body').eq(0)) {
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
				if(temp1[i] == temp2[j]) {
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
	if(!arguments.length) {
		return null;
	}
	if(arguments[0] instanceof Object) {
		for(var i in arguments[0]) {
			this.style[i.replace(/-./, function(a) {
				return a[1].toUpperCase();
			})] = arguments[0][i];
//			this.attr('style', this.attr('style') + i.replace(/[A-Z]/, function($1) {
//				return $1.toLowerCase();
//			}) + ':' + arguments[0][i]);
		}
		return this;
	} else {
		this.style[arguments[0].replace(/-./, function(a) {
			return a[1].toUpperCase();
		})] = arguments[1];
//		this.attr('style', this.attr('style') + arguments[0].replace(/[A-Z]/, function($1) {
//			return $1.toLowerCase();
//		}) + ':' + arguments[1]);
//		return this;
	}
}

NodeArray.prototype.css = function() {
	if(!this.length) {
		return this;
	}
	var args = arguments;
	if(args[0] instanceof Object) {
		for(var i in args[0]) {
			this.forEach(function(v, i) {
				v.style[i.replace(/-./, function(a) {
					return a[1].toUpperCase();
				})] = args[0][i];
			});
			return this;
		}
	} else {
		this.forEach(function(v, i) {
			v.style[args[0].replace(/-./, function(a) {
				return a[1].toUpperCase();
			})] = args[1];
		});
		return this;
	}
}

Node.prototype.attr = function() {
	if(!arguments.length) {
		return null;
	} else if(arguments.length == 1) {
		return this.getAttribute(arguments[0]);
	} else {
		this.setAttribute(arguments[0], arguments[1]);
		return this;
	}
}

NodeArray.prototype.attr = function() {
	if(!arguments.length) {
		return null;
	} else if(arguments.length == 1) {
		return this.eq(0).getAttribute(arguments[0]);
	} else {
		var args = arguments;
		this.forEach(function(v, i) {
			v.setAttribute(args[0], args[1]);
		});
		return this;
	}
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
