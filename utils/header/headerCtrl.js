/**
 Description: Header Controller
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("headerCtrl", ['$rootScope', '$scope', '$filter', '$location', '$timeout', 'onlineHelpService',
		'dialogService','notificationService','requestRoutingService','dashletReloadTime','$interval','executeCliCmdService','getStringLineService','gridCrudService','getMonthIndex',
		function($rootScope, $scope, $filter, $location, $timeout, onlineHelpService, dialogService,
		notificationService,requestRoutingService,dashletReloadTime,$interval,executeCliCmdService,getStringLineService,gridCrudService,getMonthIndex) {
	var translate = $filter("translate");
	//Set Language related configs
	//Add any new supported language here and in i18nService in commonServices.js
	//Set default language
	$scope.prefLang = null;
	$scope.isLoading = true;
	$scope.userName = "";
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
	//The drop down takes a while to populate. We cannot time it. Hence try till its populated and call it.
	var setDefaultLanguage = function(){
		$timeout(function () {
			if(angular.element("#languageSelected").data("kendoDropDownList") &&
				angular.element("#languageSelected").data("kendoDropDownList").dataSource._data.length){
				$scope.prefLang = $rootScope.preferredLanguage;
			} else {
				setDefaultLanguage();
			}
			//Required to change the drop down icon to reflect its purpose - language selection
			var langIcon = $(".k-icon.k-i-arrow-s","#languageSelector");
			if(langIcon){
				if(langIcon[0]){
					langIcon[0].innerHTML = "";
				}
				langIcon.removeClass("k-icon k-i-arrow-s","#languageSelector");
				langIcon.addClass("fa fa-language fa-2x langicon","#languageSelector");
			}
        	}, 500);
	};
	setDefaultLanguage();
	if(versionInfo.ShowVersion.name.indexOf("S6650L") != -1 || versionInfo.ShowVersion.name.indexOf("S5960") != -1 ){
		$scope.supportedLanguages = new kendo.data.ObservableArray([
		                           {"name": "English", "value": "en"},
		                           {"name": "中文", "value": "zh"}]);
		$scope.productOwner="ICNT";
		$scope.ciscoDevice=false;
		$scope.inspurDevice=true;
	}else{
		$scope.supportedLanguages = new kendo.data.ObservableArray([
		                          {"name": "English", "value": "en"},
		                          {"name": "中文", "value": "zh"},
		                          {"name": "日本語", "value": "ja"},
		                          {"name": "한국어", "value": "ko"},
		                          {"name": "Deutsch", "value": "de"},
		                          {"name": "Español", "value": "es"}]);
		$scope.productOwner="Cisco";
		$scope.ciscoDevice=true;
		$scope.inspurDevice=false;
	}		
	$scope.updateLanguageSelection = function(){
		if($scope.isLoading){
			$scope.isLoading=!$scope.isLoading;
			return;
		}
		if(this.prefLang !== $rootScope.preferredLanguage){
			angular.element("body").addClass("busy");
			window.localStorage.preferredLanguage = this.prefLang;
			window.location.reload();
		}
	};

	//Set device description and device Version
	//Remove the "," at the end
	$scope.version = versionInfo.ShowVersion.version.split(',')[0];
	//Show certificate renewal option for SM devices
	$scope.smDeviceStatus=false;	
	if(versionInfo.ShowVersion.name.indexOf("C2960L-SM") !=-1 || versionInfo.ShowVersion.name.indexOf("C1000SM") !=-1){
		$scope.smDeviceStatus=true;
	}else{
		$scope.smDeviceStatus=false;
	}
	$scope.deviceDescription = versionInfo.ShowVersion.name;
	//setting hostname on header
	$rootScope.hostName = versionInfo.ShowVersion.hostname;
	$rootScope.userPrivilegeLevel = parseInt(requestRoutingService.getShowCmdOutput("show privilege").substr(27));
	//Setting cluster candidate status
	$scope.loadClusterDetails= function(){
		 //Hiding cluster details for all devices since CCP 1.6 release , will be enabled if required in future
		$rootScope.clusterCandidateAvail =false;
		/*if(versionInfo.ShowVersion.name.indexOf("C2960L") !=-1){
			$rootScope.clusterCandidateAvail =false;
		}else{
			var clusterCLIOP = deviceCommunicator.getExecCmdOutput("show cluster candidates\n");
			var clusterCandidates=[];
			var arrCandidate=clusterCLIOP.trim().split("\n");
			for (var i=2; i < arrCandidate.length; i++) {
					var candidateObj = {};
					candidateObj["macAddress"] = arrCandidate[i].substring(0,14).trim();
					candidateObj["name"] =arrCandidate[i].substring(15,27).trim();
					clusterCandidates.push(candidateObj)
			}
			if(clusterCandidates.length > 0){
				$rootScope.clusterCandidateAvail =true;
			}else{
				$rootScope.clusterCandidateAvail =false;
			}
		}		*/
	}
	var count=0;
	//Refresh the cluster candidate details only one time if cluster exist and not come to online
	var fetchLoop = $interval(function(){
		if(count==0){
			$scope.loadClusterDetails();
			count++;
		} else {
			$interval.cancel(fetchLoop);
		}
	}, dashletReloadTime);
 	//for initial load of cluster candidate
	$scope.loadClusterDetails();
	$rootScope.portStatus = ['not connected','connected','disabled','error-disabled', 'suspended'];
	$scope.isActive = false;
	$scope.hideShowMenu = function() {
		$scope.isActive = !$scope.isActive;
		$rootScope.$broadcast('hideShowMegaMenu', {"isActive": $scope.isActive});
	};
	setTimeout(function(){
		onlineHelpService.setBrowserTitle($location.url(), $scope.deviceDescription, " ");
	}, 500);

	$scope.$on('$locationChangeSuccess', function(event, url) {
		var url = $location.url();
		$scope.currentPage = url;
		// Setting the browser title
		if(!$rootScope.hostName){
				$rootScope.hostName = "Switch";
		}
		setTimeout(function(){
			onlineHelpService.setBrowserTitle($scope.currentPage, $scope.deviceDescription, " ");
		}, 500);
        angular.element("body").removeClass("inlineHelp");
	});
	$scope.openOnlineHelpWindow = function() {		
		if(versionInfo.ShowVersion.name.indexOf("S6650L") != -1 || versionInfo.ShowVersion.name.indexOf("S5960") != -1 ){
			var openedChild;
		    var winFeatures = "width=1000,height=700,location=0,centerscreen=yes,resizable=yes,scrollbars=yes";
		    var urlToOpen = "http://www.icntnetworks.com/";
		    openedChild = window.open(urlToOpen, 'inspurhelpwindow', winFeatures);		    
		}else{
			onlineHelpService.openOnlineHelpWindow();
		}
	};
	$scope.showConfirmWindow = function(value, window) {
		if (value) {
			window.center().open();
		} else {
			window.close();
		}
	};
	$scope.logout = function() {
		window.location.href = "/logout.html";
	};
	$scope.$on("okClicked_logout", function() {
		if($scope.dlg){
			$scope.dlg.data("kendoWindow").close();
			$scope.logout();
		}
	});
	$scope.$on("okClicked_saveConfiguration", function() {
		if($scope.dlg){
			var result = requestRoutingService.getShowCmdOutput("write memory");
	                if(result != undefined && result.indexOf("[OK]")){
            		  notificationService.showNotification(translate('saveconfig_success_msg'), translate('saveconfig_success'), 'success');
            		}else{
               		  notificationService.showNotification(translate('saveconfig_fail_msg'), translate('saveconfig_fail'), 'error');
            		}
			$scope.dlg.data("kendoWindow").close();
		}
	});
	$scope.$on("okClicked_renewCertificate", function() {
		if($scope.dlg1){
			var result = requestRoutingService.getConfigCmdOutput("crypto key zeroize\n crypto key generate rsa label cisco modulus 2048\n");			
	        if( result=="" || result.indexOf("Generating")!=-1 ){
               notificationService.showNotification(translate('certrenew_success_msg'), translate('com_config_success_title'), 'success');
            }else{
               notificationService.showNotification(translate('certrenew_fail_msg'), translate('com_config_fail_title'), 'error');
            }
			$scope.dlg1.data("kendoWindow").close();
		}
	});
	
	$scope.showWindow = function(windowFor) {
		if (windowFor == "logoutConfirmWindow") {
			$scope.dlg = dialogService.dialog({
				content : translate("msg_logout"),
				title : translate("com_logout"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "okClicked_logout"
				}, {
					text : translate("com_cancel")
				}]
			});
		} else if (windowFor == "saveConfigConfirmWindow") {
			$scope.dlg = dialogService.dialog({
				//content : 'Are you sure you want to save the configuration?',
				content : translate('confirm_save_config'),
				title : translate('save_configuration'),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "okClicked_saveConfiguration",
					btnClass : "dummyClass"
				}, {
					text : translate("com_cancel")
				}]
			});
		} else if (windowFor == "renewCertificate") {
			$scope.dlg1 = dialogService.dialog({
			    content : translate('confirm_renewcert_config'),
				title : translate('renew_certificate'),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "okClicked_renewCertificate",
					btnClass : "dummyClass"
				}, {
					text : translate("com_cancel")
				}]
			});
		} else if (windowFor === "systemInformationWindow") {			
			var productName,productShortName,productCopyRight;
			if(versionInfo.ShowVersion.name.indexOf("S6650L") != -1 || versionInfo.ShowVersion.name.indexOf("S5960") != -1 ){
				productName=properties.productNameInspur;
				if($scope.prefLang=="zh"){
					productName=properties.productNameInspurChinese;
				}
				productShortName=properties.productNameShortInspur;
				productCopyRight=properties.copyRightInspur;
			}else{
				productName=properties.productName;
				productShortName=properties.productNameShort;
				productCopyRight=properties.copyRight;
			}
			var message = productName +" (" + productShortName + ")" +
					"\nVersion: "+webuiVersionInfo.version +
					"\nBuilt: "+webuiVersionInfo.buildTime;
			var copyRight = productShortName +
					"\n"+productCopyRight+"\n";
			$scope.dlg = dialogService.sysInfoDialog({
                                content : message,
				copyRight : copyRight,
                                title : translate('product_information'),
                                messageType : "confirm",
                                actionButtons : [{
                                        text : translate("com_ok"),
                                        btnClass : "dummyClass"
                                }]
                        });
		}
	};
	$scope.isIE = function() {
		return angular.element("html.k-ie").length;
	};

	$scope.isHTML5SupportedBrowser = function() {
		var cCanvas = {};
		cCanvas.createCanvas = document.createElement("canvas");
		var canvascheck = (cCanvas.createCanvas.getContext) ? true : false;
		if (window.FormData == undefined || !canvascheck) {
			return false;
		}
		delete cCanvas.createCanvas;
		return true;
	};
   //Loading logs while header page loading
    $scope.logCount = 0;
	$scope.notificationStatus = false;
	initLogStatus();
	function initLogStatus(){
	       var arrLoggingDetails = [];
	       var arrWords = [];
	       var arrWords1 = [];
	       var strCLIOutput = deviceCommunicator.getExecCmdOutput("show logging");
	       strCLIOutput = executeCliCmdService.getNextString(strCLIOutput,["Log Buffer"],["! OUTPUT END"]);
	       var strLines = getStringLineService.getLines(strCLIOutput,["%"]);
	       if (strLines != null) {
	          for (var i=0; i<strLines.length; i++) {
	                       var strLine = strLines[i];
	                       if(strLine.indexOf("%")!=-1){
	                       	arrWords = strLine.split("%");
	                       	if(arrWords[1].indexOf("-")!=-1){
	                       		arrWords1 = arrWords[1].split("-");
	                       		if(arrWords1[2] != 'undefined' && arrWords1[2] != undefined && arrWords1[2].indexOf(":")!=-1){
	                       				var timestamp=arrWords[0].substring(0,arrWords[0].length-2).trim();
	                       				var items = {
	                       					"actualTimestamp"  : timestamp
	                       				};
	                       				arrLoggingDetails.push(items);
	                       		}
	                       	}
	                     }
	             }
	       }
	       if(arrLoggingDetails.length==0){
	    	   $rootScope.lastTimeStamp="";
	    	   $rootScope.lastTimeStampValue="";
	       }else{
	    	   $rootScope.lastTimeStamp=arrLoggingDetails[arrLoggingDetails.length-1].actualTimestamp;
	    	   $rootScope.lastTimeStampValue=timeConversion($rootScope.lastTimeStamp);
	       }
	}
	var arrLoggingLatest= new Array();
    function showCLDetails(){
       var arrLoggingDetails = [];
       var arrWords = [];
       var arrWords1 = [];
       var arrWords2 = [];
       var latestLogs=false;
       var latestLogsCount=0;
       var lastLogTimeStamp=$rootScope.lastTimeStamp;
       var lastLogTimeStampValue=timeConversion($rootScope.lastTimeStamp);
       var strCLIOutput = deviceCommunicator.getExecCmdOutput("show logging");
       strCLIOutput = executeCliCmdService.getNextString(strCLIOutput,["Log Buffer"],["! OUTPUT END"]);
       var strLines = getStringLineService.getLines(strCLIOutput,["%"]);
       if (strLines != null) {
          for (var i=0; i<strLines.length; i++) {
                       var strLine = strLines[i];
                       if(strLine.indexOf("%")!=-1){
                       	arrWords = strLine.split("%");
                       	if(arrWords[1].indexOf("-")!=-1){
                       		arrWords1 = arrWords[1].split("-");
                       		if(arrWords1[2] != 'undefined' && arrWords1[2].indexOf(":")!=-1){
                       			    arrWords2 = arrWords1[2].split(":");
                       				var timestamp=arrWords[0].substring(0,arrWords[0].length-2).trim();
                       				var timestampValue=timeConversion(timestamp);
                       				var actualTimestamp=arrWords[0].substring(0,arrWords[0].length-2).trim();
                       				if(latestLogsCount==0){
                       					if( (timestamp==="") || (parseFloat(timestampValue) > parseFloat(lastLogTimeStampValue)) ){
                       						latestLogs=true;
                           					latestLogsCount++;
                       					}
                       				}
                       				if(latestLogs){
		                       				var arrTimestamp=timestamp.split(" ");
		                       				var getMonthNum = getMonthIndex.monthIndex(arrTimestamp[0]);
		                       				var getDay;
		                       				if(arrTimestamp[1]==""){
		                       					getDay = arrTimestamp[2].length < 2 ? '0'+arrTimestamp[2] : arrTimestamp[2];
		                           				if(arrTimestamp[3].indexOf(":")!=-1){
		                           					timestamp=new Date().getFullYear()+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[3];
		                           				}else{
		                           					timestamp=arrTimestamp[3]+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[4];
		                           				}
		                       				}else{
		                       					if(arrTimestamp[1]!=undefined){
		                       						getDay = arrTimestamp[1].length < 2 ? '0'+arrTimestamp[1] : arrTimestamp[1];
		                       					}else{
		                       						getDay = arrTimestamp[1];
		                       					}		                       					
		                           				if(arrTimestamp[1]!=undefined && arrTimestamp[2].indexOf(":")!=-1){
		                           					timestamp=new Date().getFullYear()+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[2];
		                           				}else{
		                           					timestamp=arrTimestamp[2]+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[3];
		                           				}
		                       				}
		                       				var items = {
		                       					"actualTimestamp":actualTimestamp,
		                       					"timeStamp"  : timestamp,
		                       					"facility"   : arrWords1[0],
		                       					"severity"   : arrWords1[1],
		                       					"description": arrWords2[1],
		                       					"status"     : arrWords2[0]
		                       				};
		                       				arrLoggingDetails.push(items);
                       			  }
                       		}
                       	}
                     }
             }
          }
		  if(arrLoggingDetails.length > 0){
			  $timeout(function(){
				$scope.logCount=arrLoggingDetails.length;
			  },50);
		  }
          arrLoggingLatest= [];
          arrLoggingLatest=arrLoggingDetails;
		  if(arrLoggingLatest.length > 0){
			  $scope.notificationStatus = true;
		  }else{
			  $scope.logCount = 0;
			  $scope.notificationStatus = false;
		  }
       return arrLoggingLatest;
    }
    //Refresh the CL for every 60 seconds
	$interval(function(){
		showCLDetails();
	},60000);
    $scope.showLogsWindow = function(){
		var latestLogArr=arrLoggingLatest;
		if(latestLogArr.length > 0){
			$scope.$broadcast('openAddDialog:logsGridWindow', translate('system_logs_alert'));
			showLogGrid(latestLogArr);
			$rootScope.lastTimeStamp=latestLogArr[latestLogArr.length-1].actualTimestamp;
			$rootScope.lastTimeStampValue=timeConversion($rootScope.lastTimeStamp);
			$scope.logCount = 0;
			$scope.notificationStatus = false;
			arrLoggingLatest= [];
		}
	}
    function showLogGrid(arrLoggingDetails){
       $scope.arrLoggingList = new kendo.data.ObservableArray(arrLoggingDetails)
               $scope.logsDataSource = new kendo.data.DataSource({
                       pageSize : 10,
                       data : $scope.arrLoggingList
       });
       $scope.logsGridOptions = {
    		   dataSource: $scope.logsDataSource,
               editable : false,
               sortable : true,
               reorderable: true,
               scrollable: true,
               resizable: true,
               filterable : {
                       extra : false,
                       operators : {
                               string : {
                                   eq : translate("com_is_equal"),
                                   neq : translate("com_isnot_equal")
                               }
                       },
                       messages : {
       		            info: translate("com_page_dropDowntext"),
       		            filter: translate("com_btn_filter"),
       		            clear: translate("com_btn_clear")
       		        }
               },
               selectable : true,
               pageable : {
               		messages: {
               			display: translate("com_page_display"),
               			empty: translate("com_page_empty"),
               			page: translate("com_page_pagetext"),
               			of:translate("com_page_of"),
               			itemsPerPage: translate("com_page_itemsPerPage"),
               			first: translate("com_page_first"),
               			previous: translate("com_page_previous"),
               			next: translate("com_page_next"),
               			last: translate("com_page_last"),
               			refresh: translate("com_page_refresh"),
               			morePages: translate("com_page_morePage")
               		},
                       previousNext : true,
                       info : true,
                       refresh : true,
                       pageSizes : gridCrudService.grid_page_sizes,
                       buttonCount : 5
               },
               columns : [{
                       field : "timeStamp",
                       title : translate("critical_logs_timestamp"),
                       width : "15%"
               }, {
                       field : "facility",
                       title : translate("critical_logs_facility"),
                       width : "15%"
               }, {
                       field : "severity",
                       title : translate("critical_logs_severity"),
                       width : "10"
               }, {
                       field : "description",
                       title : translate("critical_logs_desc"),
                       width : "45%"
               },{
                   field : "status",
                   title : translate("critical_logs_status"),
                   width : "15%"
              }]
       };
     //highlighting sev1 logs in red color
       $timeout(function(){
      	 angular.element("#logsGrid").kendoGrid(angular.extend({
           dataBound: function(e) {
               // iterate the data items and apply row styles where sev is 1
               var dataItems = e.sender.dataSource.view();
               for (var j = 0; j < dataItems.length; j++) {
                   var Severity = dataItems[j].get("severity");
                   var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
                   if(Severity==1){
                      row.addClass("critical");
  				 }
               }
         }
       }, $scope.logsGridOptions));
       },100);
       $timeout(function(){
	       var grid = angular.element("#logsGrid").data("kendoGrid");
	       grid.resizable.bind("start", function(e) {
	           if ($(e.currentTarget).data("th").data("field") == "bar") {
	             e.preventDefault();
	             setTimeout(function(){
	               grid.wrapper.removeClass("k-grid-column-resizing");
	               angular.element(document.body).add(".k-grid th").css("cursor", "");
	             },50);
	           }
	       });
       },150);
   }
    function timeConversion(timestamp){    
    	    var arrTimestamp=timestamp.split(" ");
			var getMonthNum = getMonthIndex.monthIndex(arrTimestamp[0]);
			var getDay;			
			if(arrTimestamp[1]==""){
				getDay = arrTimestamp[2].length < 2 ? '0'+arrTimestamp[2] : arrTimestamp[2];
				if(arrTimestamp[3].indexOf(":")!=-1){
					timestamp=new Date().getFullYear()+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[3];
				}else{
					timestamp=arrTimestamp[3]+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[4];
				}
			}else{
				if(arrTimestamp[1]!=undefined){
					getDay = arrTimestamp[1].length < 2 ? '0'+arrTimestamp[1] : arrTimestamp[1];
				}else{
					getDay = arrTimestamp[1];
				}				
				if(arrTimestamp[1]!=undefined && arrTimestamp[2].indexOf(":")!=-1){
					timestamp=new Date().getFullYear()+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[2];
				}else{
					timestamp=arrTimestamp[2]+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[3];
				}
		}
	   	if(timestamp!=""){
    		timestamp=timestamp.replace("-", "");
    		timestamp=timestamp.replace("-", "");
    		timestamp=timestamp.replace(" ", "");
    		timestamp=timestamp.replace(":", "");
    		timestamp=timestamp.replace(":", "");
    		timestamp=timestamp.split(".")[0];
       		return timestamp;
    	}else{
    		return timestamp;
    	}
    }

    function fetchUsername() {
    	var usernameResponse = "";
 		var GET_USERNAME = "";
 		if($(location)[0] != undefined && $(location)[0] !=""){
 			GET_USERNAME = $(location)[0].origin+"/"+"get_loginuser";
 		}
 		if (GET_USERNAME != ""){
	 		 usernameResponse="";
	 		 var xmlHttp = new XMLHttpRequest();
	         // false for synchronous request
	 		 xmlHttp.open( "GET", GET_USERNAME, false );
	 		 xmlHttp.send( null );
	 		 usernameResponse = xmlHttp.responseText;  		 
 		}
 		if(usernameResponse.indexOf("404 Not Found") == -1){
 			$scope.userName = usernameResponse;
 		}	
    }
    fetchUsername();
}]);

