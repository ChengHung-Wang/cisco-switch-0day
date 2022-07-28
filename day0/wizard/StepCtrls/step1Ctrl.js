/**
 Description: Controller - Day Zero Wizard
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("step1Ctrl", ['$scope', 'dayZeroStepService', 'validationService', '$filter','$timeout','$rootScope','requestRoutingService',
function($scope, dayZeroStepService,  validationService,$filter,$timeout,$rootScope,requestRoutingService) {
	var translate = $filter("translate");
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
	$scope.basicConfigToolTip=true;
	var todayDate = new Date();
	$scope.dayzero = {};
	$scope.dayzero.enableVTPTransparent=false;
	$scope.dayzero.enableTelnet=false;
	$scope.dayzero.enableSSH=false;
	$scope.dayzero.enableAutoQosPhones=false;
	$scope.dayzero.enableAutoQosUplink=false;
	$scope.advConfigToolTip=true;
	var cultureName = "";
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
	angular.element("#hostName").on("focus", function () {
		$timeout(function(){
			$scope.hostNameTip = true;
		},0);
	});
	angular.element("#userName").on("focus", function () {
		$timeout(function(){
			$scope.userNameTip = true;
		},0);
	});
	angular.element("#password").on("focus", function () {
		$timeout(function(){
			$scope.passwordTip = true;
		},0);
	});
	angular.element("#enablePassword").on("focus", function () {
		$timeout(function(){
			$scope.enablePasswordTip = true;
		},0);
	});
	angular.element("#clock").on("focus", function () {
		$timeout(function(){
			$scope.clockTip = true;
		},0);
	});
	angular.element("input").on("blur", function () {
		$timeout(function(){
			$scope.hostNameTip=false;
			$scope.userNameTip=false;
			$scope.passwordTip=false;
			$scope.enablePasswordTip=false;
			$scope.clockTip=false;
			$scope.basicConfigToolTip=true;
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
			$scope.basicConfigToolTip=false;
		},0);
	});
	$timeout(function(){
		angular.element("#clock").kendoDateTimePicker({
			value: todayDate,
			format: "yyyy-MM-dd HH:mm:ss",
			culture: kendo.culture('en')
		});
		var datepicker = angular.element("#clock").data("kendoDateTimePicker");
		$scope.dayzero.clock = datepicker._oldText;
		$scope.defaultTime = angular.element('#clock').val();
	},100);
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
	$scope.wizardValidations = {
		//TODO: make it re-usable
		rules : {
			hostnamevalidate : function(input) {
				var valMsg = input.data('hostnamevalidateMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				var regExp=/^[0-9-_]+$/;
				if(regExp.test(input.val())){
					return false;
				}
				return true;
			},
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
			},
			minchar: function(input){
				var field = input.val(); 
				var minlen = input.data('minchar');
				var valMsg = input.data('mincharMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				if(minlen && field.length >= minlen){
					return true;
				}
				return false;
			},
			pwdvalid: function(input){
				var field = input.val(); 
				var minlen = input.data('pwdmin');
				if(minlen){
					var valMsg = input.data('pwdvalidMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(field.length >= minlen)
					{ 
						var pwdReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)|(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]/;
						return pwdReg.test(field);
					}
					return false;	
				}
				return true;
			},
			pwdmatch: function(input){
				var pwd = input.val();
				var valMsg = input.data('pwdmatchMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				if($scope.dayzero.password === pwd){
					return true;
				}
				return false;
			}
		}
	};
	$scope.$on("dayZeroWizard:nextButtonPressed", function(evt, laststep, stepNumber) {
		if (stepNumber === 1) {
			$scope.myValidator = $scope.basicScreenValidator;
			validationService.addValidator($scope.myValidator, 1);
			validationService.setWirelessPossible(true);
			if ($scope.myValidator && $scope.myValidator.validate()) {
				$scope.convertToDeviceTime=$filter('date')(new Date($scope.dayzero.clock),'HH:mm:ss dd MMMM yyyy');
				var basicConfig = {
					"hostName": $scope.dayzero.hostName,
					"userName": $scope.dayzero.userName,
					"password": $scope.dayzero.password,
					"enablePassword": $scope.dayzero.enablePassword,
					"clock": $scope.convertToDeviceTime
				};
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
				var basicConfigResult = Object.assign(basicConfig, advConfig);
				dayZeroStepService.setBasicConfig(basicConfigResult);
			}
		}
	});
}]);
