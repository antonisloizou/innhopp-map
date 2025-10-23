	/*-----------------------------------------------------------------------------------*/
    /*	CONFIGURATION
    /*-----------------------------------------------------------------------------------*/
	recaptcha_public_key = CAPTCHA_SITE_KEY;
	gmaps_public_key = "xxxxxxxxxxxxxxxxx";
	gmaps_map_id = "xxxxxxxxxxxxxxxxx";


	/*-----------------------------------------------------------------------------------*/
    /*	LOADER
    /*-----------------------------------------------------------------------------------*/
	function init_loader(){
		//$(".site_wrapper").show();$(".preloader").removeClass("preloader");return;
		$(".site_wrapper").show();
		return;
		$(".preloader").lsPreloader({
			backgroundColor:  "#ffffff", 
			//logoImage: SITE+"assets/pict/page/logo.png",
			backgroundImage:  "",   
			backgroundRepeat: "repeat", // repeat | no-repeat | repeat-x | repeat-y
			progressShow:   true, 
			progressColor:    "#000000",
			progressHeight:   "1px", 
			progressPosition: "center", // top | center | bottom
			percentShow:    true,      
			percentFontFamily:  "'baskerville-urw', Georgia, 'Times New Roman', Times, serif", 
			percentFontSize:  "40px",  
			animationComplete:  "slideUp", // fade | hide | slideUp | slideDown | slideLeft | slideRight 
			minimumTime:    0.2,              
			onStart:      function(){
				$(".site_wrapper").show();
				
			}, 
			onComplete:     function(){
				//init_zoom_images();
				//init_equal_heights();
				$(".preloader").removeClass("preloader");
				
			}
		});
	}
	
	/*-----------------------------------------------------------------------------------*/
    /*	SPEED INSIGHTS
    /*-----------------------------------------------------------------------------------*/
	function is_not_speed_insight(){
		if(navigator.userAgent.indexOf("Chrome-Lighthouse") == -1)
			return true;
		else
			return false;
		
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	ESHOP IFRAME
    /*-----------------------------------------------------------------------------------*/
	function init_iframe_eshop(){
		
		//https://github.com/davidjbradshaw/iframe-resizer
		iFrameResize({ 
			log: false 
			,checkOrigin: ["https://shop.flybgd.com", "https://www.flybgd.com", "https://www.airwave.aero", "https://cdn.flybgd.com", "https://cdn2.flybgd.com", "https://cdn3.flybgd.com"]
		}, '#iframe_eshop')
		
		//Pour avoir le click
		window.addEventListener('message', function(e) {
			var $iframe = jQuery("#iframe_eshop");
			var eventName = e.data[0];
			var data = e.data[1];

			switch(eventName) {
				
				case 'iframe_unload':
					$("html, body").animate({ scrollTop: 0 }, 0);
				break;
			}
		}, false);
		
		/*window.addEventListener('message', function(e) {
			var $iframe = jQuery("#iframe_eshop");
			var eventName = e.data[0];
			var data = e.data[1];

			switch(eventName) {
				case 'set_height':
					$iframe.height(data);
				break;
				
				case 'iframe_change':
					$("html, body").animate({ scrollTop: 0 }, 0);
				break;
			}
		}, false);*/

	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	DATA GTM
    /*-----------------------------------------------------------------------------------*/
	function get_gtm_value(id){
		var value;
		var obj_gtm = $("#data-gtm-"+id);
		if(obj_gtm.length){
			value = obj_gtm.val();
			
			if(value == "")
				value = obj_gtm.text();	
		}
		
		if(value == "undefined" || value === undefined)
		   value = "";	
				
		//console.log(id+ " : "+value);
		return value;
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	FB
    /*-----------------------------------------------------------------------------------*/
	fb_pixel_id = "441409130301115";
	fb_pixel_tries = 20;
	fb_pixel_timeout = 1200;
	fb_pixel_timeout_retry = 200;
	
	fb_pixel_tracker_sent_findlocation = false;
	
	function fb_init_tracker(timeout, tries){

		if(is_not_speed_insight()){
			
			if(typeof(timeout) == 'undefined' || timeout === null)
				timeout = fb_pixel_timeout;
			
			if(typeof(tries) == 'undefined' || tries === null)
				tries = fb_pixel_tries;
			
			window.setTimeout(function(){	
				if (typeof fbq == 'undefined') {
					
					console.log("load : FB Pixel script");
		
					!function(f,b,e,v,n,t,s)
					{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
					n.callMethod.apply(n,arguments):n.queue.push(arguments)};
					if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
					n.queue=[];t=b.createElement(e);t.async=!0;
					t.src=v;s=b.getElementsByTagName(e)[0];
					s.parentNode.insertBefore(t,s)}(window, document,'script',
					'https://connect.facebook.net/en_US/fbevents.js');
					
					$("body").append('<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id='+fb_pixel_id+'&ev=PageView&noscript=1"/></noscript>');
			
					console.log("load : FB Pixel ("+timeout+")");			
					fbq('init', fb_pixel_id);
			
					if (typeof window.fbq_pageview == 'undefined') {
						fbq('track', 'PageView');
						window.fbq_pageview = 1;
					}
					
					if (typeof window.fbq_viewcontent == 'undefined') {
						tracker_fb_event_product();
						window.fbq_viewcontent = 1;
					}
				}else if (typeof fbq == 'function' && typeof window.fbq_pageview == 'undefined') {
					console.log("load : FB Pixel ("+timeout+")");
					fbq('init', fb_pixel_id);
					fbq('track', 'PageView');
					tracker_fb_event_product();
				}else{
					if (tries > 0) {
						setTimeout(function() { fb_init_tracker(tries-1); }, fb_pixel_timeout_retry);
					} else {
						console.log('FB Pixel : Failed to load the Facebook Pixel');
					}
				}
			}, timeout);
		}
	}
	
	function tracker_fb_event_product(){
		
		var id = get_gtm_value("product-id");
		
		if (id) {
			var values = {
            	content_name : get_gtm_value("product-name"),
                content_ids : [id],
                content_type: 'product'       
            };
				
			tracker_fb_event('ViewContent', values);
		}
	}
	
	function tracker_fb_event(type, values, max_tries){
		
		if(is_not_speed_insight()){
			
			if(type == "FindLocation" && fb_pixel_tracker_sent_findlocation)
				return false;
			
			if(typeof(max_tries) == 'undefined' || max_tries === null)
				max_tries = fb_pixel_tries;
				
			if (typeof fbq != 'function') {
				setTimeout(function(){tracker_fb_event(type, values, max_tries-1)}, fb_pixel_timeout_retry + 100);
			}else{
				
				if(typeof(values) === 'undefined')	{	
					console.log("FB Pixel : "+type);
					fbq('track', type);
				}else{
					console.log("FB Pixel : "+type);
					console.log(values);
					fbq('track', type, values);
				}
				
				if(type == "FindLocation")
					fb_pixel_tracker_sent_findlocation = true;
			}
		}
		
		
		
	}
	
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	DETAILED VIEW
    /*-----------------------------------------------------------------------------------*/
	function init_toggle_detailed_view(){
		$('.switcher_bloc input[name="toggle"]').on("change", function() {		
			do_toggle_detailed_view();
		});	
		
		//do_toggle_detailed_view();
		change_toggle_detailed_view();
	}
	
	function do_toggle_detailed_view(){
		var val = $('.switcher_bloc input[name="toggle"]:checked').val();
		//console.log(val);
		if(val == "detailed"){
			$('.detailed_view').slideDown();
			init_donuts_detailed();
		}else{
			$('.detailed_view').slideUp();
		}
	}
	
	function change_toggle_detailed_view(){		
		var val = $('.switcher_bloc input[name="toggle"]:checked').val();
		
		//console.log(val);
		if(IS_MOBILE){
			
		}else{
			
			if(val == "detailed"){
				//$('.switcher_bloc input[name="toggle"]').filter('[value=summary]').prop('checked', true);
				//$('.switcher_bloc input[name="toggle"]').filter('[value=detailed]').prop('checked', false);
			}else{
				$('.switcher_bloc input[name="toggle"]').filter('[value=summary]').prop('checked', false);
				$('.switcher_bloc input[name="toggle"]').filter('[value=detailed]').prop('checked', true);
			}	
		}

		//console.log(val);
		
		do_toggle_detailed_view();
	}
	
	is_active_donuts = false;
	
	function init_donuts_detailed(){
		
		if(is_active_donuts)
			return false;
		
		is_active_donuts = true;	
		$('.donuts_inline').circliful({
			animationStep: 5
			,animation: 1
			,foregroundBorderWidth: 15
			,backgroundBorderWidth: 5
			,backgroundColor: "#c5c5c5"
			,foregroundColor: "#c5004f"
			,fillColor: "none"
			,fontColor: "#000"
			,target: 0
			,start: 0
			,showPercent: 1
			,percentageTextSize: 0
			,textBelow :false
			,textStyle : 'font-size:20px; font-weight:400; text-transform:uppercase;'
			,textY: 200


			//,pointSize : 1
			//,halfCircle: 1
		});
	}
	
	
		
		
	
	 /*-----------------------------------------------------------------------------------*/
    /*	MENU
    /*-----------------------------------------------------------------------------------*/
	
	var bodyEl = $("body"),
		content = $('.site_wrapper'),
		open_btn = $('#menu'),
		is_menu_open = false;

	function init_menu() {
				
		init_menu_events();
		
	}

	function init_menu_events() {
		open_btn.click(function(e) {		
			toggle_menu();
			e.stopPropagation();
			return false;
		});

		$('.btn_close_menu').click(function(e) {
			toggle_menu();
		});

		content.click(function(e) {		
			var target = e.target;
			if( is_menu_open && target !== open_btn ) {
				toggle_menu();
			}
		});	
	}
	function toggle_menu() {		
		if( is_menu_open ){
			console.log("close menu");
			bodyEl.removeClass('menu_open');
			bodyEl.addClass('menu_close');
		}else{
			
			console.log("open menu");
			bodyEl.removeClass('menu_close');
			bodyEl.addClass('menu_open');
		}
	
		is_menu_open = !is_menu_open;
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	BG IMAGE
    /*-----------------------------------------------------------------------------------*/
	function init_bg_img(){
		
		$('.bg_image').each(function () {
            var $this = $(this);

            if ($this.length) {
                $this.css({
                    'background-image': 'url(' + $this.data('src')+ ')'/*,
                    'background-position': $this.data('bg-position'),
                    'background-attachment': $this.data('bg-attachment'),
                    'background-repeat': $this.data('bg-repeat'),
                    'background-size': $this.data('bg-size')*/
                });
            }
        });
		
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	LOGO GLIDERS MOTORS
    /*-----------------------------------------------------------------------------------*/
	function init_logo_bgd(){
		
		var my_el = $('.logo-paramotors');
		
		var initial = my_el.attr("src");
		
		my_el.hover(function(){
		  	$(this).attr("src", initial.replace('.svg', '-on.svg'));
		}, function(){
		  	$(this).attr("src", initial);
		});
           
		
	}
	
	/*-----------------------------------------------------------------------------------*/
    /*	COOKIE LAW
    /*-----------------------------------------------------------------------------------*/
	
	function init_cookie_law(){
		
		$.cookieBar({
			message: _t("Our website uses cookies to offer a better user experience and we consider that you are accepting their use if you keep browsing the website.", "cookies"),
			acceptButton: true,
			acceptText: _t("I understand", "cookies"),
			acceptFunction: null,
			declineButton: false,
			declineText: _t("Disable Cookies", "cookies"),
			declineFunction: null,
			policyButton: false,
			policyText: _t("Privacy Policy", "cookies"),
			policyURL: PAGE_PRIVACY,
			autoEnable: true,
			acceptOnContinue: true,
			acceptOnScroll: false,
			acceptAnyClick: false,
			expireDays: 365,
			renewOnVisit: false,
			forceShow: false,
			effect: 'slide',
			element: 'body',
			append: false,
			fixed: true,
			bottom: true,
			zindex: '100000'/*,
			domain: 'www.example.com',
			referrer: 'www.example.com'*/
		}); 
	
	}
	
	/*-----------------------------------------------------------------------------------*/
    /*	SCROLL TO
    /*-----------------------------------------------------------------------------------*/
	function init_scroll(){
		
		$('.scroll_to').on('click', function() {
			var page = $(this).attr('href');
			var speed = 750; 
			$('html, body').animate( { scrollTop: $(page).offset().top }, speed );
			return false;
		});
		
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	PREVIOUS MODEL
    /*-----------------------------------------------------------------------------------*/
	function init_previous_model(){
		
		$('#previous_model_open').on('click', function() {
			
			$('#liste_produits_old').toggle(500, "swing");
			return false;
			
			/*$("#previous_model_open").stop().fadeOut(function() {
				$('#liste_produits_old').stop().fadeIn();
			});
				
			return false;*/
		});
		
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	3D
    /*-----------------------------------------------------------------------------------*/
	var viewerIframe = null;
	var viewerActive = false;
	var viewerConfiguration = false;
			
	function init_animation_product(){
		
		if ($('iframe.is_3d').length) {
			var id_frame = $("iframe.is_3d").attr('id');
			document.getElementById(id_frame).onload = function() {
				viewerIframe = document.getElementById(id_frame).contentWindow;
				window.removeEventListener('message', animation_viewerEventListener ,false);
				viewerIframe.postMessage({action : 'registerCallback'}, '*');
				window.addEventListener('message', animation_viewerEventListener, false);
				viewerIframe.postMessage({action:'getViewerState'}, '*');	
			};
		}
	}
	
	var animation_viewerEventListener =  function(event){
		if(event.data && event.data.action == 'onStateChange'){
			//console.log(event.data);
			if(event.data.state.viewerState == 'loaded' || event.data.state.viewerState == 'fallbackloaded'){
				console.log("viewerActive : true");
				viewerActive = true;
				
				if(viewerConfiguration != false){
					console.log("switchConfiguration : "+viewerConfiguration);
					viewerIframe.postMessage({action : 'applyPreset', presetName : viewerConfiguration},'*');
				}
			}
		}
		if(event.data && event.data.action == 'onError'){
			console.log("viewerEventListener : error");
			console.log(event);
		}
	};

	var animation_switchConfiguration = function(configurationName){
		if(viewerActive && viewerConfiguration != configurationName){
			console.log("switchConfiguration : "+configurationName);
			viewerIframe.postMessage({action : 'applyPreset', presetName : configurationName},'*');
			viewerConfiguration = configurationName;
		};
	};
	
	
	
	if ($('iframe.is_3d').length && viewerActive == false) {
		$( ".panel_3d_options .panel_3d_options_selector" ).on('click', function(e) {
			if(viewerActive == false){
				console.log("viewerActive : activate");
				
				var id_frame = $("iframe.is_3d").attr('id');

				var viewerIframe_pre = document.getElementById(id_frame).contentWindow;

				viewerIframe_pre.postMessage({
					action : 'startViewer'
				},'*');
				
				var couleur = $(this).data("couleur");
				if(couleur){
					console.log("viewerActive : couleur : "+couleur);
					viewerConfiguration = couleur;
				}
				
			}
		});
	}
	
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	PHOTO PRODUCT Switch
    /*-----------------------------------------------------------------------------------*/
	
			
	function switch_product_color(id_color){
		
		if ($('#main_picture_sel_'+id_color).length) {
			$(".main_picture_sel:visible").stop().fadeOut(function() {
				$(".main_picture_sel").removeClass("active");
				$('#main_picture_sel_'+id_color).stop().fadeIn();
			});
		}
	}
	

	
	/*-----------------------------------------------------------------------------------*/
    /*	FILTERS
    /*-----------------------------------------------------------------------------------*/
	function init_filters(){
		
		$( "ul.filters li" ).on('click', function(e) {
			
			e.preventDefault();
			var li = $(this);
			var a = li.find("a");
			var filter = a.attr('data-filter');
			
			if(a.hasClass("active"))
				a.removeClass('active');
			else
				a.addClass('active');
			
			a.blur();
			
			//console.log(filter);
			
			
			var produits = ".liste_produits:not(.no_filter) .liste_produit";
			
			if($(".filters a.active").length){
				
				
				$(produits).fadeOut();
				
				var case_click = $(this).find('a');
				if(case_click.hasClass("filtre_alone")){
					$('html, body').animate( { scrollTop: ($(".liste_produits").offset().top - 200) }, 1500 );
				}
				
				var classes = "";
				var classes_ou = "";
				$(".filters a.active").each(function() {
					
					if($(this).hasClass("filtre_or")){
						if(classes_ou == "")
							classes_ou = "."+$(this).attr('data-filter');
						else
							classes_ou = classes_ou + "." +$(this).attr('data-filter');
							
					}else if($(this).hasClass("filtre_alone")){

						
						if($(this).attr('data-filter') == filter){
							classes = produits+"."+$(this).attr('data-filter');
						}else{
							$(this).removeClass('active');
						}
						
						
	
					}else{
						if(classes == "")
							classes = produits+"."+$(this).attr('data-filter');
						else
							classes = classes + ", "+produits+"." +$(this).attr('data-filter');
					}
						
				});
				
				//console.log(classes);
				//console.log(classes_ou);
				
				if(classes == "")
					classes = produits;
					
				if(classes_ou == "")
					$(classes).fadeIn(400, update_lazyload);
				else
					$(classes).filter(classes_ou).fadeIn(400, update_lazyload);
									
											
				if($(".reset_filters").is(':hidden'))
					$(".reset_filters").stop().fadeIn();
						
			}else{
				$(".liste_produits .liste_produit").stop().fadeIn(400, update_lazyload);
				$(".reset_filters").stop().fadeOut();
			}
			
			
			//myLazyLoad.update();

			
		});
		
		
		if($("ul.filters").length){
			$("ul.filters").parent().append('<div class="reset_filters"><a href="#filter" class="btn btn-primary btn-sm">'+_t("Reset filters", "all")+'</a></div>');
		}
		
		$( ".reset_filters a" ).on('click', function(e) {
			e.preventDefault();
			
			var a = $(this);
			a.blur();

			$("ul.filters li a").removeClass('active');
			
			$(".liste_produits .liste_produit").stop().fadeIn();
			
			$(".reset_filters").stop().fadeOut();
										
		});
		
	}
	
	
	
	
	

	
	/*-----------------------------------------------------------------------------------*/
    /*	FEATURES
    /*-----------------------------------------------------------------------------------*/
	function init_features(){

		if ($('.btn-features').length) {
			$('.btn-features').on('click mouseover', function(event) {
				
				event.preventDefault();
				
				var e = $(this).data("feature-id");
				 
  				$(".features-picture .btn-features").removeClass("active");
				//$(".feature .feature-title").removeClass("active");
				
				$(this).addClass("active");
			
				//$('.feature[data-feature-id="' + e + '"] .feature-title').addClass("active");
				 
				$("#features .feature:visible").stop().fadeOut(function() {
    				$("#features .feature").removeClass("active");
					$('#features .feature[data-feature-id="' + e + '"]').stop().fadeIn();
				});
			});
			
			
			$('.btn-features-top').on('click', function(event) {
				
				event.preventDefault();
				
				var e = $(this).data("feature-id");
				 
  				$(".features-picture .btn-features").removeClass("active");
				//$(".feature .feature-title").removeClass("active");
				
				$("#btn-features-"+e).addClass("active");
			
				//$('.feature[data-feature-id="' + e + '"] .feature-title').addClass("active");
				 
				$("#features .feature:visible").stop().fadeOut(function() {
    				$("#features .feature").removeClass("active");
					$('#features .feature[data-feature-id="' + e + '"]').stop().fadeIn();
				});
			});
		}
	}
	
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	SLIDER
    /*-----------------------------------------------------------------------------------*/
	function init_slider_line(){

		if ($('#flying_level').length) {
			$("#flying_level").slider({ id: "flying_level"});
		}
		
		if ($('.flying_certification').length) {
			$(".flying_certification").slider();
		}
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	DONUTS
    /*-----------------------------------------------------------------------------------*/
	function init_donuts(){

		$('.mydonuts').circliful({
			animationStep: 5
			,animation: 1
			,foregroundBorderWidth: 15
			,backgroundBorderWidth: 5
			,backgroundColor: "#c5c5c5"
			,foregroundColor: "#c5004f"
			,fillColor: "none"
			,fontColor: "#000"
			,target: 0
			,start: 0
			,showPercent: 1
			,percentageTextSize: 0
			,textBelow :false
			,textStyle : 'font-size:20px; font-weight:400; text-transform:uppercase;'
			,textY: 200



			//,pointSize : 1
			//,halfCircle: 1
		});


//data-dimension="250" data-text="35%" data-info="New Clients" data-width="30" data-fontsize="38"

	}
	

	
	
	
			
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	GO TO TOP
    /*-----------------------------------------------------------------------------------*/
	function init_to_top(){

		$.scrollUp({
			scrollName: 'scrollUp',
			// Element ID
			scrollDistance: 300,
			// Distance from top/bottom before showing element (px)
			scrollFrom: 'top',
			// 'top' or 'bottom'
			scrollSpeed: 300,
			// Speed back to top (ms)
			easingType: 'linear',
			// Scroll to top easing (see http://easings.net/)
			animation: 'slide',
			// Fade, slide, none
			animationInSpeed: 200,
			// Animation in speed (ms)
			animationOutSpeed: 200,
			// Animation out speed (ms)
			scrollText: '<span class="btn btn-square"><i class="budicon-arrow-up"></i></span>',
			// Text for element, can contain HTML
			scrollTitle: false,
			// Set a custom <a> title if required. Defaults to scrollText
			scrollImg: false,
			// Set true to use image
			activeOverlay: false,
			// Set CSS color to display scrollUp active point, e.g '#00FFFF'
			zIndex: 1001 // Z-Index for the overlay
		});
	}
	
	

	/*-----------------------------------------------------------------------------------*/
    /*	Lazyload
    /*-----------------------------------------------------------------------------------*/
	
	var myLazyLoad;
	
	function init_lazyload(){	
			
		myLazyLoad = new LazyLoad({
			elements_selector: ".lazy"
			,threshold : 800
			//,load_delay: 300
		});
	}
	
	function update_lazyload(){		
		myLazyLoad.update();
	}
	

	

 	/*-----------------------------------------------------------------------------------*/
    /*	PARALLAX IMAGES
    /*-----------------------------------------------------------------------------------*/
	function init_parallax(){
		$(".parallax").each(function( index ) {
			$(this).find("img").hide();
			var image_url = $(this).find("img").attr('src');
			//console.log(image_url);
			$(this).css("background-image", 'url("'+image_url+'")');
		});
		
		/*$(".content_index .choix .image_bg").each(function( index ) {
			$(this).find("img").hide();
			var image_url = $(this).find("img").attr('src');
			//console.log(image_url);
			$(this).css("background-image", 'url("'+image_url+'")');
		});*/
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	IS PC MOBILE
    /*-----------------------------------------------------------------------------------*/
	function init_pc_mobile(){
		if(IS_MOBILE){
			$('body').addClass('is_mobile');
			$('body').removeClass('is_pc');
		}else{
			$('body').addClass('is_pc');
			$('body').removeClass('is_mobile');
		}
	}
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	TRACK ACTION
    /*-----------------------------------------------------------------------------------*/
	function init_track_action(){
		
		$('.track_call').on('click', function() {
			try {
				gtag('event', 'contact_call', {'value' : '10'});
				tracker_fb_event('Contact');
			}catch(err) {console.log(err.message);}
		});
		
		$('.track_email').on('click', function() {
			try {
				gtag('event', 'contact_mailto', {'value' : '5'});
				tracker_fb_event('Contact');
			}catch(err) {console.log(err.message);}
		});
		
		var filter_one = false;
		$('.track_filter_gliders').on('click', function() {
			
			if(filter_one == false){
				try {
					gtag('event', 'filter_use');
					filter_one = true;
				}catch(err) {console.log(err.message);}
			}
			
			
			try {
				gtag('event', 'filter_click', {'gliders' : $(this).text()});
				filter_one = true;
			}catch(err) {console.log(err.message);}
		});

	}
	
	

	/*-----------------------------------------------------------------------------------*/
    /*	IE
    /*-----------------------------------------------------------------------------------*/
	

	function init_ie_compatible(){
		
		
		var user_agent = navigator.userAgent;
		
		//Index object-fit compatible
		if (document.documentMode || /Edge/.test(navigator.userAgent) || /MSIE/.test(navigator.userAgent)) {
			
			console.log(user_agent);
			
			$("body").addClass("is_ie");

			
			jQuery('.object-fit-img, .slider .carousel-item img, .background_header img').each(function(){
				
				var t = jQuery(this),
					s = 'url(' + t.attr('src') + ')',
					p = t.parent(),
					d = jQuery('<div class="object-fit-div"></div>');

				p.append(d);
				d.css({
					'height'                : t.parent().css('height'),
					'background-size'       : 'cover',
					'background-repeat'     : 'no-repeat',
					'background-position'   : '50% 50%',
					'background-image'      : s
				});
				t.hide();
			});
		}
	}
	
	
	function refresh_ie_compatible(){
		
		
		var user_agent = navigator.userAgent;
		
		//Index object-fit compatible
		if (document.documentMode || /Edge/.test(navigator.userAgent) || /MSIE/.test(navigator.userAgent)) {

			jQuery('.object-fit-div').each(function(){
				var t = jQuery(this);
				t.css({'height': t.parent().css('height')});
			});
		}
	}
	
	
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	CONTACT PAGE
    /*-----------------------------------------------------------------------------------*/
	
	
	
	/*function geocodeCountry(country, geocoder, resultsMap) {
		
		geocoder.geocode({'address': country}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				
				resultsMap.setCenter(results[0].geometry.location);
				resultsMap.fitBounds(results[0].geometry.viewport);
				//resultsMap.setZoom(resultsMap.getZoom()+1); 
	
			}else{
				console.log('This country has not been found (' + status +') : '+address);
				//alert('Geocode was not successful for the following reason: ' + status);
				
			}
	
		});
	}*/
	
	//marker_groups = Array("dearler", "service", "importer", "dealer_service");
	
	function initialize_map_distributors() {

		var myOptions = {
		  	zoom: 3
			,maxZoom: 15
			,minZoom: 3
			,center: new google.maps.LatLng(23, 10)
		  	,mapTypeId: google.maps.MapTypeId.ROADMAP 
		  	,disableDefaultUI: false
			,mapTypeControl: false
			,draggable: true
			,disableDoubleClickZoom: false
			,scrollwheel: true
			,styles: [
				 {featureType:"landscape",stylers:[{saturation:-100},{lightness:25},{visibility:"off"}]}
				,{featureType:"poi",stylers:[{saturation:-100},{lightness:51},{visibility:"off"}]}
				,{featureType:"road.highway",stylers:[{saturation:-100},{visibility:"simplified"}]}
				,{featureType:"road.arterial",stylers:[{saturation:-100},{lightness:30},{visibility:"simplified"}]}
				,{featureType:"road.local",stylers:[{saturation:-100},{lightness:0},{visibility:"simplified"}]}
				,{featureType:"transit",stylers:[{saturation:-100},{visibility:"simplified"}]}
				,{featureType:"administrative.country", elementType:"labels",stylers:[{visibility:"on"}]}
				,{featureType:"administrative.country", elementType:"geometry.stroke",stylers:[{visibility:"on"}, {"weight":"2.00"}]}
				,{featureType:"administrative.province",stylers:[{visibility:"off"}]}
				,{featureType:"administrative.locality",stylers:[{visibility:"on"}]}
				,{featureType:"administrative.neighborhood",stylers:[{visibility:"off"}]}
				,{featureType:"water",elementType:"labels",stylers:[{visibility:"on"},{lightness:-25},{saturation:-100}]}
				,{featureType:"water",elementType:"geometry",stylers:[{hue:"#ffff00"},{lightness:-25},{saturation:-97}]}
			]
		};
		
		var map = new google.maps.Map(document.getElementById('map_distributors'), myOptions);

		var geocoder = new google.maps.Geocoder();
				
		var markers = distributors.map(function(data, i) {

			var adresse_complete = "";
			if(data.adresse)
				adresse_complete = data.adresse;
				
			if(data.code_postal || data.ville)
				adresse_complete = adresse_complete+',';
				
			if(data.code_postal)
				adresse_complete = adresse_complete+' '+data.code_postal;
			
			if(data.ville)
				adresse_complete = adresse_complete+' '+data.ville;
				
			if(data.pays)
				adresse_complete = adresse_complete+', '+data.pays;
			
			if(data.latitude != "" && data.longitude != ""){
								
				if(data.is_dealer == 1 && data.is_service == 1){
					var categorie = "#"+_t("Distributor", "distributors") + " "+ "#"+_t("Service Center", "distributors")+ " ";
					var icon = SITE+"assets/pict/icon/map/map-pin-mixte.svg";
				}else if(data.is_dealer == 0 && data.is_service == 1){
					var categorie = "#"+_t("Service Center", "distributors")+ " ";
					var icon = SITE+"assets/pict/icon/map/map-pin-bleu.svg";						
				}else if(data.is_dealer == 1 && data.is_service == 0){
					var categorie = "#"+_t("Distributor", "distributors")+ " ";
					var icon = SITE+"assets/pict/icon/map/map-pin.svg";
				}
				
				if(data.is_importer == 1){
					var categorie = categorie + "#"+_t("Importer", "distributors")+ " ";
					var icon = SITE+"assets/pict/icon/map/map-pin-orange.svg";
				}
				
				if(icon != ""){

					var marker =  new google.maps.Marker({
						position: new google.maps.LatLng(data.latitude, data.longitude)
						,icon: new google.maps.MarkerImage(icon, null, null, null, new google.maps.Size(22,28)),
					});
					
					if(data.is_main_point == 1){
						
						var contentString = '<div class="window_map">'+
							'<h3 class="couleur">'+_t("BGD Sales", "distributors")+'</h3>'+
							'<h4 class="h2">'+data.pays+'</h4>'+
							'<p>'+_t("For all BGD Sales in this country, please contact", "distributors")+' <a href="mailto:sales@flybgd.com" class="link">sales@flybgd.com</a></p>'
							'</div>';
					}else{
						
						var contentString = '<div class="window_map">'+
							'<h3 class="couleur">'+data.societe+'</h3>'+
							'<h4 class="h2">'+categorie+'</h4>'+
							'<h4>'+data.contact+'</h4>'+
							'<h4>'+data.telephone+'</h4>'+
							'<br><p>'+adresse_complete+'</p>'+
							'<br><p><a href="'+data.site+'" class="link" target="_blank" rel="nofollow">'+data.site+'</a></p>'+
							'</div>';
					}
					//console.log(marker);
				
					var infowindow = new google.maps.InfoWindow({
					  content: contentString
					});
		
					lastWindow=null;
					
					function open_window(e) {
					  	if (lastWindow) lastWindow.close();
						infowindow.open(map, marker);
						lastWindow=infowindow;
						
						tracker_fb_event('FindLocation');
					}

					marker.addListener('click', open_window, false);
					marker.addListener('mouseover', open_window, false);
				}

			}else{
			
				if(adresse_complete == ""){
					console.log('This entry do not have address (' + data.id +' : '+adresse_complete+')');
				}else{
					setTimeout(function(){
					
						geocoder.geocode({'address': adresse_complete}, function(results, status) {
							if (status === google.maps.GeocoderStatus.OK) {
								console.log('GPS sent : '+results[0].geometry.location.lat()+" / "+results[0].geometry.location.lng());	
								$.ajax({
									type: "POST"
									,data: {action: 'add_gps', lat: results[0].geometry.location.lat(), long: results[0].geometry.location.lng(), id_dealer: data.id, token: data.token}
									,url: SITE+'outils/ajax.php'
									,success: function(msg) {}
									,error: function() {}
								});
				
							}else{
								console.log('This entry has not been found (' + data.id +' : ' + status +') : '+data.adresse_complete);	
							}
					
						});
					}, 1000);
				}
			}

			return marker;
        });
				
		var markerCluster = new MarkerClusterer(map, markers,{
			imagePath: SITE+"assets/pict/icon/map/cluster/m"
			,maxZoom: 6
    		,averageCenter: true
		});		
		
		// Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            map.setCenter(pos);
			map.setZoom(6);
          }, function() {
            //handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          //handleLocationError(false, infoWindow, map.getCenter());
        }
		
		var icons = {
          	importer: {
            	name: _t("Importer", "distributors")
            	,icon: SITE+"assets/pict/icon/map/map-pin-orange.svg"
				//,type: "importer"
          	}
		  	,dealer: {
            	name: _t("Distributor", "distributors")
            	,icon: SITE+"assets/pict/icon/map/map-pin.svg"
				//,type: "dealer"
          	}
          	,service: {
            	name: _t("Service Center", "distributors")
            	,icon: SITE+"assets/pict/icon/map/map-pin-bleu.svg"
				//,type: "service"
          	}
          	,dealer_service: {
            	name: _t("Distributor", "distributors") + " & "+ _t("Service Center", "distributors")
            	,icon: SITE+"assets/pict/icon/map/map-pin-mixte.svg"
				//,type: "dealer_service"
          }
		  
        };
		
		var legend = document.getElementById('legend');
        for (var key in icons) {
          	var type = icons[key];
          	var name = type.name;
          	var icon = type.icon;
          	var div = document.createElement('div');
			
			div.innerHTML = '<img src="' + icon + '"> ' + name;
	
          	legend.appendChild(div);
        }

        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
		
		var search_html = document.getElementById('distributor_countries');
        map.controls[google.maps.ControlPosition.LEFT_TOP].push(search_html);
		
		
		
		
		/*-----------------------------------------------------------------------------------*/
		/*	FORMULAIRE RECHERCHE DISTRIBUTEURS
		/*-----------------------------------------------------------------------------------*/
	
		$('#js__distributor').validate({
			rules: {
				search: {required: true}
			}
			,messages: {
				search: {required: _t("Enter a city or a country", "validation")}
			}
			,errorPlacement: function(error, element) {
				var placement = $(element).data('error');
				if (placement) {$(placement).append(error)} else {error.insertAfter(element); }
			}
			,submitHandler: function(form) {
				
				$('.form-process').fadeIn();
													
				var form_id = $('.formulaire form').attr('id');
				grecaptcha.ready(function() {
					grecaptcha.execute('6LcWBY8UAAAAALGLt5eO-fhWM0-74teZ__tufezS', {action: form_id}).then(function(token) {
						$('#g-recaptcha-response').val(token);
						
						var adresse_complete = $(form).find('input[name="address"]').val();
						var geocoder = new google.maps.Geocoder();
						
						setTimeout(function(){
							geocoder.geocode({'address': adresse_complete}, function(results, status) {
								
								$('.form-process').fadeOut();
								
								if (status === google.maps.GeocoderStatus.OK) {
									console.log('GPS sent : '+results[0].geometry.location.lat()+" / "+results[0].geometry.location.lng());	
									
									var pos_search = {
									  lat: results[0].geometry.location.lat(),
									  lng: results[0].geometry.location.lng()
									};
						
									map.setCenter(pos_search);
									map.setZoom(7);
									
									try {
										//gtag('event', 'click', {'event_category' : 'Distributor form', 'event_label' : 'Distributor form request found'});
										gtag('event', 'distributor_form', {'libelle' : 'found'});
										tracker_fb_event('FindLocation');
									}catch(err) {console.log(err.message);}
									
									$('#distributor_search_submit').blur();
					
								}else{
									var margin_left = $("#distributor_search").css("marginLeft");
									$("#distributor_search").animate(
										{marginLeft: '100px'}
										, 150
										,function(){
											$("#distributor_search").animate(
												{marginLeft: '-20px'}
												,150
												,function(){
													$("#distributor_search").animate({marginLeft: margin_left});
												}
											);
										}	
									);
									
									try {
										//gtag('event', 'click', {'event_category' : 'Distributor form', 'event_label' : 'Distributor form request no found'});
										gtag('event', 'distributor_form', {'libelle' : 'not found'});
										tracker_fb_event('FindLocation');
									}catch(err) {console.log(err.message);}
									
									console.log('This entry has not been found (' + status +') : '+adresse_complete);	
								}
						
							});
						}, 100);
						
					});
				});
			}
		});

	}
	

	//	MAP: infowindow (open) 20160601	REVIEW da rivedere per cluser
	function openInfowindow(uuid){ 
	
		dl_app.infowindow_visible=true; dl_app.env.show_infowindow=true;
	
		dl_app.env.active_zoom_level = dl_app.map.getZoom();
		consoleLog('Infowindow opens on..: '+uuid);
		$('.store-locator').removeClass('force-cluster-offset').removeClass('force-pin-offset');	
		var marker=dl_app.markers[uuid];
		var force_zoom_center=marker.getPosition();//new 
		
		if(marker !== undefined){
			location.hash='dealer-details';
			var force_zoom=false;
			var cluster=dl_app.clusters_list[marker.cluster_index];
			consoleLog('cluster_index:'+marker.cluster_index);
	
	
			if(cluster !== undefined){	
				consoleLog('I\'m not undefined');		
				if(cluster.markers_.length==1){
					consoleLog('may be a simple marker ['+marker.cluster_index+']');
					force_zoom_center=cluster.center_;
			
				}
				else{
					if(dl_app.env.active_zoom_level>=15){
					//	nothing to do here
					
					}
					else{
						$('.store-locator').addClass('force-cluster-offset');	
						force_zoom=true;
					}
					
					
				}
			} 
			else {
				consoleLog('Cluster is undefined');
				
			}
			
			var dataItem = dl_app.datasources.retailers.get(uuid); 
			var template = kendo.template($("#infowindow-template").html());
			var content = template(dataItem);
			
			dl_app.infowindow.setContent(content);	
			dl_app.infowindow_visible=true;
			
			if(force_zoom) {
					
				var info = new google.maps.MVCObject;
	
					info.set('position', cluster.center_);
	
					dl_app.infowindow.open(dl_app.map,info);
					$('.infowindow-container').addClass('cluster-option');
					force_zoom=false;
			}
			else {
				dl_app.infowindow.open(dl_app.map,marker); $('.infowindow-container').addClass('cluster-option');
				}
	
			
	
			setTimeout(function() {
				$('.infowindow-container').addClass('mark-as-highlighted');
			}, 250);			
	
			$('#action-call a').attr('href','tel:'+dataItem.address.phone1);
			
			var mobile_template = kendo.template($("#mobile-infowindow-template").html());
			var mobile_content = mobile_template(dataItem);
	
	
			$('#mobile-info-hook div').html(mobile_content);
		
			$('#mobile-infowindow').addClass('show-panel');
			$('#search-header').addClass('hidden-xs');
			
	
			
			displayActivityPanel(false);
		}
		else {
			// nothing to do here
			
		}
		
	}
	
	function hideInfowindow(bool){
		
		if(bool){
			$('.infowindow-container').addClass('hidden');
			}
		else {
			$('.infowindow-container').removeClass('hidden');
			$('#sort-modal-hook').removeClass('force-to-hidden');
		}		
	}
	
	//	MAP: infowindow (close) 20160601
	function closeInfowindow(){ 
	
		highlightSelected(null);
		$('#search-header').removeClass('hidden-xs');
		$('#mobile-infowindow').removeClass('show-panel');
		$('#sort-modal-hook').removeClass('force-to-hidden');
		$('#listview-hook ul li').removeClass('highlighted');
		
		$('#sort-modal-hook').removeClass('force-hide-on-mobile');
		$('#search-header').removeClass('force-low-z-index');
	
		if(isDirectionsPanelOpen()){
			setSearchPanelOpen();
			$('.show-on-rounting').removeClass('hidden');
			$('.show-on-directions-list').addClass('hidden');				
			$('.show-on-directions-panel').removeClass('hidden'); 
			
			closeDirectionsPanel();
		}
		else{
		if(isSearchPanelOpen())location.hash='search';	
		}
	
		dl_app.infowindow_visible=false;
		dl_app.infowindow.close(); dl_app.env.infowindow_change=true;
		$('#listview-hook ul .dealer-schema').removeClass('k-state-selected');
		displayActivityPanel(false);
	
	}


	
	function initialize_map_api() {
		
		if($('#map_distributors').length){
			
			var key = "AIzaSyC9uYGv0NP6CabjO-26faNrXTpj-a49bW8";
			
			if($('#map_distributors').length)
				var callback = "initialize_map_distributors";
				
				
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://maps.google.com/maps/api/js?key="+key+"&callback="+callback;
			document.body.appendChild(script);

		}
	}
	
	
	
	function initialize_selector_distributors() {
		if($('#js__distributor_countries').length){
			
			if($('#id_pays_defaut_value').length){
				var defaut_value = $('#id_pays_defaut_value').val();
				console.log('Value default : '+defaut_value);	
				//$('#js__distributor_countries select').addClass('-is-active');
				//$('#js__distributor_countries select option[value="'+ defaut_value +'"]').prop('selected', true);
				
				setTimeout(function(){$("#js__distributor_countries select").val(defaut_value);}, 300);
				
				
			}

			$('#js__distributor_countries select').on('change', function (e) {
				var option_selected = $("option:selected", this);
				var value_selected = this.value;
				var text_selected = option_selected[0].text;
				
				//$('.form-process').fadeIn();
							
				console.log('Value sent : '+text_selected+" / "+value_selected);	

				$('.form-process').fadeIn();
					
				var form_id = $('.formulaire form').attr('id');
	
				/*grecaptcha.ready(function() {
					grecaptcha.execute('6LcWBY8UAAAAALGLt5eO-fhWM0-74teZ__tufezS', {action: form_id}).then(function(token) {
						$('#g-recaptcha-response').val(token);*/
													
						$.ajax({
							type: "POST" 
							,data: {action: "search_distributor_countries", id_pays: value_selected}
							,url: SITE+'outils/ajax.php'
							,success: function(msg) {
								var reponse = jQuery.parseJSON(msg);
								
								
								$('.form-process').fadeOut();
								
								if (reponse.success == 'true') {
									
									try {
										//gtag('event', 'click', {'event_category' : 'Distributor form', 'event_label' : 'Distributor countries : '+text_selected+" / "+value_selected});
										gtag('event', 'distributor_form', {'libelle' : 'countries', 'emplacement' : text_selected+" / "+value_selected});
										tracker_fb_event('FindLocation');
									}catch(err) {console.log(err.message);}
	
									window.location.href = reponse.msg.url;
	
								}else{
									$("#js__error-id_pays").html(reponse.msg.reason);
									$('#js__error-id_pays').fadeIn();
									//Formulaires.init_captcha();	
									
									
									var margin_left = $("#distributor_countries").css("marginLeft");
									$("#distributor_countries").animate(
										{marginLeft: '100px'}
										, 150
										,function(){
											$("#distributor_countries").animate(
												{marginLeft: '-20px'}
												,150
												,function(){
													$("#distributor_countries").animate({marginLeft: margin_left});
												}
											);
										}	
									);
									
									try {
										//gtag('event', 'click', {'event_category' : 'Distributor form', 'event_label' : 'FALSE : Distributor countries : '+text_selected+" / "+value_selected});
										gtag('event', 'distributor_form', {'libelle' : 'countries error', 'emplacement' : text_selected+" / "+value_selected});
										tracker_fb_event('FindLocation');
									}catch(err) {console.log(err.message);}
								}		
							}
							,error: function() {
								$('.form-process').fadeOut();
								//$('#js__error-id_pays').fadeIn();
								//Formulaires.init_captcha();	
								
								try {
									//gtag('event', 'click', {'event_category' : 'Distributor form', 'event_label' : 'FALSE : Distributor countries : '+text_selected+" / "+value_selected});
									gtag('event', 'distributor_form', {'libelle' : 'countries error', 'emplacement' : text_selected+" / "+value_selected});
									tracker_fb_event('FindLocation');
								}catch(err) {console.log(err.message);}
							}
						});
					/*});
				});*/
				
			});	
		}
	}
	
	/*-----------------------------------------------------------------------------------*/
    /*	Scroll Progress Tracker
    /*-----------------------------------------------------------------------------------*/
	
	function init_progress(){
		if ($('.spt-trackThis').length) {
			$('body').progressTracker({
				horTracker : false
				,verTracker: true
				,verPosition : "right"
				,verTitles: false
				,verStops  : true
				,addFinalStop: true
				//,verColor: "custom"
				,trackViewport : true
				,trackViewportOnly : true
			});
		}
	}
	
	
	
/*-----------------------------------------------------------------------------------------------------------------------------------*/
/*	NOT USED
/*-----------------------------------------------------------------------------------------------------------------------------------*/	
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	STICKY MENU
    /*-----------------------------------------------------------------------------------*/
	
	function init_sticky_menu(){
		//$("nav").sticky({topSpacing:0});
		var sticky = new Sticky('.header_sticky');
	}
	

	
	
	
	
	/*-----------------------------------------------------------------------------------*/
    /*	BUG SAFARI CALC
    /*-----------------------------------------------------------------------------------*/
	function init_safari() {

		if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
			console.log("Navigateur : Safari");
			//$('.sticky-wrapper header').css('width', '100%').css('width', '-150px');
			
			//$('.sticky-wrapper header').css('width', $('.sticky-wrapper header').parent().width()-16); 
			
			/*var width = $(".page").outerWidth(false) - 47;
			$('.sticky-wrapper header').css("width", width + 'px');*/
			$('.just_safari').css("display", "block");

		}
		
		var is_ios = /iP(ad|od|hone)/i.test(window.navigator.userAgent), is_safari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
  		if(is_ios && is_safari) {
			
			console.log("OS : iOS / Navigateur : Safari");
			
			$(".parallax").each(function( index ) {
				$(this).css("background-attachment", 'scroll');
			});
		}
	  
	  
	}
	
	/*-----------------------------------------------------------------------------------*/
    /*	EQUALHEIGHT
    /*-----------------------------------------------------------------------------------*/
	function init_equal_heights(){
		//$('div.equal').equalHeights();
		
		/*!function(a){a.fn.equalHeights=function(){var b=0,c=a(this);return c.each(function(){var c=a(this).innerHeight();c>b&&(b=c)}),c.css("height",b)},a("[data-equal]").each(function(){var b=a(this),c=b.data("equal");b.find(c).equalHeights()})}(jQuery);*/
		
		! function(a) {
			a.fn.equalHeights = function() {
				var b = 0,
					c = a(this);
				return c.each(function() {
					var c = a(this).innerHeight();
					//console.log(a(this).innerHeight());
					c > b && (b = c)
				}), c.css("height", b)
			}, a("[data-equal]").each(function() {
				var b = a(this),
					c = b.data("equal");
					
				b.find(c).equalHeights();
			})
		}(jQuery);
	}
	
	
	function refresh_equal_heights(){
		! function(a) {
			a.fn.refreshHeights = function() {
				var b = 0,
					c = a(this);
				return c.each(function() {
					var c = a(this).find("[data-ratio]").height();
					//console.log(c);
					c > b && (b = c)
				}), c.css("height", b)
			}, a("[data-equal]").each(function() {
				var b = a(this),
					c = b.data("equal");
					
				b.find(c).refreshHeights();
			})
		}(jQuery);
	}
	
	
		
		
	/*-----------------------------------------------------------------------------------*/
    /*	POPUP COOKIE
    /*-----------------------------------------------------------------------------------*/
	function init_popup_information() {
		
		if ($('#popup_0_1').length) {
			if (Cookies.get('popup_0_1_'+LANG) == null) {
				//alert(Cookies.get('popup_0_1'));
				$('#popup_0_1').modal('show');
				Cookies.set('popup_0_1_'+LANG, '1', { expires: 1 });
			}
		}
	}
	


	/*-----------------------------------------------------------------------------------*/
    /*	GALLERY LightBox
    /*-----------------------------------------------------------------------------------*/
		
	
	lightbox.option({
		'alwaysShowNavOnTouchDevices': true
		,'albumLabel': "%1 / %2"
		,'disableScrolling': true
		,'fadeDuration': 600
		,'fitImagesInViewport': true
		,'imageFadeDuration': 600
		,'positionFromTop': 60
      	,'resizeDuration': 400
      	,'showImageNumberLabel': true
		,'wrapAround': true
    });

	/*-----------------------------------------------------------------------------------*/
	/*	EVENEMENT "READY"
	/*-----------------------------------------------------------------------------------*/
	$(document).ready(function() {	
		
		init_loader();
		init_pc_mobile();
		init_lazyload();
		
		init_parallax();
		init_menu();	
		
		init_sticky_menu();
		
		
		init_slider_line();	
		init_donuts();
		init_animation_product();
		
		init_features();
		
		init_scroll();
		
		init_filters();
		
		init_progress();	
		
		init_iframe_eshop();
		
		init_to_top();
		
		init_logo_bgd();
		
		initialize_map_api();
		init_track_action();
		
		initialize_selector_distributors();

		Formulaires.init();
		//init_bg_img();
		
		init_cookie_law();
		
		init_ie_compatible();
		init_safari();
		
		init_previous_model();
		
		
		fb_init_tracker();
		
		init_toggle_detailed_view();
		
		
		
		
		
		//init_popup_information();
		
		$(window).bind("unload", function(){		   
			console.log("unload");
		});
		
	});
		
	
	/*-----------------------------------------------------------------------------------*/
	/*	EVENEMENT "RESIZE"
	/*-----------------------------------------------------------------------------------*/
   
	$(window).bind("resize", function(){	
					


		//refresh_zoom_images();
		//refresh_equal_heights();
		
		//window.setTimeout(init_safari, 100);

		//init_equal_heights();
		
		refresh_ie_compatible();
		
	});
	
	
	
	/*-----------------------------------------------------------------------------------*/
	/*	EVENEMENT "SCROLL"
	/*-----------------------------------------------------------------------------------*/
   
	$(window).bind("scroll", function(){			   
		
		//init_safari();
	});
	
	
	/*-----------------------------------------------------------------------------------*/
	/*	EVENEMENT "ORIENTATION CHANGE"
	/*-----------------------------------------------------------------------------------*/
	$(window).bind("orientationchange", function(){
		

		refresh_ie_compatible();
		
		/*refresh_zoom_images();
		refresh_equal_heights();
		window.setTimeout(init_safari, 100);*/
	});
	
	



/*-----------------------------------------------------------------------------------*/
/*	FORMULAIRE
/*-----------------------------------------------------------------------------------*/

function setup_forms(){
	Formulaires.setup();
}

var Formulaires = function() {
	"use strict";
	
	var init_captcha_js = function() {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://www.google.com/recaptcha/enterprise.js?onload=setup_forms&render=" + recaptcha_public_key;
		document.body.appendChild(script);	
	};
	
	var clear_form = function(form) {
		form.clearForm();

		form.find('.form-control').each(function() {
			if(this.type == "radio" || this.type == "checkbox"){
				
			}else{
  				localStorage.removeItem($(this).attr("id"));
			}
		});
	};
	
	var save_value = function(e) {
		var id = e.id;
        var val = e.value;

		if(e.type == "radio" || e.type == "checkbox")
			val = e.checked;
		else
			localStorage.setItem(id, val);

		//console.log(id+" = "+val);
	};
	
	var get_saved_value = function(id) {
		//console.log(id);
		if (!localStorage.getItem(id)) {return "";}
		return localStorage.getItem(id);
	};
	
	var init_save_values = function() {
		$('.form-control, .form-check-input').on('input', function() {
			save_value(this);
		});
	};
	
	var load_values = function() {
		$('.form-control, .form-check-input').each(function() {
			if(this.type == "radio" || this.type == "checkbox"){
				
			}else{
  				$(this).val(get_saved_value($(this).attr("id")));
			
				if($(this).attr('type') != "date"){
					if($(this).val() !== '') {
						$(this).addClass('-is-active');
					}
				}
			}
		});
	};
	
	var init_labels = function() {
		//$('.js__form-input').val('');
		
		$(".js__form-input__field[type='date']").each(function() {
			$(this).addClass('-is-active');
		});
		
		$('.js__form-input__field').on('focusout', function() {
			
			if($(this).attr('type') != "date"){

				if($(this).val() !== '') {
					$(this).addClass('-is-active');
				} else{
					$(this).removeClass('-is-active');
				}
			}
		});
	};

	var setup_forms = function() {

		$('#js__contact').validate({
			rules: {
				name: {required: true, minlength: 2, maxlength: 255}
				,id_pays: {required: true}
				,email: {required: true, email: true, maxlength: 255}
				,message: {required: true, minlength: 10}
			}
			,messages: {
				name: {required: _t("Enter your name", "validation"), minlength: _t("Your name must consist of at least 2 characters", "contact_form")}
				,id_pays: {required: _t("Select your country", "validation")}
				,email: {required: _t("Enter your email", "validation")}
				,message: {required: _t("Enter your message", "validation"), minlength: _t("Your message must consist of at least 10 characters", "validation")}
			}
			,errorPlacement: function(error, element) {
				var placement = $(element).data('error');
				if (placement) {$(placement).append(error)} else {error.insertAfter(element); }
			}
			,submitHandler: function(form) {
				
				$('.form-process').fadeIn();
				
				var form_id = $('.formulaire form').attr('id');
				
				grecaptcha.enterprise.ready(function() {
					grecaptcha.enterprise.execute(recaptcha_public_key, {action: form_id}).then(function(token) {
	
						var formulaire = $(form);
						$('#g-recaptcha-response').val(token);
				
						formulaire.ajaxSubmit({
							type: "POST", data: formulaire.serialize(), url: formulaire.attr("action")
							,success: function(msg) {
								var reponse = jQuery.parseJSON(msg);
								
								$('.form-process').fadeOut();
								
								if (reponse.success == 'true') {
									clear_form(formulaire);
				  
									try {
										gtag('event', 'form_contact', {'value' : '15'});
										tracker_fb_event('Contact');
									}catch(err) {console.log(err.message);}
									
			
									
									$("#js__success_txt").html(reponse.msg.reason);
									
									$('#js__error').fadeTo(100, 0, function() {
										$('#js__contact').fadeTo(300, 0, function() {
											$(this).css('display', 'none');
											$(this).css('visibility', 'hidden');
											$('#js__success').fadeIn();
										});
									});
								}else{
									$("#js__error_txt").html(reponse.msg.reason);
									$('#js__error').fadeIn();
									///Formulaires.init_captcha();
								}
							}
							,error: function() {
								$('.form-process').fadeOut();
								$('#js__error').fadeIn();
								///Formulaires.init_captcha();
							}
						});
					});
				});
			}
		});
		
		
		/*-----------------------------------------------------------------------------------*/
		/*	FORMULAIRE GARANTIE
		/*-----------------------------------------------------------------------------------*/
										
						
		$('#js__warranty').validate({
			rules: {
				email: {required: true, email: true, maxlength: 255}
				,first_name: {required: true, maxlength: 255}
				,last_name: {required: true, maxlength: 255}
				,address: {required: true, maxlength: 255}
				,zip_code: {required: true, maxlength: 255}
				,city: {required: true, maxlength: 255}
				,id_pays: {required: true}
				,telephone: {required: true, maxlength: 255}
				,date_purchase_1: {required: true}
				,retailer_1: {required: true, maxlength: 255}
				,product_1: {required: true, maxlength: 255}
				,serial_number_1: {required: true, maxlength: 255}
			}
			,messages: {
				email: {required: _t("Enter your Email", "validation")}
				,first_name: {required: _t("Enter your First Name", "validation")}
				,last_name: {required: _t("Enter your Last Name", "validation")}
				,address: {required: _t("Enter your Address", "validation")}
				,zip_code: {required: _t("Enter your Zip code", "validation")}
				,city: {required: _t("Enter your City", "validation")}
				,id_pays: {required: _t("Enter your Country", "validation")}
				,telephone: {required: _t("Enter your Telephone", "validation")}
				,date_purchase_1: {required: _t("Enter your date of purchase (dd/mm/yyyy)", "validation")}
				,retailer_1: {required: _t("Enter your retailer name", "validation")}
				,product_1: {required: _t("Enter your product name", "validation")}
				,serial_number_1: {required: _t("Enter your serial number", "validation")}
			}
			,errorPlacement: function(error, element) {
				var placement = $(element).data('error');
				if (placement) {$(placement).append(error)} else {error.insertAfter(element); }
			}
			,submitHandler: function(form) {
				
				$('.form-process').fadeIn();
				
				var form_id = $('.formulaire form').attr('id');
				
				grecaptcha.enterprise.ready(function() {
					grecaptcha.enterprise.execute(recaptcha_public_key, {action: form_id}).then(function(token) {
					
						var formulaire = $(form);
						$('#g-recaptcha-response').val(token);
						
						formulaire.ajaxSubmit({
							type: "POST", data: formulaire.serialize(), url: formulaire.attr("action")
							,success: function(msg) {
								var reponse = jQuery.parseJSON(msg);
								
								$('.form-process').fadeOut();
								
								if (reponse.success == 'true') {
									clear_form(formulaire);
									
									try {
										gtag('event', 'form_warranty');
										tracker_fb_event('SubmitApplication');
									}catch(err) {console.log(err.message);}
									
									
									$("#js__success_txt").html(reponse.msg.reason);
									
									$('#js__error').fadeTo(100, 0, function() {
										$('#js__warranty').fadeTo(300, 0, function() {
											$(this).css('display', 'none');
											$(this).css('visibility', 'hidden');
											$('#js__success').fadeIn();
			
											$('html, body').animate( { scrollTop: ($(".formulaire").offset().top - 200) }, 750 );
										});
									});
								}else{
									$("#js__error_txt").html(reponse.msg.reason);
									$('#js__error').fadeIn();
									///Formulaires.init_captcha();	
								}		
							}
							,error: function() {
								$('.form-process').fadeOut();
								$('#js__error').fadeIn();
								///Formulaires.init_captcha();	
							}
						});
					});
				});
			}
		});
		
		
		
		
		/*-----------------------------------------------------------------------------------*/
		/*	FORMULAIRE CONTACT PILOT
		/*-----------------------------------------------------------------------------------*/
										
						
		$('#js__pilot_contact').validate({
			rules: {
				email: {required: true, email: true, maxlength: 255}
				,name: {required: true, minlength: 2, maxlength: 255}
				,title: {required: true, maxlength: 255}
				,subtitle: {required: true, maxlength: 255}
				,tags: {required: false, maxlength: 255}
				,video: {required: false, url: true, maxlength: 255}
				,link: {required: false, url: true, maxlength: 255}
				,content: {required: true, minlength: 200}
				,picture_1: {required: true}
				,picture_2: {required: false}
				,picture_3: {required: false}
			}
			,messages: {
				email: {required: _t("Enter your Email", "validation")}
				,name: {required: _t("Enter your name", "validation"), minlength: _t("Your name must consist of at least 2 characters", "validation")}
				,title: {required: _t("Enter the Article Title", "validation")}
				,subtitle: {required: _t("Enter the Article Sub title", "validation")}
				,content: {required: _t("Enter the Article Content", "validation"), minlength: _t("Your content must consist of at least 200 characters", "validation")}
			}
			,errorPlacement: function(error, element) {
				var placement = $(element).data('error');
				if (placement) {$(placement).append(error)} else {error.insertAfter(element); }
			}
			,submitHandler: function(form) {
				
				$('.form-process').fadeIn();
				
				var form_id = $('.formulaire form').attr('id');
				
				grecaptcha.enterprise.ready(function() {
					grecaptcha.enterprise.execute(recaptcha_public_key, {action: form_id}).then(function(token) {
					
						var formulaire = $(form);
						$('#g-recaptcha-response').val(token);
						
						formulaire.ajaxSubmit({
							type: "POST", data: formulaire.serialize(), url: formulaire.attr("action")
							,processData: false, contentType: false //Fichier
							,success: function(msg) {
								var reponse = jQuery.parseJSON(msg);
								
								$('.form-process').fadeOut();
								
								if (reponse.success == 'true') {
									clear_form(formulaire);
									
									try {
										//gtag('event', 'click', {'event_category' : 'Pilot contact form', 'event_label' : 'Pilot contact article sent'});
										gtag('event', 'form_pilot_contact');
										
									}catch(err) {console.log(err.message);}
									
									
									$("#js__success_txt").html(reponse.msg.reason);
									
									$('#js__error').fadeTo(100, 0, function() {
										$('#js__pilot_contact').fadeTo(300, 0, function() {
											$(this).css('display', 'none');
											$(this).css('visibility', 'hidden');
											$('#js__success').fadeIn();
			
											$('html, body').animate( { scrollTop: ($(".formulaire").offset().top - 200) }, 750 );
										});
									});
								}else{
									$("#js__error_txt").html(reponse.msg.reason);
									$('#js__error').fadeIn();
									///Formulaires.init_captcha();	
								}		
							}
							,error: function() {
								$('.form-process').fadeOut();
								$('#js__error').fadeIn();
								///Formulaires.init_captcha();	
							}
						});
					});
				});
			}
		});
		
		
		/*-----------------------------------------------------------------------------------*/
		/*	FORMULAIRE CONTACT FREE DEMO
		/*-----------------------------------------------------------------------------------*/
		$('#js__freedemo_contact').validate({
			rules: {
				name: {required: true, minlength: 2, maxlength: 255}
				,id_pays: {required: true}
				,email: {required: true, email: true, maxlength: 255}
				,product: {required: true, minlength: 2, maxlength: 255}
				,message: {required: true, minlength: 10}
			}
			,messages: {
				name: {required: _t("Enter your name", "validation"), minlength: _t("Your name must consist of at least 2 characters", "contact_form")}
				,id_pays: {required: _t("Select your country", "validation")}
				,email: {required: _t("Enter your email", "validation")}
				,product: {required: _t("Enter the product you are interested in", "validation"), minlength: _t("Your name must consist of at least 2 characters", "contact_form")}
				,message: {required: _t("Enter your message", "validation"), minlength: _t("Your message must consist of at least 10 characters", "validation")}
			}
			,errorPlacement: function(error, element) {
				var placement = $(element).data('error');
				if (placement) {$(placement).append(error)} else {error.insertAfter(element); }
			}
			,submitHandler: function(form) {
				
				$('.form-process').fadeIn();
				
				var form_id = $('.formulaire form').attr('id');
				
				grecaptcha.enterprise.ready(function() {
					grecaptcha.enterprise.execute(recaptcha_public_key, {action: form_id}).then(function(token) {
					
						var formulaire = $(form);
						$('#g-recaptcha-response').val(token);
				
						formulaire.ajaxSubmit({
							type: "POST", data: formulaire.serialize(), url: formulaire.attr("action")
							,success: function(msg) {
								var reponse = jQuery.parseJSON(msg);
								
								$('.form-process').fadeOut();
								
								if (reponse.success == 'true') {
									clear_form(formulaire);
				  
									try {
										gtag('event', 'form_free_demo');
										tracker_fb_event('Lead');
									}catch(err) {console.log(err.message);}
									
			
									
									$("#js__success_txt").html(reponse.msg.reason);
									
									$('#js__error').fadeTo(100, 0, function() {
										$('#js__freedemo_contact').fadeTo(300, 0, function() {
											$(this).css('display', 'none');
											$(this).css('visibility', 'hidden');
											$('#js__success').fadeIn();
										});
									});
								}else{
									$("#js__error_txt").html(reponse.msg.reason);
									$('#js__error').fadeIn();
									///Formulaires.init_captcha();
								}
							}
							,error: function() {
								$('.form-process').fadeOut();
								$('#js__error').fadeIn();
								///Formulaires.init_captcha();
							}
						});
					});
				});
			}
		});

	}

	return {
		init: function() {
			if($('.formulaire').length){
				//clear_forms();
				init_captcha_js();
				init_save_values();
				load_values();
				
				init_labels();

			}
		},setup: function() {
			setup_forms();
		}
	}

}();