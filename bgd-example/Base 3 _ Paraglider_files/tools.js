
	
	if (!window.console) window.console = {};
	if (!window.console.log) window.console.log = function () { };
	
	
	var deviceAndroid = "android";
	var deviceIphone = "iphone";
	var deviceBlackberry = "blackberry";
	var uagent = navigator.userAgent.toLowerCase();
  
	

	function DetectDevice() {
		if (uagent.search(deviceAndroid) > -1) {}
		else if (uagent.search(deviceIphone) > -1) {}
		else if (uagent.search(deviceBlackberry) > -1) { return "blackberry";}
		else { }
	}
	
	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};
	
	function is_touch_device() {
	 return (('ontouchstart' in window)
		  || (navigator.MaxTouchPoints > 0)
		  || (navigator.msMaxTouchPoints > 0));
	}
	
	function copy_to_clipboard(text) {
		var el = document.createElement('textarea');
		el.value = text;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
		return text;
	}
	
	function loadjscssfile(filename, filetype){
		if (filetype=="js"){ //if filename is a external JavaScript file
			var fileref=document.createElement('script')
			fileref.setAttribute("type","text/javascript")
			fileref.setAttribute("src", filename)
		}
		else if (filetype=="css"){ //if filename is an external CSS file
			var fileref=document.createElement("link")
			fileref.setAttribute("rel", "stylesheet")
			fileref.setAttribute("type", "text/css")
			fileref.setAttribute("href", filename)
		}
		if (typeof fileref!="undefined")
			document.getElementsByTagName("head")[0].appendChild(fileref)
	}
	
	
	//**************************************************************
	//Universal Analytics
	
	function decorateLink(target){
		ga(function(tracker) {
		  var linker = new window.gaplugins.Linker(tracker);
		  var output = linker.decorate(target);
		});
	}
	
	//Universal Analytics
	//**************************************************************

	//**************************************************************
	//Réseaux sociaux
	function loadSocial(app_id, my_lang){


		var timeout = setTimeout(function() { 
	
			//FACEBOOK
			if(my_lang == "en")
				var second_lang = "US";
			else
				var second_lang = my_lang.toUpperCase();
			
			window.fbAsyncInit = function() {
				FB.init({
				  	appId      : app_id,
				  	xfbml      : true,
				  	version    : 'v18.0',
					autoLogAppEvents : true
				});
			};

			(function(d, s, id){
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) {return;}
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/"+my_lang+"_"+second_lang+"/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
	   
			
			//TWITTER
			!function(d,s,id){
				var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
				if(!d.getElementById(id)){
					js=d.createElement(s);
					js.id=id;js.src=p+'://platform.twitter.com/widgets.js';
					fjs.parentNode.insertBefore(js,fjs);
				}
			}(document, 'script', 'twitter-wjs');
			
			
			//GOOGLE+
			window.___gcfg = {lang: my_lang+"_"+second_lang};
	
			(function() {
				var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
				po.src = 'https://apis.google.com/js/plusone.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
			})();
			
			var timeout_back = setTimeout(function() { 
				$("ul.icons_social").css("overflow", "visible");
			}, 2000);
	
		}, 300);
	}
	
	//Réseaux sociaux
	//**************************************************************
	
	//**************************************************************
	//COOKIES
	
	function set_cookie(c_name, value, days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}else{
			var expires = "";
		}
		document.cookie = c_name+"="+value+expires+"; path=/";
	}
	
	function get_cookie(c_name) {
		var nameEQ = c_name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	
	function set_message_bottom(c_name, txt) {
		
		var is_cookie = get_cookie(c_name);
		console.log('Cookie: '+is_cookie);
		
		if(is_cookie === null){			
			if(txt != ""){
				
				console.log('Cookie: '+is_cookie+" = exec");
				
				var html = '<div id="'+c_name+'" class="ban_bot" >';
					html += '<div class="ban_bot_wrapper">';
						html += base64_decode(txt);
						/*html += '<p>';
						html += txt;
						html += ' <a id="'+c_name+'_remove" class="ban_bot_remove">OK</a>';
						html += '</p>';*/
					html += '</div>';
				html += '</div>';
											
				$(document).ready(function() {
					$("body").append(html);
					$("#"+c_name).slideDown(1200);
					
					set_cookie(c_name, c_name, 3);
				
					$('#'+c_name+'_remove').click(function () {
						//set_cookie(c_name, c_name, 365);
						$("#"+c_name).slideUp(600, function () {
							$("#"+c_name).remove();
						});
						
					});
				});
				
				
				
			}
		}
	}
	
	//COOKIES
	//**************************************************************
	

	//**************************************************************
	//Session Store
	
	function session_save(key, value) {
		try {
			localStorage.setItem(key, value);
		}
		
		catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				console.log("Error: Local Storage limit exceeds.");
			}
			else {
				console.log("Error: Saving to local storage.");
			}
		} 
		
	}
	function session_load(key) {
		try {
			return localStorage.getItem(key);
		}
		
		catch (e) {

			console.log("Error: Loading from local storage.");
			return false;

		}
	}
	
	
	//JSON **********************************************
	
	function session_save_json(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		}
		
		catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				console.log("Error: Local Storage limit exceeds.");
			}
			else {
				console.log("Error: Saving to local storage.");
			}
		} 
		
	}
	function session_load_json(key) {
		try {
			return JSON.parse(localStorage.getItem(key));
		}
		
		catch (e) {

			console.log("Error: Loading from local storage.");
			return false;

		}
	}
	
	function session_del(key) {
		try {
			localStorage.removeItem(key);
		}
		
		catch (e) {

			console.log("Error: Deleting from local storage.");
		}
	}
	
	function session_clear() {
		try {
			localStorage.clear();
		}
		
		catch (e) {

			console.log("Error: Clearing from local storage.");
		}
	}
	
	function reload_store(key, callback) {
		session_del(key);
		load_store(key, callback);
		
	}


	function load_store(key, callback) {
		
		var store = eval(key);
		
		store.addListener(
			"load", 
			function(my_store){
										   
				var json = my_store.reader.jsonData;
				session_save_json(key, json);
				
				if(callback)
					eval(callback);
			}
		);

		var json = session_load_json(key);
	
		if (!json) {
			store.load();
		}else{
			store.loadData(json);
		}
	}
	
