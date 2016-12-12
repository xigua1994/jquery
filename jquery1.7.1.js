//传入undefined确保undefined的值是undefined
(function(window,undefined){
//构造jQuery对象，通过将这些局部变量包裹在一个自调用匿名函数中，实现高内聚低耦合的设计思想
	var jQuery = (function(){
//该jQuery是构造函数，其与上面的jQuery等价，都指向jQuery构造函数。
		var jQuery = function(selector,context){
//在jQuery内部返回一个对象，就可以不用以new的方式创建JQ对象，同时返回的对象必须可以调用
//jQuery.prototype（即jQuery.fn）上的方法。jQuery对象根本就是init函数的实例对象
//如果不加new的话，只是调用了jQuery.fn.init方法，this指向的以及最后返回的都是同一个jQuery.fn对象
//$('body')和$('p')就没有区分了，加了new，就是每次用构造函数实例化了一个新对象，彼此都是不同的
			return new jQuery.fn.init(selector,context,rootjQuery);
		};
//jQuery初始化时，把可能存在的window.jQuery和window.$备份到局部变量_jQuery和_$
		_jQuery = window.jQuery,
		_$ = window.$,
		quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		trim = String.prototype.trim,
		indexOf = Array.prototype.indexOf,
//覆盖了构造函数jQuery()的原型对象，为了简写方便，所以写了
//在jQuery的原型上定义的属性和方法会被所有的jQuery对象教程，可以有效减少每个jQuery对象所需的内存
		jQuery.fn = jQuery.prototype = {
//定义一个构造函数时，其默认的prototype对象是一个Object类型的实例，如果将其原型设置为另外一个对象
//那么新对象自然不会具有原对象的constructor值
			constructor:jQuery,
//调用jQuery构造函数时，实际上返回的是jQuery.fn.init()的实例
			init:function(selector,context,rootjQuery){
				var match,elem,ret,doc;
//参数selector可以转换为false，例如undefined、空字符串、null等，则直接返回this
//this为空jQuery对象，其属性length为0.
				if ( !selector ) {
					return this;
				};
//如果selector有节点属性，则认为DOM元素
				if ( selector.nodeType ) {
					this.context = this[0] = selector;
					this.length = 1;
					return this;
				};
				if ( selector === "body" && !context && document.body ) {
					this.context = document;
					this[0] = document.body;
					this.selector = selector;
					this.length = 1;
					return this;
				}；
				if ( typeof selector === "string" ) {
//如果selector为html片段，并不意味着其实合法的html片段
					if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
						match = [ null, selector, null ];
					} else {
//用quickExpr检测selector是否是稍微复杂的HTML代码或#id
						match = quickExpr.exec( selector );
					}
//如果参数是单独标签，调用document.createElement()创建标签对应的DOM元素
//如果selector是HTML代码或者selector是#id并且没有传入参数context
					if ( match && (match[1] || !context) ) {
//出来selector是HTML代码的情况	
						if ( match[1] ) {
							context = context instanceof jQuery ? context[0] : context;
							doc = ( context ? context.ownerDocument || context : document );
							ret = rsingleTag.exec( selector );
//selector是单独标签							
							if ( ret ) {
//如果context是普通对象，调用jQuery.attr()，同时设置新创建的DOM元素的属性、事件。
								if ( jQuery.isPlainObject( context ) ) {
//方便调用jQuery.merge方法，该方法用于合并两个数组的元素到第一个数组
									selector = [ document.createElement( ret[1] ) ];
									jQuery.fn.attr.call( selector, context, true );
								} else {
									selector = [ doc.createElement( ret[1] ) ];
								}
							} else {
//如果为复杂的HTML代码，则用innerHTML机制创建DOM元素
								ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
//？存疑
								selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
							}
							return jQuery.merge( this, selector );
//如果selector是#id,并且没有传入参数context							
						} else {
							elem = document.getElementById( match[2] );
//在IE6和IE7和某些版本的Opera中，会按属性name查找，万恶的IE
							if ( elem && elem.parentNode ) {
								if ( elem.id !== match[2] ) {
									return rootjQuery.find( selector );
								}
								this.length = 1;
								this[0] = elem;
							}

							this.context = document;
							this.selector = selector;
							return this;
						}					
					} else if ( !context || context.jquery ) {
//如果指定了上下文，且为jQuery对象。则执行
						return ( context || rootjQuery ).find( selector );
					} else {
//如果指定了上下文，且不为jQuery，则先创建一个jquery对象，再从里面找。
						return this.constructor( context ).find( selector );
					}
				} else if ( jQuery.isFunction( selector ) ) {
					return rootjQuery.ready( selector );
				}
				if ( selector.selector !== undefined ) {
					this.selector = selector.selector;
					this.context = selector.context;
				}
				return jQuery.makeArray( selector, this );
			},
			selector: "",
			jquery: "1.7.1",
			length: 0,
			size: function() {
				return this.length;
			},
//将当前jQuery对象转换为真正的数组
//常用那个的arguments对象，document.links,document.forms等都是非常像数组的，但是没有slice，所以调原型的slice
			toArray: function() {
				return slice.call( this, 0 );
			},
			get: function( num ) {
				return num == null ?
					this.toArray() :
					( num < 0 ? this[ this.length + num ] : this[ num ] );
			},
//在执行jQuery构造函数之后会产生一个实例对象，里面放着匹配到的元素，使用PushStack在创建一个空的jQuery对象，然后把调用这个方法的
//对象匹配到的元素放到栈中，一个数组通过一个指针指向调用此方法的对象，这样就是一个链式栈可以不断进行扩展，可以让我们实现“向后”操作
//elems放入到jQuery对象的元素数组（或类数组对象),name产生元素数组elems的jQuery方法名。
//selector传给jQuery方法的参数，用于修正原型属性
			pushStack: function( elems, name, selector ) {
//构造一个新的空jQuery对象ret，this.constructor指向构造函数jQuery()；
				var ret = this.constructor();
				if ( jQuery.isArray( elems ) ) {
//不是调用push方法，如果直接调用push的话，其会变成二维数组，利用apply的数组参数属性。
//注意其实这个有缺陷，数组长度有限制
					push.apply( ret, elems );
				} else {
//将elems转换为数组
					jQuery.merge( ret, elems );
				}
//新对象中添加一个属性来指向当前的jQuery对象，因为链式的必须有指针。
				ret.prevObject = this;
				ret.context = this.context;
				if ( name === "find" ) {
					ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
				} else if ( name ) {
					ret.selector = this.selector + "." + name + "(" + selector + ")";
				}
				return ret;
			},
			each: function( callback, args ) {
				return jQuery.each( this, callback, args );
			},
			ready: function( fn ) {
				jQuery.bindReady();
				readyList.add( fn );
				return this;
			},

			eq: function( i ) {
//如果i是字符串，则通过在前面加上一个加号把参数转换为数组
				i = +i;
				return i === -1 ?
					this.slice( i ) :
					this.slice( i, i + 1 );
			},
			first: function() {
				return this.eq( 0 );
			},
			last: function() {
				return this.eq( -1 );
			},
//用数组方法slice()从当前jQuery对象获取指定范围的子集，再调用方法.pushStack()把子集转换为jQuery对象。
			slice: function() {
				return this.pushStack( slice.apply( this, arguments ),
					"slice", slice.call(arguments).join(",") );
			},
			map: function( callback ) {
				return this.pushStack( jQuery.map(this, function( elem, i ) {
					return callback.call( elem, i, elem );
				}));
			},
//结束当前链条中最近的筛选，并将匹配元素集合还原之前的状态
//举个例子var $p=$('p');var $p_span=$p.find('span');console.log($p_span.end()===$p);//true
			end: function() {
				return this.prevObject || this.constructor(null);
			},
			push: push,
			sort: [].sort,
			splice: [].splice
		};
//用jQuery构造函数的原型对象覆盖了jQuery.fn.init()的原型对象。将init的原型指向jQuery的原型，
//所以jQuery对象能够访问jQuery.fn上面的方法，不需要担心循环引用的性能问题
		jQuery.fn.init.prototype = jQuery.fn;
//jQuery.extend([deep],target,objectl,[,objectN])
//deep可选boolean，表示是否进行深度合并。如果第一个参数的属性本身是一个对象或数组，会被第二个
//或后面的其他参数的同名属性完全覆盖。如为true，则表示深度合并，合并过程是递归的。
//该两个函数用于合并两个或多个对象的属性到第一个对象
		jQuery.extend = jQuery.fn.extend = function(){
			var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,//表示期望源对象从第二个元素开始
			length = arguments.length,
			deep = false;
//如果第一个参数是布尔值，修正第一个参数为deep，修正第二个参数为target，并且期望第三个源对象从第三个元素开始
			if ( typeof target === "boolean" ) {
				deep = target;
				target = arguments[1] || {};
				i = 2;
			};
//变量源对象不是对象，函数，而是一个字符串或其他基本类型，则统一为空对象
			if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
				target = {};
			}
			if ( length === i ) {
				target = this;
				--i;
			};
			for ( ; i < length; i++ ) {
				if ( (options = arguments[ i ]) != null ) {
					for ( name in options ) {
						src = target[ name ];
						copy = options[ name ];
						if ( target === copy ) {
							continue;
						}
						if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && jQuery.isArray(src) ? src : [];
							} else {
								clone = src && jQuery.isPlainObject(src) ? src : {};
							}
							target[ name ] = jQuery.extend( deep, clone, copy );
						} else if ( copy !== undefined ) {
							target[ name ] = copy;
						}
					}
				}
			}
			return target;	
		};
