/**
 Description: Controller - Day Zero Wizard
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("step3Ctrl", ['$scope','$rootScope', 'dayZeroStepService', 'validationService', '$timeout','$filter','$compile','executeCliCmdService','requestRoutingService',
function($scope,$rootScope, dayZeroStepService, validationService, $timeout, $filter,$compile,executeCliCmdService,requestRoutingService) {
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
    var deviceType = versionInfo.ShowVersion.name;
	$scope.interface = {
		selected:{}
	};
	$scope.ipAddress = {
		selected:{}
	};
	$scope.newIpAddress = {
		selected:{}
	};
	$scope.subnetMask = {
		selected:{}
	};
	$scope.layerConfigToolTip=true;
	angular.element("#defaultGateway").on("focus", function () {
		$timeout(function(){
			$scope.defaultGatewayTip = true;
		},0);
	});
	angular.element("#defaultRoute").on("focus", function () {
		$timeout(function(){
			$scope.defaultRouteTip = true;
		},0);
	});
	$(document).on("focus","#dynamicInterface input", function () {
		$timeout(function(){
			$scope.ipAddressAssignTip = true;
			$scope.layerConfigToolTip=false;
		},0);
	});
	$(document).on("blur","#dynamicInterface input", function () {
		$timeout(function(){
			$scope.ipAddressAssignTip = false;
			$scope.layerConfigToolTip=true;
		},0);
	});
	angular.element("input").on("blur", function () {
		$timeout(function(){
			$scope.defaultGatewayTip=false;
			$scope.defaultRouteTip=false;
			$scope.ipAddressAssignTip=false;
			$scope.layerConfigToolTip=true;
		},0);
	});
	angular.element("input").on("focus", function () {
		$timeout(function(){
			$scope.layerConfigToolTip=false;
		},0);
	});
	$scope.iprouteDisable=true;
	if ((deviceType.indexOf("C2960X") != -1)
			|| (deviceType.indexOf("2960XR") != -1)
			|| (deviceType.indexOf("C3560CX") != -1)
			|| (deviceType.indexOf("2960CX") != -1)) {
		$scope.iprouteDisable = false;
	}
	if((deviceType.indexOf("C2960X") != -1) && (deviceType.indexOf("-LL") != -1)){
		$scope.iprouteDisable=true;
	}
	var translate = $filter("translate");
	$scope.dayzero={};
	var ipArr = deviceCommunicator.getExecCmdOutput("show running interface Vlan 1 | i secondary").split(" ");
	$scope.dayzero.vlan="Vlan1";
        $scope.dayzero.ipAddress = ipArr[2];
	$scope.interfaceOptions=dayZeroStepService.getInterOption();
	$scope.$watch(function() {
		return dayZeroStepService.getInterOption();
	}, function(newValue) {
		$scope.interfaceOptions = newValue;
		$scope.accordions = [];
		for(var i=0;i<$scope.interfaceOptions.length;i++){
			$scope.accordions.push($scope.accordions.length);
			$scope.interface.selected[i]=$scope.interfaceOptions[i].interfaceText;
		}
	});
	var ipAddressReg=/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	var subnetRegex = /^(255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252)$/;
	$scope.wizardValidations = {
		rules : {
			validateip:function(input){
				var valMsg = input.data('validateipMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				var ipAddress=input.val();
				if (ipAddress=="0.0.0.0" || '') {
					return false;
				}
				if (ipAddressReg.test(ipAddress)) {
					return true;
				};
				return false;
			},
			routevalidate:function(input){
				var valMsg = input.data('routevalidateMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				//One of the IP addresses is mandatory
				//IP can be on default vlan1, data vlan or voice vlan
				if(angular.element("#newIpAddress1").val()){
					if(angular.element("#newIpAddress").val() == "" &&
					angular.element("#newIpAddress0").val() == "" && angular.element("#newIpAddress1").val() == ""){
						return false;
					}
				}
				else if(angular.element("#newIpAddress").val() == "" &&
					angular.element("#newIpAddress0").val() == ""){
					return false;
				}
				if (input.val()==''){
					return true;
				}
				if (input.val()=="0.0.0.0"){
					return false;
				}
				if (ipAddressReg.test(input.val()) && input.val()!='') {
					return true;
				};
				return false;
			},
			submaskvalidate:function(input){
				var valMsg = input.data('submaskvalidateMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				//check for its corresponding IP. If the IP is not empty, the subnet should be validated
				var subnetId = input[0].id;
				var myIp = "";
				if(subnetId == "subnetMask"){
					myIp = angular.element("#newIpAddress").val();
				} else if (subnetId == "subnetMask0"){
					myIp = angular.element("#newIpAddress0").val();
				} else {
					myIp = angular.element("#newIpAddress1").val();
				}
				if(input.val()==""){
					if(myIp != ""){
						return false;
					} else {
						return true;
					}
				}
				if (input.val()=="0.0.0.0"){
					return false;
				}
				if (subnetRegex.test(input.val()) && input.val()!='') {
					return true;
				};
				return false;
				}
		}
	};

	$scope.$on("dayZeroWizard:nextButtonPressed", function(evt, laststep, stepNumber) {
		if (stepNumber === 3) {
			$scope.myValidator = $scope.basicScreenValidator;
			validationService.addValidator($scope.myValidator, 3);
			if ($scope.myValidator && $scope.myValidator.validate()) {
				var ipAddressAssign =[];
					for(var i=0;i<$scope.interfaceOptions.length;i++){
						if($scope.interface.selected[i]&&$scope.newIpAddress.selected[i]&&$scope.subnetMask.selected[i]) {
							ipAddressAssign.push({
								"vlan": $scope.interface.selected[i],
								"ipAddress": $scope.newIpAddress.selected[i],
								"subnet":$scope.subnetMask.selected[i]
							});
						}
					}
				var vlanInterfaceDef='';
				var newIpAddressDef='';
				var subnetMaskVal='';
				if($scope.dayzero.vlan&&$scope.dayzero.newIpAddress&&$scope.dayzero.subnetMask){
					vlanInterfaceDef=$scope.dayzero.vlan;
					newIpAddressDef=$scope.dayzero.newIpAddress;
					subnetMaskVal=$scope.dayzero.subnetMask;
				}
				var layConfig = {
					"defaultGateway": $scope.dayzero.defaultGateway,
					"defaultRoute": $scope.dayzero.defaultRoute,
					"vlan":vlanInterfaceDef,
					"newIpAddress": newIpAddressDef,
					"subnet":subnetMaskVal
				};
				dayZeroStepService.setLayConfig(layConfig);
				dayZeroStepService.setIpAddressAssign(ipAddressAssign);
			}
		}
	});
}]);