//**************************************************************

	
//*************************************************************	
//FUNCTIONS
	function pluriel(expression, nombre, lettre){
		
		if(!lettre)
			lettre = "s";
			
			
			
		if(nombre > 1)
			return expression+lettre;
		else
			return expression;
	}
	
	function is_count(val){
		
		if(val > 0)
			return "<b>"+val+"</b>";
		else
			return val;
	}
	

	
	function short_sext(val, longeur) {
		
		if(val == null)
			return "";
		
		if(longeur == null)
			longeur = 50;
			
		if(val.length > longeur)
		{
			val = val.substr(0, longeur)+"...";
		}
		
		return val;
	}
	
	function val_existe(val) {

		if(val == null || val == "")
			return "<img src='"+SITE+"assets/pict/icon/no.png' />";
		else
			return "<img src='"+SITE+"assets/pict/icon/yes.png' />";
		
	}
	
	function get_number(val) {

		if(val == null || val == "" || val == 0)
			return "<img src='"+SITE+"assets/pict/icon/no.png' />";
		else
			return "<b>"+val+"</b>";
		
	}
	
	function get_is_on(val) {

		if(val == 0)
			return "<img src='"+SITE+"assets/pict/icon/yes.png' />";
		else
			return "<img src='"+SITE+"assets/pict/icon/no.png' />";
		
	}
	
	function get_indexation_status(val) {

		if(val == 1)
			return "I - NF";
		else if(val == 2)
			return "NI - F";
		else if(val == 3)
			return "<img src='"+SITE+"assets/pict/icon/no.png' />";
		else
			return "";
		
	}
	
	function get_flag(val) {

		if(val == null || val == "")
			return "<img src='"+SITE+"assets/pict/icon/no.png' />";
		else
			return "<img src='"+SITE+"assets/pict/icon/flags/"+val+".png' />";
		
	}
	
	function get_extension(val) {

		if(val == null || val == "")
			return null;
		else
			return "<img src='"+SITE+"assets/pict/icon/extension/"+val+".png' />";
		
	}
	
	function get_size(bytes) {
	   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	   if (bytes == 0 || bytes == null) return null;
	   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	};
	
	
	function findUrls( text )
	{
		var source = (text || '').toString();
		var urlArray = [];
		var url;
		var matchArray;
	
		// Regular expression to find FTP, HTTP(S) and email URLs.
		var regexToken = /((((ftp|https|http?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})|(((ftp|https|http?):\/\/\{)(.*)\}))/g;

		// Iterate through any URLs in the text.
		while( (matchArray = regexToken.exec( source )) !== null )
		{
			var token = matchArray[0];
			urlArray.push( token );
		}
	
		return urlArray;
	}
	


	function set_disappear(div, timeout, opacity, height, timer) {
			
			e = document.getElementById(div);
			
            var reduceOpacityBy = 15;
			var reduceHeightBy = 4;

			if (opacity == null) {
				opacity = 100;
				setTimeout(function () {
					set_disappear(div, timeout, opacity);
				}, timeout);
				return;
			}

			if (!height) {
				height = $( '#'+div ).height();;
			}
				
			if (opacity > 0) {
				opacity -= reduceOpacityBy;
				if (opacity < 0) {
					opacity = 0;
				}
		
				if (e.filters) {
					try {
						e.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
					} catch (e) {
						// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
						e.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + opacity + ")";
					}
				} else {
					e.style.opacity = opacity / 100;
				}
			}
		
			if (height > 0) {
				height -= reduceHeightBy;
				if (height < 0) {
					height = 0;
				}
				e.style.height = height + "px";
			}

			if (height > 0 || opacity > 0) {
				setTimeout(function () {
					set_disappear(div, timeout, opacity, height, this);
				}, 30);
			} else {
				e.style.display = "none";
				clearTimeout(timer);
			}
        }
		
		
	function number_format(number, decimals, dec_point, thousands_sep) {
	  //   example 1: number_format(1234.56);
	  //   returns 1: '1,235'
	  //   example 2: number_format(1234.56, 2, ',', ' ');
	  //   returns 2: '1 234,56'
	  //   example 3: number_format(1234.5678, 2, '.', '');
	  //   returns 3: '1234.57'
	  //   example 4: number_format(67, 2, ',', '.');
	  //   returns 4: '67,00'
	  //   example 5: number_format(1000);
	  //   returns 5: '1,000'
	  //   example 6: number_format(67.311, 2);
	  //   returns 6: '67.31'
	  //   example 7: number_format(1000.55, 1);
	  //   returns 7: '1,000.6'
	  //   example 8: number_format(67000, 5, ',', '.');
	  //   returns 8: '67.000,00000'
	  //   example 9: number_format(0.9, 0);
	  //   returns 9: '1'
	  //  example 10: number_format('1.20', 2);
	  //  returns 10: '1.20'
	  //  example 11: number_format('1.20', 4);
	  //  returns 11: '1.2000'
	  //  example 12: number_format('1.2000', 3);
	  //  returns 12: '1.200'
	  //  example 13: number_format('1 000,50', 2, '.', ' ');
	  //  returns 13: '100 050.00'
	  //  example 14: number_format(1e-8, 8, '.', '');
	  //  returns 14: '0.00000001'
	
	  number = (number + '')
		.replace(/[^0-9+\-Ee.]/g, '');
	  var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function(n, prec) {
		  var k = Math.pow(10, prec);
		  return '' + (Math.round(n * k) / k)
			.toFixed(prec);
		};
	  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
	  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
		.split('.');
	  if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	  }
	  if ((s[1] || '')
		.length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1)
		  .join('0');
	  }
	  return s.join(dec);
	}


