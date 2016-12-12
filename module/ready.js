// jQuery中的ready事件模块的功能是来检测文档是否已经加载完成，加载完成后就执行相应的操作。
// 在jQ中，文档加载完成是根据浏览器来侦听DOMContentLoaded（IE9+和其它浏览器）和readystatechange（低版本IE浏览器）这个两个事件，
// 当这两个事件发生时调用DOMContentLoaded方法来进行jQuery.ready(wait)方法的调用，
// 这个方法就是处理绑定的加载后执行的函数（也可以说是在readyList列表中储存的函数）。
// 另外在IE浏览器中，为了保证在页面内容较多或者是包含iframe的情况下正确的作出文档已加载的判断，还使用模拟浏览器滚动条点击的方法来触发ready事件。
// jQ还添加了一段防御性代码，通过检测onload事件来调用jQuery.ready(wait)方法。
(function(window,undefined){
	var jQuery = (function(){
		var jQuery = function(selector,context){
			return new jQuery.fn.init(selector,context,rootjQuery);
		},
// 只含有document对象的jQuery对象
		rootjQuery,
// ready事件监听函数列表，用于存放ready事件监听函数
		readyList,
		DomContentLoaded,
		jQuery.fn = jQuery.prototype = {
			init : function(selector,context,rootjQuery){
				if(typeof selector === 'string'){

				}else if(jQuery.isFunction(selector)){
					return rootjQuery.ready(selector);
				}
			}
// 绑定ready事件监听函数
			ready:function(fn){

			}
		};
		jQuery.extend({
// ready状态标记
			isReady:false,
// ready等待计数器
			readyWait:1,
			holdReady:function(hold){
				if ( hold ) {
					jQuery.readyWait++;
				} else {
					jQuery.ready( true );
				}
			},
// 在document对象上绑定一个ready事件监听函数，当DOM结构加载完成后，监听函数被执行。
//调用jQuery.bindReady方法创建readyList、绑定各种关于ready的事件监听方法
			ready:function(fn){
// 如果ready事件已就绪，并且ready事件并没有被延迟或延迟已全部恢复，则执行ready事件监听函数
// 在ready事件正常出发的情况下，wait总是undefined，如果jQuery.isReady是false，说明尚未执行过if快中的代码
// 满足if条件表达式的后半部分，会继续执行if块中后面的代码。
				if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
					if ( !document.body ) {
						return setTimeout( jQuery.ready, 1 );
					}
					jQuery.isReady = true;
					if ( wait !== true && --jQuery.readyWait > 0 ) {
						return;
					}
					readyList.fireWith( document, [ jQuery ] );
					if ( jQuery.fn.trigger ) {
						jQuery( document ).trigger( "ready" ).off( "ready" );
					}
				}
			},
			bindReady:function(){
// 如果ready事件监听函数列表readyList不是undefined，表示方法jQuery.bindReady()已经被调用过了
// 不需要再次执行后面的代码
				if ( readyList ) {
					return;
				}
// 调用方法jQuery.Callback(flags)初始化ready事件监听函数列表readyList
// once确保监听函数列表只触发一次
// memory记录上一次触发监听函数列表reayList时的参数，之后添加的任何监听函数都将用记录的参数值立即调用
				readyList = jQuery.Callbacks( "once memory" );
// document.readyState返回一个字符串，指示document对象的加载状态有四个可选值，uninitialized:尚未加载
// loading：正在加载中;interactive:已经加载了必需的内容，此时用户可以操作;complete:全部加载完成
// 当document.readyState的值改变时，会触发一个readystatechange事件
				if ( document.readyState === "complete" ) {
					return setTimeout( jQuery.ready, 1 );
				}
// 将监听函数DOMContentLoaded绑定到document对象的DOMContentLoaded
// 这个事件是从HTML中的onLoad的延伸而来的，当一个页面完成加载时,初始化脚本的方法是使用load事件，
// 但这个类函数的缺点是仅在所有资源都完全加载后才被触发,这有时会导致比较严重的延迟,开发人员随后创建了一种自定义事件,domready,它在DOM加载之后及资源加载之前被触发。
				if ( document.addEventListener ) {
					document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
// 把方法jQuery.ready(wait)绑定到window对象的load事件上，以确保该方法总是被执行，一段“防御性代码”
					window.addEventListener( "load", jQuery.ready, false );
				} else if ( document.attachEvent ) {
					document.attachEvent( "onreadystatechange", DOMContentLoaded );
// 把方法jQuery.ready(wait)绑定到window对象的load事件上，以确保该方法总是被执行，一段“防御性代码”
					window.attachEvent( "onload", jQuery.ready );
// 如果当前页面是顶层窗口，即没有包含在其他iframe或frame元素中，会可以通过调用函数doScrollCheck()来
// 检测是否可以出发ready事件
					var toplevel = false;
					try {
						toplevel = window.frameElement == null;
					} catch(e) {}
					if ( document.documentElement.doScroll && toplevel ) {
						doScrollCheck();
					}
				}
			},
		});
		rootjQuery = jQuery(document);
		if(document.addEventListener){
// IE9+其他浏览器中，监听函数DOMContentLoaded初始化
			DOMContentLoaded = function() {
				document.removeEventListener('DOMContentLoaded',DOMContentLoaded,false);
				jQuery.ready();
			};
		}else if(document.attachEvent){
			DOMContentLoaded = function(){
// 监听函数DOMContentLoaded会检测文档是否加载完成，如果已完成，则先移除绑定的onreadystatechange
// 然后再调用jQuery.ready(wait)执行ready事件监听函数
				if(document.readyState === 'complete'){
					document.detachEvent('onreadystatechange',DOMContentLoaded);
					jQuery.ready();
				}
			}
		}
// 每隔1ms模拟点击滚动条，直到不再抛出异常为止
		function doScrollCheck(){
			if ( jQuery.isReady ) {
				return;
			}
			try {
				document.documentElement.doScroll("left");
			} catch(e) {
				setTimeout( doScrollCheck, 1 );
				return;
			}
			jQuery.ready();
		}
		return jQuery;
	})();
})