//创建文档片段，转换HTML代码为dom元素，缓存转换后的DOM元素
		jQuery.buildFragment = function( args, nodes, scripts ) {
			var fragment, cacheable, cacheresults, doc,
			first = args[ 0 ];
			if ( nodes && nodes[0] ) {
//修正文档对象doc				
				doc = nodes[0].ownerDocument || nodes[0];
			}
//createDocumentFragment可以将一大批子元素添加到任何类似node的父节点上，高效率
			if ( !doc.createDocumentFragment ) {
				doc = document;
			}
			if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
				first.charAt(0) === "<" && !rnocache.test( first ) &&
				(jQuery.support.checkClone || !rchecked.test( first )) &&
				(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

				cacheable = true;

				cacheresults = jQuery.fragments[ first ];
//如果HTML代码符合缓存条件，则从缓存对象中读取缓存的DOM对象				
				if ( cacheresults && cacheresults !== 1 ) {
					fragment = cacheresults;
				}
			}

			if ( !fragment ) {
				fragment = doc.createDocumentFragment();
				jQuery.clean( args, doc, fragment, scripts );
			}

			if ( cacheable ) {
				jQuery.fragments[ first ] = cacheresults ? fragment : 1;
			}

			return { fragment: fragment, cacheable: cacheable };
		};

		jQuery.fragments = {};

		jQuery.extend({
//用于释放jQuery对全局变量$的控制权，可选的参数removeAll指向是否释放对全局变俩个jQuery的控制权
//如果deep为true，则表示同时让出变量$和jQuery的控制权详见http://www.365mini.com/page/jquery_noconflict.htm
			noConflict: function( deep ) {
//当前的jQuery库持有全局变量$的情况下，才会释放$控制权给前一个javascript库
				if ( window.$ === jQuery ) {
					window.$ = _$;
				}
//如果deep为true，当前的jQuery库持有全局变量jQuery的情况下，才会释放$控制权给前一个javascript库
				if ( deep && window.jQuery === jQuery ) {
					window.jQuery = _jQuery;
				}
				return jQuery;
			},
			isFunction: function( obj ) {
				return jQuery.type(obj) === "function";
			},
			isArray: Array.isArray || function( obj ) {
				return jQuery.type(obj) === "array";
			},
//用于判断传入的参数是否是window对象，通过检测是否存在特征属性setInterval来实现
			isWindow: function( obj ) {
				return obj && typeof obj === "object" && "setInterval" in obj;
			},
			isNumeric: function( obj ) {
//parseInt()和parseFloat()只转换第一个无效字符之前的字符串，如果字符串没有以一个有效的数字开头，则返回NaN;
//如果传入的参数是对象，则自动调用该对象的方法toString()，的到该对象的字符串表示，然后再执行解析过程
				return !isNaN( parseFloat(obj) ) && isFinite( obj );
			},
//先借用Object的toString()获取obj的字符串表示，返回值为[object class]，其中class是内部对象类，
//type这个点比较有意思，很容易被人忽略，建议看客在网上搜下这个
			type: function( obj ) {
				return obj == null ?
					String( obj ) :
					class2type[ toString.call(obj) ] || "object";
			},
//判断是否是用对象直接量{}或new Object()创建的对象
			isPlainObject: function( obj ) {
//type返回的不是[object Object],obj是DOM元素，obj是window对象，返回false，不满足，obj则为对象
				if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
					return false;
				}
				try {
//如果对象obj没有constructor属性，则对象通过对象字面量{}创建的
//注意如果使用Object.create(null)创建的对象e，其实质不是一个继承自Object的对象，它是一个完全的新对象，通过Object.create(Object)对象
//创建的才是一个继承自Object的对象 详见http://www.zhangyunling.com/?p=83
//下面判断条件：对象是否存在constructor属性，在obj的实例中，是否有constructor属性，在obj.constructor对象的原型链中，是否有isPrototype属性

					if ( obj.constructor &&
						!hasOwn.call(obj, "constructor") &&
						!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
						return false;
					}
				} catch ( e ) {
					return false;
				}
				var key;
//检查对象obj 属性是否都是非继承属性，如果没有属性，或者所有属性都是非继承属性。则返回true
//执行for-in属性时，JS会先枚举非继承属性，再枚举从原型对象继承的属性
				for ( key in obj ) {}
				return key === undefined || hasOwn.call( obj, key );
			},
//用于检测对象是否为空的（即不包含（非非继承属性和从原型对象继承的属性）属性）
			isEmptyObject: function( obj ) {
				for ( var name in obj ) {
					return false;
				}
				return true;
			},
			error: function( msg ) {
				throw new Error( msg );
			},
			parseJSON: function( data ) {
				if ( typeof data !== "string" || !data ) {
					return null;
				}
//移除开头和末尾的空白符，在IE6/7中，如果不移除则不能解析
				data = jQuery.trim( data );
				if ( window.JSON && window.JSON.parse ) {
					return window.JSON.parse( data );
				}
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();

				}
				jQuery.error( "Invalid JSON: " + data );
			},
			parseXML: function( data ) {
				var xml, tmp;
				try {
					if ( window.DOMParser ) {
						tmp = new DOMParser();
						xml = tmp.parseFromString( data , "text/xml" );
					} else { // IE
						xml = new ActiveXObject( "Microsoft.XMLDOM" );
						xml.async = "false";
						xml.loadXML( data );
					}
				} catch( e ) {
					xml = undefined;
				}
				if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
					jQuery.error( "Invalid XML: " + data );
				}
				return xml;
			},

			noop: function() {},
//用于在全局作用域中执行javascript代码，
			globalEval: function( data ) {
//在IE中可以调用execScript()让javascript代码在全局作用域中执行；在其他
//浏览器中需自调用一个匿名函数中调用eval()执行javascript，自调用匿名函数确保了执行环境是全局作用域。
				if ( data && rnotwhite.test( data ) ) {
					( window.execScript || function( data ) {
						window[ "eval" ].call( window, data );
					} )( data );
				}
			},