//FUNCTIONS
//*************************************************************	


//*************************************************************	
//TRADUCTIONS

add_translations = false;

function _t(expression, alias, langue){

	if(typeof langue == 'undefined'){
		langue = LANG;	
	}

	var md5 = "_"+CryptoJS.MD5(expression);
	
	
	if(typeof TEXT[langue] != 'undefined' && typeof TEXT[langue][alias] != 'undefined' && typeof TEXT[langue][alias][md5] != 'undefined') {
		
		if(TEXT[langue][alias][md5] != ""){
			return TEXT[langue][alias][md5];
		}else{
			if(typeof TEXT[LANG_DEFAUT] != 'undefined' && typeof TEXT[LANG_DEFAUT][alias] != 'undefined' && typeof TEXT[LANG_DEFAUT][alias][md5] != 'undefined')
				return TEXT[LANG_DEFAUT][alias][md5];
		}
		
	}else if(add_translations == true){
		console.log('try to add translation : '+alias+" : "+expression);	
		$.ajax({
			type: "POST"
			,data: {action: 'add_translation', expression: expression, alias: alias, langue: langue}
			,url: SITE+'outils/ajax.php'
			,success: function(msg) {console.log('translation added : '+alias+" / "+langue+": "+expression);}
			,error: function() {}
		});
	}
	
	return expression;
	
}

