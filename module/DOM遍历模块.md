```javascript
// 先用方法jQuery.each()遍历一个含有若干函数名和函数映射的对象，然后再jQuery.each()的回调函数中，将函数名逐个添加到构造函数jQuery()的回调函数中，
// 将函数名逐个添加到构造函数jQuery
// 的原型对象jQuery.fn中，其属性值是一个模板函数,即DOM遍历模块的所有公开方法都指向了同样的模板函数。
// 在模板函数中调用相应的遍历函数查找DOM元素，然后执行过滤、排序、去重操作，最后用剩余的DOM元素构造一个新jQuery对象并返回。
// jQuery.dir(),jQuery.nth(),jQuery.sibling()三个工具函数是DOM遍历模块实现的核心所在。
jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
// 模板函数的步骤
	jQuery.fn[ name ] = function( until, selector ) {
// 1.查找
// 这里的this指向的调用查找函数的jquery对象
		var ret = jQuery.map( this, fn, until );
// 2.修正参数
		if ( !runtil.test( name ) ) {
			selector = until;
		}
// 3.过滤
		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}
// 4.排序和去重
		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;
// 5.倒序:parents()、prevUntil()、prevAll()
		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}
// 6.构造jQuery对象，并返回
// 调用方法.pushStach()用找到的元素数组ret构造新的jQuery对象并返回
		return this.pushStack( ret, name, slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
// n必须为元素节点，在某些浏览器中，会把文本节点当做元素节点的兄弟节点来处理
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});
```
