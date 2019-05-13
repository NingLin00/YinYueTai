(function(w){
	//设置不覆盖的transform的Css样式，两个值为读取，三个值为设置值
	w.transformCss = function(node, name, value) {
	
	if(!node.obj) {
		node.obj = {}
	}
	
	if(arguments.length > 2) {
		node.obj[name] = value;
		var result = '';
		for(var key in node.obj) {
			switch(key) {
				case 'translateX':
				case 'translateY':
				case 'translateZ':
				case 'translate':
					result += key + '(' + node.obj[key] + 'px) ';
					break;
				case 'rotateX':
				case 'rotateY':
				case 'rotateZ':
				case 'rotate':
				case 'skewX':
				case 'skewY':
				case 'skew':
					result += key + '(' + node.obj[key] + 'deg) ';
					break;
				case 'scaleX':
				case 'scaleY':
				case 'scale':
					result += key + '(' + node.obj[key] + ') ';
					break;
			}
		}

		node.style.transform = result; //真正的把对象当中所有的属性值设置给元素；

		
	} else {
		//读取值，一上来要判断要读取的这个属性有没有，如果没有，要去给赋默认值
		//不能直接返回undefined
		var result = 0;
		if(node.obj[name] == undefined) {
			//如果没有值，我们设置默认值
			if(name == 'scale' || name == 'scaleX' || name == 'scaleY') {
				result = 1;
			} else {
				result = 0;
			}
		} else {
			result = node.obj[name];
		}
		return result;
	}

};
    //元素后插入节点
	w.inserAfter = function (node,newNode){
			var parentNode = node.parentNode;
			if(parentNode.lastElementChild === node){
				parentNode.appendChild(newNode)
			}else{
				parentNode.insertBefore(newNode,node.nextElementSibling)
			}
		};
	//获取所有兄弟元素
	w.allSibling = function (elm) {
		var a = [];
		var p = elm.parentNode.children;
		for(var i =0,pl= p.length;i<pl;i++) {
		if(p[i] !== elm) a.push(p[i]);
		}
		return a;
		};
	//内容s滑动
	w.contentMove = function (navWrap,how) {
        var navList = navWrap.firstElementChild;
        var eleStart = 0;
        var mouseStart = 0;
        var startX = 0;
        var startY = 0;
        var m2 = 0;
        var t1 = 0;
        var t2 = 0;
        var maxDis = 0;
        var timer = null;
        var isfirst = true;
        //tween缓动算法
        var tween = {
        	Linear: function(t,b,c,d){ return c*t/d + b; },
            easeOut: function(t,b,c,d,s){
                if (s == undefined) s = 1.70158;
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            },
		};
        //判断X还是Y
        if (how == 'true') {
        	how = true;
		}else if (how == 'false'){
            how = false;
		}else {
        	return;
		}
        navWrap.addEventListener('touchstart',function(event){
            var touch = event.changedTouches[0];
            navList.style.transition = 'none';
            // 元素开始位置
            eleStart = how?transformCss(navList,'translateX'):transformCss(navList,'translateY');
            // 鼠标开始位置
            mouseStart = how?touch.clientX:touch.clientY;
            //时间标志开始
            t1 = new Date().getTime();
            startX = touch.clientX;
            startY = touch.clientY;
            isfirst = true;
            clearInterval(timer)
        });
        navWrap.addEventListener('touchmove',function(event){
        	if (!isfirst) {
        		return;
			}
            var touch = event.changedTouches[0];
            var end = how?touch.clientX:touch.clientY;
            var endX = touch.clientX;
            var endY = touch.clientY;
            var disX = endX - startX;
            var disY = endY - startY;

            //防抖判断
			var flag = how?Math.abs(disX)<Math.abs(disY):Math.abs(disX)>Math.abs(disY);
            if (flag) {
				isfirst = false;
				return;
			}
            var dis = end - mouseStart;
            var lastDis = eleStart + dis;

            //限制大小
            //临界值
            maxDis = how?document.documentElement.clientWidth-navList.offsetWidth:document.documentElement.clientHeight-navList.offsetHeight;
			//视口的宽或高
            var viewDis = how?document.documentElement.clientWidth:document.documentElement.clientHeight;

            // 阻尼系数;
            if (lastDis > 0) {
                var scale = 0.6 - lastDis/(3*viewDis);
                lastDis = scale * lastDis;
            }else if (lastDis < maxDis){
                var temp = Math.abs(lastDis) - Math.abs(maxDis);
                var scale = 0.6 -temp/(3*viewDis);
                temp = scale * temp;
                lastDis = maxDis-temp;
            }

            how?transformCss(navList,'translateX',lastDis):transformCss(navList,'translateY',lastDis);
        });
        navWrap.addEventListener('touchend',function () {

            m2 = how?transformCss(navList,'translateX'):transformCss(navList,'translateY');
            t2 = new Date().getTime();
            var speed = (m2-eleStart)/(t2-t1);
            var lastDis = m2 +speed * 200;
            var timeAll = 1;
            var type = 'Linear';
            //超出则启用tween的easeOut方法
            if(lastDis > 0){
                lastDis = 0;
                type = 'easeOut';
            }else if(lastDis < maxDis){
                lastDis = maxDis;
                type = 'easeOut';
            }
            //t 当前在循环的次数
            //b 抬起的最后位置 元素的初始值
            //c 变化量（需要加速的距离）
            //d 持续时间（总共的次数=设定的持续的时间/定时器执行时间）
            tweenMove(m2,lastDis,timeAll,type);
            function tweenMove(m2,lastDis,timeAll,type) {
				var t = 0;
                var b = m2;
                //var b = how=='true'?transformCss(navList,'translateX'):transformCss(navList,'translateY');
                var c = lastDis - b;
                var d = timeAll/0.02;
				timer = setInterval(function () {
						if (t >= d) {
							clearInterval(timer);
						}else {
                            t++;
                            var lastDist = tween[type](t,b,c,d);
                            how?transformCss(navList,'translateX',lastDist):transformCss(navList,'translateY',lastDist);
						}
                },20)

            }



            //回弹
            // var bezier = '';
			//
            // if(lastDis > 0){
            //     lastDis = 0;
            //     bezier = 'cubic-bezier(.13,.67,.71,1.79)';
            // }else if(lastDis < maxDis){
            //     lastDis = maxDis;
            //     bezier = 'cubic-bezier(.13,.67,.71,1.79)';
            // }
			//
			//
            // navList.style.transition = 'transform 1s '+bezier;
            // how=='true'?transformCss(navList,'translateX',lastDis):transformCss(navList,'translateY',lastDis);
        })
    }
})(window);