//TRADUCTIONS
//*************************************************************		

//*************************************************************	
//FUNCTIONS PHP


	function base64_encode(data) {
	  //  discuss at: http://phpjs.org/functions/base64_encode/
	  // original by: Tyler Akins (http://rumkin.com)
	  // improved by: Bayron Guevara
	  // improved by: Thunder.m
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Rafał Kukawski (http://kukawski.pl)
	  // bugfixed by: Pellentesque Malesuada
	  //   example 1: base64_encode('Kevin van Zonneveld');
	  //   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	  //   example 2: base64_encode('a');
	  //   returns 2: 'YQ=='
	  //   example 3: base64_encode('✓ à la mode');
	  //   returns 3: '4pyTIMOgIGxhIG1vZGU='
	
	  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		enc = '',
		tmp_arr = [];
	
	  if (!data) {
		return data;
	  }
	
	  data = unescape(encodeURIComponent(data))
	
	  do {
		// pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);
	
		bits = o1 << 16 | o2 << 8 | o3;
	
		h1 = bits >> 18 & 0x3f;
		h2 = bits >> 12 & 0x3f;
		h3 = bits >> 6 & 0x3f;
		h4 = bits & 0x3f;
	
		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	  } while (i < data.length);
	
	  enc = tmp_arr.join('');
	
	  var r = data.length % 3;
	
	  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	}
	
	function base64_decode(data) {
	  //  discuss at: http://phpjs.org/functions/base64_decode/
	  // original by: Tyler Akins (http://rumkin.com)
	  // improved by: Thunder.m
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //    input by: Aman Gupta
	  //    input by: Brett Zamir (http://brett-zamir.me)
	  // bugfixed by: Onno Marsman
	  // bugfixed by: Pellentesque Malesuada
	  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	  //   returns 1: 'Kevin van Zonneveld'
	  //   example 2: base64_decode('YQ===');
	  //   returns 2: 'a'
	  //   example 3: base64_decode('4pyTIMOgIGxhIG1vZGU=');
	  //   returns 3: '✓ à la mode'
	
	  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		dec = '',
		tmp_arr = [];
	
	  if (!data) {
		return data;
	  }
	
	  data += '';
	
	  do {
		// unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));
	
		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
	
		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;
	
		if (h3 == 64) {
		  tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
		  tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
		  tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	  } while (i < data.length);
	
	  dec = tmp_arr.join('');
	
	  return decodeURIComponent(escape(dec.replace(/\0+$/, '')));
	}
	
	
	/* MD5 */
	var CryptoJS=CryptoJS||function(s,p){var m={},l=m.lib={},n=function(){},r=l.Base={extend:function(b){n.prototype=this;var h=new n;b&&h.mixIn(b);h.hasOwnProperty("init")||(h.init=function(){h.$super.init.apply(this,arguments)});h.init.prototype=h;h.$super=this;return h},create:function(){var b=this.extend();b.init.apply(b,arguments);return b},init:function(){},mixIn:function(b){for(var h in b)b.hasOwnProperty(h)&&(this[h]=b[h]);b.hasOwnProperty("toString")&&(this.toString=b.toString)},clone:function(){return this.init.prototype.extend(this)}},
q=l.WordArray=r.extend({init:function(b,h){b=this.words=b||[];this.sigBytes=h!=p?h:4*b.length},toString:function(b){return(b||t).stringify(this)},concat:function(b){var h=this.words,a=b.words,j=this.sigBytes;b=b.sigBytes;this.clamp();if(j%4)for(var g=0;g<b;g++)h[j+g>>>2]|=(a[g>>>2]>>>24-8*(g%4)&255)<<24-8*((j+g)%4);else if(65535<a.length)for(g=0;g<b;g+=4)h[j+g>>>2]=a[g>>>2];else h.push.apply(h,a);this.sigBytes+=b;return this},clamp:function(){var b=this.words,h=this.sigBytes;b[h>>>2]&=4294967295<<
32-8*(h%4);b.length=s.ceil(h/4)},clone:function(){var b=r.clone.call(this);b.words=this.words.slice(0);return b},random:function(b){for(var h=[],a=0;a<b;a+=4)h.push(4294967296*s.random()|0);return new q.init(h,b)}}),v=m.enc={},t=v.Hex={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++){var k=a[j>>>2]>>>24-8*(j%4)&255;g.push((k>>>4).toString(16));g.push((k&15).toString(16))}return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j+=2)g[j>>>3]|=parseInt(b.substr(j,
2),16)<<24-4*(j%8);return new q.init(g,a/2)}},a=v.Latin1={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++)g.push(String.fromCharCode(a[j>>>2]>>>24-8*(j%4)&255));return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j++)g[j>>>2]|=(b.charCodeAt(j)&255)<<24-8*(j%4);return new q.init(g,a)}},u=v.Utf8={stringify:function(b){try{return decodeURIComponent(escape(a.stringify(b)))}catch(g){throw Error("Malformed UTF-8 data");}},parse:function(b){return a.parse(unescape(encodeURIComponent(b)))}},
g=l.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(b){"string"==typeof b&&(b=u.parse(b));this._data.concat(b);this._nDataBytes+=b.sigBytes},_process:function(b){var a=this._data,g=a.words,j=a.sigBytes,k=this.blockSize,m=j/(4*k),m=b?s.ceil(m):s.max((m|0)-this._minBufferSize,0);b=m*k;j=s.min(4*b,j);if(b){for(var l=0;l<b;l+=k)this._doProcessBlock(g,l);l=g.splice(0,b);a.sigBytes-=j}return new q.init(l,j)},clone:function(){var b=r.clone.call(this);
b._data=this._data.clone();return b},_minBufferSize:0});l.Hasher=g.extend({cfg:r.extend(),init:function(b){this.cfg=this.cfg.extend(b);this.reset()},reset:function(){g.reset.call(this);this._doReset()},update:function(b){this._append(b);this._process();return this},finalize:function(b){b&&this._append(b);return this._doFinalize()},blockSize:16,_createHelper:function(b){return function(a,g){return(new b.init(g)).finalize(a)}},_createHmacHelper:function(b){return function(a,g){return(new k.HMAC.init(b,
g)).finalize(a)}}});var k=m.algo={};return m}(Math);
(function(s){function p(a,k,b,h,l,j,m){a=a+(k&b|~k&h)+l+m;return(a<<j|a>>>32-j)+k}function m(a,k,b,h,l,j,m){a=a+(k&h|b&~h)+l+m;return(a<<j|a>>>32-j)+k}function l(a,k,b,h,l,j,m){a=a+(k^b^h)+l+m;return(a<<j|a>>>32-j)+k}function n(a,k,b,h,l,j,m){a=a+(b^(k|~h))+l+m;return(a<<j|a>>>32-j)+k}for(var r=CryptoJS,q=r.lib,v=q.WordArray,t=q.Hasher,q=r.algo,a=[],u=0;64>u;u++)a[u]=4294967296*s.abs(s.sin(u+1))|0;q=q.MD5=t.extend({_doReset:function(){this._hash=new v.init([1732584193,4023233417,2562383102,271733878])},
_doProcessBlock:function(g,k){for(var b=0;16>b;b++){var h=k+b,w=g[h];g[h]=(w<<8|w>>>24)&16711935|(w<<24|w>>>8)&4278255360}var b=this._hash.words,h=g[k+0],w=g[k+1],j=g[k+2],q=g[k+3],r=g[k+4],s=g[k+5],t=g[k+6],u=g[k+7],v=g[k+8],x=g[k+9],y=g[k+10],z=g[k+11],A=g[k+12],B=g[k+13],C=g[k+14],D=g[k+15],c=b[0],d=b[1],e=b[2],f=b[3],c=p(c,d,e,f,h,7,a[0]),f=p(f,c,d,e,w,12,a[1]),e=p(e,f,c,d,j,17,a[2]),d=p(d,e,f,c,q,22,a[3]),c=p(c,d,e,f,r,7,a[4]),f=p(f,c,d,e,s,12,a[5]),e=p(e,f,c,d,t,17,a[6]),d=p(d,e,f,c,u,22,a[7]),
c=p(c,d,e,f,v,7,a[8]),f=p(f,c,d,e,x,12,a[9]),e=p(e,f,c,d,y,17,a[10]),d=p(d,e,f,c,z,22,a[11]),c=p(c,d,e,f,A,7,a[12]),f=p(f,c,d,e,B,12,a[13]),e=p(e,f,c,d,C,17,a[14]),d=p(d,e,f,c,D,22,a[15]),c=m(c,d,e,f,w,5,a[16]),f=m(f,c,d,e,t,9,a[17]),e=m(e,f,c,d,z,14,a[18]),d=m(d,e,f,c,h,20,a[19]),c=m(c,d,e,f,s,5,a[20]),f=m(f,c,d,e,y,9,a[21]),e=m(e,f,c,d,D,14,a[22]),d=m(d,e,f,c,r,20,a[23]),c=m(c,d,e,f,x,5,a[24]),f=m(f,c,d,e,C,9,a[25]),e=m(e,f,c,d,q,14,a[26]),d=m(d,e,f,c,v,20,a[27]),c=m(c,d,e,f,B,5,a[28]),f=m(f,c,
d,e,j,9,a[29]),e=m(e,f,c,d,u,14,a[30]),d=m(d,e,f,c,A,20,a[31]),c=l(c,d,e,f,s,4,a[32]),f=l(f,c,d,e,v,11,a[33]),e=l(e,f,c,d,z,16,a[34]),d=l(d,e,f,c,C,23,a[35]),c=l(c,d,e,f,w,4,a[36]),f=l(f,c,d,e,r,11,a[37]),e=l(e,f,c,d,u,16,a[38]),d=l(d,e,f,c,y,23,a[39]),c=l(c,d,e,f,B,4,a[40]),f=l(f,c,d,e,h,11,a[41]),e=l(e,f,c,d,q,16,a[42]),d=l(d,e,f,c,t,23,a[43]),c=l(c,d,e,f,x,4,a[44]),f=l(f,c,d,e,A,11,a[45]),e=l(e,f,c,d,D,16,a[46]),d=l(d,e,f,c,j,23,a[47]),c=n(c,d,e,f,h,6,a[48]),f=n(f,c,d,e,u,10,a[49]),e=n(e,f,c,d,
C,15,a[50]),d=n(d,e,f,c,s,21,a[51]),c=n(c,d,e,f,A,6,a[52]),f=n(f,c,d,e,q,10,a[53]),e=n(e,f,c,d,y,15,a[54]),d=n(d,e,f,c,w,21,a[55]),c=n(c,d,e,f,v,6,a[56]),f=n(f,c,d,e,D,10,a[57]),e=n(e,f,c,d,t,15,a[58]),d=n(d,e,f,c,B,21,a[59]),c=n(c,d,e,f,r,6,a[60]),f=n(f,c,d,e,z,10,a[61]),e=n(e,f,c,d,j,15,a[62]),d=n(d,e,f,c,x,21,a[63]);b[0]=b[0]+c|0;b[1]=b[1]+d|0;b[2]=b[2]+e|0;b[3]=b[3]+f|0},_doFinalize:function(){var a=this._data,k=a.words,b=8*this._nDataBytes,h=8*a.sigBytes;k[h>>>5]|=128<<24-h%32;var l=s.floor(b/
4294967296);k[(h+64>>>9<<4)+15]=(l<<8|l>>>24)&16711935|(l<<24|l>>>8)&4278255360;k[(h+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;a.sigBytes=4*(k.length+1);this._process();a=this._hash;k=a.words;for(b=0;4>b;b++)h=k[b],k[b]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;return a},clone:function(){var a=t.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=t._createHelper(q);r.HmacMD5=t._createHmacHelper(q)})(Math);

	


//FUNCTIONS PHP
//*************************************************************	

		


	function getWindowHeight() {
		var windowHeight=0;
		if (typeof(window.innerHeight)=='number') {
			windowHeight=window.innerHeight;
		}
		else {
			if (document.documentElement && document.documentElement.clientHeight) {
					windowHeight = document.documentElement.clientHeight;
			}else {
				if (document.body&&document.body.clientHeight) {
					windowHeight=document.body.clientHeight;
				}
			}
		}
		return windowHeight;
	}
	
	
	function getHeight(moins, mini){
			
			var height = getWindowHeight() - moins;
			
			if(height < mini)
				return mini;
			else
				return height;
	
	}
	
	function getWindowWidth() {
		var windowWidth=0;
		if (typeof(window.innerWidth)=='number') {
			windowWidth=window.innerWidth;
		}
		else {
			if (document.documentElement && document.documentElement.clientWidth) {
					windowWidth = document.documentElement.clientWidth;
			}else {
				if (document.body&&document.body.clientWidth) {
					windowWidth=document.body.clientWidth;
				}
			}
		}
		return windowWidth;
	}
	
	
	function getWidth(pourcent){
		
		return Math.floor((getWindowWidth()) * pourcent/100);
	
	}
	
	
	var deep = 0;
	 
	// affichage des éléments d'un object
	function listObject(object, maxdeep) {
		var decal = '-- ';
		var textObject = "";
		for (var i in object) {
			// création de l'indentation
			var indent = "";
			for (var y = 0; y < deep; y++) indent += decal;
			// nom de la propriété
			textObject += "deep = " + deep + " : " + indent + "<b>" + i + "</b> : ";
			if (typeof(object[i]) == ("object") && deep < maxdeep) {
				deep++;
				textObject += "<br />" + listObject(object[i],  maxdeep);
				deep--;
			}
			else {
				// valeur de la propriété
				textObject += object[i] + "<br />";
			}
		}
		return (textObject);
	}
	 
	// Affichage dans le div des éléments d'un object
	function retourObj (object, deep) {
		var evalObject = eval(object);
		document.getElementById('infoObject').style.display = "";
		document.getElementById('infoObject').innerHTML = (object) ? listObject(evalObject, deep) : "Ce n'est pas un object";
	}
	
	
	
	
	/*-----------------------------------------------------------------------------------*/
	/*	MD5  => md5()
	/*  https://github.com/blueimp/JavaScript-MD5
	/*-----------------------------------------------------------------------------------*/
	!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t),e=(n>>16)+(t>>16)+(r>>16);return e<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[(r+64>>>9<<4)+14]=r;var e,i,a,h,d,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,h=v,d=m,l=o(l,g,v,m,n[e],7,-680876936),m=o(m,l,g,v,n[e+1],12,-389564586),v=o(v,m,l,g,n[e+2],17,606105819),g=o(g,v,m,l,n[e+3],22,-1044525330),l=o(l,g,v,m,n[e+4],7,-176418897),m=o(m,l,g,v,n[e+5],12,1200080426),v=o(v,m,l,g,n[e+6],17,-1473231341),g=o(g,v,m,l,n[e+7],22,-45705983),l=o(l,g,v,m,n[e+8],7,1770035416),m=o(m,l,g,v,n[e+9],12,-1958414417),v=o(v,m,l,g,n[e+10],17,-42063),g=o(g,v,m,l,n[e+11],22,-1990404162),l=o(l,g,v,m,n[e+12],7,1804603682),m=o(m,l,g,v,n[e+13],12,-40341101),v=o(v,m,l,g,n[e+14],17,-1502002290),g=o(g,v,m,l,n[e+15],22,1236535329),l=u(l,g,v,m,n[e+1],5,-165796510),m=u(m,l,g,v,n[e+6],9,-1069501632),v=u(v,m,l,g,n[e+11],14,643717713),g=u(g,v,m,l,n[e],20,-373897302),l=u(l,g,v,m,n[e+5],5,-701558691),m=u(m,l,g,v,n[e+10],9,38016083),v=u(v,m,l,g,n[e+15],14,-660478335),g=u(g,v,m,l,n[e+4],20,-405537848),l=u(l,g,v,m,n[e+9],5,568446438),m=u(m,l,g,v,n[e+14],9,-1019803690),v=u(v,m,l,g,n[e+3],14,-187363961),g=u(g,v,m,l,n[e+8],20,1163531501),l=u(l,g,v,m,n[e+13],5,-1444681467),m=u(m,l,g,v,n[e+2],9,-51403784),v=u(v,m,l,g,n[e+7],14,1735328473),g=u(g,v,m,l,n[e+12],20,-1926607734),l=c(l,g,v,m,n[e+5],4,-378558),m=c(m,l,g,v,n[e+8],11,-2022574463),v=c(v,m,l,g,n[e+11],16,1839030562),g=c(g,v,m,l,n[e+14],23,-35309556),l=c(l,g,v,m,n[e+1],4,-1530992060),m=c(m,l,g,v,n[e+4],11,1272893353),v=c(v,m,l,g,n[e+7],16,-155497632),g=c(g,v,m,l,n[e+10],23,-1094730640),l=c(l,g,v,m,n[e+13],4,681279174),m=c(m,l,g,v,n[e],11,-358537222),v=c(v,m,l,g,n[e+3],16,-722521979),g=c(g,v,m,l,n[e+6],23,76029189),l=c(l,g,v,m,n[e+9],4,-640364487),m=c(m,l,g,v,n[e+12],11,-421815835),v=c(v,m,l,g,n[e+15],16,530742520),g=c(g,v,m,l,n[e+2],23,-995338651),l=f(l,g,v,m,n[e],6,-198630844),m=f(m,l,g,v,n[e+7],10,1126891415),v=f(v,m,l,g,n[e+14],15,-1416354905),g=f(g,v,m,l,n[e+5],21,-57434055),l=f(l,g,v,m,n[e+12],6,1700485571),m=f(m,l,g,v,n[e+3],10,-1894986606),v=f(v,m,l,g,n[e+10],15,-1051523),g=f(g,v,m,l,n[e+1],21,-2054922799),l=f(l,g,v,m,n[e+8],6,1873313359),m=f(m,l,g,v,n[e+15],10,-30611744),v=f(v,m,l,g,n[e+6],15,-1560198380),g=f(g,v,m,l,n[e+13],21,1309151649),l=f(l,g,v,m,n[e+4],6,-145523070),m=f(m,l,g,v,n[e+11],10,-1120210379),v=f(v,m,l,g,n[e+2],15,718787259),g=f(g,v,m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,h),m=t(m,d);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function h(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function d(n){return a(i(h(n),8*n.length))}function l(n,t){var r,e,o=h(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(h(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="0123456789abcdef",o="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),o+=e.charAt(t>>>4&15)+e.charAt(15&t);return o}function v(n){return unescape(encodeURIComponent(n))}function m(n){return d(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);