//用于CSS模块和数据缓存模块
			camelCase: function( string ) {
				return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
			},

			nodeName: function( elem, name ) {
//在检测时限查看elem.nodeName是否存在，可以有效避免参数elem不是DOM元素，或者elem没有属性nodeName
				return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
			},
			clean: function( elems, context, fragment, scripts ) {
				var checkScriptType;
				context = context || document;
				if ( typeof context.createElement === "undefined" ) {
					context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
				}
				var ret = [], j;
				for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
					if ( typeof elem === "number" ) {
						elem += "";
					}
					if ( !elem ) {
						continue;
					}
					if ( typeof elem === "string" ) {
						if ( !rhtml.test( elem ) ) {
							elem = context.createTextNode( elem );
						} else {
							elem = elem.replace(rxhtmlTag, "<$1></$2>");
							var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
								wrap = wrapMap[ tag ] || wrapMap._default,
								depth = wrap[0],
								div = context.createElement("div");
							if ( context === document ) {
								safeFragment.appendChild( div );
							} else {
								createSafeFragment( context ).appendChild( div );
							}
							div.innerHTML = wrap[1] + elem + wrap[2];
							while ( depth-- ) {
								div = div.lastChild;
							}
							if ( !jQuery.support.tbody ) {
								var hasBody = rtbody.test(elem),
									tbody = tag === "table" && !hasBody ?
										div.firstChild && div.firstChild.childNodes :
										wrap[1] === "<table>" && !hasBody ?
											div.childNodes :
											[];
								for ( j = tbody.length - 1; j >= 0 ; --j ) {
									if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
										tbody[ j ].parentNode.removeChild( tbody[ j ] );
									}
								}
							}
							if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
								div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
							}

							elem = div.childNodes;
						}
					}
					var len;
					if ( !jQuery.support.appendChecked ) {
						if ( elem[0] && typeof (len = elem.length) === "number" ) {
							for ( j = 0; j < len; j++ ) {
								findInputs( elem[j] );
							}
						} else {
							findInputs( elem );
						}
					}

					if ( elem.nodeType ) {
						ret.push( elem );
					} else {
						ret = jQuery.merge( ret, elem );
					}
				}

				if ( fragment ) {
					checkScriptType = function( elem ) {
						return !elem.type || rscriptType.test( elem.type );
					};
					for ( i = 0; ret[i]; i++ ) {
						if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
							scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

						} else {
							if ( ret[i].nodeType === 1 ) {
								var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

								ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
							}
							fragment.appendChild( ret[i] );
						}
					}
				}

				return ret;
			},
			each: function( object, callback, args ) {
				var name, i = 0,
					length = object.length,
					isObj = length === undefined || jQuery.isFunction( object );
				if ( args ) {
					if ( isObj ) {
						for ( name in object ) {
							if ( callback.apply( object[ name ], args ) === false ) {
								break;
							}
						}
					} else {
						for ( ; i < length; ) {
							if ( callback.apply( object[ i++ ], args ) === false ) {
								break;
							}
						}
					}
				} else {
					if ( isObj ) {
						for ( name in object ) {
							if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
								break;
							}
						}
					} else {
						for ( ; i < length; ) {
							if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
								break;
							}
						}
					}
				}
				return object;
			},
//如果不支持String.prototype.trim()，则调用toString()得到字符串，然后再调用方法replace()将正则trimLeft和trimRight匹配到
//的空白符替换为空字符串
			trim: trim ?
			function( text ) {
				return text == null ?
					"" :
					trim.call( text );
			} :
			function( text ) {
				return text == null ?
					"" :
					text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
			},
//类数组对象转换为真正对象
			makeArray: function( array, results ) {
				var ret = results || [];

				if ( array != null ) {
					var type = jQuery.type( array );
					if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
//如果用ret.push(array),ret不一定为数组
						push.call( ret, array );
					} else {
						jQuery.merge( ret, array );
					}
				}
				return ret;
			},
//在数组中查找特定的元素并返回下标，未找到则返回-1；
			inArray: function( elem, array, i ) {
				var len;
				if ( array ) {
					if ( indexOf ) {
						return indexOf.call( array, elem, i );
					}
					len = array.length;
					i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
					for ( ; i < len; i++ ) {
//先检测i in array，如果结果为false，说明数组array的下标是不连续的，也不需要与指定值elem比较,有疑问？？？？？？？？？
						if ( i in array && array[ i ] === elem ) {
							return i;
						}
					}
				}
				return -1;
			},
//用于合并两个数组的元素到第一个数组中，注意实参一中可以是类数组而可以是任何含有连续性属性的对象
			merge: function( first, second ) {
				var i = first.length,
					j = 0;
//second的属性length是数值类型，则将其当作数组处理，把其中的元素添加到参数first中
				if ( typeof second.length === "number" ) {
					for ( var l = second.length; j < l; j++ ) {
						first[ i++ ] = second[ j ];
					}
// 如果second没有length属性，或其不为数值类型，则将该参数当作是含有连续整型属性的对象
				} else {
// 将其中的非undefined元素逐个插入参数first中
					while ( second[j] !== undefined ) {
						first[ i++ ] = second[ j++ ];
					}
				}

				first.length = i;

				return first;
			},
//用于查找数组中满足过滤函数中的元素，原数组不会受影响
//如果inv未传入或为false，元素只有爱过滤函数返回true，或返回值可以转换为true，才会被保存在最终的结果数组中，
//如果为true，则返回一个不满足回调函数的元素数组
			grep: function( elems, callback, inv ) {
				var ret = [], retVal;
				inv = !!inv;

				for ( var i = 0, length = elems.length; i < length; i++ ) {
					retVal = !!callback( elems[ i ], i );
					if ( inv !== retVal ) {
						ret.push( elems[ i ] );
					}
				}

				return ret;
			},

			// arg is for internal usage only
			map: function( elems, callback, arg ) {
				var value, key, ret = [],
					i = 0,
					length = elems.length,
					// jquery objects are treated as arrays
					isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

				// Go through the array, translating each of the items to their
				if ( isArray ) {
					for ( ; i < length; i++ ) {
						value = callback( elems[ i ], i, arg );

						if ( value != null ) {
							ret[ ret.length ] = value;
						}
					}

				// Go through every key on the object,
				} else {
					for ( key in elems ) {
						value = callback( elems[ key ], key, arg );

						if ( value != null ) {
							ret[ ret.length ] = value;
						}
					}
				}

				// Flatten any nested arrays
				return ret.concat.apply( [], ret );
			},
//全局计数器
			guid: 1,
//某种原因，未能及时解析，？？？？？
			proxy: function( fn, context ) {
				if ( typeof context === "string" ) {
					var tmp = fn[ context ];
					context = fn;
					fn = tmp;
				}
// 指定name对应的函数的上下文始终未参数context
				if ( !jQuery.isFunction( fn ) ) {
					return undefined;
				}
				var args = slice.call( arguments, 2 ),
					proxy = function() {
						return fn.apply( context, args.concat( slice.call( arguments ) ) );
					};
				proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

				return proxy;
			},
//很多jquery的set/get方法都是调用了access方法
// exec布尔值，当属性值为函数时，该参数指示了是否执行函数，pass基本可以忽略
			access: function( elems, key, value, exec, fn, pass ) {
				var length = elems.length;
//如果key是对象，则表示设置多个属性，遍历之后返回元素集合elems
				if ( typeof key === "object" ) {
					for ( var k in key ) {
						jQuery.access( elems, k, key[k], exec, fn, value );
					}
					return elems;
				}
				if ( value !== undefined ) {
					exec = !pass && exec && jQuery.isFunction(value);
					for ( var i = 0; i < length; i++ ) {
						fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
					}
					return elems;
				}
				return length ? fn( elems[0], key ) : undefined;
			},

			now: function() {
				return ( new Date() ).getTime();
			},
//解析当前浏览器的类型和版本号
			uaMatch: function( ua ) {
				ua = ua.toLowerCase();

				var match = rwebkit.exec( ua ) ||
					ropera.exec( ua ) ||
					rmsie.exec( ua ) ||
					ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
					[];

				return { browser: match[1] || "", version: match[2] || "0" };
			},

			sub: function() {
				function jQuerySub( selector, context ) {
					return new jQuerySub.fn.init( selector, context );
				}
				jQuery.extend( true, jQuerySub, this );
				jQuerySub.superclass = this;
				jQuerySub.fn = jQuerySub.prototype = this();
				jQuerySub.fn.constructor = jQuerySub;
				jQuerySub.sub = this.sub;
				jQuerySub.fn.init = function init( selector, context ) {
					if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
						context = jQuerySub( context );
					}

					return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
				};
				jQuerySub.fn.init.prototype = jQuerySub.fn;
				var rootjQuerySub = jQuerySub(document);
				return jQuerySub;
			},

			browser: {}
			map: function( elems, callback, arg ) {
				var value, key, ret = [],
					i = 0,
					length = elems.length,
//这段比较难懂，如果elems为jQuery对象的话或者elem.length是数值型并且满足elems是一个类数组对象或length为0或elems是真正的数组的话，则isArray为true。
					isArray = elems instanceof jQuery 
					|| length !== undefined 
					&& typeof length === "number" && 
					( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;
				if ( isArray ) {
					for ( ; i < length; i++ ) {
						value = callback( elems[ i ], i, arg );
						if ( value != null ) {
							ret[ ret.length ] = value;
						}
					}
				} else {
					for ( key in elems ) {
						value = callback( elems[ key ], key, arg );
						if ( value != null ) {
							ret[ ret.length ] = value;
						}
					}
				}
				return ret.concat.apply( [], ret );
			},
			if ( rnotwhite.test( "\xA0" ) ) {
				trimLeft = /^[\s\xA0]+/;
				trimRight = /[\s\xA0]+$/;
			}
		})
