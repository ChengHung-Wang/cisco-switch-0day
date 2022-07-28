/**
 Description: Controller - Day Zero Wizard
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';

angular.module('webUiDevApp').controller('DayZeroCtrl', ['$scope', 'validationService', 'dayZeroStepService','httpEndPointService', '$location','requestRoutingService','notificationService','$filter','$window','dialogService','$interval',
	function($scope, validationService, dayZeroStepService, httpEndPointService,$location,requestRoutingService,notificationService,$filter,$window,dialogService,$interval) {
		var translate = $filter("translate");
		if(navigator.language.indexOf("zh") != -1){
			kendo.culture("zh")
		}else if(navigator.language.indexOf("ko") != -1){
			kendo.culture("ko");
		}else if(navigator.language.indexOf("ja") != -1){
			kendo.culture("ja")
		}else if(navigator.language.indexOf("de") != -1){
			kendo.culture("de")
		}else if(navigator.language.indexOf("es") != -1){
			kendo.culture("es")
		}
		$scope.mainStep=true;
		$scope.welcomeScreen=false;
		$scope.gotoScreen = false;
		$scope.$emit("WebUI::DayZeroCheck");
		               //Special case, need to relook at the implementation in phase2
                //******************************************
                var sendConfigReq = function(dayZeroConfigCli){
                        var csrfToken = "";
                        var CMD_GET_CSRF = "";
                        if($(location)[0] != undefined && $(location)[0] !=""){
                            CMD_GET_CSRF = $(location)[0].origin+"/"+"get_csrf";
                        }
                        if(CMD_GET_CSRF != ""){
                            csrfToken="";
                            var xmlHttp = new XMLHttpRequest();
                            // false for synchronous request
                            xmlHttp.open( "GET", CMD_GET_CSRF, false );
                            xmlHttp.send( null );
                            csrfToken = xmlHttp.responseText;             
                        }

                        if(csrfToken.indexOf("404 Not Found") == -1){
                            $.ajaxSetup({headers: {'X-Csrf-Token':csrfToken}});
                        }
                        var CMD_HTTP_URL = '/ios_web_exec/commandset';
                        var requestData = "! COMMANDSET VERSION=\"1.0\"\n" +
                        "! OPTIONS BEGIN\n! MODE=\"" + "1" + "\"\n" +
                        "! OPTIONS END\n" +
                                dayZeroConfigCli + "\n" +
                        "! END\n! COMMANDSET END";
                        var d = new Date();
                        $.ajax({
                                type: 'POST',
                                async: 'false',
                                timeout: 5000,
                                url: CMD_HTTP_URL,
                                data: requestData,
                                success: function(data){
					angular.element("body.busy").removeClass("busy");
                                		if((data.indexOf('PARSE_ERROR="2"')!=-1)|| (data.indexOf('PARSE_ERROR="1"')!=-1) || (data.indexOf('PARSE_ERROR="3"')!=-1)){
                                			notificationService.showNotification("Error: ",translate('com_config_fail_title'),'error');
                                		} else {
                                			$scope.laySummary= dayZeroStepService.getLayConfig();
											$scope.ipAddressAssign=dayZeroStepService.getIpAddressAssign()
											$scope.$watch(function() {
													return dayZeroStepService.getLayConfig();
											}, function(newValue,oldValue) {
													$scope.laySummary = newValue;
											});
											if($scope.laySummary.newIpAddress){
													var vlanInterface=dayZeroStepService.getVlanInter();
													for(var i=0;i<vlanInterface.length;i++){
															var ipAddress=vlanInterface[i]['IP-Address'];
													}
													if(ipAddress!=$scope.laySummary.newIpAddress){
														commonConfirmationSwitch($scope.laySummary.newIpAddress);
													} else {
                                                                                        		window.location.href = "http://" + ipAddress;
                                                                                		}
											}else {
													for(var i=0;i<$scope.ipAddressAssign.length;i++){
															if($scope.ipAddressAssign[i].ipAddress){
																	commonConfirmationSwitch($scope.ipAddressAssign[i].ipAddress);
																	break;
															}
													}
											}
                                		}
                                },
                                error: function(data){
                                        //If its timed out, most likely it succeeded, assume success
                                        angular.element("body.busy").removeClass("busy");
					notificationService.showNotification(translate('day0_wizard_success_msg'),translate('com_config_success_title'),'success');
                                	$scope.laySummary= dayZeroStepService.getLayConfig();
                                	$scope.ipAddressAssign=dayZeroStepService.getIpAddressAssign()
                                	$scope.$watch(function() {
                                        	return dayZeroStepService.getLayConfig();
                                	}, function(newValue,oldValue) {
                                        	$scope.laySummary = newValue;
                                	});
                                	if($scope.laySummary.newIpAddress){
                                        	var vlanInterface=dayZeroStepService.getVlanInter();
                                        	for(var i=0;i<vlanInterface.length;i++){
                                                	var ipAddress=vlanInterface[i]['IP-Address'];
                                        	}
                                        	if(ipAddress!=$scope.laySummary.newIpAddress){
												commonConfirmationSwitch($scope.laySummary.newIpAddress);
											} else {
											window.location.href = "http://" + ipAddress;
										}
                                	}else {
                                        	for(var i=0;i<$scope.ipAddressAssign.length;i++){
                                                	if($scope.ipAddressAssign[i].ipAddress){
                                                        	commonConfirmationSwitch($scope.ipAddressAssign[i].ipAddress);
                                                        	break;
                                                	}
                                        	}
                                	}

                                }
                        });
                };
				//******************************************
		$scope.isDay0Mode = false;
		$scope.nextTab = translate("day0_wizard_summary");
		$scope.prevTab = translate("day0_wizard_interface_config");
		var findClients = function(){
			var sCDPLldpDetails,
				cdpClients = [],
			showCDPDetails = requestRoutingService.getShowCmdOutput("show cdp neighbors detail", "clientsShowCdpNeighborsDetail");
			if(angular.isUndefined(showCDPDetails.showCdpNeighborsDetail.wnwebdata)){
				showCDPDetails = undefined;
			}else if(!angular.isArray(showCDPDetails.showCdpNeighborsDetail.wnwebdata)){
				showCDPDetails = [showCDPDetails.showCdpNeighborsDetail.wnwebdata];
			}else{
				showCDPDetails = showCDPDetails.showCdpNeighborsDetail.wnwebdata;
			}
			if(showCDPDetails==undefined){
				showCDPDetails = [];
			}
			for(var cl in showCDPDetails){
				if(showCDPDetails[cl].Manufacturer.indexOf('AP') != -1 || showCDPDetails[cl].Manufacturer.indexOf('IW') != -1){
					if(showCDPDetails[cl].hasOwnProperty('SwitchPort')){
						cdpClients.push(showCDPDetails[cl].SwitchPort);
					}
				}
			}
			dayZeroStepService.setCDPClientSwitchPort(cdpClients);
			return cdpClients;
		}
		$scope.findControllerIP = function(){
			//Check if the device has come up after being reset
			//And if the new IP has been assigned
			var controllerIP = dayZeroStepService.setControllerIP();
			var day0Mode = "";
			if(controllerIP != undefined && controllerIP != ""){
					//We got back the Controller online
					//Run day 0 check and unset the busy cursor.
					day0Mode = dayZeroStepService.setDay0Mode(controllerIP);
					day0Mode.then(function(_day0Mode){						
						if(_day0Mode && _day0Mode.data.hasOwnProperty('prodid')){
							$scope.isDay0Mode = _day0Mode.data.prodid == "" ? false : true;
							dayZeroStepService.setDay0ModeBool($scope.isDay0Mode);
							$scope.nextTab = translate("dayzero_wireless_config");
							$scope.prevTab = $scope.nextTab;
						}
						//$interval.cancel(clearInterval);
						$scope.gotoScreen = true;
					});
			}
		};
		var clearInterval;
		$scope.initLoad = function(){
			//Checking Device type and setting logo accordingly 
			var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
			if(versionInfo.ShowVersion.name.indexOf("S6650L") != -1 || versionInfo.ShowVersion.name.indexOf("S5960") != -1 ){				
				$scope.ciscoDevice=false;
				$scope.inspurDevice=true;
			}else{				
				$scope.ciscoDevice=true;
				$scope.inspurDevice=false;
			}		
			var dayZeroInitConfigCli= "ip dhcp pool 10.0.0.0\n default-router 10.0.0.1\n exit\n";
			//var result = requestRoutingService.getConfigCmdOutput(dayZeroInitConfigCli);
			var controllerIP = dayZeroStepService.setControllerIP();
			var day0Mode = dayZeroStepService.setDay0Mode(controllerIP);
			if(controllerIP && controllerIP != ""  && day0Mode){
			/*
				This is the device. We need to force it to get a fresh IP
				by running shut and no shut for this port. This will force the
				controller to request dhcp lease again and now it gets the 
				default router IP also.
			*/
				var cdpNeighClient = findClients(), detectedPort="";
                                for(var cdp = 0; cdp < cdpNeighClient.length; cdp++){
                                        detectedPort = "interface "+cdpNeighClient[cdp]+"\n";
                                        detectedPort += "shut\n no shut\n";
                                        detectedPort += "exit\n";
                                        detectedPort += "do clear ip dhcp binding " + controllerIP + "\n";
                                }
				//In service, set the IP to empty
				dayZeroStepService.setControllerIP("");
				$scope.findControllerIP();
				//Run the CLI to shut and no shut the port and clear dhcp binding
				/*
                                var result = requestRoutingService.getConfigCmdOutput(detectedPort);
				clearInterval = $interval(function () {
					//Loop and check if the controller has come up after restart
					$scope.findControllerIP();
				}, 10000);
				*/
			} else {
				//$interval.cancel(clearInterval);
				$scope.gotoScreen = true;
			}
		}
		$scope.cancelControllerIPLoop = function(){
			$interval.cancel(clearInterval);
			$scope.gotoScreen = true;
		}
		$scope.finishedWizard = function() {
			var dayZeroConfigCli=dayZeroStepService.getCli();
			angular.element("body").addClass("busy");
                        sendConfigReq(dayZeroConfigCli);
                        return;

			var result = requestRoutingService.getConfigCmdOutput(dayZeroConfigCli);
			if( result=="" || result.indexOf("Written") >-1 ){
				notificationService.showNotification(translate('day0_wizard_success_msg'),translate('com_config_success_title'),'success');
				$scope.laySummary= dayZeroStepService.getLayConfig();
				$scope.ipAddressAssign=dayZeroStepService.getIpAddressAssign()
				$scope.$watch(function() {
					return dayZeroStepService.getLayConfig();
				}, function(newValue,oldValue) {
					$scope.laySummary = newValue;
				});
				if($scope.laySummary.newIpAddress){
					var vlanInterface=dayZeroStepService.getVlanInter();
					for(var i=0;i<vlanInterface.length;i++){
						var ipAddress=vlanInterface[i]['IP-Address'];
					}
					if(ipAddress!=$scope.laySummary.newIpAddress){
					commonConfirmationSwitch($scope.laySummary.newIpAddress);
					}
				}else {
					for(var i=0;i<$scope.ipAddressAssign.length;i++){
						if($scope.ipAddressAssign[i].ipAddress){
							commonConfirmationSwitch($scope.ipAddressAssign[i].ipAddress);
							break;
						}
					}
				}
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
		};
		var redirectIP='';
		var commonConfirmationSwitch = function(newIP) {
			redirectIP=newIP;
			if(newIP.indexOf(":")!=-1){
				newIP=newIP.split("/")[0];
				newIP="["+newIP+"]";
			}
			$scope.dlgSwitch = dialogService.dialog({
				content : translate("msg_redirect_confirmation")+" "+newIP,
				title : translate("msg_redirect_confirmation_window"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "pageRedirection"

				}, {
					text : translate("com_cancel")
				}]
			});
		};

		$scope.$on("pageRedirection", function(event, data) {
			var baseUrl = $window.location.origin;
			if(redirectIP.indexOf(":")!=-1){
				redirectIP=redirectIP.split("/")[0];
				redirectIP="["+redirectIP+"]";
			}		
			if(baseUrl.indexOf('https') > -1){
				$window.location.href = "https://"+ redirectIP;
			}else {
				$window.location.href = "http://"+ redirectIP;
			}
		});

		$scope.gotowelcomeScreen = function(string) {
			if (string==="towelcome") {
				$scope.myValidator = $scope.createUserValidator;
				validationService.addValidator($scope.myValidator, 1);
				if ($scope.myValidator && $scope.myValidator.validate() == true) {
					$scope.welcomeScreen=false;
				}
			} else if (string==="towizard"){
				$scope.mainStep=false;
				$scope.welcomeScreen=true;
			}
		}
		$scope.wizardValidations = {
			rules : {

			}
		};
		$scope.getData = function(wzModel, isLastStep, stepNumber) {
			//broadcasting next button pressed event to the individual step controllers...
			$scope.$broadcast('dayZeroWizard:nextButtonPressed', isLastStep, stepNumber);
		};
		// Broadcast the event on site profile change
		$scope.$on("dayZeroWizard:notifySiteProfileChange", function(evt, siteProfile) {
			$scope.$broadcast('dayZeroWizard:siteProfileChanged', siteProfile);
		});
		// Broadcast event on wireless state change
		$scope.$on("dayZeroWizard:wirelessToggle", function(evt, wirelessState) {
			$scope.$broadcast('dayZeroWizard:wirelessStateChange', wirelessState);
		});
		// Broadcast event on wired state change
		$scope.$on("dayZeroWizard:wiredToggle", function(evt, wiredState) {
			$scope.$broadcast('dayZeroWizard:wiredStateChange', wiredState);
		});
		$scope.$on("dayZeroWizard:notifySetupToggle", function(evt) {
			$scope.$broadcast("dayZeroWizard:setupToggle");
		});
		$scope.$on("DayZeroWizard:notifyDHCPChange", function(evt, dhcpAddress) {
			$scope.$broadcast("dayZeroWizard:dhcpChanged", dhcpAddress);
		});
	}]);
