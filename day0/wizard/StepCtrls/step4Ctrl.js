/**
Description: Controller - Day Zero Wizard
Copyright (c) 2016 by Cisco Systems, Inc.
	All rights reserved.
*/
app.controller("step4Ctrl", ['$scope','$rootScope','dayZeroStepService', 'validationService' ,'$filter','$timeout','requestRoutingService',
function($scope,$rootScope, dayZeroStepService, validationService, $filter,$timeout,requestRoutingService){
	var translate = $filter("translate");
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
	$scope.version = versionInfo.ShowVersion.version.split(',')[0];
	$rootScope.deviceInfo = {
		type: versionInfo.ShowVersion.name
	};
	if( ($rootScope.deviceInfo.type.indexOf("C2960X") != -1 && $rootScope.deviceInfo.type.indexOf("-LL") == -1) ||
        ($rootScope.deviceInfo.type.indexOf("C3560CX") != -1) ||
        ($rootScope.deviceInfo.type.indexOf("2960C") != -1 && $rootScope.deviceInfo.type.indexOf("-S") == -1)  ||
        ($rootScope.deviceInfo.type.indexOf("WS-C2960+") != -1 && $rootScope.deviceInfo.type.indexOf("-S") == -1) ||
        ($rootScope.deviceInfo.type.indexOf("2960XR") != -1)  ||
        ($rootScope.deviceInfo.type.indexOf("2960CX") != -1) ) {
              $scope.showDeviceStatus=true;
	}else{
			  $scope.showDeviceStatus=false;
	}
	var dayzeroConfigCLI='';
	$scope.dayzero={};
	$scope.dayzero.enableVTPTransparent=true;
	$scope.dayzero.enableTelnet=false;
	$scope.dayzero.enableSSH=false;
	$scope.dayzero.enableAutoQosPhones=false;
	$scope.dayzero.enableAutoQosUplink=false;
	$scope.advConfigToolTip=true;
	angular.element("#enableTelnet").on("focus", function () {
		$timeout(function(){
			$scope.enableTelnetTip = true;
		},0);
	});
	angular.element("#enableVTPTransparent").on("focus", function () {
		$timeout(function(){
			$scope.enableVTPTransparentTip = true;
		},0);
	});
	angular.element("#enableSSH").on("focus", function () {
		$timeout(function(){
			$scope.enableSSHTip = true;
		},0);
	});
	angular.element("#enableAutoQosPhones").on("focus",function(){
			$timeout(function(){
				$scope.enableAutoQosPhonesTip = true;
			},0);
	});
	angular.element("#enableAutoQosUplink").on("focus",function(){
		$timeout(function(){
			$scope.enableAutoQosUplinkTip = true;
		},0);
	});
	angular.element("#domainName").on("focus",function(){
		$timeout(function(){
			$scope.domainNameTip = true;
		},0);
	});
	angular.element("#rsaKey").on("focus",function(){
		$timeout(function(){
			$scope.rsaKeyTip = true;
		},0);
	});
	angular.element("input").on("blur", function () {
		$timeout(function(){
			$scope.enableTelnetTip=false;
			$scope.enableVTPTransparentTip=false;
			$scope.enableSSHTip=false;
			$scope.enableAutoQosPhonesTip=false;
			$scope.enableAutoQosUplinkTip=false;
			$scope.domainNameTip=false;
			$scope.rsaKeyTip=false;
			$scope.advConfigToolTip=true;
		},0);
	});
	angular.element("input").on("focus", function () {
		$timeout(function(){
			$scope.advConfigToolTip=false;
		},0);
	});
	//field validations
	$scope.wizardValidations = {
		rules : {
			domainnamevalidate : function(input) {
				var valMsg = input.data('domainnamevalidateMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				var regExp=/^[0-9-_]+$/;
				if(regExp.test(input.val())){
					return false;
				}
				return true;
			},
			rsakeyvalidate : function(input){
				var valMsg = input.data('rsakeyvalidateMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				if(input.val() == ""){
					return false;
				}
				return true;
			},
			range: function (input) {
				var valMsg = input.data('rangeMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				if(input.val()==''){
					return false;
				}
				var min= input.prop('min');
				var max= input.prop('max');
				var arr = input.val();
				min = parseFloat(min);
				max = parseFloat(max);
				arr = parseFloat(arr);
					if((arr>= min)&&(arr<= max)) {
						return true;
					} else {
						return false;
					}
				return false;
			}
		}
	};
	$scope.$on("dayZeroWizard:nextButtonPressed", function(evt, laststep, stepNumber) {
		if (stepNumber === 4) {
			$scope.myValidator = $scope.basicScreenValidator;
			validationService.addValidator($scope.myValidator, 4);
			if ($scope.myValidator && $scope.myValidator.validate()){
				var vtpstatus=translate("com_enable");
				if($scope.dayzero.enableVTPTransparent){
					vtpstatus=translate("com_enable");
				}else{
					vtpstatus=translate("com_disable");
				}
				//set telnet enable
				var enbaleTelnetVal,telnetStatus;
				if($scope.dayzero.enableTelnet){
					telnetStatus = 1;
					enbaleTelnetVal=translate("com_enable");
				} else {
					telnetStatus = 0;
					enbaleTelnetVal=translate("com_disable");
				}
				//enable SSH enable and domainName and rsaKey
				var enbaleSSHVal='',sshStatus,domainNameadv,rsaKeyadv=2048,advConfig;
				if($scope.dayzero.enableSSH){
					sshStatus=1;
					enbaleSSHVal=translate("com_enable");
					domainNameadv = $scope.dayzero.domainName;
					rsaKeyadv = $scope.dayzero.rsaKey;
				}else{
					sshStatus=0;
					enbaleSSHVal=translate("com_disable");
				}
				if(  ($rootScope.deviceInfo.type.indexOf("C2960X") != -1 && $rootScope.deviceInfo.type.indexOf("-LL") == -1) ||
				     ($rootScope.deviceInfo.type.indexOf("C3560CX") != -1) ||
				     ($rootScope.deviceInfo.type.indexOf("2960C") != -1 && $rootScope.deviceInfo.type.indexOf("-S") == -1)  ||
				     ($rootScope.deviceInfo.type.indexOf("WS-C2960+") != -1 && $rootScope.deviceInfo.type.indexOf("-S") == -1) ||
				     ($rootScope.deviceInfo.type.indexOf("2960XR") != -1)  ||
				     ($rootScope.deviceInfo.type.indexOf("2960CX") != -1) ) {
					//Enable auto QoS
						var enableAutoQosPhones,enableAutoQosCli;
						if($scope.dayzero.enableAutoQosPhones) {
							enableAutoQosPhones=translate("com_enable");
							enableAutoQosCli='auto qos voip cisco-phone';
						}else{
							enableAutoQosPhones=translate("com_disable");
						}
					//Enable auto Qos for uplink
						var enableAutoQosUplink='';
						var enableAutoQosUplinkCli='';
						if($scope.dayzero.enableAutoQosUplink) {
							enableAutoQosUplink=translate("com_enable");
							enableAutoQosUplinkCli='auto qos voip trust';
						}else{
							enableAutoQosUplink=translate("com_disable");
						}
						advConfig = {
							"enableVTPTransparent":vtpstatus,
							"enableTelnet":enbaleTelnetVal,
							"telnetStatus":telnetStatus,
							"enableSSH":enbaleSSHVal,
							"sshStatus":sshStatus,
							"domainName":domainNameadv,
							"RSAKey":rsaKeyadv,
							"enableQosPhones":enableAutoQosPhones,
							"enableAutoQosCli":enableAutoQosCli,
							"enableQosUplink":enableAutoQosUplink,
							"enableAutoQosUplinkCli":enableAutoQosUplinkCli
						};
						} else {
				advConfig = {
				"enableVTPTransparent":vtpstatus,
				"enableTelnet" : enbaleTelnetVal,
				"enableSSH" : enbaleSSHVal,
				"domainName" : domainNameadv,
				"RSAKey" : rsaKeyadv
				};
				}
				dayZeroStepService.setAdvConfig(advConfig);
			}
		}
	});
}]);