//class2Type的遍历
		jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		});
		return jQuery;
	})();

var rclass = /[\n\t\r]/g,
//匹配任意空白符
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
//定义了需要修正的布尔型HTML属性
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;
jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},
//之所以用try catch和this[name]=undefined是因为IE6-8不允许删除DOM上的元素
	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},
	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;
//如果value是函数，则遍历匹配元素集合，在每个匹配元素上执行函数，并取其返回值作为待添加的类样式，然后迭代调用方法.addClass()
			if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}
		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );
			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = ( value || "" ).split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}
		return this;
	},
	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";
		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}
		return this.each(function() {
			if ( type === "string" ) {
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );
				while ( (className = classNames[ i++ ]) ) {
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					jQuery._data( this, "__className__", this.className );
				}
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},
//注意selector可以含有多个类样式，但不会拆分为数组而是作为整体检测，如果selector自带前空格或后空格，就不能正确的检测
	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}
		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];
//如果没有传入参数，则返回获取的第一个DON元素的value值
		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];
				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}
//否则直接读取DOM属性的value，对属性值简单处理后返回。如果属性值是字符串，则删除可能有的回车符，然后返回；
//如果属性值是null或者undefined，则返回空字符串；如果属性值是数值型，则直接返回。rreturn用于匹配回车符
				ret = elem.value;
				return typeof ret === "string" ?
					ret.replace(rreturn, "") :
					ret == null ? "" : ret;
			}
			return;
		}
		isFunction = jQuery.isFunction( value );
		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}
			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});
//值修正对象集jQuery.valHooks存放了需要修正或扩展的节点名称或节点类型和对应的修正对象，修正对象含有方法get或set，
//分别用于修正DOM属性value的读取和设置方式。需要修正或扩张的节点名称或节点类型有：option,select,button,radio,checkbox
jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";
				if ( index < 0 ) {
					return null;
				}
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {
						value = jQuery( option ).val();
						if ( one ) {
							return value;
						}
						values.push( value );
					}
				}
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}
				return values;
			},
			set: function( elem, value ) {
				var values = jQuery.makeArray( value );
				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});
				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},
	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},
//参数pass,如果HTML属性与jquery方法同名，是否调用同名jquery方法。如果该参数是true则调用，如果是false则不调用
	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;
//忽略文本节点（nodetype为3）、注释为8，属性节点2
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}
//如果HTML属性名与jquery方法同名，则调用同名的jquery方法
		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}
//如果不支持getAttribute()方法，则读取对应的DOM属性
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}
		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}
		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;
			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}
		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;
		} else {
			ret = elem.getAttribute( name );
			return ret === null ?
				undefined :
				ret;
		}
	},
	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;
		if ( value && elem.nodeType === 1 ) {
//rspace匹配任意空白符
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;
			for ( ; i < l; i++ ) {
				name = attrNames[ i ];
				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					jQuery.attr( elem, name, "" );
					elem.removeAttribute( getSetAttribute ? name : propName );
					if ( rboolean.test( name ) && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;
//忽略文本，注释，属性节点，不在其上读取或设置DOM属性
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}
		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );
//转换DOM属性为驼峰式，获取对应的修正对象
		if ( notxml ) {
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
//优先调用修正对象的修正方法set()。如果存在对应的修正对象，并且修正对象有修正方法set()则调用该方法
//设置DOM属性；如果返回值不是undefined，则认为设置成功
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;
//否则直接在DOM元素上设置DOM属性，并返回属性值。
			} else {
				return ( elem[ name ] = value );
			}
//如果未传入参数，则读取DOM属性
		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;
			} else {
				return elem[ name ];
			}
		}
	},
//里面存放了需要修正的DOM属性和对应的修正对象，每个修正对象均含有修正方法get(elem,name)或set(elem,value,name)
//分别用于修正特殊的DOM属性的读取和设置方式
	propHooks: {
		tabIndex: {
			get: function( elem ) {
				var attributeNode = elem.getAttributeNode("tabindex");
				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;
//如果某个HTML属性对应的DOM属性为boolean值，则称为布尔型HTML属性，其属性值是小写的属性名
boolHook = {
//借助对应的DOM属性值返回最新的HTML属性值，用于修正布尔型HTML属性的读取和设置方式
//关于布尔值HTML属性详情可看http://www.tuicool.com/articles/ZNv6Vvb
	get: function( elem, name ) {
		var attrNode,
			property = jQuery.prop( elem, name );
//如果对应的DOM属性值是true，或HTML属性值不是false，则返回小写的属性名，否则返回undefined
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},

	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			jQuery.removeAttr( elem, name );
		} else {
//取出HTML属性名对应的DOM属性名，如果该DOM属性名在DOM属性名在DOM元素上已经存在，则设置为true
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				elem[ propName ] = true;
			}
			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};
//在属性操作模块初始化时，如果测试项jQuery.support.getSetAttribute为false，则创建通过HTML属性修正对象nodeHook
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true
	};
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );
		}
	};
	jQuery.attrHooks.tabindex.set = nodeHook.set;
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
};
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}
//为IE而设，目前最低兼容IE8，所以忽略不计
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.event = {
//用于为DOM元素绑定一个或多个类型的事件监听函数。
//其执行的步骤如下：
//取出或初始化事件缓存对象events，取出或初始化主监听函数
//转换参数types为数组
//遍历事件类型数组，逐个绑定事件：
//handler待绑定的事件监听函数。当对应类型的事件被触发时，该事件监听函数将被执行。
	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;
//过滤文本节点、注释节点、不支持附带扩展属性的DOM以及参数不完整的情况
//!(elemData = jQuery._data( elem ))实现的功能：（可能）初始化关联的事件对象；获取关联的事件对象，判断当前元素是否支持扩展附加属性
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}
//为监听函数分配一个唯一标示guid.在移除监听函数时，将通过这个唯一标示来匹配监听函数
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}
//缓存对象events用于存放当前元素关联的所有监听函数
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			eventHandle.elem = elem;
		}
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ )
			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			special = jQuery.event.special[ type ] || {};
//如果传入了selector，则绑定的是代理事件，可能需要把当前类型修正为可冒泡的事件类型
//如果未传入，则为普通的事件绑定，也需要修正为支持度更好的事件类型
			type = ( selector ? special.delegateType : special.bindType ) || type;
//此时事件类型可能已经被改变，所以需要再次尝试获取对应的修正对象，如果未取到，则默认为一个空对象			
			special = jQuery.event.special[ type ] || {};
//将监听函数封装为监听对象，并附带一些增强属性，用于支持事件模拟、自定义事件类型、事件移除、事件触发、事件代理、事件命名空间等功能
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );
//如果是第一次绑定该类型的事件，则初始化监听对象数组，并绑定主监听函数
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;
//如果第一次绑定给类型的事件，则绑定主监听函数。绑定时优先调用修正对象的修正方法setup()；如果修正对象没有修正方法
//setup()，或者修正方法setup()返回false，则调用原生方法addEventListener(type,listener,useCapture)或attachEvent(ontype,listener)
//绑定主监听函数。
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
//IE9+和其他浏览器中
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}
			if ( special.add ) {
				special.add.call( elem, handleObj );
				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}
//将监听函数handleObj插入到监听对象数组handlers中，如果传入了selector，则绑定的是代理事件，把
//代理监听对象插入属性handlers.delegateCount所指定的位置，如果未传入，则是普通的事件绑定，把监听对象插入到末尾。
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}
			jQuery.event.global[ type ] = true;
		}
		elem = null;
	},
	global: {},
