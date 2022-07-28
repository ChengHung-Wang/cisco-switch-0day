/**
 Description: Controller for software update feature
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */

'use strict';
app.register.controller('SWUpdateCtrl', ['$rootScope', '$scope', '$http', '$interval', '$timeout', 'requestRoutingService', 'gridCrudService', 'dialogService', 'executeCliCmdService', '$filter','notificationService','$timeout',
function($rootScope, $scope, $http, $interval, timeout, requestRoutingService, gridCrudService, dialogService, executeCliCmdService, $filter,notificationService,$timeout) {
	var translate = $filter("translate");
	$scope.statusFetchReq = null;
	$scope.spinner_msg = '<i class="fa fa-spinner fa-spin" style="font-size:24px; color:blue" aria-hidden="true"></i>';
	$scope.loading_msg_displayed = false;
	$scope.verification_msg_displayed = false;
	$scope.serverSessionTimeout = false;
	$scope.requestData = {
		type: "webuionly",
		file: ""
	};

	$scope.print_status_msg = function(msg, remove_old_spinner, add_new_spinner){
        if(remove_old_spinner) {
            $scope.statusdlg[0].getElementsByClassName("windowContent")[0].innerHTML=
                $scope.statusdlg[0].getElementsByClassName("windowContent")[0].innerHTML.replace($scope.spinner_msg,"");
        }

        if(msg != ""){
            $scope.statusdlg[0].getElementsByClassName("windowContent")[0].innerHTML+="<br />"+ " &#9658;" +translate(msg);
        }

        if(add_new_spinner){
            $scope.statusdlg[0].getElementsByClassName("windowContent")[0].innerHTML+=$scope.spinner_msg ;
        }
    };

    $scope.restartBtnStatus=false;
	$scope.$on("restartSwitch", function() {
		$scope.dlg.data("kendoWindow").close();
		var result = "";
		var cli = "";
		if(angular.element("#saveconfig").is(":checked")){
			$timeout(function() {
				requestRoutingService.getShowCmdOutput("write memory\n");
			},100);
		} 
		cli="reload\n";		
		notificationService.showNotification(translate('restart_success'),translate('software_update_restart_title'),'success');
		$timeout(function() {
			$scope.restartBtnStatus=true;
			result =requestRoutingService.getShowCmdOutput(cli);			
		},100);
		if(result != ""){
			notificationService.showNotification(result,translate('restart_fail'),'error');
		}
	});

	$scope.$on("startSoftwareUpdate", function() {
		document.getElementById("statusMsg").innetHTML = "";
		var formToSubmit = document.getElementById("swUpdateForm");
		if ($scope.requestData.type === "webuiandios") {
			formToSubmit.action = "/archive+download-sw+%2fhttp+uploadFile%0A";
		} else {
			formToSubmit.action = "/archive+download-file+%2fhttp+uploadFile%0A";
			var result = requestRoutingService.getShowCmdOutput("mkdir flash:/uploadFile");
			if (result != "" && result.indexOf("Created dir") < 0 && result.indexOf("File exists") < 0) {
				$scope.doCleanUp(true);
				return;
			}
		}

		//SUBMIT THE FORM
		//___________________
		var csrfToken = "";
		var CMD_GET_CSRF = "";
		if ($(location)[0] != undefined && $(location)[0] != "") {
		    CMD_GET_CSRF = $(location)[0].origin + $(location)[0].pathname + "get_csrf";
		}
		if (CMD_GET_CSRF != "") {
		    csrfToken = "";
		    var xmlHttp = new XMLHttpRequest();
		    // false for synchronous request
		    xmlHttp.open("GET", CMD_GET_CSRF, false);
		    xmlHttp.send(null);
		    csrfToken = xmlHttp.responseText;
		}

		if (csrfToken.indexOf("404 Not Found") == -1) {
		    $.ajaxSetup({ headers: { 'X-Csrf-Token': csrfToken } });
		    $.ajax({
		        // server script to process the upload
		        url: formToSubmit.action,
		        type: 'POST',
		        data: new FormData($('form')[0]),
		        cache: false,
		        contentType: false,
		        processData: false,
		        // error: function(data) {
		        //     $scope.callForUpgrade(data)
		        // },
		        success: function(data) {
		            $scope.callForUpgrade(data)
		        },
		        // Custom XMLHttpRequest
		        xhr: function() {
		            var myXhr = $.ajaxSettings.xhr();
		            if (myXhr.upload) {
		                // For handling the progress of the upload
		                myXhr.upload.addEventListener('progress', function(e) {
		                    console.log("loaded ", e.loaded, " total", e.total)
		                }, false);
		            }
		            return myXhr;
		        }
		    });
		}
		//___________________

		if($scope.requestData.type === "webuiandios"){
			$scope.statusFetchReq = $interval(function(){
				var status = requestRoutingService.getShowCmdOutput("show archive status");
                if(!(status.indexOf('LOADING: Upgrade in progress') >=0)){
                    if($scope.loading_msg_displayed === false){
                        $scope.print_status_msg('config_file_transfer_success_msg',true,false);
                        $scope.loading_msg_displayed= true;
                    }
                }
				var msg = document.getElementById("statusMsg").innetHTML;
				if(msg === undefined || msg === null || msg === ""){
					msg = translate('software_update_copyProgress');
				} else {
                    var newUpdate = translate('software_update_untar');
					if((status.indexOf('VERIFY: Verifying software') >= 0 ||
                          status.indexOf('EXTRACT: Extracting the image') >= 0) && msg.indexOf(newUpdate) < 0){
                        if($scope.verification_msg_displayed === false){
                            $scope.print_status_msg("software_verification_and_untar",false,true);
                            $scope.verification_msg_displayed = true;
                        }

					}
				}
				document.getElementById("statusMsg").innetHTML = msg;
        		}, 15000);
		}
		if($scope.dlg){
			$scope.dlg.data("kendoWindow").close();
		}

	    $scope.statusdlg = dialogService.dialog({
                                content :" &#9658;"+ translate('software_update_copyProgress')+ $scope.spinner_msg,
                                title : translate('software_update_status'),
                                messageType : "inform",
                                visible: false,
                                actionButtons : [{
                                         text : translate("com_ok")
                                }]
                         });
	    /* Disable OK button of the  Status dialog */
		$scope.statusdlg.parent().find(".k-window-action").css("visibility", "hidden");
	    angular.element(".btn.btn-primary.k-button",".inform")[0].disabled = true;
	    $scope.changeServerSessionTimeout("300", true);

	});

	$scope.changeServerSessionTimeout = function(newTimeout, getTimeout){
		if(getTimeout){
			var data = requestRoutingService.getShowCmdOutput("show ip http server status");
			if(data) $scope.serverSessionTimeout = executeCliCmdService.getNextString(data,["Server session idle time-out:"],["seconds"]).trim();
		}
		if(newTimeout){
			var result = requestRoutingService.getConfigCmdOutput("ip http session-idle-timeout " + newTimeout);
			if (result == "") console.log("server session timeout updated to ", newTimeout , " seconds");
		}
	}

	$scope.showUpdateConfirmDialog = function(){
		$scope.dlg = dialogService.dialog({
                                content : translate('software_update_start_confirm'),
                                title : translate('software_update_start'),
                                messageType : "confirm",
                                actionButtons : [{
                                        text : translate("com_ok"),
                                        callback : "startSoftwareUpdate",
                                        btnClass : "dummyClass"
                                }, {
                                        text : translate("com_cancel")
                                }]
                        });
	};

	$scope.showRestartConfirmDialog = function(){
		$scope.dlg = dialogService.dialog({
			content : translate('software_update_restart_confirm') + "<br/>"+ "<div class=\"col-sm-9 col-sm-offset-1 webui-centerpanel-label\"><div class=\"col-sm-4 custom-checkbox\"><span class=\"label\">"+translate('save_configuration')+"</span></div><div class=\"col-sm-1 custom-checkbox\"><input type=\"checkbox\" name=\"saveconfig\" id=\"saveconfig\" class=\"k-checkbox form-control\" ng-model=\"saveconfig\"><label class=\"k-checkbox-label\" for=\"saveconfig\"></label></div></div>" + "<br/>",
			title : translate('software_update_restart_title'),
			messageType : "confirm",
			actionButtons : [{
				text : translate("com_ok"),
				callback : "restartSwitch"
			}, {
				text : translate("com_cancel")
			}]
		});
	};

	$scope.showRestartSuccessDialog = function(){
		$scope.dlg = dialogService.dialog({
			content : translate('software_update_restart_success'),
			title : translate('software_update_restart_title'),
			messageType : "success",
			actionButtons : [{
				text : translate("com_ok")
			}]
		});
	};
	$scope.showRestartFailDialog = function(){
		$scope.dlg = dialogService.dialog({
			content : translate('software_update_restart_fail'),
			title : translate('software_update_restart_title'),
			messageType : "failure",
			actionButtons : [{
				text : translate("com_ok")
			}]
		});
	};


	$scope.showStatus = function(error,restart){
		var type = error?"error":"info";
		var msg="";
		if(error){
			msg = translate('software_update_failed')+ " &#10060";
		}else{
			msg = translate('software_update_successfull') + " &#9989";
			if(restart){
				msg += "<br />"+translate('software_update_restart_message');
			}else{
				msg += "<br />"+translate('software_update_relaunch');
			}
		}
	    $scope.print_status_msg(msg,false,false);
	    /* Enable OK button of Status Dialog */
	    angular.element(".btn.btn-primary.k-button",".inform")[0].disabled = false ;
	};

	$scope.doCleanUp = function(error){
		var platform = $rootScope.deviceInfo.type.split('-')[1];
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
                        platform = $rootScope.deviceInfo.type.split('-')[0];
                }else if($rootScope.deviceInfo.type.indexOf("2960+")!=-1){
                        platform = "C2960";
                }else if($rootScope.deviceInfo.type.indexOf("2960C")!=-1 && $rootScope.deviceInfo.type.indexOf("2960CX") == -1){
                        platform = "C2960C405";
                }else if(platform == "C2960XR"){
                        platform = "C2960X";
                }
                platform = platform.toLowerCase();
                var srcFile = "flash:/uploadFile/" + $scope.requestData.file.split(/(\\|\/)/g).pop();
		document.getElementById("swUpdateForm").reset();
		$scope.showStatus(error,false);
		$scope.clearForm();
	};

	$scope.extractAndCleanFiles = function(){
	    $scope.print_status_msg('untar_done',true,false);
	    $scope.changeServerSessionTimeout($scope.serverSessionTimeout, false);
		var httpServerBasePath = "";
		var httpPath = requestRoutingService.getShowCmdOutput("show ip http server status | i HTTP server base path")

        	if(httpPath.indexOf("flash:/") == -1){
                	httpPath = httpPath.substr(29);
                	httpPath = "flash:/" + httpPath;
        	}else{
                	httpPath = httpPath.substr(23);
        	}
		var error = false;
        	httpServerBasePath = httpPath;
		var newPath = httpServerBasePath+".new";
		var result = requestRoutingService.getShowCmdOutput("mkdir "+newPath);
		if(result != "" && result.indexOf("Created dir") < 0 && result.indexOf("File exists") < 0 ){
			error = true;
			$scope.doCleanUp(error);
			return;
		}

		//copy macros to running config
		var macroFile = httpServerBasePath+"/macros/extractMacro";
		var macroCommand = "copy " + macroFile + " running-config";
		var result1 = requestRoutingService.getShowCmdOutput(macroCommand);
		if(result1.indexOf("bytes copied") < 0){
                        error = true;
			$scope.doCleanUp(error);
			return;
		}

		//run macros
		//flash:/uploadFile/c2960l-cwml.tar
		var platform = $rootScope.deviceInfo.type.split('-')[1];
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
			platform = $rootScope.deviceInfo.type.split('-')[0];
		}else if($rootScope.deviceInfo.type.indexOf("2960+")!=-1){
			platform = "C2960";
		}else if($rootScope.deviceInfo.type.indexOf("2960C")!=-1 && $rootScope.deviceInfo.type.indexOf("2960CX") == -1){
			platform = "C2960C405";
		}else if(platform == "C2960XR"){
			platform = "C2960X";
		}
		platform = platform.toLowerCase();
		var srcFile = "flash:/uploadFile/" + $scope.requestData.file.split(/(\\|\/)/g).pop();
		var result2 = requestRoutingService.getConfigCmdOutput("macro global apply extractMacro $SRCFILE " + srcFile +" $TARGETPATH " + newPath);
		//If old directory is present, delete it.
		var result3 = requestRoutingService.getShowCmdOutput("delete /force /recursive "+httpServerBasePath+".old");
		//Rename the directories. Current becomes .old, and .new extracted above becomes current
		var result4 = requestRoutingService.getShowCmdOutput("rename "+httpServerBasePath+" "+httpServerBasePath+".old");
		if(result4 != "" && result4.indexOf("Destination filename") < 0 ){
			error=true;
			$scope.doCleanUp(error);
			return;
		}
		var result5 = requestRoutingService.getShowCmdOutput("rename "+newPath+" "+httpServerBasePath);
		if(result5 != "" && result5.indexOf("Destination filename") < 0 ){
			error=true;
			$scope.doCleanUp(error);
			return;
		}

		//Do the cleanup on success as no error has occured
	    $scope.print_status_msg('clean_up',false,false);
		$scope.doCleanUp(error);
	};

	// document.getElementById('statusDetails').onload = function(){
	// 	if(document.getElementById('uploadFile').files.length == 0){
	// 		return;
	// 	}
	// 	var response = this.contentDocument.body.innerText;
	$scope.callForUpgrade = function(output) {
        var response = output;
		if(response.indexOf("Succeed: uploadFile") >= 0 || (response.indexOf("404 Not Found") >= 0 && ($rootScope.deviceInfo.version.indexOf("15.2(7)E1") >=0 || $rootScope.deviceInfo.version.indexOf("15.2(7)E2") >=0 || ($rootScope.deviceInfo.version.indexOf("15.2(7)E3") >=0 || ($rootScope.deviceInfo.version.indexOf("15.2(7.1") >=0 && $rootScope.deviceInfo.version.indexOf("E3") >=0))) && $scope.requestData.type === "webuionly")){
			//WEBUIONLY success
	        $scope.print_status_msg("config_file_transfer_success_msg", true,false);
	        $scope.print_status_msg('software_update_untar',false,true);
	        timeout(function(){
			$scope.extractAndCleanFiles();
	        },2000);
		} else if (response.indexOf("All software images installed") >=0 || (response.indexOf("404 Not Found") >= 0 && ($rootScope.deviceInfo.version.indexOf("15.2(7)E1") >=0 || $rootScope.deviceInfo.version.indexOf("15.2(7)E2") >=0 || ($rootScope.deviceInfo.version.indexOf("15.2(7)E3") >=0 || ($rootScope.deviceInfo.version.indexOf("15.2(7.1") >=0 && $rootScope.deviceInfo.version.indexOf("E3") >=0))) && $scope.requestData.type === "webuiandios")){
			//WEBUIANDIOS success
			if($scope.statusFetchReq){
				$interval.cancel($scope.statusFetchReq);
				$scope.statusFetchReq = null;
			}
			$scope.changeServerSessionTimeout($scope.serverSessionTimeout, false);
			var msg = document.getElementById("statusMsg").innetHTML;
			msg += "\n" + translate('software_update_successfull')
					+ " " + translate('software_update_restart_message');
			document.getElementById("statusMsg").innetHTML = msg;
			document.getElementById("swUpdateForm").reset();
	        /* Remove spinner for WEBUI+IOS */
			$scope.print_status_msg("",true,false);
			$scope.showStatus(false,true);
			$scope.clearForm();
		} else{
			//UPDATE FAILED
			$scope.changeServerSessionTimeout($scope.serverSessionTimeout, false);
			var msg1 = document.getElementById("statusMsg").innetHTML;
			msg1 += "\n" + translate('software_update_failed');
			document.getElementById("statusMsg").innetHTML = msg1;
			if($scope.statusFetchReq){
				$interval.cancel($scope.statusFetchReq);
				$scope.statusFetchReq = null;
			}
			document.getElementById("swUpdateForm").reset();
			$scope.showStatus(true,false);
			$scope.clearForm();
		}
	};

	$scope.fileSelected = function(file){
		if(file.value != ''){
			$scope.requestData.file = file.value;
			$scope.$apply();
		}
	};

	$scope.clearForm = function(){
		$scope.requestData.type = "webuionly";
		$scope.requestData.file = "";
		$scope.statusFetchReq = null;
		$scope.$apply();
	};

	$scope.fileTypeDataSource = new kendo.data.ObservableArray([
                                {"name": translate('software_update_file_type_webui'), "value": "webuionly"},
                                {"name": translate('software_update_file_type_webuiandios'), "value": "webuiandios"}
                        ]);
}]);
