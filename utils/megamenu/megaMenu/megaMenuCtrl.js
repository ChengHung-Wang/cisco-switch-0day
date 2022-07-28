/**
 Description: Megamenu Controller
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("megaMenuCtrl", ['$rootScope', '$scope', 'httpEndPointService','requestRoutingService','$interval','$filter',
function($rootScope, $scope, httpEndPointService, requestRoutingService, $interval, $filter) {
	$scope.isPoECapable = $rootScope.deviceInfo.isPoECapable;
   
	$scope.deviceCapabilities={};
	$scope.deviceCapabilities={
		isPoECapable:$scope.isPoECapable
	};
	var MENU_URL="utils/megamenu/helper/menu.json";
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
    var type = versionInfo.ShowVersion.name;
	if((type.indexOf("C2960C") !=-1 && type.indexOf("C2960CX") ==-1) || type.indexOf("CDB") !=-1 ){
		MENU_URL="utils/megamenu/helper/menu_CDB_2960L_2960plus.json";
	}
	if(type.indexOf("C2960CX") !=-1){
		MENU_URL="utils/megamenu/helper/menu_2960CX_2960plus.json";
	}
	if(type.indexOf("C2960+") !=-1){
		MENU_URL="utils/megamenu/helper/menu_2960plus.json";
	}
	if(type.indexOf("C2960L") !=-1 || type.indexOf("S6650L") !=-1 || type.indexOf("S5960L") !=-1){
		MENU_URL="utils/megamenu/helper/menu_2960L.json";
	}
	if(type.indexOf("C2960L-SM") !=-1){
		MENU_URL="utils/megamenu/helper/menu_2960L_SM.json";
	}
	if(type.indexOf("C1000") !=-1){
		MENU_URL="utils/megamenu/helper/menu_C1000.json";
	}
	if(type.indexOf("C1000SM") !=-1){
		MENU_URL="utils/megamenu/helper/menu_C1000SM.json";
	}	
	if( (type.indexOf("C2960X") !=-1 || (type.indexOf("S5960") != -1 && type.indexOf("S5960L") == -1)) && type.indexOf("C2960XR") ==-1 ){
		MENU_URL="utils/megamenu/helper/menu_2960X.json";
	}
	
	$scope.$on("hideShowMegaMenu", function(event, data){
		$scope.isActive = data.isActive;
	});
	$scope.menuData = [];
	httpEndPointService.httpGet(MENU_URL).then(function(data) {
		$scope.menuData = data.data;
		$scope.removeUnwantedMenuItems($scope.menuData);
	});	
	$scope.removeUnwantedMenuItems = function(data){		
        for(var i=0; i<data.length; i++){
			if(data[i].display !== undefined){
				data[i].display = $scope.displayHideMenuItem(data[i].display);
				var index = -1;
				if(data[i].display == false){
					index = data[i].indexOf(data[i].display);
					if(index > -1){
						data[i].splice(index, 1);						
					}
				}
				
			}else if(data[i].submenus !== undefined && data[i].submenus.length > 0){				
				for(var j=0; j<data[i].submenus.length; j++){
					if(data[i].submenus[j].display != undefined){
						data[i].submenus[j].display = $scope.displayHideMenuItem(data[i].submenus[j].display);
						var index = -1;
						if(data[i].submenus[j].display == false){
							index = (data[i].submenus).indexOf(data[i].submenus[j]);
							if(index > -1){
								(data[i].submenus).splice(index, 1);								
							}							
						}
					}
				}
			}
			
        }		
		
	};	
	$scope.displayHideMenuItem = function(value){		
		if(typeof value === "boolean"){
			return value;
		}
		else{
			//example value - isWirelessSupported
			value = $scope.deviceCapabilities[value];
			return value;
		}
	};	
	$scope.isHTML5SupportedBrowser = function() {
		return false;
		var cCanvas = {};
		cCanvas.createCanvas = document.createElement("canvas");
		var canvascheck = (cCanvas.createCanvas.getContext) ? true : false;
		if (window.FormData == undefined || !canvascheck) {
			return false;
		}
		delete cCanvas.createCanvas;
		return true;
	};
	var expandCollapseMegamenu = function(reference) {
		var elm = angular.element(reference),
		    prts = elm.parents(".megamenu-menu");
		if ( typeof reference === "string") {
			angular.element(".menu-item a").parent().parent().removeClass("selectedSubmenu");
			elm.parent().parent().addClass("selectedSubmenu");
		}
		if (!prts.hasClass("megamenuExpanded")) {
			angular.element(".megamenu-menu").removeClass("megamenuExpanded").removeClass("menuExpand").height(0);

			if ( typeof reference === "string") {
				prts.addClass("menuExpand").height(angular.element("ul.submenus", prts).height() + 25);
			} else {
				prts.addClass("menuExpand").height(elm.siblings("ul").height() + 25);
			}
		}
	};

	var fireTransitionEnd = function(event) {
		angular.element(".menuExpand").addClass("megamenuExpanded").removeClass("megamenuCollapsed");
		if (!angular.element(event.target).hasClass("menuExpand")) {
			angular.element(event.target).addClass("megamenuCollapsed");
		}
	};
	// Code for detect when routing has changed
	$scope.$on('$routeChangeStart', function(next, current) {
		var cTab = angular.element(".submenuTitle").find("a[href='#" + current.$$route.originalPath + "']");
		expandCollapseMegamenu("a[href='#" + current.$$route.originalPath + "']");
		angular.element(".menu-item a").parent().parent().removeClass("selectedSubmenu");
		cTab.parent().parent().addClass("selectedSubmenu");
	});
	// Code for Expand and collapse
	var expandTimer = setInterval(function() {
		expandCollapseMegamenu("a[href='" + location.hash + "']");
		angular.element(".megamenu-menu").addClass("megamenuCollapsed").each(function(i, menu) {
			if (navigator.userAgent.indexOf("Firefox") > 0 || navigator.userAgent.indexOf("Trident") > 0) {
				menu.addEventListener('transitionend', fireTransitionEnd, false);
			} else {
				menu.addEventListener('webkitTransitionEnd', fireTransitionEnd, false);
			}
		});
		if (angular.element(".menuExpand").length > 0) {
			clearInterval(expandTimer);

			angular.element(".megamenu-menu-title").bind("click", function() {
				expandCollapseMegamenu(this);
			});

			angular.element(".megamenu-menu .menu-item a[href]").bind("click", function() {
				angular.element(".menu-item a").parent().parent().removeClass("selectedSubmenu");
				angular.element(this).parent().parent().addClass("selectedSubmenu");
			});
			if (!$scope.isHTML5SupportedBrowser() && $scope.supportedBrowsersWindow != undefined) {
				$scope.showConfirmWindow(true, $scope.supportedBrowsersWindow);
			}
		}
	}, 0);

}]);

