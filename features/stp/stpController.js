/**
 Description: STP Controller
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';
app.register.controller('StpCtrl', ['$scope','$rootScope','$filter', 'gridCrudService', 'dataSourceService', '$timeout', 'stpdataSourceService', 'notificationService', 'validationService','$window','dialogService','requestRoutingService','executeCliCmdService','getStringLineService',
    function ($scope,$rootScope,$filter, gridCrudService, dataSourceService, $timeout, stpdataSourceService, notificationService, validationService,$window,dialogService,requestRoutingService,executeCliCmdService,getStringLineService) {
        var trimVal=$filter('trimValue');
		var translate = $filter("translate");
		$scope.isACluster = ($rootScope.deviceInfo.stackingInfo.type == "CLUSTER");
        $scope.showPhysicalStacking = false;
        $scope.diablePortCycleButton = true;
        $scope.diableVStackApplyButton = true;
        var jumboVal = "10240";
        $scope.virtualStartCluster = "";
        var deviceType =$rootScope.deviceInfo.type;
        var imageVersion =$rootScope.deviceInfo.version;
		var oldClusterDomainName;
        $scope.isSelecon = false;
		$scope.showBluetoothTab=true;
		$scope.showBluetoothDetails=true;
		$scope.hstackStatus=translate("com_disable");
		//H-Stack Status
		$scope.hStackStatus=false;
		if( (deviceType.indexOf("C1000")!=-1 && deviceType.indexOf("C1000SM")==-1 && deviceType.indexOf("C1000FE")==-1) ){
			$scope.hStackStatus=true;
		}else{
			$scope.hStackStatus=false;
		}
		if( (deviceType.indexOf("CDB")!=-1) ){
			$scope.checkCdb=true;
		}else{
			$scope.checkCdb=false;
		}
		if($rootScope.deviceInfo.type.indexOf("WS-C2960+")!=-1 || ($rootScope.deviceInfo.type.indexOf("2960C") != -1 && $rootScope.deviceInfo.type.indexOf("2960CX") == -1)){
			$scope.hideElement = true;
		}else{
			$scope.hideElement = false;
		}
		var winHost = $window.location.hostname;
		$scope.forL3Device = (deviceType.indexOf("2960X")!=-1 || (deviceType.indexOf("S5960") != -1 && deviceType.indexOf("S5960L") == -1) ) ? true : false;
		$scope.onClickstpTab = function(tab){
			if(tab === 'switch'){
				$scope.initGridLoad();
			}
			if(tab === 'stp'){
				$scope.loadSTP();
			}
			if(tab === 'bluetooth'){
				$scope.loadBlueTooth();
			}
			if(tab === 'vtp'){
				$scope.loadVTPConfig();
			}
			if(tab === 'hstack'){
				$scope.loadHstack();
			}
		}
		$scope.logicalInterface ={
			vlan :{
		        ipv6SubType : null,
				listIpb6Address : []
			}
		}
		$scope.iptype ={
			ipv6 : false,
			ipv4 : false
		}
		$scope.oldListIpb6Address = [];
		$scope.logicalInterface ={
    			port :{
    		        ipv6SubType : null,
    				listIpb6Address : [],
    				oldlistIpb6Address : [],
    				dhcp :false,
    				rapid : false,
    				autoconfig :false,
    				ipv6SubTypeFa : null,
    				listIpb6AddressFa : [],
    				oldlistIpb6AddressFa : [],
    				dhcpFa :false,
    				rapidFa : false,
    				autoconfigFa :false
    			}
    	}
		$scope.ipv6TypeOptions = dataSourceService.ipv6TypeOptions();
		$scope.ipv6TypeOptionsFa = dataSourceService.ipv6TypeOptions();
/*Controller - Data & Actions For Switch Tab Starts*/
        var switchConfigDetails, switchInitialData,stackInitialData;
        if(deviceType.indexOf("CDB") != -1){
        	$scope.showSeleconDetails=true;
        	$scope.mtuSizeStatus=true;
			$scope.isSelecon = true;
        }
		if(deviceType.indexOf("2960C-") != -1 || deviceType.indexOf("2960+48TC-S") != -1 || deviceType.indexOf("2960+-48TC-S") != -1 || deviceType.indexOf("2960+") != -1){
			$scope.showBluetoothTab=false;
			$scope.showBluetoothDetails=false;
        }
        $scope.mtuSizeDataSource = dataSourceService.mtuSizeOptions();
        if( deviceType.indexOf("2960L") != -1 || deviceType.indexOf("C1000") != -1 || deviceType.indexOf("S6650L") != -1 || deviceType.indexOf("S5960L") != -1 ){
        	$scope.mtuSizeDataSource = new kendo.data.ObservableArray( 
        	[{
				mtuSizeText : '1500',
				mtuSizeValue : '1500'
			}, {
				mtuSizeText : '2026',
				mtuSizeValue : '2026'
			}, {
				mtuSizeText : 'jumbo',
				mtuSizeValue : 'jumbo'
			}]);
        }
		$rootScope.$watch('deviceInfo.stackingInfo', function(newVal){
			stackInitialData = newVal.type;
        });
		        
		/*LED status start Here*/
		if(deviceType.indexOf("CDB") != -1){
			$scope.stpLedTab = true;
			$scope.imageON = false;
			$scope.imageOFF = true;
			$scope.ledstatusDisable = true;
			$scope.ledDayDataSource = [];
			$scope.ledHrDataSource = [];
			$scope.ledMinDataSource = [];
			$scope.ledDayType = null;
			$scope.ledHrType = null;
			$scope.ledMinType = null;
			var len = 60;
			var tempDay,tempHr,tempMin;
			for(var ind=0;ind<len;ind++){
				tempDay = {};
				tempHr = {};
				tempMin = {};
				tempDay.ledDayText = ind;
				tempDay.ledDayValue = ind;
				tempHr.ledHrText = ind;
				tempHr.ledHrValue = ind;
				tempMin.ledMinText = ind;
				tempMin.ledMinValue = ind;
				if(ind < 2){
					$scope.ledDayDataSource.push(tempDay);
				}
				if(ind < 24){
					$scope.ledHrDataSource.push(tempHr);
				}
				$scope.ledMinDataSource.push(tempMin);
			}
		}
		$scope.ledStatusChange = function(){
			$scope.diableApplyButton = false;
		}
		$scope.toggleImage = function(){
			$scope.enableApplybtnselecon();
			$scope.imageOFF = !$scope.imageOFF;
			$scope.imageON = !$scope.imageON;
			if($scope.imageOFF == false){
				$scope.ledstatusDisable = false;
			}else{
				$scope.ledstatusDisable = true;
			}
		}
		/*LED status end Here*/
        $scope.initGridLoad = function () {
           //Hiding stacking configuration option for SM devices and all devices since CCP 1.6 release
        	$scope.clusterConfigHidingStatus = true;
        	/*if(deviceType.indexOf("2960L") != -1 ){
        		$scope.clusterConfigHidingStatus = true;
        	}*/
			var cdp = deviceCommunicatorCLI.getExecCmdOutput("show cdp neighbors\n");
			var lldp = deviceCommunicatorCLI.getExecCmdOutput("show lldp neighbors\n");
			var cdpCheck = translate("com_disable");
			var lldpCheck = translate("com_disable");
			if(cdp[0].indexOf("CDP is not enabled") == -1) {
				cdpCheck = translate("com_enable");
			}else {
				cdpCheck = translate("com_disable");
			}
			if(lldp[0].indexOf("LLDP is not enabled") == -1) {
				lldpCheck = translate("com_enable");
			}else {
				lldpCheck = translate("com_disable");
			}
            switchConfigDetails = stpdataSourceService.getSwitchDetails();
           //setting values
           $scope.switchConfigData = {
               hostName: switchConfigDetails.hostName,
               cdp: cdpCheck,
               ldp: lldpCheck,
               switchIp: switchConfigDetails.switchIp,
               managementVlan: switchConfigDetails.managementVlan,
               mtuSize: switchConfigDetails.mtuSize,
               subnetMask: switchConfigDetails.subnetMask,
               defaultGateway: switchConfigDetails.defaultGateway,
               switchCOAP:switchConfigDetails.switchCOAP,
               ipType:switchConfigDetails.ipType
		   };
           //setting ipv6 value for switch management insterface
           $scope.iptypeipv4=switchConfigDetails.ipv4Status;
           $scope.iptypeipv6=switchConfigDetails.ipv6Status;          
           $scope.logicalInterface.port.listIpb6Address=switchConfigDetails.ipv6List;
           $scope.logicalInterface.port.oldlistIpb6Address=switchConfigDetails.ipv6List;
           $scope.logicalInterface.port.dhcp=switchConfigDetails.ipv6DhcpStatus;
           $scope.logicalInterface.port.rapid=switchConfigDetails.ipv6RapidCommitStatus;
           $scope.logicalInterface.port.autoconfig=switchConfigDetails.ipv6AutoConfigStatus;
           $scope.oldCdp=angular.copy($scope.switchConfigData.cdp);
           $scope.oldldp=angular.copy($scope.switchConfigData.ldp);
           
		   // find management Intetrface or VLAN
		   	if($scope.switchConfigData.managementVlan.indexOf("Vlan") != -1 || $scope.switchConfigData.managementVlan.indexOf("FastEthernet0") != -1){
				$scope.mgmInterface = "FastEthernet0";
			}
		   	//should be taken care in the future
		   	if($scope.forL3Device){
		   	 	$scope.mgmInterface = "FastEthernet0";
		   	}
		  
			$scope.mgmtIntFldDisabled = ($scope.switchConfigData.managementVlan.indexOf("FastEthernet0") != -1) ? true : false;
			if($scope.mgmtIntFldDisabled){
				$scope.switchConfigData.fastIntIp = switchConfigDetails.switchIp;
				$scope.switchConfigData.fastIntSubnet = switchConfigDetails.subnetMask;
			}else{
				$scope.switchConfigData.fastIntIp = switchConfigDetails.fastInt.ip;
				$scope.switchConfigData.fastIntSubnet = switchConfigDetails.fastInt.subnet;
				
				//setting ipv6 value for management interface
				$timeout(function(){  				
		            $scope.iptypeipv4Fa=switchConfigDetails.ipv4StatusFa;
		            $scope.iptypeipv6Fa=switchConfigDetails.ipv6StatusFa;          
		            $scope.logicalInterface.port.listIpb6AddressFa=switchConfigDetails.ipv6ListFa;
		            $scope.logicalInterface.port.oldlistIpb6AddressFa=switchConfigDetails.ipv6ListFa;
		            $scope.logicalInterface.port.dhcpFa=switchConfigDetails.ipv6DhcpStatusFa;
		            $scope.logicalInterface.port.rapidFa=switchConfigDetails.ipv6RapidCommitStatusFa;
		            $scope.logicalInterface.port.autoconfigFa=switchConfigDetails.ipv6AutoConfigStatusFa;
				},500)
			}
           	if(winHost == $scope.switchConfigData.fastIntIp){
           		$scope.tabI = true;
           		$scope.tabV = !$scope.tabI;
           	}else{
           		$scope.tabV = true;
           		$scope.tabI = !$scope.tabV;
           	}
           $scope.diableApplyButton=true;
			if(deviceType.indexOf("2960L") != -1 || deviceType.indexOf("C1000") != -1 || deviceType.indexOf("S6650L") != -1 || deviceType.indexOf("S5960L") != -1 || deviceType.indexOf("CDB")!=-1){
				$scope.mtusizetype='1';
				$timeout(function(){
				   if(switchConfigDetails.mtuSize=="10240"){
					   angular.element("#mtuSize").data('kendoDropDownList').value("jumbo");
				   }else{
					   angular.element("#mtuSize").data('kendoDropDownList').value(switchConfigDetails.mtuSize);
				   }
				},50);
			}
			else{
				$scope.mtusizetype='2';
				$scope.switchConfigData.mtuSize=switchConfigDetails.mtuSize;
			}
			if(deviceType.indexOf("CDB") != -1){
				$scope.ledDayType = $scope.ledDayDataSource[0].ledDayValue;
				$scope.ledHrType = $scope.ledHrDataSource[0].ledHrValue;
				$scope.ledMinType = $scope.ledMinDataSource[0].ledMinValue;
				$scope.stpLedTab = true;
				$scope.imageON = false;
				$scope.imageOFF = true;
				$scope.ledstatusDisable = true;
			}
			switchInitialData = angular.copy(switchConfigDetails);
        };
        $scope.initGridLoad();
		$scope.enableApplybtn = function(){
			if((switchInitialData.hostName != $scope.switchConfigData.hostName) ||  (switchInitialData.switchIp != $scope.switchConfigData.switchIp) || (switchInitialData.subnetMask != $scope.switchConfigData.subnetMask) || (switchInitialData.defaultGateway != $scope.switchConfigData.defaultGateway) || (switchInitialData.managementVlan != $scope.switchConfigData.managementVlan) || (switchInitialData.mtuSize != $scope.switchConfigData.mtuSize) || (switchInitialData.switchCOAP != $scope.switchConfigData.switchCOAP) || ($scope.stpStackModeType != oldStpStackModeType) || (oldClusterDomainName != $scope.cluster.virtualDomainName)|| ($scope.oldCdp != $scope.switchConfigData.cdp)|| ($scope.oldldp != $scope.switchConfigData.ldp)){
				$scope.diableApplyButton = false;
			}else{
				$scope.diableApplyButton = true;
			}
		}
		var curMgmtField = "";
		$scope.enableStpApplyDelBtn = function(name){
			curMgmtField = name;
			$scope.diableApplyButton = false;
		}
		$scope.enableApplybtnselecon = function(){
			if((switchInitialData.hostName != $scope.switchConfigData.hostName) ||  (switchInitialData.switchIp != $scope.switchConfigData.switchIp) || (switchInitialData.subnetMask != $scope.switchConfigData.subnetMask) || (switchInitialData.defaultGateway != $scope.switchConfigData.defaultGateway) || (switchInitialData.managementVlan != $scope.switchConfigData.managementVlan) || (switchInitialData.mtuSize != $scope.switchConfigData.mtuSize) || (switchInitialData.switchCOAP != $scope.switchConfigData.switchCOAP) || ($scope.stpStackModeType != oldStpStackModeType) || $scope.imageON == false || ($scope.oldCdp != $scope.switchConfigData.cdp)|| ($scope.oldldp != $scope.switchConfigData.ldp)){
				$scope.diableApplyButton = false;
			}else{
				$scope.diableApplyButton = true;
			}
		}
		$scope.validateSubnetMask = function(value) {
			if(value == undefined){
				return false;
			} else {
				var subnetRegex = "^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$";
				if (new RegExp(subnetRegex).test(value)) {
					return true;
				}
			}
			return false;
		};
		var btValidations = angular.element("#btForm").kendoValidator({
            rules: {
				validateip: function (input) {
					var valMsg = input.data('validateipMsg');
                    if ((valMsg==undefined)){
                        return true;
					}

					if(input.val().trim() == ""){
						return true;
					}
					return validationService.validateIPAddress(input);
				},
				ipv6 : function(input) {
					if (!input.data('ipv6Msg')) {
						return true;
					}
					var value = input.val();
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
				},
				ipv6linklocal : function(input) {
					if (!input.data('ipv6linklocal-msg')){
						return true;
					}
					var value = input.val();
					if (value.trim() == "") {
						return true;
					}
					value=value.trim();
					value=value.toLowerCase();
					if(!value.startsWith("fe80")){
						return false;
					}
					return input.data('ipv6linklocal-msg') ? validationService.validateIpv6Address(input.val()) : true;
				},
				validatesubnet: function(input){
					var valMsg = input.data('validatesubnetMsg');
                    if ((valMsg==undefined)){
                        return true;
					}
					if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255" || input.val().trim() == ""){
						return true;
					}
					else{
						return input.data('validatesubnetMsg') ? $scope.validateSubnetMask(input.val())  : true;
					}
				},
				cusreq: function(input){
					var valMsg = input.data('cusreqMsg');
                    if ((valMsg==undefined)){
                        return true;
					}
					if(input.val().trim() == "" && $scope.bt.blueDHCPIp){
						return false;
					}
					return true;
				},
				btsubreq: function(input){
					var valMsg = input.data('btsubreqMsg');
                    if ((valMsg==undefined)){
                        return true;
					}
					if(input.val().trim() == "" && $scope.bt.blueConfigIp){
						return false;
					}
					return true;
				},
				cusdhcpreq: function(input){
					var valMsg = input.data('cusdhcpreqMsg');
                    if ((valMsg==undefined)){
                        return true;
					}
					return true;
				},
				dhcpsubreq: function(input){
					var valMsg = input.data('dhcpsubreqMsg');
                    if ((valMsg==undefined)){
                        return true;
					}
					if(input.val().trim() == "" && $scope.bt.blueDHCPIp){
						return false;
					}
					return true;
				},
				subeq: function(input){
					var valMsg = input.data('subeqMsg');
					var isEqualTo = input.data('subeq');
                    if ((valMsg==undefined)){
                        return true;
					}
					if( ($scope.bt.blueDHCPIp) && (input.val().trim() != $scope.$eval(isEqualTo))){
						return false;
					}
					return true;
				}
			}
		}).data("kendoValidator");
        var stpValidations = angular.element("#stpForm").kendoValidator({
            rules: {
                validateip: function (input) {
					var valMsg = input.data('validateipMsg');
                    if ((valMsg==undefined)){
                        return true;
					}

					if(input.val().trim() == ""){
						return true;
					}
					return validationService.validateIPAddress(input);
				},
				ipv6 : function(input) {
					if (!input.data('ipv6Msg')) {
						return true;
					}
					var value = input.val();
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
				},
				ipv6linklocal : function(input) {
					if (!input.data('ipv6linklocal-msg')){
						return true;
					}
					var value = input.val();
					if (value.trim() == "") {
						return true;
					}
					value=value.trim();
					value=value.toLowerCase();
					if(!value.startsWith("fe80")){
						return false;
					}
					return input.data('ipv6linklocal-msg') ? validationService.validateIpv6Address(input.val()) : true;
				},
                dataspace: function (input) {
                    return validationService.validateDataSpace(input);
                },
                range: function (input) {
					if(input.val() != jumboVal){
						if(input.val() != ""){
							var count=0;
							var valMsg = input.data('rangeMsg');
							if ((valMsg==undefined)) {
								return true;
							}
							var min= trimVal(input.prop('min'));
							var max= trimVal(input.prop('max'));
							var arr = input.val().replace('-',',');
							arr= arr.split(',');
							for(var i=0;i<arr.length;i++){
								if(parseFloat(trimVal(arr[i]))>=min && parseFloat(trimVal(arr[i]))<=max) {
									count++;
								}
							}
							if(arr.length!=count){
								return false;
							}
							return true;
						}
						else {
              return true;
            }
					}else{
						return true;
					}
				},
				checkVlanList:function(input){
					var valMsg = input.data('checkmtusizeMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var regExp=/^[,-]+$/;
					var valStrHy=input.val().includes("--");
					var valStrCom=input.val().includes(",,");
					if(regExp.test(input.val()) || valStrHy || valStrCom || trimVal(input.val()) == ""){
						return false;
          }
					return true;
				},
				 domain: function (input) {
            var valMsg = input.data('domainMsg');
            if ((valMsg==undefined)) {
                return true;
            }
            if($scope.stpStackModeType == "CLUSTER"){
              if(input.val()==''){
                  return false;
              }
            }
              return true;
          },
			domainspace: function(input){
				  var valMsg = input.data('domainspaceMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(/\s/g.test(input.val())){
					  return false;
					}
					return true;
				},
				validatesubnet: function(input){
					var valMsg = input.data('validatesubnetMsg');
                    if ((valMsg==undefined)){
                        return true;
					}
					if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255" || input.val().trim() == ""){
						return true;
					}
					else{
						return input.data('validatesubnetMsg') ? $scope.validateSubnetMask(input.val())  : true;
					}
				},
				cusreq: function(input){
                	var valMsg = input.data('cusreqMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(($scope.switchConfigData.switchIp == "" && $scope.switchConfigData.subnetMask == "") && ($scope.switchConfigData.fastIntIp == "" && $scope.switchConfigData.fastIntSubnet == "")){
						return false;
					}
					if(input.val().trim() == "" && $scope.switchConfigData.switchIp){
						return false;
					}
					return true;
				},
				mandatory: function(input){
					var valMsg = input.data('mandatoryMsg');
					var modelVal = input.data('modeleq');
					if ((valMsg==undefined)) {
						return true;
					}
					if($scope.$eval(modelVal) == ""){
						return true;
					}
					return true;
				},
				mandsub: function(input){
					var valMsg = input.data('mandsubMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if($scope.switchConfigData.fastIntIp && !$scope.switchConfigData.fastIntSubnet){
						return false;
					}
					return true;
				},
                checkreq: function(input){
                	var valMsg = input.data('checkreqMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if((!$scope.switchConfigData.switchIp && !$scope.switchConfigData.subnetMask) && (!$scope.switchConfigData.fastIntIp && !$scope.switchConfigData.fastIntSubnet)){
						return false;
					}
					return true;
                }
          	}
        }).data("kendoValidator");
  /*Stacking Starts Here*/
		var isPhysicalStackSupported = $rootScope.deviceInfo.isPhysicalStackSupported;
        var masterId = $rootScope.deviceInfo.masterId;
        if(isPhysicalStackSupported){
          $scope.showPhysicalStacking = true;
        }
        $scope.updateStacking = function(){
          if(stackInitialData !== $scope.stpStackModeType){
            $scope.diableApplyButton = false;
          }
        }
        $scope.stpStackModeType = null;
        $scope.stackingInit = function(){
            $scope.clusterConfig();
        };
        var oldStpStackModeType;
        $scope.loadStackingOptions = function(){
          $timeout(function(){
            if($scope.showPhysicalStacking){
              if($rootScope.deviceInfo.stackingInfo.type === "STACK"){
                $scope.stpStackModeDataSource = [{stpStackText: translate("stack_standalone"), stpStackValue:"STANDALONE"},
                      {stpStackText: translate("stack_physicalStacking"), stpStackValue:"STACK"}];
              }else{
                $scope.stpStackModeDataSource = [{stpStackText: translate("stack_standalone"), stpStackValue:"STANDALONE"},
                        {stpStackText: translate("stack_physicalStacking"), stpStackValue:"STACK"},
                        {stpStackText: translate("stack_virtualStacking"), stpStackValue:"CLUSTER"}];
              }
            }else{
                $scope.stpStackModeDataSource = [{stpStackText: translate("stack_standalone"), stpStackValue:"STANDALONE"},
                {stpStackText: translate("stack_virtualStacking"), stpStackValue:"CLUSTER"}];
            }
            $scope.stpStackModeType = $rootScope.deviceInfo.stackingInfo.type;
            oldStpStackModeType = $scope.stpStackModeType;
            $scope.diableApplyButton = true;
          },1000);
        }
        $scope.cluster = {};
        $scope.clusterConfig = function(){
            $scope.cluster.virtualDomainName = "";
            var showClusterDetails = switchConfigDetails.domainName;
            if(showClusterDetails!=""){
                $scope.virtualDomainName = showClusterDetails.replace(/"/gi, "");
                $scope.cluster.virtualDomainName = showClusterDetails.replace(/"/gi, "");
                oldClusterDomainName = $scope.cluster.virtualDomainName;
            }
        }
        /*Physical stacking Configuration function*/
        var stackingIsEdited = false;
         $scope.PhysicalStackingConfig = function(cliHostNameCmd){
            if(isPhysicalStackSupported){
				      stackingIsEdited = false;
              cliHostNameCmd+="do switch "+masterId+" stack port 1 enable \n";
              cliHostNameCmd+="do switch "+masterId+" stack port 2 enable \n";
            }
            return cliHostNameCmd;
         }
          /*Virtual stacking Configuration function*/
         $scope.virtualStackingConfig = function(cliHostNameCmd){
            if($scope.cluster.virtualDomainName && $scope.cluster.virtualDomainName !== oldClusterDomainName){
              if(!oldClusterDomainName){
                stackingIsEdited = false;

                cliHostNameCmd+="cluster run\n";
                cliHostNameCmd+="cluster enable "+$scope.cluster.virtualDomainName.replace(/ /g, '')+"\n";
              }else{
                stackingIsEdited = true;

                cliHostNameCmd+="cluster enable "+$scope.cluster.virtualDomainName.replace(/ /g, '')+"\n";
              }
            }
            return cliHostNameCmd;
          }
          /*Standalone stacking Configuration function*/
           $scope.standaloneConfig = function(cliHostNameCmd){
            /*show command for physcical stacking*/
            if(isPhysicalStackSupported){
              stackingIsEdited = false;
              if($scope.cluster.virtualDomainName){
                cliHostNameCmd+="no cluster enable "+$scope.cluster.virtualDomainName+"\n";
                cliHostNameCmd+="no cluster run\n";
              }
              cliHostNameCmd+="do switch "+masterId+" stack port 1 disable \n";
              cliHostNameCmd+="do switch "+masterId+" stack port 2 disable \n";
            }else{
              stackingIsEdited = false;
              if($scope.cluster.virtualDomainName){

                cliHostNameCmd+="no cluster enable "+$scope.cluster.virtualDomainName+"\n";
                cliHostNameCmd+="no cluster run\n";
              }
            }
            return cliHostNameCmd;
          }
          $scope.bluconfIPTypeOnChange = function(){
          	$scope.diableApplyButton = false;
          }
 /*Stacking Ends Here*/
 //save switch config into device
        $scope.saveSwitchConfig = function () {
        	var cliHostNameCmd="";
        	if (stpValidations.validate()) {
                if ($scope.switchConfigData.hostName !== switchInitialData.hostName) {
                      cliHostNameCmd+="hostname "+$scope.switchConfigData.hostName+"\n";
                }
				if ($scope.switchConfigData.cdp !== $scope.oldCdp) {
					  if($scope.switchConfigData.cdp == translate("com_enable")){
						  cliHostNameCmd+="cdp run \n";
					  }else{
                          cliHostNameCmd+="no cdp run \n";
					  }
                }
				if ($scope.switchConfigData.ldp !== $scope.oldldp) {
					  if($scope.switchConfigData.ldp == translate("com_enable")){
						  cliHostNameCmd+="lldp run \n";
					  }else{
                          cliHostNameCmd+="no lldp run \n";
					  }
                }
                if(deviceType.indexOf("2960X")!=-1 || (deviceType.indexOf("S5960") != -1 && deviceType.indexOf("S5960L") == -1)){
					if(!$scope.mgmtIntFldDisabled && (switchInitialData.fastInt.ip != $scope.switchConfigData.fastIntIp ||
	        			switchInitialData.fastInt.subnet != $scope.switchConfigData.fastIntSubnet)){
						if(!$scope.switchConfigData.fastIntIp || !$scope.switchConfigData.fastIntSubnet){
							cliHostNameCmd+="int fastEthernet0 \n no ip address \n exit\n";
						}else{
							cliHostNameCmd+="int fastEthernet0 \n ip address "+$scope.switchConfigData.fastIntIp+" "+$scope.switchConfigData.fastIntSubnet+" \n exit\n";
						}
	        		}
                }
              //IPv6 Configuration for  management interface like fastEthernet
                if($scope.forL3Device){
	                if(!$scope.mgmtIntFldDisabled && !$scope.hideElement){
	                	 cliHostNameCmd+="int fastEthernet0 \n";
	                	 if($scope.logicalInterface.port.oldlistIpb6AddressFa.length > 0){
	                		 cliHostNameCmd += "no ipv6 address \n ";                            	
	                     }
	                     for(var i = 0; i < $scope.logicalInterface.port.listIpb6AddressFa.length; i++){
	                    	 cliHostNameCmd += "ipv6 address "+$scope.logicalInterface.port.listIpb6AddressFa[i].name+"\n";  
	                     }
	                	                     
	                     if($scope.logicalInterface.port.rapidFa==false){
	                    	 cliHostNameCmd += "no ipv6 address dhcp rapid-commit\n"; 
                         }
                         if($scope.logicalInterface.port.dhcpFa==true){
                         	if($scope.logicalInterface.port.rapidFa==true){
                         		cliHostNameCmd += "ipv6 address dhcp rapid-commit\n";	
                         	}else{
                         		cliHostNameCmd += "ipv6 address dhcp\n"; 
                         	}
                         }else{
                        	 cliHostNameCmd += "no ipv6 address dhcp\n";
                         }
                         
	                     if($scope.logicalInterface.port.autoconfigFa==true){
	                    	 cliHostNameCmd += "ipv6 address autoconfig\n"; 
	                     }else{
	                    	 cliHostNameCmd += "no ipv6 address autoconfig\n";
	                     }
	                     cliHostNameCmd += "exit\n";
	                }
                }
                
                if (($scope.switchConfigData.switchIp && $scope.switchConfigData.subnetMask) && ($scope.switchConfigData.switchIp !== switchInitialData.switchIp || $scope.switchConfigData.subnetMask !== switchInitialData.subnetMask)) 
                {
                	if(deviceType.indexOf("2960X")!=-1 || (deviceType.indexOf("S5960") != -1 && deviceType.indexOf("S5960L") == -1) || deviceType.indexOf("3560CX")!=-1 || deviceType.indexOf("2960CX")!=-1){
                		if($scope.switchConfigData.managementVlan.indexOf("gig")!=-1 || $scope.switchConfigData.managementVlan.indexOf("Gig")!=-1) {
                		    cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n no switchport\n ip address "+$scope.switchConfigData.switchIp+" "+$scope.switchConfigData.subnetMask+"\n exit\n";
                		}else{
                			cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n ip address "+$scope.switchConfigData.switchIp+" "+$scope.switchConfigData.subnetMask+"\n exit\n";
                		}
                	}else if($scope.switchConfigData.switchIp && $scope.switchConfigData.subnetMask){
                		cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n ip address "+$scope.switchConfigData.switchIp+" "+$scope.switchConfigData.subnetMask+"\n exit\n";
                	}
                }
                
                if ($scope.switchConfigData.managementVlan !== switchInitialData.managementVlan) {
                    if(switchInitialData.managementVlan.indexOf("Gig")!=-1 || $scope.switchConfigData.managementVlan.indexOf("gig")!=-1) {
                    	cliHostNameCmd+="int "+switchInitialData.managementVlan+"\n no ip address \n switchport \n exit\n";
                    } else{
                    	 cliHostNameCmd+="int "+switchInitialData.managementVlan+"\n no ip address \n exit\n";
                    }
                    if(deviceType.indexOf("2960X")!=-1 || (deviceType.indexOf("S5960") != -1 && deviceType.indexOf("S5960L") == -1) || deviceType.indexOf("3560CX")!=-1 || deviceType.indexOf("2960CX")!=-1){
                		if($scope.switchConfigData.managementVlan.indexOf("gig")!=-1 || $scope.switchConfigData.managementVlan.indexOf("Gig")!=-1) {
                			cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n no switchport\n ip address "+$scope.switchConfigData.switchIp+" "+$scope.switchConfigData.subnetMask+"\n exit\n";
                		}else{
                			cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n ip address "+$scope.switchConfigData.switchIp+" "+$scope.switchConfigData.subnetMask+"\n exit\n";
                		}
                	}else{
                		cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n ip address "+$scope.switchConfigData.switchIp+" "+$scope.switchConfigData.subnetMask+"\n exit\n";
                	}
                }
                //IPv6 Configuration for switch management interface
                if($scope.switchConfigData.managementVlan && $scope.switchConfigData.managementVlan!=="" && $scope.switchConfigData.managementVlan!==undefined && !$scope.hideElement){
                	 cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n";
                	 if($scope.logicalInterface.port.oldlistIpb6Address.length > 0){
                		 cliHostNameCmd += "no ipv6 address \n no ipv6 address dhcp\n";                            	
                     }
                     for(var i = 0; i < $scope.logicalInterface.port.listIpb6Address.length; i++){
                    	 cliHostNameCmd += "ipv6 address "+$scope.logicalInterface.port.listIpb6Address[i].name+"\n";  
                     }                    
                     if($scope.logicalInterface.port.rapid==false){
                    	 cliHostNameCmd += "no ipv6 address dhcp rapid-commit\n"; 
                     }
                     if($scope.logicalInterface.port.dhcp==true){
                     	if($scope.logicalInterface.port.rapid==true){
                     		cliHostNameCmd += "ipv6 address dhcp rapid-commit\n";	
                     	}else{
                     		cliHostNameCmd += "ipv6 address dhcp\n"; 
                     	}
                     }else{
                    	 cliHostNameCmd += "no ipv6 address dhcp\n";
                     }
                     if($scope.logicalInterface.port.autoconfig==true){
                    	 cliHostNameCmd += "ipv6 address autoconfig\n"; 
                     }else{
                    	 cliHostNameCmd += "no ipv6 address autoconfig\n"; 
                     }
                     cliHostNameCmd += "exit\n";
                }
                
				if ($scope.switchConfigData.mtuSize !== switchInitialData.mtuSize) {
					if(parseInt($scope.switchConfigData.mtuSize) > 1998){
						if(deviceType.indexOf("2960L")!=-1 || deviceType.indexOf("C1000")!=-1 || deviceType.indexOf("S6650L") != -1 || deviceType.indexOf("S5960L") != -1){
							cliHostNameCmd+="system mtu "+$scope.switchConfigData.mtuSize+"\n";
						}else{
							cliHostNameCmd+="system mtu jumbo "+$scope.switchConfigData.mtuSize+"\n";
						}
					}else{
						cliHostNameCmd+="system mtu "+$scope.switchConfigData.mtuSize+"\n";
					}
				}
                if ($scope.switchConfigData.defaultGateway !== switchInitialData.defaultGateway) {
                      cliHostNameCmd+="ip default-gateway "+$scope.switchConfigData.defaultGateway+"\n";
                }
                if(deviceType.indexOf("CDB")!=-1 && $scope.switchConfigData.switchCOAP !== switchInitialData.switchCOAP){
                  if ($scope.switchConfigData.switchCOAP) {
	                    cliHostNameCmd+="coap proxy \n security none \n start \n";
	                }else{
	                	cliHostNameCmd+="coap proxy \n stop \n no coap proxy \n";
	                }
                }
                if(($scope.switchConfigData.switchIp != switchInitialData.switchIp) && (!$scope.switchConfigData.switchIp)){
					cliHostNameCmd+="int "+$scope.switchConfigData.managementVlan+"\n no ip address \n exit\n";
				}
                               
          		 var selectedStackingOption = $filter('filter')($scope.stpStackModeDataSource, $scope.stpStackModeType);
          			if(stackInitialData !== $scope.stpStackModeType){
          			  switch(selectedStackingOption[0].stpStackText) {
          				case "Physical Stacking":
          				  cliHostNameCmd = $scope.PhysicalStackingConfig(cliHostNameCmd);
          				  break;
          				case "Virtual Stacking":
          				  cliHostNameCmd = $scope.virtualStackingConfig(cliHostNameCmd);
          				  break;
          				case "Standalone":
          				  cliHostNameCmd = $scope.standaloneConfig(cliHostNameCmd);
          				  break;
						default:
						  break;
          			  }
          			}else{
                  if($scope.cluster.virtualDomainName && oldClusterDomainName !== $scope.cluster.virtualDomainName){
                    cliHostNameCmd = $scope.virtualStackingConfig(cliHostNameCmd,true);
                  }
                }
                if($scope.switchConfigData.switchIp != switchInitialData.switchIp){
                   var baseUrl = window.location.origin;

                   if(baseUrl.indexOf('https') > -1){
                     $window.location.href = "https://"+ $scope.switchConfigData.switchIp + "/#/switch";
                   }else{
                     $window.location.href = "http://"+ $scope.switchConfigData.switchIp + "/#/switch";
                   }
                }
				if(deviceType.indexOf("CDB") != -1){
					if($scope.imageON == true){
						cliHostNameCmd += "do led status " + $scope.ledDayType + " " + $scope.ledHrType + " " +  $scope.ledMinType + "\n";
					}
				}
				if(cliHostNameCmd!=""){
                  $timeout(function() {
                    var result = requestRoutingService.getConfigCmdOutput(cliHostNameCmd);
                  	if(result=="" || result.indexOf("MTU will not take effect until the next reload is done")!=-1 ){
                  		notificationService.showNotification(translate('switch_success_msg'),translate('com_config_success_title'),'success');
						if(!stackingIsEdited && stackInitialData !== $scope.stpStackModeType){
							location.reload();
						}
                    }else{
                  		notificationService.showNotification(result,translate('com_config_fail_title'),'error');
                  	}
					$scope.diableApplyButton=true;
					$scope.initGridLoad();
					$scope.clusterConfig();
                    switchInitialData = angular.copy($scope.switchConfigData);
                  },50);
                }
            }
        };
		$scope.switchmtuSizeOnchange = function(){
			$scope.diableApplyButton = false;
		};
        //cancel the changes
        $scope.cancelSwitchConfig = function () {
			$scope.diableApplyButton=true;
			$scope.switchConfigData.hostName=switchInitialData.hostName;
			$scope.switchConfigData.switchIp=switchInitialData.switchIp;
			$scope.switchConfigData.managementVlan=switchInitialData.managementVlan;
			$scope.switchConfigData.mtuSize=switchInitialData.mtuSize;
			$scope.switchConfigData.subnetMask=switchInitialData.subnetMask;
			$scope.switchConfigData.defaultGateway=switchInitialData.defaultGateway;
			$scope.switchConfigData.switchCOAP=switchInitialData.switchCOAP;
			$scope.initGridLoad();
			$scope.clusterConfig();
			$scope.stpStackModeType = oldStpStackModeType;
        };
        $scope.commonConfirmationSwitch = function() {
        	var changeIpMsg="", changeIp = "";
        	if(($scope.switchConfigData.switchIp != switchInitialData.switchIp) || ($scope.switchConfigData.fastIntIp != switchConfigDetails.fastInt.ip)){
        		changeIpMsg = translate("ipaddress_change_msg")+"</br>";
        	}
        	changeIpMsg += translate("msg_redirect_confirmation");
        	if(($scope.switchConfigData.switchIp) && ($scope.switchConfigData.switchIp != switchInitialData.switchIp)){
        		changeIp = 	$scope.switchConfigData.switchIp;
        	}else if((curMgmtField === "mgmtIp") && (!$scope.switchConfigData.switchIp && $scope.switchConfigData.fastIntIp) || ($scope.switchConfigData.fastIntIp != switchConfigDetails.fastInt.ip)){
        		changeIp = 	$scope.switchConfigData.fastIntIp == undefined ? "" : $scope.switchConfigData.fastIntIp;
        	}
        	$scope.dlgSwitch = dialogService.dialog({
                content : changeIpMsg+" "+changeIp,
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
        $scope.$on("pageRedirection", function() {
          $scope.dlgSwitch.data("kendoWindow").close();
            $timeout(function(){
              $scope.saveSwitchConfig();
            },50);
        });
        $scope.redirection= function(){
        	if (stpValidations.validate()) {
	           	if(($scope.switchConfigData.switchIp != switchInitialData.switchIp)){
	        	   $scope.commonConfirmationSwitch();
	           	}else{
	        	   $scope.saveSwitchConfig();
	           	}
	       }
        };
       
        //IPV6 Support code for switch management interface
        $scope.addIpv6Address = function () {        	
            if (!stpValidations.validate()) {
                  return;
            } 
            $scope.diableApplyButton = false;
            var ipv6Type = $scope.logicalInterface.port.ipv6type;
            var linkAddress = $scope.logicalInterface.port.vlanIPV6Address;
            var ipv6Address = $scope.logicalInterface.port.vlanIPV6Address;
            var ipv6SubType = $scope.logicalInterface.port.ipv6SubType;
            var name = "";
            var isValidIpv6 = true;            
            if (ipv6SubType != "link-local") {
                    var subType = $scope.logicalInterface.port.ipv6SubType;
                    var addStr = "";
                    if (subType !== "None") {
                          addStr = " "+subType;
                    }                    
                    name = ipv6Address + addStr;
                    if (ipv6Address == "") {
                          return false;
                    }
            } else if (ipv6SubType === "link-local") {
	            var addStr = "link-local";
	            name = linkAddress +" "+ addStr;
	            if (linkAddress == "") {
	                   return false;
	            }
            } 
            var finalObj={"name": name, "ipv6Type": $scope.logicalInterface.port.ipv6type, "ipv6SubType": ipv6SubType, "ipv6Address": ipv6Address};
            var find=false;
            for (var index = 0; index < $scope.logicalInterface.port.listIpb6Address.length; index++) {
                     if($scope.logicalInterface.port.listIpb6Address[index].name==finalObj.name){
                         find=true;
                         return false;
                     }
            }
            if(!find){
                $scope.logicalInterface.port.listIpb6Address.push(finalObj);               
                $scope.logicalInterface.port.vlanIPV6Address = "";
	            $scope.logicalInterface.port.actInterfaceDhcpClint = false;
	            $scope.logicalInterface.port.rapidCommit = false;
            }
        };
		function arrayRemove(arr, value) {
		return arr.filter(function(ele){
		               return ele != value;
			});		
		}
		$scope.removeIpv6Address = function (rowData) {
		            var ipv6Seclect = rowData;
		            var myArray = $scope.logicalInterface.port.listIpb6Address;
		            myArray = arrayRemove(myArray, ipv6Seclect);
		            $scope.logicalInterface.port.listIpb6Address = myArray;
		            $scope.diableApplyButton = false;
		};
		
	//IPV6 Support code fastethernet
        $scope.addIpv6AddressFa = function () {        	
            if (!stpValidations.validate()) {
                  return;
            } 
            $scope.diableApplyButton = false;
            var ipv6Type = $scope.logicalInterface.port.ipv6typeFa;
            var linkAddress = $scope.logicalInterface.port.vlanIPV6AddressFa;
            var ipv6Address = $scope.logicalInterface.port.vlanIPV6AddressFa;
            var ipv6SubType = $scope.logicalInterface.port.ipv6SubTypeFa;
            var name = "";
            var isValidIpv6 = true;            
            if (ipv6SubType != "link-local") {
                    var subType = $scope.logicalInterface.port.ipv6SubTypeFa;
                    var addStr = "";
                    if (subType !== "None") {
                          addStr = " "+subType;
                    }                    
                    name = ipv6Address + addStr;
                    if (ipv6Address == "") {
                          return false;
                    }
            } else if (ipv6SubType === "link-local") {
	            var addStr = "link-local";
	            name = linkAddress +" "+ addStr;
	            if (linkAddress == "") {
	                   return false;
	            }
            } 
            var finalObj={"name": name, "ipv6Type": $scope.logicalInterface.port.ipv6type, "ipv6SubType": ipv6SubType, "ipv6Address": ipv6Address};
            var find=false;
            for (var index = 0; index < $scope.logicalInterface.port.listIpb6AddressFa.length; index++) {
                     if($scope.logicalInterface.port.listIpb6AddressFa[index].name==finalObj.name){
                         find=true;
                         return false;
                     }
            }
            if(!find){
                $scope.logicalInterface.port.listIpb6AddressFa.push(finalObj);
                $scope.logicalInterface.port.vlanIPV6AddressFa = "";
	            $scope.logicalInterface.port.actInterfaceDhcpClintFa = false;
	            $scope.logicalInterface.port.rapidCommitFa = false;
            }
        };
		
		$scope.removeIpv6AddressFa = function (rowData) {
		            var ipv6Seclect = rowData;
		            var myArray = $scope.logicalInterface.port.listIpb6AddressFa;
		            myArray = arrayRemove(myArray, ipv6Seclect);
		            $scope.logicalInterface.port.listIpb6AddressFa = myArray;
		            $scope.diableApplyButton = false;
		};
  /*Controller - Data & Actions For Switch Tab Ends*/
  /*Blue Tooth Config Page Start*/
	  $scope.bt = {
			blueConfigIp:"",
			blueConfigSubnet:"",
			blueDHCPIp:"",
			blueDHCPSubnet:""
	  }
	  var initBluetoothStats 
	  var initblueConfigIp 
	  var initblueConfigSubnet 
	  var initblueDHCPConfigIp 
	  var initblueDHCPConfigSubnet 
	  var initblueDHCPName 
	  
      $scope.loadBlueTooth = function(){
			  initBluetoothStats = "";
			  initblueConfigIp = "";
			  initblueConfigSubnet = "";
			  initblueDHCPConfigIp = "";
			  initblueDHCPConfigSubnet = "";
			  initblueDHCPName = "";
		       $scope.bt.blueDHCPIp ="";
			   $scope.bt.blueDHCPSubnet = "";
		       $scope.iptype.ipv4 = false;
               $scope.iptype.ipv6 = false;
		       $scope.oldListIpb6Address =[];
		       $scope.logicalInterface.vlan.listIpb6Address =[];
    	       var bluetoothConfigOP="";
			   if(deviceType.indexOf("2960C-") === -1 || deviceType.indexOf("2960+48TC-S") === -1 || deviceType.indexOf("2960+-48TC-S") != -1){
					$scope.diableblueApplyButton=false;
					$scope.cancelblueButton = true;
					bluetoothConfigOP = deviceCommunicatorCLI.getExecCmdOutput("show bluetooth stats\n show run interface bluetooth0\n show running-config ip dhcp pool\n");
					if(bluetoothConfigOP[0].indexOf("BT Interface is Ready") != -1) {
						$scope.switchConfigData.bluetoothstatus = translate("toggle_on");
						initBluetoothStats = translate("toggle_on");
					}else {
						$scope.switchConfigData.bluetoothstatus = translate("toggle_off");
						initBluetoothStats = translate("toggle_off");
					}
					//BT Stack Enabled
					if(bluetoothConfigOP[0].indexOf("BT Stack Enabled: No") != -1) {
						$scope.switchConfigData.bluetoothIntstatus = translate("com_inactive");
					}else {
						$scope.switchConfigData.bluetoothIntstatus = translate("com_active");
					}
			 	/* load interface IP Address */
				if(bluetoothConfigOP[1].indexOf("no ip address") != -1){
					$scope.bt.blueConfigIp ="";
					$scope.bt.blueConfigSubnet = "";
					initblueConfigIp = "";
					initblueConfigSubnet ="";
					$scope.bt.blueDHCPIp ="";
					$scope.bt.blueDHCPSubnet = "";
					initblueDHCPConfigIp = "";
					initblueDHCPConfigSubnet ="";
				}else{
					var getIpAddress = getStringLineService.getLines(bluetoothConfigOP[1],["ip address"]);
					var ipAddress=getIpAddress[0].trim().split(" ")[2].trim();
					var subnet=getIpAddress[0].trim().split(" ")[3].trim();
					$scope.bt.blueConfigIp = ipAddress;
					$scope.bt.blueConfigSubnet =subnet;
					initblueConfigIp = ipAddress;
					initblueConfigSubnet = subnet;
					var dhcpPoolList=bluetoothConfigOP[2].split("ip dhcp pool");
					for (var index = 1; index < dhcpPoolList.length; index++) {
						if(dhcpPoolList[index].indexOf("default-router")!=-1 && dhcpPoolList[index].indexOf("network")!=-1 ){
							var dhcpPoolName="ip dhcp pool"+dhcpPoolList[index];
							var defaultRouterIP=executeCliCmdService.getNextString(dhcpPoolList[index],["default-router "],["\n"]).trim();
							var networkDetails =executeCliCmdService.getNextString(dhcpPoolList[index],["network"],["\n"]).trim();
							var networkIP=networkDetails.split(" ")[0].trim();
							var networkMask=networkDetails.split(" ")[1].trim();
							if(ipAddress==defaultRouterIP && subnet==networkMask){
								$scope.bt.blueDHCPIp =networkIP;
								$scope.bt.blueDHCPSubnet = networkMask;
								initblueDHCPConfigIp = networkIP;
								initblueDHCPConfigSubnet =networkMask;
								initblueDHCPName=executeCliCmdService.getNextString(dhcpPoolName,["ip dhcp pool "],["\n"]).trim();								
							}
						}
					}
				}
				if(bluetoothConfigOP[1].indexOf("ipv6 address") != -1){
					var ipv6check= getStringLineService.getLines(bluetoothConfigOP[1],[" ipv6 address"]);
					for (var i = 0; i < ipv6check.length; i++) {
						if (ipv6check[i].indexOf("dhcp") ==-1 && ipv6check[i].indexOf("autoconfig") ==-1) {
							var  tempString=executeCliCmdService.getNextString(ipv6check[i],["ipv6 address"],["\n"]).trim();
							$scope.logicalInterface.vlan.listIpb6Address.push({"name":tempString});
						}
					}
				}
				if (bluetoothConfigOP[1].indexOf("dhcp") != -1) {
                    if (bluetoothConfigOP[1].indexOf("rapid-commit") !=-1) {
						$scope.logicalInterface.vlan.rapid = true;
						$scope.logicalInterface.vlan.dhcp = true;
					}else{
						$scope.logicalInterface.vlan.dhcp = true;
					}
					$scope.iptype.ipv6 = true;
                }
				if (bluetoothConfigOP[1].indexOf("autoconfig") != -1) {
					$scope.logicalInterface.vlan.autoconfig = true;
					$scope.iptype.ipv6 = true;
                }
				$scope.oldListIpb6Address = angular.copy($scope.logicalInterface.vlan.listIpb6Address);
				$timeout(function(){
					if($scope.logicalInterface.vlan.listIpb6Address.length > 0){
						$scope.iptype.ipv6 = true;
					}if($scope.bt.blueConfigIp){
						$scope.iptype.ipv4 = true;
					}
				},500); 
           }
     }
	 $scope.addIpv6AddressBluetooth = function () {
			if (!btValidations.validate()) {
				return;
			}
			var ipv6Type = $scope.logicalInterface.vlan.ipv6type;
			var ipv6Address = $scope.logicalInterface.vlan.vlanIPV6Address;
			var ipv6SubType = $scope.logicalInterface.vlan.ipv6SubType;
			var name = "";
			var isValidIpv6 = true;
			if( ipv6Address=="" || ipv6Address==null || ipv6Address==undefined ){
            	return ;
            }
			if($scope.logicalInterface.vlan.ipv6type == null || $scope.logicalInterface.vlan.ipv6type == "None"|| $scope.logicalInterface.vlan.ipv6type == undefined ){
				$scope.logicalInterface.vlan.ipv6type = "";
			}
			if (ipv6SubType != "link-local") {
				var subType = $scope.logicalInterface.vlan.ipv6SubType;
				if(subType == null || subType == "None"|| subType == undefined){
					subType = "";
				}
				var addStr = "";
				if (subType !== "Prefix" && subType !== "") {
					addStr = " "+ subType;
				}
				name = ipv6Address + addStr;
				if (ipv6Address == "") {
					return false;
				}
			} else if (ipv6SubType === "link-local") {
			var addStr = "link-local";
			name = ipv6Address +" "+ addStr;
			if (ipv6Address == "") {
				return false;
			}
			}
			var finalObj={"name": name, "ipv6Type": $scope.logicalInterface.vlan.ipv6type, "ipv6SubType": ipv6SubType, "ipv6Address": ipv6Address};
			var find=false;
			for (var index = 0; index < $scope.logicalInterface.vlan.listIpb6Address.length; index++) {
					if($scope.logicalInterface.vlan.listIpb6Address[index].name==finalObj.name){
							find=true;
							return false;
					}
			}
			if(!find){
				$scope.logicalInterface.vlan.listIpb6Address.push(finalObj);
				$scope.logicalInterface.vlan.layer3IpV6Address ="";
				$scope.logicalInterface.vlan.vlanIPV6Address = "";
				$scope.logicalInterface.vlan.actInterfaceDhcpClint = false;
				$scope.logicalInterface.vlan.rapidCommit = false;
				$scope.diableblueApplyButton = false;
			}
			
		};
		$scope.removeIpv6AddressBluetooth = function (rowData) {
			var ipv6Seclect = rowData;
			var myArray = $scope.logicalInterface.vlan.listIpb6Address;
			myArray = arrayRemove(myArray, ipv6Seclect);
			$scope.logicalInterface.vlan.listIpb6Address = myArray;
			$scope.diableblueApplyButton = false;
			$scope.cancelblueButton = false;
		};
      $scope.saveBluetoothConfig = function () {
			 if(btValidations.validate()) {
					var clibluetoothCmd="";
					var timeStamp="";
					if(deviceType.indexOf("2960C-")===-1 || deviceType.indexOf("2960+48TC-S") === -1 || deviceType.indexOf("2960+-48TC-S") != -1){
						var changesCount=0;
						if ($scope.switchConfigData.bluetoothstatus === translate("toggle_on")) {
							clibluetoothCmd += "do staging config bluetooth on \n";
						} 
						if(initBluetoothStats != $scope.switchConfigData.bluetoothstatus){
							changesCount=1;
							if ($scope.switchConfigData.bluetoothstatus === translate("toggle_on")) {
								clibluetoothCmd += "do staging config bluetooth on \n";
							} else {
								clibluetoothCmd += "do staging config bluetooth off \n";
							}
						}
						if(initblueConfigIp != $scope.bt.blueConfigIp || initblueConfigSubnet != $scope.bt.blueConfigSubnet || initblueDHCPConfigIp != $scope.bt.blueDHCPIp){
							changesCount=2;
							if(initblueConfigIp != $scope.bt.blueConfigIp || initblueConfigSubnet != $scope.bt.blueConfigSubnet){
								clibluetoothCmd += "interface bluetooth0 \n";
								if($scope.bt.blueConfigIp){
								clibluetoothCmd += "ip address " + $scope.bt.blueConfigIp + " " + $scope.bt.blueConfigSubnet + "\n";
								}else{
								clibluetoothCmd += "no ip address \n";	
								}
								// removed ipv6 configs as per webui not get enabled
								/* clibluetoothCmd += "no ipv6 address \n";
								clibluetoothCmd += "no ipv6 address dhcp rapid-commit\n";
								if($scope.logicalInterface.vlan.listIpb6Address.length > 0){
									for(var i=0;i<$scope.logicalInterface.vlan.listIpb6Address.length;i++){
										clibluetoothCmd += "ipv6 address " + $scope.logicalInterface.vlan.listIpb6Address[i].name + " \n";
									}
								}
								if($scope.logicalInterface.vlan.dhcp){
									if($scope.logicalInterface.vlan.rapid){
									  clibluetoothCmd += "ipv6 address dhcp rapid-commit \n";
									}else{
									  clibluetoothCmd += "ipv6 address dhcp  \n";
									}
								}
								if($scope.logicalInterface.vlan.autoconfig){
									  clibluetoothCmd += "ipv6 address autoconfig \n";
								} */
								clibluetoothCmd += "no ip route-cache\n";
								clibluetoothCmd += "exit\n";
							}
							timeStamp = Math.floor(Date.now());
							if(initblueDHCPName!=""){
								clibluetoothCmd += "no ip dhcp pool "+initblueDHCPName+" \n";
							}								
							if($scope.bt.blueDHCPIp){
								clibluetoothCmd += "ip dhcp pool default_bluetooth_pool_"+timeStamp+" \n";
								clibluetoothCmd += "network " + $scope.bt.blueDHCPIp + " " + $scope.bt.blueDHCPSubnet + "\n";
								if($scope.bt.blueConfigIp){
									clibluetoothCmd += "default-router "+$scope.bt.blueConfigIp+"\n";
								}
							}						
						 }
						 if(clibluetoothCmd!=""){
							var result = requestRoutingService.getConfigCmdOutput(clibluetoothCmd);
							if(result==""){
								notificationService.showNotification(translate('bluetooth_success_msg'),translate('com_config_success_title'),'success');
							}else{
								if(typeof(result) == "string"){
									notificationService.showNotification(result,translate('com_config_fail_title'),'error');
								} else if(result.indexOf("A pool already exists for network") != -1){
									if(changesCount==1){
										notificationService.showNotification(translate('bluetooth_success_msg'),translate('com_config_success_title'),'success');
									}else{
										notificationService.showNotification(result,translate('com_config_fail_title'),'error');
									}
								} else{
									notificationService.showNotification(result,translate('com_config_fail_title'),'error');
								}
								
							}
						}
						$scope.loadBlueTooth();
					}
			 }
		};
		$scope.cancelBluetoothConfig = function () {
			$timeout(function(){
				angular.element("#btForm span.k-tooltip-validation").hide();
				$scope.diableApplyButton = true;
				$scope.cancelblueButton = true;
				$scope.loadBlueTooth();
			},50)
		}
		$scope.togglebluechange = function(){
			$scope.diableblueApplyButton = false;
			$scope.cancelblueButton = false;
		};
 /*Blue Tooth Config Page Ends*/
  /*Controller - Data & Actions For STP Tab Starts*/
        /*Default Values*/
        var stpDefaultModeType = "rapid-pvst";
        /*To Identify Edited filed*/
        $scope.gridEdited = false;
        $scope.stpModeEdited = false;
        /*Display Values*/
        $scope.stpModeType=null;
        $scope.stpPortType=null;
        $scope.transHeadCount=null;
        $scope.stpGridValues = [];
        $scope.stpPriorityOptions = dataSourceService.stpPriorityOptions();
        $scope.stpForwardTimeOptions = dataSourceService.stpForwardTimeOptions();
        $scope.stpHelloTimeOptions = dataSourceService.stpHelloTimeOptions();
        $scope.stpMaxAgeOptions = dataSourceService.stpMaxAgeOptions();
        $scope.stpModeDataSource = dataSourceService.stpModeOptions();
        $scope.stpPortTypeList = dataSourceService.stpPortTypeList();
        $scope.transCountList = dataSourceService.transCountList();
        /*To Identify Actual Edit*/
        $scope.stpModeModel = null;
        $scope.stpPortTypeModel = null;
        $scope.stpBpdufilterModel = null;
        $scope.stpBpduguardModel = null;
        $scope.stpLoopGuardModel = null;
        $scope.transHeadCountModel = null;
        $scope.editedVlanListValues = [];

        /*Enable and Disabling Cancel & Apply Buttons*/
        $scope.disableApplyButton = function () {
            return ($scope.stpModeEdited || $scope.gridEdited) ? false : true;
        };
        $scope.disableCancelButton = function () {
            return ($scope.stpModeEdited || $scope.gridEdited) ? false : true;
        };
      $scope.loadSTP= function(){
        $scope.stpGridValues = stpdataSourceService.getVlanData();
        $timeout(function () {
        	var stpGlobalInfo=stpdataSourceService.getStpGlobalInfo();        	
            $scope.stpModeType = stpGlobalInfo[0].stpModeType;
            $scope.stpPortType = stpGlobalInfo[0].stpPortType;
            if(stpGlobalInfo[0].stpBpdufilter=="enabled"){
            	$scope.stpBpdufilter = translate("com_enable");
            }else{
            	$scope.stpBpdufilter = translate("com_disable");
            }    
            if(stpGlobalInfo[0].stpBpduguard=="enabled"){
            	$scope.stpBpduguard = translate("com_enable");
            }else{
            	$scope.stpBpduguard = translate("com_disable");
            }    
            if(stpGlobalInfo[0].stpLoopGuard=="enabled"){
            	$scope.stpLoopGuard = translate("com_enable");
            }else{
            	$scope.stpLoopGuard = translate("com_disable");
            }            
            $scope.transHeadCount = stpGlobalInfo[0].transHeadCount;
            
            $scope.stpModeModel = angular.copy($scope.stpModeType);
            $scope.stpPortTypeModel = angular.copy($scope.stpPortType);
            $scope.stpBpdufilterModel = angular.copy($scope.stpBpdufilter);
            $scope.stpBpduguardModel = angular.copy($scope.stpBpduguard);
            $scope.stpLoopGuardModel = angular.copy($scope.stpLoopGuard);
            $scope.transHeadCountModel = angular.copy($scope.transHeadCount);
        }, 1000);
        /*Kendo Grid-Data Values*/
        var hdrTmpbridgePriorityNum=translate("stp_bridgepriority") + " <tooltip helptext='" + translate("help_STP_bridge_priority_number") +"' position='top'></tooltip>";
        var forwardTimeTemplate=translate("stp_forward_time") + " <tooltip helptext='" + translate("stp_forward_time_help") +"' position='top'></tooltip>";
        var helloTimeTemplate=translate("stp_hello_time") + " <tooltip helptext='" + translate("stp_hello_time_help") +"' position='top'></tooltip>";
        var maxAgeTemplate=translate("stp_maxage_time") + " <tooltip helptext='" + translate("stp_maxage_time_help") +"' position='top'></tooltip>";
        $scope.stpInstanceGridOptions = {
            editable: true,
            filterable: {
                extra : false,
                messages: {
                    isTrue: translate("com_enable"),
                    isFalse: translate("com_disable"),
                    info: translate("com_page_dropDowntext"),
		            filter: translate("com_btn_filter"),
		            clear: translate("com_btn_clear")
                },
                operators : {
                    string : {
                        eq : translate("com_is_equal"),
                        neq : translate("com_isnot_equal")
                    }
                }
            },
            sortable: true,
            pageable: {
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
                refresh: true,
                pageSizes: gridCrudService.grid_page_sizes,
                buttonCount: 5
            },
            scrollable: true,
            navigatable: true,
            selectable: 'multiple, row',
            columns: [
            {
                field: "vlanId",
                title: translate("stp_vlanid")
            }, {
                field: "vlanName",
                title: translate("stp_vlanname")
            }, {
                field: "hasSpanningTree",
                title: translate("stp_spanningtree"),
                template:'<span>#= hasSpanningTree === true ? "'+translate("com_enable")+'": "'+translate("com_disable")+'" #</span>'
            }, {
            	 field: "bridgePriorityNumber",
                 title: translate("stp_bridgepriority"),
                 headerTemplate :hdrTmpbridgePriorityNum,
                 template: "#=bridgePriorityNumber#",
                 editor: function (container, options) {
                     var inlineEditSpanningTreeFlag = !options.model.hasSpanningTree;
                     container.append(angular.element('<select ng-disabled="' + inlineEditSpanningTreeFlag +
                     '" kendo-drop-down-list="stpPriority" name="stpPriority" id="stpPriority" k-data-source="stpPriorityOptions" k-data-text-field="\'name\'" k-data-value-field="\'value\'" data-bind="value:'
                     + options.field + '" ></select>'));
                 }
            }, {
	           	 field: "forwardTime",
	             title: translate("stp_forward_time"),
	             headerTemplate :forwardTimeTemplate,
	             template: "#=forwardTime#",
	             editor: function (container, options) {
	                 var inlineEditSpanningTreeFlag = !options.model.hasSpanningTree;
	                 container.append(angular.element('<select ng-disabled="' + inlineEditSpanningTreeFlag +
	                 '" kendo-drop-down-list="stpForwardTime" name="stpForwardTime" id="stpForwardTime" k-data-source="stpForwardTimeOptions" k-data-text-field="\'name\'" k-data-value-field="\'value\'" data-bind="value:'
	                 + options.field + '" ></select>'));
	             }
            }, {
	           	 field: "helloTime",
	             title: translate("stp_hello_time"),
	             headerTemplate :helloTimeTemplate,
	             template: "#=helloTime#",
	             editor: function (container, options) {
	                 var inlineEditSpanningTreeFlag = !options.model.hasSpanningTree;
	                 container.append(angular.element('<select ng-disabled="' + inlineEditSpanningTreeFlag +
	                 '" kendo-drop-down-list="stpHelloTime" name="stpHelloTime" id="stpHelloTime" k-data-source="stpHelloTimeOptions" k-data-text-field="\'name\'" k-data-value-field="\'value\'" data-bind="value:'
	                 + options.field + '" ></select>'));
	             }
            }, {
	           	 field: "maxAge",
	             title: translate("stp_maxage_time"),
	             headerTemplate :maxAgeTemplate,
	             template: "#=maxAge#",
	             editor: function (container, options) {
	                 var inlineEditSpanningTreeFlag = !options.model.hasSpanningTree;
	                 container.append(angular.element('<select ng-disabled="' + inlineEditSpanningTreeFlag +
	                 '" kendo-drop-down-list="stpMaxAge" name="stpMaxAge" id="stpMaxAge" k-data-source="stpMaxAgeOptions" k-data-text-field="\'name\'" k-data-value-field="\'value\'" data-bind="value:'
	                 + options.field + '" ></select>'));
	             }
            }
            ],
            change: function () {
                // hasSpanningTree checkbox event bubbling in safari
                $timeout(function(){
                  $scope.stpInstanceGrid.tbody.on('mousedown', 'input[type="checkbox"]', function ($event) {
                      $event.preventDefault();
                      $event.stopPropagation();
                    });
                },10);
            }
        };
        $scope.stpInstancedataSource = kendoGridObject($scope.stpGridValues);
    }

        /*STP Mode Select*/
        $scope.updateStpMode = function () {
            if ( ($scope.stpModeModel) && ($scope.stpModeModel !== $scope.stpModeType) || ($scope.stpPortTypeModel) && ($scope.stpPortTypeModel !== $scope.stpPortType) || ($scope.stpBpdufilterModel) && ($scope.stpBpdufilterModel !== $scope.stpBpdufilter) || ($scope.stpBpduguardModel) && ($scope.stpBpduguardModel !== $scope.stpBpduguard) || ($scope.stpLoopGuardModel) && ($scope.stpLoopGuardModel !== $scope.stpLoopGuard) || ($scope.transHeadCountModel) && ($scope.transHeadCountModel !== $scope.transHeadCount) ) {
                $scope.stpModeEdited = true;
            } else {
                $scope.stpModeEdited = false;
            }
        };
        /*Apply Button Click*/
        $scope.apply = function () {
        	var resultResponse=null;
            if ($scope.stpModeEdited) {
            	var stpCliCommand="";
            	stpCliCommand +="spanning-tree mode "+$scope.stpModeType+ "\n";
            	stpCliCommand +="spanning-tree portfast "+$scope.stpPortType+ "\n";
            	if($scope.stpBpdufilter == translate("com_enable")){
            		stpCliCommand +="spanning-tree portfast edge bpdufilter default \n";
            	}else{
            		stpCliCommand +="no spanning-tree portfast edge bpdufilter default \n";
            	}
            	if($scope.stpBpduguard == translate("com_enable")){
            		stpCliCommand +="spanning-tree portfast edge bpduguard default \n";
            	}else{
            		stpCliCommand +="no spanning-tree portfast edge bpduguard default \n";
            	}
            	if($scope.stpLoopGuard == translate("com_enable")){
            		stpCliCommand +="spanning-tree loopguard default \n";
            	}else{
            		stpCliCommand +="no spanning-tree loopguard default \n";
            	}
            	stpCliCommand +="spanning-tree transmit hold-count "+$scope.transHeadCount+ "\n";
            	
                resultResponse=requestRoutingService.getConfigCmdOutput(stpCliCommand);
                $timeout(function () {

                	var stpGlobalInfo=stpdataSourceService.getStpGlobalInfo();        	
                    $scope.stpModeType = stpGlobalInfo[0].stpModeType;
                    $scope.stpPortType = stpGlobalInfo[0].stpPortType;
                    if(stpGlobalInfo[0].stpBpdufilter=="enabled"){
                    	$scope.stpBpdufilter = translate("com_enable");
                    }else{
                    	$scope.stpBpdufilter = translate("com_disable");
                    }    
                    if(stpGlobalInfo[0].stpBpduguard=="enabled"){
                    	$scope.stpBpduguard = translate("com_enable");
                    }else{
                    	$scope.stpBpduguard = translate("com_disable");
                    }    
                    if(stpGlobalInfo[0].stpLoopGuard=="enabled"){
                    	$scope.stpLoopGuard = translate("com_enable");
                    }else{
                    	$scope.stpLoopGuard = translate("com_disable");
                    }            
                    $scope.transHeadCount = stpGlobalInfo[0].transHeadCount;
                    
                    $scope.stpModeModel = angular.copy($scope.stpModeType);
                    $scope.stpPortTypeModel = angular.copy($scope.stpPortType);
                    $scope.stpBpdufilterModel = angular.copy($scope.stpBpdufilter);
                    $scope.stpBpduguardModel = angular.copy($scope.stpBpduguard);
                    $scope.stpLoopGuardModel = angular.copy($scope.stpLoopGuard);
                    $scope.transHeadCountModel = angular.copy($scope.transHeadCount);
                
                }, 50);
                $scope.stpModeEdited = false;
            }
            if ($scope.gridEdited) {
                var editedObject = $scope.editedVlanListValues;
                resultResponse = stpdataSourceService.sendingVlanDataToDevice(editedObject);
                var updatedData = stpdataSourceService.getVlanData();
                var dataSource = kendoGridObject(updatedData);
                var grid = angular.element('#stpInstanceGrid').data('kendoGrid');
                dataSource.read();
                grid.setDataSource(dataSource);
                $scope.gridEdited = false;
            }
            if(resultResponse==""){
        		notificationService.showNotification(translate('STP_success_msg'),translate('com_config_success_title'),'success');
        	}else{
        		notificationService.showNotification(resultResponse,translate('com_config_fail_title'),'error');
        	}
        };
        /*Cancel Button Click*/
        $scope.cancel = function () {
            if ($scope.stpModeEdited) {
                $scope.stpModeType = $scope.stpModeModel;
                $scope.stpPortType = $scope.stpPortTypeModel;
                $scope.stpBpdufilter = $scope.stpBpdufilterModel;
                $scope.stpBpduguard = $scope.stpBpduguardModel;
                $scope.stpLoopGuard = $scope.stpLoopGuardModel;
                $scope.transHeadCount = $scope.transHeadCountModel;
                $scope.stpModeEdited = false;
            }
            if ($scope.gridEdited) {
            	var updatedData = stpdataSourceService.getVlanData();
                var dataSource = kendoGridObject(updatedData);

                var grid = angular.element('#stpInstanceGrid').data('kendoGrid');
                dataSource.read();
                grid.setDataSource(dataSource);
                $scope.gridEdited = false;
            }
        };
        function kendoGridObject(dataValues) {
            var newOject = new kendo.data.DataSource({
                pageSize: 10,
                data: dataValues,
                batch: true,
                change: function () {
                    var dataList = this.data();
                    var editedVlanList = [];
                    for (var index = 0; index < dataList.length; index++) {
                        if (dataList[index].hasOwnProperty('dirty') && dataList[index].dirty == true) {
                            var editedObj = {};
                            editedObj["vlanId"] = dataList[index].vlanId;
                            editedObj["vlanName"] = dataList[index].vlanName;
                            editedObj["hasSpanningTree"] = dataList[index].hasSpanningTree;
                            editedObj["bridgePriorityNumber"] = dataList[index].bridgePriorityNumber;
                            editedObj["forwardTime"] = dataList[index].forwardTime;
                            editedObj["helloTime"] = dataList[index].helloTime;
                            editedObj["maxAge"] = dataList[index].maxAge;
                            editedVlanList.push(editedObj);
                        }
                    }
                    if (editedVlanList.length > 0) {
                        $scope.editedVlanListValues = editedVlanList;
                        $scope.gridEdited = true;
                    }
                },
                schema: {
                    model: {
                        id: "vlanId",
                        fields: {
                            vlanId: {
                                editable: false,
                                nullable: true
                            },
                            vlanName: {
                                editable: false,
                                nullable: true
                            },
                            hasSpanningTree: {
                                type: "boolean"
                            },
                            bridgePriorityNumber: {
                            },
                            forwardTime: {
                            },
                            helloTime: {
                            },
                            maxAge: {
                            }
                        }
                    }
                }
            });
            return newOject;
        };
        /*Controller - Data & Actions For STP Tab Ends*/
    //Start Controller code for VTP Config
        $scope.showTick = true;
        $scope.vtpVersions=null;
        $scope.vtpModesVlan=null;
        $scope.vtpModesMst=null;
        $scope.forceCheck=true;
        $scope.checkboxForce=false;
        $scope.vtpMSTModeDataSource = function() {
            return new kendo.data.DataSource({
                 data : [{
               			vtpModeName : translate('vtp_mode_transparent'),
               			vtpModeValue : "Transparent"
              	    }, {
                  		vtpModeName : translate('vtp_mode_server'),
                  		vtpModeValue : "Server"
                  	}, {
                  		vtpModeName : translate('vtp_mode_off'),
                  		vtpModeValue : "Off"
                  	}, {
                  		vtpModeName : translate('vtp_mode_client'),
                  		vtpModeValue : "Client"
                  	} ]
            })
        }
        $scope.loadVTPConfigOptions=function(){
		    $scope.vtpVersionTypeList = dataSourceService.vtpVersionDataSource();
		    $scope.vtpModeVlanList = dataSourceService.vtpModeDataSource();
		    $scope.vtpModeMstList =  $scope.vtpMSTModeDataSource();
        }
        var vtpHDomainName="",vtpHVersions="",vtpHModesVlan="",vtpHModesMst="",vtpHPassword="",vlanPrimary="",mstPrimary="",pruningHMode=false;;
        $scope.loadVTPConfig=function(){
        	 var vtpShowCLI="show vtp status\n show vtp pass\n";
        	 var vtpShowCLIOP = deviceCommunicatorCLI.getExecCmdOutput(vtpShowCLI);
             var arrVTPCommonConfig=vtpShowCLIOP[0].split("Feature MST");
             $scope.vtpDomainName=executeCliCmdService.getNextString(arrVTPCommonConfig[0],["VTP Domain Name                 :"],["\n"]).trim();
             vtpHDomainName=$scope.vtpDomainName;
             $scope.vtpVersions=executeCliCmdService.getNextString(arrVTPCommonConfig[0],["VTP version running             :"],["\n"]).trim();
             vtpHVersions=$scope.vtpVersions;
			 var vlanModeStatus=executeCliCmdService.getNextString(arrVTPCommonConfig[0],["VTP Operating Mode                :"],["\n"]).trim();
			 var vtpPruningMode=executeCliCmdService.getNextString(arrVTPCommonConfig[0],["VTP Pruning Mode                :"],["\n"]).trim();
			 if(vtpPruningMode=="Enabled"){
				 $scope.pruningMode=true;
				 pruningHMode=true;
			 }else{
				 $scope.pruningMode=false;
				 pruningHMode=false;
			 }
			 if(vlanModeStatus.indexOf("Primary")!=-1){
				 $scope.checkboxVlan=true;
				 $scope.checkboxHVlan=true;
				 var vlanStatusArr=vlanModeStatus.split(" ");
				 $scope.vtpModesVlan=vlanStatusArr[1];
                 vtpHModesVlan=$scope.vtpModesVlan;
				 vlanPrimary=true;
				 $scope.vlanPrimaryStatus=true;
			 }else{
				 $scope.checkboxVlan=false;
				 $scope.checkboxHVlan=false;
				 $scope.vtpModesVlan=executeCliCmdService.getNextString(arrVTPCommonConfig[0],["VTP Operating Mode                :"],["\n"]).trim();
				 vtpHModesVlan=$scope.vtpModesVlan;
				 vlanPrimary=false;
				 $scope.vlanPrimaryStatus=false;
			 }
			 var mstModeStatus=executeCliCmdService.getNextString(arrVTPCommonConfig[1],["VTP Operating Mode                :"],["\n"]).trim();
			 if(mstModeStatus.indexOf("Primary")!=-1){
				 $scope.checkboxMst=true;
				 $scope.checkboxHMst=true;
				 var mstStatusArr=mstModeStatus.split(" ");
				 $scope.vtpModesMst=mstStatusArr[1];
                 vtpHModesMst=$scope.vtpModesMst;
				 mstPrimary=true;
				 $scope.mstPrimaryStatus=true;
			 }else{
				 $scope.checkboxMst=false;
				 $scope.checkboxHMst=false;
				 $scope.vtpModesMst=executeCliCmdService.getNextString(arrVTPCommonConfig[1],["VTP Operating Mode                :"],["\n"]).trim();
                 vtpHModesMst=$scope.vtpModesMst;
				 mstPrimary=false;
				 $scope.mstPrimaryStatus=false;
			 }
			 if(vlanModeStatus.indexOf("Primary")!=-1 || mstModeStatus.indexOf("Primary")!=-1){
				 $timeout(function(){
					 $scope.forceCheck=false;
				 },100);
			 }else{
				 $timeout(function(){
					 $scope.forceCheck=true;
				 },100);
			 }
			 $timeout(function(){
				 if($scope.vtpVersions == 1 || $scope.vtpVersions == 2){
						$scope.vtpModesMst="Transparent";
						vtpHModesMst="Transparent";
		                $scope.transparentDisable=true;
					 } else{
						 $scope.transparentDisable=false;
					 }
			 },100);
             $scope.vtpPassword=executeCliCmdService.getNextString(vtpShowCLIOP[1],["VTP Password:"],["\n"]).trim();
             vtpHPassword=$scope.vtpPassword;
			if($scope.vtpVersions == 3 && $scope.vtpModesVlan=='Server' && $scope.vtpModesMst == 'Server'){
				$scope.primaryVlan = false;
				$scope.primaryMst = false;
			}else if($scope.vtpVersions == 3 && $scope.vtpModesVlan=='Server' && $scope.vtpModesMst != 'Server'){
				$scope.primaryVlan = false;
				$scope.primaryMst = true;
			}else if($scope.vtpVersions == 3 && $scope.vtpModesVlan!='Server' && $scope.vtpModesMst == 'Server'){
				$scope.primaryVlan = true;
				$scope.primaryMst = false;
			}else{
				$scope.primaryVlan = true;
				$scope.primaryMst = true;
			}
			if($scope.vtpModesVlan=='Server'){
				$scope.disablePruningMode=false;
			}else{
				$scope.disablePruningMode=true;
			}
        }
        $scope.saveVTPConfig=function(evt){
        	evt=evt.target;
        	if (vtpValidations.validate()) {
        		angular.element(evt).button('loading');
                $scope.showTick = false;
                $timeout(function(){
                	var vtpConfigCLI="";
    	        	if($scope.vtpDomainName!=vtpHDomainName){
    	        		vtpConfigCLI+="vtp domain "+$scope.vtpDomainName+"\n";
    	        	}
    	        	if($scope.vtpPassword!=vtpHPassword){
    	        		if($scope.vtpPassword==""){
    	        			vtpConfigCLI+="no vtp password \n";
    	        		}else{
    	        			vtpConfigCLI+="vtp password "+$scope.vtpPassword+"\n";
    	        		}
    	        	}
    	        	if($scope.vtpVersions!=vtpHVersions){
    					if(vtpHVersions==3){
    					  vtpConfigCLI+="vtp mode Transparent mst\n";
    					}
    	        		vtpConfigCLI+="vtp version "+$scope.vtpVersions+"\n";
    	        	}
    	        	if($scope.vtpModesVlan!=vtpHModesVlan){
    	        		vtpConfigCLI+="vtp mode "+$scope.vtpModesVlan+" vlan\n";
    	        	}
    	        	if($scope.vtpModesVlan=="Server"){
    	        		if($scope.pruningMode){
    	        			vtpConfigCLI+="vtp pruning\n";
    	        		}else{
    	        			vtpConfigCLI+="no vtp pruning\n";
    	        		}
    	        	}
    	        	if($scope.vtpModesMst!=vtpHModesMst){
    	        		vtpConfigCLI+="vtp mode "+$scope.vtpModesMst+ " mst\n";
    	        	}
    				if($scope.checkboxForce){
    					vtpConfigCLI+="do vtp primary force \n";
    				}
    				if(($scope.checkboxVlan) && ($scope.checkboxVlan!=$scope.checkboxHVlan)){
    					  vtpConfigCLI+="do vtp primary vlan \n";
    				}
    				if(($scope.checkboxMst) && ($scope.checkboxMst!=$scope.checkboxHMst)){
    					vtpConfigCLI+="do vtp primary mst \n";
    				}
    	        	if(vtpConfigCLI!=""){
    	                    var result = requestRoutingService.getConfigCmdOutput(vtpConfigCLI);
    	                	if(result=="" || result.indexOf("System can become primary server for Vlan")!=-1 || result.indexOf("VTP password to")!=-1 || result.indexOf("Clearing device VTP password")!=-1 || result.indexOf("This system is becoming primary")!=-1 || result.indexOf("Pruning")!=-1){
    	                		notificationService.showNotification(translate('vtp_success_msg'),translate('com_config_success_title'),'success');
    	                    }else{
    	                		notificationService.showNotification(result,translate('com_config_fail_title'),'error');
    	                	}
    	           }
    	           angular.element(evt).button('reset');
                   $scope.showTick = true;
                   $scope.loadVTPConfig();
                   $scope.cancelVTPConfig();
                },50);
          }
        }
        $timeout(function(){
        	 $scope.applyVTPButton=true;
	         $scope.cancelVTPButton=true;
        },500);
        $scope.enableVTPApplybtn=function(){
			if( ($scope.vtpVersions == 3 && $scope.vtpModesVlan=='Server' && $scope.checkboxVlan==true ) || ($scope.vtpVersions == 3 && $scope.vtpModesMst ==='Server' && $scope.checkboxMst==true) ){
            	$scope.forceCheck = false;
            }else{
				$scope.forceCheck = true;
			}
			if($scope.vtpVersions == 3){
				$scope.transparentDisable=false;
			}
			else{
				$scope.transparentDisable=true;
				$scope.vtpModesMst="Transparent";
			}
        	if($scope.checkboxForce || $scope.vtpDomainName!=vtpHDomainName || $scope.vtpPassword!=vtpHPassword || $scope.vtpVersions!=vtpHVersions || $scope.vtpModesVlan!=vtpHModesVlan || $scope.vtpModesMst!=vtpHModesMst || $scope.checkboxVlan!=vlanPrimary ||$scope.checkboxMst!=mstPrimary || pruningHMode!=$scope.pruningMode){
        		$scope.applyVTPButton=false;
        		$scope.cancelVTPButton=false;
        	} else{
        		$scope.applyVTPButton=true;
        		$scope.cancelVTPButton=true;
            }
			if($scope.vtpVersions == 3 && $scope.vtpModesVlan=='Server' && $scope.vtpModesMst == 'Server'){
				$scope.primaryVlan = false;
				$scope.primaryMst = false;
			} else if($scope.vtpVersions == 3 && $scope.vtpModesVlan=='Server' && $scope.vtpModesMst != 'Server'){
				$scope.primaryVlan = false;
				$scope.primaryMst = true;
			} else if($scope.vtpVersions == 3 && $scope.vtpModesVlan!='Server' && $scope.vtpModesMst == 'Server'){
				$scope.primaryVlan = true;
				$scope.primaryMst = false;
			} else{
				$scope.primaryVlan = true;
				$scope.primaryMst = true;
			}			
			if($scope.vtpModesVlan=='Server'){
				$scope.disablePruningMode=false;
			}else{
				$scope.disablePruningMode=true;
			}
		}
		$scope.cancelVTPConfig =function(){
		  $scope.loadVTPConfig();
		  $timeout(function(){
           	 $scope.applyVTPButton=true;
   	         $scope.cancelVTPButton=true;
   	         $scope.checkboxForce=false;
           },500)
		}
      //validation
        var vtpValidations = angular.element("#vtpForm").kendoValidator({
            rules: {
            	checkVTPName:function(input){
					var valMsg = input.data('checkVTPNameMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var regExp=/^[-]+$/;
					if(regExp.test(input.val()) || trimVal(input.val()) == ""){
						return false;
					}
					return true;
				},
				checkVTPPw:function(input){
					var valMsg = input.data('checkVTPPwMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var regExp=/^[-]+$/;
					if(regExp.test(input.val()) || trimVal(input.val()) == ""){
						return false;
					}
					return true;
				}
			}
        }).data("kendoValidator");
    //End Controller code for VTP Config
        
    //Start H-Stack Configuration
        $scope.loadHstack= function(){
        	var hstackCLI="show switch hstack-ports\n show switch\n"
        	//Getting Switch Priority
        	var hstackInfo = deviceCommunicatorCLI.getExecCmdOutput(hstackCLI);
        	
        	var hstackPriorityInfo = [],hstackSwitchNumber = [];    	
    		var arrHstackPriority=hstackInfo[1].split("\n");
            for (var i=4; i < arrHstackPriority.length; i++) { 
            	var portsObj = {};
                var arrInnerWords = arrHstackPriority[i].split(" ");
                for (var k=0,j=1; k < arrInnerWords.length; k++) {
                    if(arrInnerWords[k] == "") {
                        continue;
                    }
                    if (j == 1) {
                    	if(arrInnerWords[k].trim().indexOf("*")!=-1){
                    		portsObj["switchNumber"]=arrInnerWords[k].trim().replace("*","");
                    		hstackSwitchNumber.push(arrInnerWords[k].trim().replace("*",""));
                    	}else{
                    		portsObj["switchNumber"]=arrInnerWords[k].trim();
                    		hstackSwitchNumber.push(arrInnerWords[k].trim())
                    	}                    	
                    }
                    if (j == 4) {
                    	portsObj["stackPriority"]=arrInnerWords[k].trim();
                    }                   
                    j++;
                }
                hstackPriorityInfo.push(portsObj)
            }           
            //Getting switch stack details           
        	var hstackSwitchInfo = [];    	
    		var arrHstackInfo=hstackInfo[0].split("\n");
            for (var i=3; i < arrHstackInfo.length; i++) {
                var portsObj = {};
                var arrInnerWords = arrHstackInfo[i].split("  ");
                for (var k=0,j=1; k < arrInnerWords.length; k++) {
                    if(arrInnerWords[k] == "") {
                        continue;
                    }
                    if (j == 1) {
                    	portsObj["tePorts"]=arrInnerWords[k].trim();
                    	var switchNumber="";
                    	if(arrInnerWords[k].indexOf("Te")!=-1){
                    		switchNumber=arrInnerWords[k].trim().split("/")[0].replace("Te",""); 
                    	}
                    	if(arrInnerWords[k].indexOf("Gi")!=-1){
                    		switchNumber=arrInnerWords[k].trim().split("/")[0].replace("Gi",""); 
                    	}                 	
                    	var priorityIndex=hstackSwitchNumber.indexOf(switchNumber);                    	
                    	portsObj["priority"]=hstackPriorityInfo[priorityIndex].stackPriority;
                    }
                    if (j == 2) {
                    	portsObj["stackPort"]=arrInnerWords[k].trim();
                    }
                    if (j == 3) {
                    	portsObj["opStatus"]=arrInnerWords[k].trim();
                    }
                    if (j == 4) {
                    	portsObj["nextReloadStatus"]=arrInnerWords[k].trim();
                    }
                    if (j == 5) {
                    	portsObj["mediaType"]=arrInnerWords[k].trim();
                    }
                    j++;
                }
                hstackSwitchInfo.push(portsObj)
            }
            //getting all Te ports
            var teInterfaceNames=[];    		
    		for(var i=0;i<hstackSwitchInfo.length;i++){    			
    			teInterfaceNames.push({
    					"hstackUplinkPortText": hstackSwitchInfo[i].tePorts,
    					"hstackUplinkPortValue": hstackSwitchInfo[i].tePorts
    			});    			
    		}		
    		$scope.hstackUplinkPort = null;
            $scope.hstackUplinkPortOptions = new kendo.data.ObservableArray(teInterfaceNames);
            
            $scope.hstackData = new kendo.data.ObservableArray(hstackSwitchInfo);
            $scope.hstackDataSource = new kendo.data.DataSource({
            	pageSize : 10,
            	data : $scope.hstackData
            });
    		$scope.hstackGridOptions = {
    			editable : false,
    			sortable : true,
    			change : editHstack,
    			pageable: {
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
    				   pageSizes : gridCrudService.grid_page_sizes,
    				   refresh : true,
    				   buttonCount : 5
    			},
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
    			scrollable : false,
    			selectable : true,
    			columns : [{
    				field : "tePorts",
    				editable : "false",
    				title : translate("switch_uplink_ports"),
    				width : 25
    			}, {
    				field : "stackPort",
    				editable : "false",
    				title : translate("hstack_stack_port"),
    				width : 25
    			}, {
    				field : "opStatus",
    				editable : "false",
    				title : translate("hstack_op_status"),
    				width : 25
    			},{
    				field : "nextReloadStatus",
    				editable : "false",
    				title : translate("hstack_next_reload_status"),
    				width : 25
    			},{
    				field : "priority",
    				editable : "false",
    				title : translate("hstack_switch_priority"),
    				width : 25
    			},{
    				field : "mediaType",
    				editable : "false",
    				title : translate("hstack_media_type"),
    				width : 25
    			}]
    		};
        }
        
        var editHstack = function(){
			$("#hstackForm  span.k-tooltip-validation").hide();
			var selected = this.dataItem(this.select());
			$scope.hstackWindow.open().center();
			$timeout(function(){
				if(selected.tePorts.indexOf("Te")!=-1){
					$scope.hstackSwitchNumber = selected.tePorts.split("/")[0].replace("Te","");
					$scope.hstackSwitchNumberOld = selected.tePorts.split("/")[0].replace("Te","");
				}else{
					$scope.hstackSwitchNumber = selected.tePorts.split("/")[0].replace("Gi","");
					$scope.hstackSwitchNumberOld = selected.tePorts.split("/")[0].replace("Gi","");
				}				
				$scope.hstackStackPort = selected.stackPort;
				$scope.hstackUplinkPort = selected.tePorts;				
				$scope.hstackStackPortOld = selected.stackPort;
				$scope.hstackUplinkPortOld = selected.tePorts;
				$scope.hstackStackPriority = selected.priority;
				$scope.hstackStackPriorityOld = selected.priority;
				if(selected.stackPort=="NA"){
					$scope.hstackStatus=translate("com_disable");
					$scope.hstackStatusOld=translate("com_disable");
				}else{
					$scope.hstackStatus=translate("com_enable");
					$scope.hstackStatusOld=translate("com_enable");
				}
				$scope.changeStackStatus();
			});					
		};
		//Configuring H-Stack
		$scope.saveHstackData = function(){
			if(hstackValidations.validate()){
				var cliHostNameCmd="";
				if($scope.hstackStatus!=$scope.hstackStatusOld){
					if($scope.hstackStatus==translate("com_enable")){
						cliHostNameCmd+="switch "+$scope.hstackSwitchNumber+" hstack-port "+$scope.hstackStackPort+" "+$scope.hstackUplinkPort+" \n";
					}else{
						cliHostNameCmd+="no switch "+$scope.hstackSwitchNumberOld+" hstack-port "+$scope.hstackStackPortOld+" "+$scope.hstackUplinkPortOld+" \n";
					}
				}else{
					if($scope.hstackStatus==translate("com_enable")){
						if($scope.hstackSwitchNumber!=$scope.hstackSwitchNumberOld || $scope.hstackStackPort!=$scope.hstackStackPortOld){
							cliHostNameCmd+="switch "+$scope.hstackSwitchNumber+" hstack-port "+$scope.hstackStackPort+" "+$scope.hstackUplinkPort+" \n";
						}
					}
				}
				if($scope.hstackStackPriority!=$scope.hstackStackPriorityOld){
		            if($scope.hstackStackPriority!=""){
		        		cliHostNameCmd+="switch "+$scope.hstackSwitchNumber+" priority "+$scope.hstackStackPriority+" \n";
		        	}else{
		        		cliHostNameCmd+="no switch "+$scope.hstackSwitchNumber+" priority "+$scope.hstackStackPriority+" \n";
		        	}  
				}
	            if(cliHostNameCmd!=""){               
	                var result = requestRoutingService.getConfigCmdOutput(cliHostNameCmd);
	                if(result==""){
	                	notificationService.showNotification(translate('switch_success_msg'),translate('com_config_success_title'),'success');						
	                }else if(result.indexOf("successfully")!=-1 ){
	                	notificationService.showNotification(result,translate('com_config_success_title'),'success');
	                }else if(result.indexOf("reload")!=-1 ){
	                	notificationService.showNotification(result,translate('com_config_success_title'),'success');
	                }else{
	                	notificationService.showNotification(result,translate('com_config_fail_title'),'error');
	                }               
	           }
	           $scope.reset();
	           $scope.loadHstack();
			}
		}	
		$scope.reset = function() {			
			$scope.hstackWindow.close();			
		};
		
		var hstackValidations = angular.element("#hstackForm").kendoValidator({
			rules: {				
				range: function (input) {
					var valMsg = input.data('rangeMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var min= input.prop('min');
					var max= input.prop('max');
					if(parseFloat(input.val())>=min && parseFloat(input.val())<=max){
						return true;
					}
					return false;
				}			
			}
		}).data("kendoValidator");
		$scope.changeStackStatus=function(){
			if($scope.hstackStatus==translate("com_enable")){
				$scope.hstackSwitchNumberStatus=false;
				$scope.hstackStackPortStatus=false;
			}else{
				$scope.hstackSwitchNumberStatus=true;
				$scope.hstackStackPortStatus=true;
			}
		}
    //End H-Stack Configuration
  }
]);
