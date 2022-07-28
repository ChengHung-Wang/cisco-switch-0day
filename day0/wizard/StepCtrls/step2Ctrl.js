/**
 Description: Controller - Day Zero Wizard
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller("step2Ctrl", ['$scope','dayZeroStepService', 'validationService', '$timeout', '$filter','requestRoutingService','executeCliCmdService',
function($scope,dayZeroStepService, validationService, $timeout, $filter,requestRoutingService,executeCliCmdService) {
	var translate = $filter("translate");
	var trim=$filter('trim');
	$scope.dayzero={};
	var gigInterface=[];
	var teInterface=[];
	var vlanInterface=[];
	var allVlans=[];
	var portsCount=''
	var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
	var cliOP = deviceCommunicatorCLI.getExecCmdOutput("show running-config partition common | in default-gateway\n show running-config int vlan1\n");
	var deviceType = versionInfo.ShowVersion.name;
	$scope.extendedVlanSupport = true;
	if((versionInfo.ShowVersion.name.indexOf("C2960X") != -1)&&(versionInfo.ShowVersion.name.indexOf("-LL") != -1)){
		var stpStatus = requestRoutingService.getShowCmdOutput("show vtp status");
		var stpEntries = stpStatus.split("\n");
		for (var i=0; i < stpEntries.length; i++) {
			var keyval = stpEntries[i].split(":");
			if((keyval[0].indexOf("VTP version running"))&&(keyval[1].indexOf("1"))){
				$scope.extendedVlanSupport = false;
				break;
			}
		}
	}
	$scope.dayzero={
		uplinkPort:null,
		wirelessVlanMode:translate("com_disable"),
		switchdhcpEnable: false,
		datavlanDhcpEnable: false,
		wirelessDhcpEnable: false
	};
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
	},true);
	var interfaceOptions=[];
	$scope.$watch('dayzero.dataVlan', function(nDVlan){
		if(nDVlan){
			var dataVlanList=(nDVlan).split(',');
			for(var i=0;i<dataVlanList.length;i++){
				var interfaceOptionsIndex = interfaceOptions.map(function(e) {
					return e.interfaceType;
				}).indexOf("data");
				if(interfaceOptionsIndex == -1){
					interfaceOptions.push({"interfaceText": translate('day0_wizard_interface_config_datavlan')+" "+dataVlanList[i],"interfaceType":"data"});
				}else{
					interfaceOptions[interfaceOptionsIndex] = {"interfaceText": translate('day0_wizard_interface_config_datavlan')+" "+dataVlanList[i],"interfaceType":"data"};
				}
			}
		}else{
			var interfaceOptionsIndex = interfaceOptions.map(function(e) {
				return e.interfaceType;
			}).indexOf("data");
			if(interfaceOptionsIndex != -1){
				interfaceOptions.splice(interfaceOptionsIndex, 1);
			}
		}
		dayZeroStepService.setInterOption(interfaceOptions);
	});
	$scope.$watch('dayzero.voiceVlan', function(nVVlan){
		var voiceVlanList='';
		if(nVVlan){
			voiceVlanList=(nVVlan).split(',');
			for(var i4=0;i4<voiceVlanList.length;i4++){
				var interfaceOptionsIndex = interfaceOptions.map(function(e) {
					return e.interfaceType;
				}).indexOf("voice");
				if(interfaceOptionsIndex == -1){
					interfaceOptions.push({"interfaceText": translate('day0_wizard_interface_config_vicevlan')+" "+voiceVlanList[i4],"interfaceType":"voice"});
				}else{
					interfaceOptions[interfaceOptionsIndex] = {"interfaceText": translate('day0_wizard_interface_config_vicevlan')+" "+voiceVlanList[i4],"interfaceType":"voice"};
				}
			}
		}else{
			var interfaceOptionsIndex = interfaceOptions.map(function(e) {
				return e.interfaceType;
			}).indexOf("voice");
			if(interfaceOptionsIndex != -1){
				interfaceOptions.splice(interfaceOptionsIndex, 1);
			}
		}
		dayZeroStepService.setInterOption(interfaceOptions);
	});
	$scope.isSelecon=(versionInfo.ShowVersion.name.indexOf("CDB-") != -1);
	if($scope.isSelecon){
		portsCount=versionInfo.ShowVersion.name.split('-')[1].substr(0,2).match(/[0-9]+/g)[0];
		$scope.showSeleconDetails=true;
	}else{
		if(versionInfo.ShowVersion.name.indexOf("C2960+") != -1){
              versionInfo.ShowVersion.name = versionInfo.ShowVersion.name.replace("+","+-");
        }
		if(versionInfo.ShowVersion.name.indexOf("C1000")!=-1){
			portsCount=versionInfo.ShowVersion.name.split('-')[1].substr(0,2).match(/[0-9]+/g)[0];
		}else if(versionInfo.ShowVersion.name.indexOf("C2960L-SM")!=-1){
			portsCount=versionInfo.ShowVersion.name.split('-')[3].substr(0,2).match(/[0-9]+/g)[0];
		}else{
			portsCount=versionInfo.ShowVersion.name.split('-')[2].substr(0,2).match(/[0-9]+/g)[0];
		}		
	}
	$scope.dayzero.portfast=false;
	$scope.interConfigToolTip=true;
	angular.element("#dataVlan").on("focus", function () {
		$timeout(function(){
			$scope.dataVlanTip = true;
		},0);
	});
	angular.element("#voiceVlan").on("focus", function () {
		$timeout(function(){
			$scope.voiceVlanTip = true;
		},0);

	});
	angular.element("#portfast").on("focus", function () {
		$timeout(function(){
			$scope.portfastTip = true;
		},0);

	});
	angular.element("#defaultGatewayInt").on("focus", function () {
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
	angular.element("#wirelessVlan").on("focus", function () {
		$timeout(function(){
			$scope.wirelessVlanTip = true;
		},0);
	});
	angular.element("#vlanIpAddress").on("focus", function () {
		$timeout(function(){
			$scope.wirelessVlanTip = true;
		},0);
	});
	angular.element("#vlanSubnetMask").on("focus", function () {
		$timeout(function(){
			$scope.wirelessVlanTip = true;
		},0);
	});
	$(document).on("blur","#dynamicInterface input", function () {
		$timeout(function(){
			$scope.ipAddressAssignTip = false;
			$scope.defaultGatewayTip=false;
			$scope.defaultRouteTip=false;
			$scope.layerConfigToolTip=true;
		},0);
	});
	$scope.checkEveClass = function(){
		$scope.eveClassTip = true;
	};
	$scope.PoE=function(){
		$scope.poeTip = true;
	};
	$scope.accessPortToolTip=function(){
		$timeout(function(){
			$scope.accessPortsTip = true;
			$scope.interConfigToolTip=false;
		},0);
	}
	$scope.accessPortToolTipHide=function(){
		$timeout(function(){
			$scope.accessPortsTip = false;
			$scope.interConfigToolTip=true;
		},0);
	}
	$scope.uplinkToolTip=function(){
		$timeout(function(){
			$scope.uplinkPortTip = true;
			$scope.interConfigToolTip=false;
		},0);
	}
	$scope.uplinkToolTipHide=function(){
		$timeout(function(){
			$scope.uplinkPortTip = false;
			$scope.interConfigToolTip=true;
		},0);
	}
	angular.element("input").on("blur", function () {
		$timeout(function(){
			$scope.interConfigToolTip=true;
			$scope.dataVlanTip=false;
			$scope.voiceVlanTip=false;
			$scope.portfastTip=false;
			$scope.eveClassTip=false;
			$scope.poeTip=false;			
			$scope.defaultGatewayTip=false;
			$scope.defaultRouteTip=false;
			$scope.ipAddressAssignTip=false;
			$scope.layerConfigToolTip=false;
			$scope.wirelessVlanTip = false;
			$scope.enableDhcpTip = false;
		},0);
	});
	angular.element("input").on("focus", function () {
		$timeout(function(){
			$scope.interConfigToolTip=false;
		},0);
	});
	angular.element("#newIpAddress ,#subnetMask").on("focus", function () {
		$timeout(function(){
			$scope.ipAddressAssignTip=true;
		},0);
	});	
	angular.element("#dataVlan, #dataVlanIpAddress , #dataVlanSubnetMask ").on("focus", function () {
		$timeout(function(){
			$scope.dataVlanTip=true;
		},0);
	});
	
	angular.element("#switchvlanDhcpEnable, #datavlanDhcpEnable, #wirelessDhcpEnable").on("focus", function () {
		$timeout(function(){
			$scope.enableDhcpTip=true;
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
	var ports = requestRoutingService.getShowCmdOutput("show ip interface brief","showAccessPorts");
	ports=ports.ShowIpInterfaceBrief.IPInterfaces.entry;

	var interfaceNames=[{"accessPortsText": translate("ntp_none"), "accessPortsValue": "none"}];
	gigInterface=ports.filter(function (el) {
		//We only need access/downlink ports here
		if(el.Interface == "FastEthernet0"){
			//Management port, ignore.
			return false;
		}
		return el.Interface.indexOf("Vlan") == -1;

		if($scope.isSelecon){
			return el.Interface.indexOf("Fast") > -1;
		} else {
			return el.Interface.indexOf("Gig") > -1;
		}
	});
	for(var i1=0;i1<portsCount;i1++){
		interfaceNames.push({
			"accessPortsText": gigInterface[i1].Interface,
			"accessPortsValue": gigInterface[i1].Interface
			});
	}

	var teInterfaceNames=[];
	teInterface=ports.filter(function (el) {
		if($scope.isSelecon){
			return el.Interface.indexOf("Gig") > -1;
		} else {
			return el.Interface.indexOf("Te") > -1;
		}
	});

	for(var i2=0;i2<gigInterface.length;i2++){
		if(i2>portsCount-1 && (gigInterface[i2].Interface.indexOf("Loopback")==-1 && gigInterface[i2].Interface.indexOf("Port-channel")==-1)){
			teInterfaceNames.push({
				"uplinkPortText": gigInterface[i2].Interface,
				"uplinkPortValue": gigInterface[i2].Interface
			});
		}
	}
	vlanInterface=ports.filter(function (el) {
		return (el.Interface=='Vlan1');
	});
	allVlans=ports.filter(function (el) {
		return (el.Interface.indexOf("Vlan") > -1  );
	});
	$scope.dayzero.newIpAddress = vlanInterface[0]['IP-Address'];
	dayZeroStepService.setVlanInter(vlanInterface);
	dayZeroStepService.setAllValns(allVlans);
	$timeout(function () {
		$scope.accessPortsDataSource=new kendo.data.ObservableArray(interfaceNames);
		$scope.uplinkPortDataSource=new kendo.data.ObservableArray(teInterfaceNames);
		$scope.dayzero.uplinkPort = $scope.uplinkPortDataSource[0].uplinkPortValue;
	}, 100);
	$scope.selectOptions = {
		autoBind: false
	};
	var ipAddressReg=/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	var subnetRegex = /^(255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252|254|255)\.(0|128|192|224|240|248|252)$/;
	$scope.validateSubnetMask = function(value) {
		if(value == undefined){
			return false;
		} else {
			if (new RegExp(subnetRegex).test(value)) {
				return true;
			}
		}
		return false;
	};
	$scope.wizardValidations = {
		rules : {
			checkvlan:function(input){
				var valMsg = input.data('checkvlanMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				//CSCvc19191
				if((!$scope.extendedVlanSupport)&&(trim(input.val())>1005)){
					return false;
				}
				if(trim(input.val()) == "" && input.prop('id')=='voiceVlan'){
					return true;
				} 
				 if(trim(input.val()) == ""){
					return false;
				}
				return true;
			},
			checkdupvlan: function(input){
				var valMsg = input.data('checkdupvlanMsg');
				var val = input.val();
				if ((valMsg==undefined)) {
					return true;
				}
				var vlanID = $scope.dayzero.vlan.match(/\d+/);
				if(!val){
					return true;
				}
				if((vlanID != null && vlanID.length > 0) ){
					if(vlanID[0] == val || $scope.dayzero.dataVlan == $scope.dayzero.wirelessVlan ){
						return false;
					}
				}
				return true;
			},
			range: function (input) {
				var count=0;
				var valMsg = input.data('rangeMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				if(trim(input.val()) == ""){
					return true;
				}
				var min= input.prop('min');
				var max= input.prop('max');
				var arr = input.val().split(',');
				for(var i=0;i<arr.length;i++){
					if(parseFloat(trim(arr[i]))>=min && parseFloat(trim(arr[i]))<=max) {
						count++;
					}
				}
				if(arr.length==count){
					return true;
				}
				return false;
			},			
			customreq:function(input){
				var valMsg = input.data('customreqMsg');
				var targetScope = input.data('customreq');
				if ((valMsg==undefined)) {
					return true;
				}
				if($scope.dayzero[targetScope] && input.val()==""){
					return false;
				}
				return true;
			},
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
				if ( (ipAddressReg.test(input.val()) && input.val()!='') || ( ipv6AddresswithPrefix(input.val()) && input.val()!='' ) ) {
					return true;
				};
				return false;
			},
			routevalidate1:function(input){
				var valMsg = input.data('routevalidate1Msg');
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
				if ( (ipAddressReg.test(input.val()) && input.val()!='') || ( validationService.validateIpv6Address(input.val()) && input.val()!='' ) ) {
					return true;
				};
				return false;
			},
			customreqmgmt:function(input){
				var valMsg = input.data('customreqmgmtMsg');
				var targetScope = input.data('customreqmgmt');
				if($scope.dayzero.newIpAddress){
					if($scope.dayzero.newIpAddress != "" && $scope.dayzero.newIpAddress.indexOf(":")==-1){					
						if($scope.dayzero[targetScope] && input.val()==""){
							return false;
						}
					}else{
						return true;
					}
				}
				return true;
			},	
			submaskvalidatemgmt:function(input){
				if($scope.dayzero.newIpAddress != "" && $scope.dayzero.newIpAddress.indexOf(":")==-1){
					var valMsg = input.data('submaskvalidatemgmtMsg');
					if ((valMsg==undefined)){
						return true;
					}
					if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255" || input.val().trim() == ""){
						return true;
					}
					else{
						return input.data('submaskvalidatemgmtMsg') ? $scope.validateSubnetMask(input.val())  : true;
					}
				}else{
					return true;
				}
			},
			customreqdata:function(input){
				var valMsg = input.data('customreqdataMsg');
				var targetScope = input.data('customreqdata');
				if($scope.dayzero.dataVlanIpAddress){
					if($scope.dayzero.dataVlanIpAddress != "" && $scope.dayzero.dataVlanIpAddress.indexOf(":")==-1){					
						if($scope.dayzero[targetScope] && input.val()==""){
							return false;
						}
					}else{
						return true;
					}
				}
				return true;
			},				
			submaskvalidatedata:function(input){
				var valMsg = input.data('submaskvalidatedataMsg');
				if ((valMsg==undefined)){
					return true;
				}
				if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255" || input.val().trim() == ""){
					return true;
				}
				else{
					return input.data('submaskvalidatedataMsg') ? $scope.validateSubnetMask(input.val())  : true;
				}
			},
			customreqwireless:function(input){
				var valMsg = input.data('customreqwirelessMsg');
				var targetScope = input.data('customreqwireless');				
				if($scope.dayzero.vlanIpAddress){
					if($scope.dayzero.vlanIpAddress != "" && $scope.dayzero.vlanIpAddress.indexOf(":")==-1){					
						if($scope.dayzero[targetScope] && input.val()==""){
							return false;
						}
					}else{
						return true;
					}
				}
				return true;
			},	
			submaskvalidatewireless:function(input){
				var valMsg = input.data('submaskvalidatewirelessMsg');
				if ((valMsg==undefined)){
					return true;
				}
				if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255" || input.val().trim() == ""){
					return true;
				}
				else{
					return input.data('submaskvalidatewirelessMsg') ? $scope.validateSubnetMask(input.val())  : true;
				}
			}
		}
	};
	//IPV6 Address Validation
   function ipv6AddresswithPrefix(value) {			
		if (value.trim() == "") {
			return true;
		}
		if (value.indexOf("/") >= 0) {
			var ipv6Format = value.split("/");
			if (!validationService.validateIpv6Address(ipv6Format[0])) {
				return false;
			} else if (Number(ipv6Format[1]) < 0 || Number(ipv6Format[1]) > 128) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
	
	function step2Init(){
		// setting default gateway and Ip address of VLAN1
		var gateway = cliOP[0].split("ip default-gateway");
		$scope.dayzero.defaultGateway = gateway[1] != undefined ? gateway[1].trim() : "";
       
		var intLine = executeCliCmdService.getNextString(cliOP[1],["ip address "],["\n"]);
		intLine = intLine.split(" ");
		$scope.dayzero.subnetMask = intLine[1];
	}
	step2Init();
	        $scope.wirelessVlanUpdated = function(){
                        if($scope.dayzero.wirelessVlan > 1 && $scope.dayzero.wirelessVlan < 4094){
                                $scope.dayzero.wirelessDhcpEnable = true;
                        } else {
                                $scope.dayzero.wirelessDhcpEnable = false;
                        }
                };
	        $scope.dataVlanUpdated = function(){
                        if($scope.dayzero.dataVlan > 1 && $scope.dayzero.dataVlan < 4094){
                                $scope.dayzero.vlanDhcpEnable = true;
                        } else {
                                $scope.dayzero.vlanDhcpEnable = false;
                        }
                };
	$scope.$on("dayZeroWizard:nextButtonPressed", function(evt, laststep, stepNumber) {
		if (stepNumber === 2) {
			$scope.myValidator = $scope.basicScreenValidator;
			validationService.addValidator($scope.myValidator, 2);
			validationService.setWirelessPossible(true);
			angular.element("#wifiPageForm  span.k-tooltip-validation").hide();
			if ($scope.myValidator && $scope.myValidator.validate()) {				
				var layConfig = {
						"defaultGateway": $scope.dayzero.defaultGateway,
						"defaultRoute": $scope.dayzero.defaultRoute,
						"vlan":$scope.vlan,
						"newIpAddress": $scope.dayzero.newIpAddress,
						"subnet":$scope.dayzero.subnetMask
					};
				dayZeroStepService.setLayConfig(layConfig);
				dayZeroStepService.setInterConfig($scope.dayzero);				
			}
		}
	});
	
	//Populate IPV6 fields based upon the ip address status
	$scope.ipv6Status = function() {
		if(versionInfo.ShowVersion.name.indexOf("2960C") != -1 || versionInfo.ShowVersion.name.indexOf("C2960+") != -1){
			return;
		}
		$timeout(function () {
			//for management interface
			if($scope.dayzero.newIpAddress && $scope.dayzero.newIpAddress!=""){
				if($scope.dayzero.newIpAddress.indexOf(":")!=-1){
					$scope.mgmtVlanSubnetStatus=true;	
					$scope.dayzero.subnetMask="";
				}else{
					$scope.mgmtVlanSubnetStatus=false;					
				}
			}			
			//for data vlan interface
			if($scope.dayzero.dataVlanIpAddress && $scope.dayzero.dataVlanIpAddress!=""){
				if($scope.dayzero.dataVlanIpAddress.indexOf(":")!=-1){
					$scope.dataVlanSubnetStatus=true;
					$scope.dataVlanDhcpStatus=true;
					$scope.dayzero.dataVlanSubnetMask="";
					$scope.dayzero.vlanDhcpEnable=false;
				}else{
					$scope.dataVlanSubnetStatus=false;
					$scope.dataVlanDhcpStatus=false;
				}
			}			
			//for wireless vlan interface
			if($scope.dayzero.vlanIpAddress && $scope.dayzero.vlanIpAddress!=""){
				if($scope.dayzero.vlanIpAddress.indexOf(":")!=-1){
					$scope.wirelessVlanSubnetStatus=true;
					$scope.wirelessVlanDhcpStatus=true;
					$scope.dayzero.vlanSubnetMask="";
					$scope.dayzero.wirelessDhcpEnable=false;
				}else{
					$scope.wirelessVlanSubnetStatus=false;
					$scope.wirelessVlanDhcpStatus=false;
				}
			}
			//for route changes
			if($scope.dayzero.newIpAddress && $scope.dayzero.newIpAddress!=""){
				if($scope.dayzero.newIpAddress.indexOf(":")!=-1){
					$scope.iprouteDisable = false;
				}else{
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
				}
			}	
		},500);
	}
	
}]);