//用于移除DOM元素上绑定的一个或多个类型的事件监听函数。
//当移除事件时，方法调用链为：.unbind/delegate/die()----.off()----jQuery.event.remove()-----jQuery._data/removeEventListener/detachEvent().
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];
//没有指定事件类型，则移除当前元素上绑定的所有事件；如果没有指定事件类型，但指定了命名空间，则移除命名空间下的所有事件
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}
//尝试从事件修正对象集jQuery.event.special中获取当前事件类型对应的修正对象
			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
// 遍历监听对象数组，如果满足条件，则使用splice将其移除
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},
	trigger: function( event, data, elem, onlyHandlers ) {
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			return;
		}
		event = typeof event === "object" ?
			event[ jQuery.expando ] ? event :
			new jQuery.Event( type, event ) :
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";
		if ( !elem ) {
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}
		eventPath = [[ elem, special.bindType || type ]];

		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			old = null;
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},
// 执行步骤
// 构造jQuery事件对象
// 提取后代元素匹配的代理监听兑现数组和代理元素上绑定的普通监听对象数组
// 执行后代元素匹配的代理监听兑现数组和代理元素上绑定的普通监听对象数组
// 返回最后一个有返回值的监听函数的返回值
	dispatch: function( event ) {
// 调用方法将原生事件对象封装为jQuery事件对象
		event = jQuery.event.fix( event || window.event );
		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments, 0 ),
			run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;
		args[0] = event;
		event.delegateTarget = this;
// 如果为当前元素绑定了代理事件，则提取后代元素匹配的代理监听对象数组
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) {

			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this;
// 遍历从触发事件的元素到代理元素这条路径上的所有后代元素，变量cur指向代理元素的某个后代元素
			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
// 为每个后代元素遍历代理元素的代理监听对象数组，吧后代元素匹配的代理监听对象存储到数组matches中
				for ( i = 0; i < delegateCount; i++ ) {
					handleObj = handlers[ i ];
					sel = handleObj.selector;
					if ( selMatch[ sel ] === undefined ) {
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
						);
					}
					if ( selMatch[ sel ] ) {
						matches.push( handleObj );
					}
				}
// 如果后代元素有匹配的代理监听对象，则以的格式存入待执行队列中
				if ( matches.length ) {
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}
// 如果监听对象数组的长度大于代理监听对象的，则表示当前元素绑定了普通事件
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}
// 执行后代元素匹配的代理监听兑现数组和代理元素上绑定的普通监听对象数组
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;
			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {
					event.data = handleObj.data;
					event.handleObj = handleObj;
					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );
					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}
		return event.result;
	},
//
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}
			return event;
		}
	},
//修正鼠标事件的专属属性
	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},
//定义方法jQuery.event.fix(event)，其中参数event可以是原生事件对象或jQuery对象
	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
//调用构造函数jQuery.Event(src,props)把原生对象封装为jQuery时间对象，调用时省略了new操作符
		event = jQuery.Event( originalEvent );
		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}
//在IE9以下的浏览器中，当load事件触发时，事件属性srcElment和target都为null，所以将事件属性target同意修正为document对象
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}
//如果是文本节点的话，在safari中，应当将其修正为它的父元素
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}
//调用事件属性对象的修正方法fixHook.filter修正特殊的事件属性，
		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		ready: {
			setup: jQuery.bindReady
		},
load事件本身是不冒泡的，当时当调用方法jquery.event.trigger()手动触发load事件时，该方法会构造一条从当前元素到window对象的冒泡路径
然后触发这条路径上元素的主监听函数和行内监听函数，以此来模拟冒泡过程，但是这也导致window对象上的load和行内监听函数onload()会被再次书法
		load: {
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;
	} else {
		this.type = src;
	}
	if ( props ) {
		jQuery.extend( this, props );
	}
	this.timeStamp = src && src.timeStamp || jQuery.now();
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}
//
jQuery.Event.prototype = {
//阻止当前时间的默认行为，
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
//如果原生事件对象是否有方法preventDefault()，如果有，则调用
		if ( e.preventDefault ) {
			e.preventDefault();
//如果没有则
		} else {
			e.returnValue = false;
		}
	},
//阻止任何祖先元素收到这个事件传播
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});
// IE9以下，submit不支持冒泡，为了支持代理submit事件，jQuery事件系统修正对象jQuery.special.submit模拟实现了submit事件
// 的监听和冒泡过程，模拟过程统一在命名空间.submit下进行
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
// 如果当前元素是form元素，则执行普通的事件绑定流程			
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}
// 如果修正方法setup返回false，则继续调用原生发绑定主监听函数
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !form._submit_attached ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true );
						}
					});
					form._submit_attached = true;
				}
			});
		},

		teardown: function() {
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}
			jQuery.event.remove( this, "._submit" );
		}
	};
}
if ( !jQuery.support.changeBubbles ) {
	jQuery.event.special.change = {
		setup: function() {
			if ( rformElems.test( this.nodeName ) ) {
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({
//用于为匹配元素集合中的每个元素绑定一个或多个类型的事件监听函数。
//绑定事件时，方法调用链为:.one/bind/delegate/live/事件便捷方法()-----.on()----jQuery.event.add()---
//addEventListener/attachEvent/jQuery._data()
	on: function( types, selector, data, fn,one ) {
		var origFn, type;
		if ( typeof types === "object" ) {
			if ( typeof selector !== "string" ) {
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				fn = data;
				data = undefined;
			} else {
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on.call( this, types, selector, data, fn, 1 );
	},
//types:一个或多个空格分隔的事件类型和可选的命名空间，或仅仅是命名空间，比如"click", "keydown.myPlugin", 或者 ".myPlugin"。
	off: function( types, selector, fn ) {
//如果types的属性types.preventDefault存在，说明该参数是一个事件对象；如果属性types.handleObj存在，说明该参数是一个被方法
//jQuery.event.dispatch(event)分发的jQuery事件对象，即参数types代表的事件正在被触发，并且其中包含了当前事件相关的所有属性
		if ( types && types.preventDefault && types.handleObj ) {
			var handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
//如果参数events是对象，即参数格式是.off(type-object[,selector])，则遍历参数events，递归调用方法.off(events[,selector][,handler(eventObject)])
//移除用于一次移除多个事件类型和多个监听函数
		if ( typeof types === "object" ) {
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},
// 用于执行每个匹配元素上绑定的监听函数和默认性为，并模拟冒泡过程，调用底层方法jQuery.event.trigger来实现
	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
// 执行第一个匹配元素上绑定的监听函数，并模拟冒泡过程，但不触发默认行为，调用底层方法jQuery.event.trigger来实现
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );
				event.preventDefault();
				return args[ lastToggle ].apply( this, arguments ) || false;
			};
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
(function(){
		var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
			expando = "sizcache" + (Math.random() + '').replace('.', ''),
			done = 0,
			toString = Object.prototype.toString,
			hasDuplicate = false,
			baseHasDuplicate = true,
			rBackslash = /\\/g,
			rReturn = /\r\n/g,
			rNonWord = /\W/;
		[0, 0].sort(function() {
			baseHasDuplicate = false;
			return 0;
		});
//selector css选择器表达式
	var Sizzle = function( selector, context, results, seed ) {
		results = results || [];
		context = context || document;
		var origContext = context;
		if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
			return [];
		}
		if ( !selector || typeof selector !== "string" ) {
			return results;
		}
//从右向左的查找方式中，是最后一个块表达式匹配的元素集合，其他块表达式和块间关系符则会从候选集set进行过滤
//从左向右的查找是，是下一个块表达式的上下文
		var m, set, checkSet, extra, ret, cur, pop, i,
			prune = true,
			contextXML = Sizzle.isXML( context ),
			parts = [],
			soFar = selector;
		do {
			chunker.exec( "" );
			m = chunker.exec( soFar );

			if ( m ) {
				soFar = m[3];
			
				parts.push( m[1] );
			
				if ( m[2] ) {
					extra = m[3];
					break;
				}
			}
		} while ( m );
//如果存在块间关系符合位置伪类，例如$('div button:first')，则从左向右查找
		if ( parts.length > 1 && origPOS.exec( selector ) ) {
//如果数组parts有两个元素，并且第一个是块间关系符
			if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
				set = posProcess( parts[0] + parts[1], context, seed );
//否则从左向右对数组中的其他块表达式逐个进行查找
			} else {
				set = Expr.relative[ parts[0] ] ?
					[ context ] :
					Sizzle( parts.shift(), context );

				while ( parts.length ) {
					selector = parts.shift();

					if ( Expr.relative[ selector ] ) {
						selector += parts.shift();
					}
					
					set = posProcess( selector, set, seed );
				}
			}
		} else {
			if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
					Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

				ret = Sizzle.find( parts.shift(), context, contextXML );
				context = ret.expr ?
					Sizzle.filter( ret.expr, ret.set )[0] :
					ret.set[0];
			}

			if ( context ) {
				ret = seed ?
					{ expr: parts.pop(), set: makeArray(seed) } :
					Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

				set = ret.expr ?
					Sizzle.filter( ret.expr, ret.set ) :
					ret.set;

				if ( parts.length > 0 ) {
					checkSet = makeArray( set );

				} else {
					prune = false;
				}

				while ( parts.length ) {
					cur = parts.pop();
					pop = cur;

					if ( !Expr.relative[ cur ] ) {
						cur = "";
					} else {
						pop = parts.pop();
					}

					if ( pop == null ) {
						pop = context;
					}

					Expr.relative[ cur ]( checkSet, pop, contextXML );
				}

			} else {
				checkSet = parts = [];
			}
		}

		if ( !checkSet ) {
			checkSet = set;
		}

		if ( !checkSet ) {
			Sizzle.error( cur || selector );
		}

		if ( toString.call(checkSet) === "[object Array]" ) {
			if ( !prune ) {
				results.push.apply( results, checkSet );

			} else if ( context && context.nodeType === 1 ) {
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
						results.push( set[i] );
					}
				}

			} else {
				for ( i = 0; checkSet[i] != null; i++ ) {
					if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
						results.push( set[i] );
					}
				}
			}

		} else {
			makeArray( checkSet, results );
		}

		if ( extra ) {
			Sizzle( extra, origContext, results, seed );
			Sizzle.uniqueSort( results );
		}

		return results;
	};

	Sizzle.uniqueSort = function( results ) {
		if ( sortOrder ) {
			hasDuplicate = baseHasDuplicate;
			results.sort( sortOrder );

			if ( hasDuplicate ) {
				for ( var i = 1; i < results.length; i++ ) {
					if ( results[i] === results[ i - 1 ] ) {
						results.splice( i--, 1 );
					}
				}
			}
		}

		return results;
	};

	Sizzle.matches = function( expr, set ) {
		return Sizzle( expr, null, null, set );
	};

	Sizzle.matchesSelector = function( node, expr ) {
		return Sizzle( expr, null, null, [node] ).length > 0;
	};

	Sizzle.find = function( expr, context, isXML ) {
		var set, i, len, match, type, left;

		if ( !expr ) {
			return [];
		}

		for ( i = 0, len = Expr.order.length; i < len; i++ ) {
			type = Expr.order[i];
			
			if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
				left = match[1];
				match.splice( 1, 1 );

				if ( left.substr( left.length - 1 ) !== "\\" ) {
					match[1] = (match[1] || "").replace( rBackslash, "" );
					set = Expr.find[ type ]( match, context, isXML );

					if ( set != null ) {
						expr = expr.replace( Expr.match[ type ], "" );
						break;
					}
				}
			}
		}

		if ( !set ) {
			set = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( "*" ) :
				[];
		}

		return { set: set, expr: expr };
	};

	Sizzle.filter = function( expr, set, inplace, not ) {
		var match, anyFound,
			type, found, item, filter, left,
			i, pass,
			old = expr,
			result = [],
			curLoop = set,
			isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

		while ( expr && set.length ) {
			for ( type in Expr.filter ) {
				if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
					filter = Expr.filter[ type ];
					left = match[1];

					anyFound = false;

					match.splice(1,1);

					if ( left.substr( left.length - 1 ) === "\\" ) {
						continue;
					}

					if ( curLoop === result ) {
						result = [];
					}

					if ( Expr.preFilter[ type ] ) {
						match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

						if ( !match ) {
							anyFound = found = true;

						} else if ( match === true ) {
							continue;
						}
					}

					if ( match ) {
						for ( i = 0; (item = curLoop[i]) != null; i++ ) {
							if ( item ) {
								found = filter( item, match, i, curLoop );
								pass = not ^ found;

								if ( inplace && found != null ) {
									if ( pass ) {
										anyFound = true;

									} else {
										curLoop[i] = false;
									}

								} else if ( pass ) {
									result.push( item );
									anyFound = true;
								}
							}
						}
					}

					if ( found !== undefined ) {
						if ( !inplace ) {
							curLoop = result;
						}

						expr = expr.replace( Expr.match[ type ], "" );

						if ( !anyFound ) {
							return [];
						}

						break;
					}
				}
			}

			// Improper expression
			if ( expr === old ) {
				if ( anyFound == null ) {
					Sizzle.error( expr );

				} else {
					break;
				}
			}

			old = expr;
		}

		return curLoop;
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Utility function for retreiving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	var getText = Sizzle.getText = function( elem ) {
	    var i, node,
			nodeType = elem.nodeType,
			ret = "";

		if ( nodeType ) {
			if ( nodeType === 1 || nodeType === 9 ) {
				// Use textContent || innerText for elements
				if ( typeof elem.textContent === 'string' ) {
					return elem.textContent;
				} else if ( typeof elem.innerText === 'string' ) {
					// Replace IE's carriage returns
					return elem.innerText.replace( rReturn, '' );
				} else {
					// Traverse it's children
					for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
						ret += getText( elem );
					}
				}
			} else if ( nodeType === 3 || nodeType === 4 ) {
				return elem.nodeValue;
			}
		} else {

			// If no nodeType, this is expected to be an array
			for ( i = 0; (node = elem[i]); i++ ) {
				// Do not traverse comment nodes
				if ( node.nodeType !== 8 ) {
					ret += getText( node );
				}
			}
		}
		return ret;
	};

	var Expr = Sizzle.selectors = {
		order: [ "ID", "NAME", "TAG" ],

		match: {
			ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
			NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
			ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
			TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
			CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
			POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
			PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
		},

		leftMatch: {},

		attrMap: {
			"class": "className",
			"for": "htmlFor"
		},

		attrHandle: {
			href: function( elem ) {
				return elem.getAttribute( "href" );
			},
			type: function( elem ) {
				return elem.getAttribute( "type" );
			}
		},

		relative: {
			"+": function(checkSet, part){
				var isPartStr = typeof part === "string",
					isTag = isPartStr && !rNonWord.test( part ),
					isPartStrNotTag = isPartStr && !isTag;

				if ( isTag ) {
					part = part.toLowerCase();
				}

				for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
					if ( (elem = checkSet[i]) ) {
						while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

						checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
							elem || false :
							elem === part;
					}
				}

				if ( isPartStrNotTag ) {
					Sizzle.filter( part, checkSet, true );
				}
			},

			">": function( checkSet, part ) {
				var elem,
					isPartStr = typeof part === "string",
					i = 0,
					l = checkSet.length;

				if ( isPartStr && !rNonWord.test( part ) ) {
					part = part.toLowerCase();

					for ( ; i < l; i++ ) {
						elem = checkSet[i];

						if ( elem ) {
							var parent = elem.parentNode;
							checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
						}
					}

				} else {
					for ( ; i < l; i++ ) {
						elem = checkSet[i];

						if ( elem ) {
							checkSet[i] = isPartStr ?
								elem.parentNode :
								elem.parentNode === part;
						}
					}

					if ( isPartStr ) {
						Sizzle.filter( part, checkSet, true );
					}
				}
			},

			"": function(checkSet, part, isXML){
				var nodeCheck,
					doneName = done++,
					checkFn = dirCheck;

				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}

				checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
			},

			"~": function( checkSet, part, isXML ) {
				var nodeCheck,
					doneName = done++,
					checkFn = dirCheck;

				if ( typeof part === "string" && !rNonWord.test( part ) ) {
					part = part.toLowerCase();
					nodeCheck = part;
					checkFn = dirNodeCheck;
				}

				checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
			}
		},

		find: {
			ID: function( match, context, isXML ) {
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			},

			NAME: function( match, context ) {
				if ( typeof context.getElementsByName !== "undefined" ) {
					var ret = [],
						results = context.getElementsByName( match[1] );

					for ( var i = 0, l = results.length; i < l; i++ ) {
						if ( results[i].getAttribute("name") === match[1] ) {
							ret.push( results[i] );
						}
					}

					return ret.length === 0 ? null : ret;
				}
			},

			TAG: function( match, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( match[1] );
				}
			}
		},
		preFilter: {
			CLASS: function( match, curLoop, inplace, result, not, isXML ) {
				match = " " + match[1].replace( rBackslash, "" ) + " ";

				if ( isXML ) {
					return match;
				}

				for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
					if ( elem ) {
						if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
							if ( !inplace ) {
								result.push( elem );
							}

						} else if ( inplace ) {
							curLoop[i] = false;
						}
					}
				}

				return false;
			},

			ID: function( match ) {
				return match[1].replace( rBackslash, "" );
			},

			TAG: function( match, curLoop ) {
				return match[1].replace( rBackslash, "" ).toLowerCase();
			},

			CHILD: function( match ) {
				if ( match[1] === "nth" ) {
					if ( !match[2] ) {
						Sizzle.error( match[0] );
					}

					match[2] = match[2].replace(/^\+|\s*/g, '');

					// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
					var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
						match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
						!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

					// calculate the numbers (first)n+(last) including if they are negative
					match[2] = (test[1] + (test[2] || 1)) - 0;
					match[3] = test[3] - 0;
				}
				else if ( match[2] ) {
					Sizzle.error( match[0] );
				}

				// TODO: Move to normal caching system
				match[0] = done++;

				return match;
			},

			ATTR: function( match, curLoop, inplace, result, not, isXML ) {
				var name = match[1] = match[1].replace( rBackslash, "" );
				
				if ( !isXML && Expr.attrMap[name] ) {
					match[1] = Expr.attrMap[name];
				}

				// Handle if an un-quoted value was used
				match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

				if ( match[2] === "~=" ) {
					match[4] = " " + match[4] + " ";
				}

				return match;
			},

			PSEUDO: function( match, curLoop, inplace, result, not ) {
				if ( match[1] === "not" ) {
					// If we're dealing with a complex expression, or a simple one
					if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
						match[3] = Sizzle(match[3], null, null, curLoop);

					} else {
						var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

						if ( !inplace ) {
							result.push.apply( result, ret );
						}

						return false;
					}

				} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
					return true;
				}
				
				return match;
			},

			POS: function( match ) {
				match.unshift( true );

				return match;
			}
		},
		
		filters: {
			enabled: function( elem ) {
				return elem.disabled === false && elem.type !== "hidden";
			},

			disabled: function( elem ) {
				return elem.disabled === true;
			},

			checked: function( elem ) {
				return elem.checked === true;
			},
			
			selected: function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
				
				return elem.selected === true;
			},

			parent: function( elem ) {
				return !!elem.firstChild;
			},

			empty: function( elem ) {
				return !elem.firstChild;
			},

			has: function( elem, i, match ) {
				return !!Sizzle( match[3], elem ).length;
			},

			header: function( elem ) {
				return (/h\d/i).test( elem.nodeName );
			},

			text: function( elem ) {
				var attr = elem.getAttribute( "type" ), type = elem.type;
				// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
				// use getAttribute instead to test this case
				return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
			},

			radio: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
			},

			checkbox: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
			},

			file: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
			},

			password: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
			},

			submit: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "submit" === elem.type;
			},

			image: function( elem ) {
				return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
			},

			reset: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && "reset" === elem.type;
			},

			button: function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && "button" === elem.type || name === "button";
			},

			input: function( elem ) {
				return (/input|select|textarea|button/i).test( elem.nodeName );
			},

			focus: function( elem ) {
				return elem === elem.ownerDocument.activeElement;
			}
		},
		setFilters: {
			first: function( elem, i ) {
				return i === 0;
			},

			last: function( elem, i, match, array ) {
				return i === array.length - 1;
			},

			even: function( elem, i ) {
				return i % 2 === 0;
			},

			odd: function( elem, i ) {
				return i % 2 === 1;
			},

			lt: function( elem, i, match ) {
				return i < match[3] - 0;
			},

			gt: function( elem, i, match ) {
				return i > match[3] - 0;
			},

			nth: function( elem, i, match ) {
				return match[3] - 0 === i;
			},

			eq: function( elem, i, match ) {
				return match[3] - 0 === i;
			}
		},
		filter: {
			PSEUDO: function( elem, match, i, array ) {
				var name = match[1],
					filter = Expr.filters[ name ];

				if ( filter ) {
					return filter( elem, i, match, array );

				} else if ( name === "contains" ) {
					return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

				} else if ( name === "not" ) {
					var not = match[3];

					for ( var j = 0, l = not.length; j < l; j++ ) {
						if ( not[j] === elem ) {
							return false;
						}
					}

					return true;

				} else {
					Sizzle.error( name );
				}
			},

			CHILD: function( elem, match ) {
				var first, last,
					doneName, parent, cache,
					count, diff,
					type = match[1],
					node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) )	 {
							if ( node.nodeType === 1 ) { 
								return false; 
							}
						}

						if ( type === "first" ) { 
							return true; 
						}

						node = elem;

					case "last":
						while ( (node = node.nextSibling) )	 {
							if ( node.nodeType === 1 ) { 
								return false; 
							}
						}

						return true;

					case "nth":
						first = match[2];
						last = match[3];

						if ( first === 1 && last === 0 ) {
							return true;
						}
						
						doneName = match[0];
						parent = elem.parentNode;
		
						if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
							count = 0;
							
							for ( node = parent.firstChild; node; node = node.nextSibling ) {
								if ( node.nodeType === 1 ) {
									node.nodeIndex = ++count;
								}
							} 

							parent[ expando ] = doneName;
						}
						
						diff = elem.nodeIndex - last;

						if ( first === 0 ) {
							return diff === 0;

						} else {
							return ( diff % first === 0 && diff / first >= 0 );
						}
				}
			},

			ID: function( elem, match ) {
				return elem.nodeType === 1 && elem.getAttribute("id") === match;
			},

			TAG: function( elem, match ) {
				return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
			},
			
			CLASS: function( elem, match ) {
				return (" " + (elem.className || elem.getAttribute("class")) + " ")
					.indexOf( match ) > -1;
			},

			ATTR: function( elem, match ) {
				var name = match[1],
					result = Sizzle.attr ?
						Sizzle.attr( elem, name ) :
						Expr.attrHandle[ name ] ?
						Expr.attrHandle[ name ]( elem ) :
						elem[ name ] != null ?
							elem[ name ] :
							elem.getAttribute( name ),
					value = result + "",
					type = match[2],
					check = match[4];

				return result == null ?
					type === "!=" :
					!type && Sizzle.attr ?
					result != null :
					type === "=" ?
					value === check :
					type === "*=" ?
					value.indexOf(check) >= 0 :
					type === "~=" ?
					(" " + value + " ").indexOf(check) >= 0 :
					!check ?
					value && result !== false :
					type === "!=" ?
					value !== check :
					type === "^=" ?
					value.indexOf(check) === 0 :
					type === "$=" ?
					value.substr(value.length - check.length) === check :
					type === "|=" ?
					value === check || value.substr(0, check.length + 1) === check + "-" :
					false;
			},

			POS: function( elem, match, i, array ) {
				var name = match[2],
					filter = Expr.setFilters[ name ];

				if ( filter ) {
					return filter( elem, i, match, array );
				}
			}
		}
	};

	var origPOS = Expr.match.POS,
		fescape = function(all, num){
			return "\\" + (num - 0 + 1);
		};

	for ( var type in Expr.match ) {
		Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
		Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
	}

	var makeArray = function( array, results ) {
		array = Array.prototype.slice.call( array, 0 );

		if ( results ) {
			results.push.apply( results, array );
			return results;
		}
		
		return array;
	};

	// Perform a simple check to determine if the browser is capable of
	// converting a NodeList to an array using builtin methods.
	// Also verifies that the returned array holds DOM nodes
	// (which is not the case in the Blackberry browser)
	try {
		Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

	// Provide a fallback method if it does not work
	} catch( e ) {
		makeArray = function( array, results ) {
			var i = 0,
				ret = results || [];

			if ( toString.call(array) === "[object Array]" ) {
				Array.prototype.push.apply( ret, array );

			} else {
				if ( typeof array.length === "number" ) {
					for ( var l = array.length; i < l; i++ ) {
						ret.push( array[i] );
					}

				} else {
					for ( ; array[i]; i++ ) {
						ret.push( array[i] );
					}
				}
			}

			return ret;
		};
	}

	var sortOrder, siblingCheck;

	if ( document.documentElement.compareDocumentPosition ) {
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
				return a.compareDocumentPosition ? -1 : 1;
			}

			return a.compareDocumentPosition(b) & 4 ? -1 : 1;
		};

	} else {
		sortOrder = function( a, b ) {
			// The nodes are identical, we can exit early
			if ( a === b ) {
				hasDuplicate = true;
				return 0;

			// Fallback to using sourceIndex (in IE) if it's available on both nodes
			} else if ( a.sourceIndex && b.sourceIndex ) {
				return a.sourceIndex - b.sourceIndex;
			}

			var al, bl,
				ap = [],
				bp = [],
				aup = a.parentNode,
				bup = b.parentNode,
				cur = aup;

			// If the nodes are siblings (or identical) we can do a quick check
			if ( aup === bup ) {
				return siblingCheck( a, b );

			// If no parents were found then the nodes are disconnected
			} else if ( !aup ) {
				return -1;

			} else if ( !bup ) {
				return 1;
			}

			// Otherwise they're somewhere else in the tree so we need
			// to build up a full list of the parentNodes for comparison
			while ( cur ) {
				ap.unshift( cur );
				cur = cur.parentNode;
			}

			cur = bup;

			while ( cur ) {
				bp.unshift( cur );
				cur = cur.parentNode;
			}

			al = ap.length;
			bl = bp.length;

			// Start walking down the tree looking for a discrepancy
			for ( var i = 0; i < al && i < bl; i++ ) {
				if ( ap[i] !== bp[i] ) {
					return siblingCheck( ap[i], bp[i] );
				}
			}

			// We ended someplace up the tree so do a sibling check
			return i === al ?
				siblingCheck( a, bp[i], -1 ) :
				siblingCheck( ap[i], b, 1 );
		};

		siblingCheck = function( a, b, ret ) {
			if ( a === b ) {
				return ret;
			}

			var cur = a.nextSibling;

			while ( cur ) {
				if ( cur === b ) {
					return -1;
				}

				cur = cur.nextSibling;
			}

			return 1;
		};
	}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
	(function(){
		// We're going to inject a fake input element with a specified name
		var form = document.createElement("div"),
			id = "script" + (new Date()).getTime(),
			root = document.documentElement;

		form.innerHTML = "<a name='" + id + "'/>";

		// Inject it into the root element, check its status, and remove it quickly
		root.insertBefore( form, root.firstChild );

		// The workaround has to do additional checks after a getElementById
		// Which slows things down for other browsers (hence the branching)
		if ( document.getElementById( id ) ) {
			Expr.find.ID = function( match, context, isXML ) {
				if ( typeof context.getElementById !== "undefined" && !isXML ) {
					var m = context.getElementById(match[1]);

					return m ?
						m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
							[m] :
							undefined :
						[];
				}
			};

			Expr.filter.ID = function( elem, match ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

				return elem.nodeType === 1 && node && node.nodeValue === match;
			};
		}

		root.removeChild( form );

		// release memory in IE
		root = form = null;
	})();

	(function(){
		// Check to see if the browser returns only elements
		// when doing getElementsByTagName("*")

		// Create a fake element
		var div = document.createElement("div");
		div.appendChild( document.createComment("") );

		// Make sure no comments are found
		if ( div.getElementsByTagName("*").length > 0 ) {
			Expr.find.TAG = function( match, context ) {
				var results = context.getElementsByTagName( match[1] );

				// Filter out possible comments
				if ( match[1] === "*" ) {
					var tmp = [];

					for ( var i = 0; results[i]; i++ ) {
						if ( results[i].nodeType === 1 ) {
							tmp.push( results[i] );
						}
					}

					results = tmp;
				}

				return results;
			};
		}

		// Check to see if an attribute returns normalized href attributes
		div.innerHTML = "<a href='#'></a>";

		if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
				div.firstChild.getAttribute("href") !== "#" ) {

			Expr.attrHandle.href = function( elem ) {
				return elem.getAttribute( "href", 2 );
			};
		}

		// release memory in IE
		div = null;
	})();

	if ( document.querySelectorAll ) {
		(function(){
			var oldSizzle = Sizzle,
				div = document.createElement("div"),
				id = "__sizzle__";

			div.innerHTML = "<p class='TEST'></p>";

			// Safari can't handle uppercase or unicode characters when
			// in quirks mode.
			if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
				return;
			}
		
			Sizzle = function( query, context, extra, seed ) {
				context = context || document;

				// Only use querySelectorAll on non-XML documents
				// (ID selectors don't work in non-HTML documents)
				if ( !seed && !Sizzle.isXML(context) ) {
					// See if we find a selector to speed up
					var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
					
					if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
						// Speed-up: Sizzle("TAG")
						if ( match[1] ) {
							return makeArray( context.getElementsByTagName( query ), extra );
						
						// Speed-up: Sizzle(".CLASS")
						} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
							return makeArray( context.getElementsByClassName( match[2] ), extra );
						}
					}
					
					if ( context.nodeType === 9 ) {
						// Speed-up: Sizzle("body")
						// The body element only exists once, optimize finding it
						if ( query === "body" && context.body ) {
							return makeArray( [ context.body ], extra );
							
						// Speed-up: Sizzle("#ID")
						} else if ( match && match[3] ) {
							var elem = context.getElementById( match[3] );

							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							if ( elem && elem.parentNode ) {
								// Handle the case where IE and Opera return items
								// by name instead of ID
								if ( elem.id === match[3] ) {
									return makeArray( [ elem ], extra );
								}
								
							} else {
								return makeArray( [], extra );
							}
						}
						
						try {
							return makeArray( context.querySelectorAll(query), extra );
						} catch(qsaError) {}

					// qSA works strangely on Element-rooted queries
					// We can work around this by specifying an extra ID on the root
					// and working up from there (Thanks to Andrew Dupont for the technique)
					// IE 8 doesn't work on object elements
					} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
						var oldContext = context,
							old = context.getAttribute( "id" ),
							nid = old || id,
							hasParent = context.parentNode,
							relativeHierarchySelector = /^\s*[+~]/.test( query );

						if ( !old ) {
							context.setAttribute( "id", nid );
						} else {
							nid = nid.replace( /'/g, "\\$&" );
						}
						if ( relativeHierarchySelector && hasParent ) {
							context = context.parentNode;
						}

						try {
							if ( !relativeHierarchySelector || hasParent ) {
								return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
							}

						} catch(pseudoError) {
						} finally {
							if ( !old ) {
								oldContext.removeAttribute( "id" );
							}
						}
					}
				}
			
				return oldSizzle(query, context, extra, seed);
			};

			for ( var prop in oldSizzle ) {
				Sizzle[ prop ] = oldSizzle[ prop ];
			}

			// release memory in IE
			div = null;
		})();
	}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}
	div.lastChild.className = "e";
	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			var match = false;
			elem = elem[dir];
			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}
				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}
				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}
				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};
//删除选择器表达式中的所有伪类，调用Sizzle查找删除伪类后的选择器表达式所匹配的元素集合
//调用Sizzle.filter用伪类过滤查找结果
var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;
//删除选择器表达式中的所有伪类，并累计在变量later中
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}
//如果删除伪类后的选择器表达式只剩下一个块间关系符，则追加一个通配符'*'
	selector = Expr.relative[selector] ? selector + "*" : selector;
//遍历上下文数组，调用函数Sizzle查找删除伪类后的选择器表达式匹配的元素集合，将查找结果合并到数组中
	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
})();
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

	window.jQuery = window.$ = jQuery;//其将jQuery成为公开的全局变量
//自调用匿名函数，其中代码不会和已知的同名函数、方法和变量等冲突，不会破坏和污染全局变量
//传入window，是window对象成为局部变量
})(window);
