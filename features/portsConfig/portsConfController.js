/**
 Description: Controller for Port Configuration
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('PortsConfCtrl', ['$scope','$rootScope','$timeout','$filter','dataSourceService','portsDataSourceService','notificationService','validationService','requestRoutingService','dialogService','executeCliCmdService','getStringLineService','clusterCmdService','gridCrudService',
    function($scope,$rootScope,$timeout,$filter,dataSourceService,portsDataSourceService,notificationService,validationService,requestRoutingService,dialogService,executeCliCmdService,getStringLineService,clusterCmdService,gridCrudService) {
        var trimVal=$filter('trimValue');
		$scope.kendoWindows = {isEditMode:true };
		var translate = $filter("translate"),
        portsConfigGenCLI = "",
        portsConfigAdvCLI = "";
        angular.element(".pageLoader").show();
        var portDetails, portInitialData ="";
        $scope.disablePortConfGlbApplyBtn = true;
        $scope.selectedSwitchId = 0;
        $scope.selectedRootMemberIndex = 0;
        $scope.disablePortConfGlbCancelBtn = true;
        var isEditModeFlag = false;
		$scope.disableDeleteButton=true;
		$scope.vlanCheckStatus=false;
		$scope.isRoutedPort=false;
		$scope.portMode = translate("com_switch");
		$scope.portGroupData = {
	       keepAliveMode:translate("com_enable")
	    };		
        $scope.portgroupno = "";
        $scope.translatePortGroupNumRange = translate("portconfig_portgroupnumber_range");
		$scope.violationType = null;
        $scope.violationOptions = new kendo.data.ObservableArray([
                {"violationText": translate('portconfig_violation_options_protect'), "violationValue": "protect"},
                {"violationText": translate('portconfig_violation_options_restrict'), "violationValue": "restrict"},
				{"violationText": translate('portconfig_violation_options_shutdown'), "violationValue": "shutdown"}
        ]);
		
		$scope.check2960Plus = false;
		$scope.checkCDB = false;
        $scope.platformType = $rootScope.deviceInfo.type;
		if($scope.platformType.indexOf("C2960+") != -1 ){
        		 $scope.check2960Plus = true;
        	} 
			if($scope.platformType.indexOf("CDB") != -1 ||$scope.platformType.indexOf("2960C") != -1 ||$scope.platformType.indexOf("3560C") != -1 ){
        		 $scope.checkCDB = true;
        	} 
        $scope.logicalInterface ={
    			port :{
    		        ipv6SubType : null,
    				listIpb6Address : [],
    				oldlistIpb6Address : [],
    				dhcp :false,
    				rapid : false,
    				autoconfig :false
    			}
    	}
        $scope.portPoeStatus=false;
        $scope.autoQosCheck=true;        
        $scope.loopDetectionDeviceStatus=true;
        $timeout(function(){
        	$scope.ipv6TypeOptions = dataSourceService.ipv6TypeOptions();        	
        	$scope.portPoeStatus=$rootScope.deviceInfo.isPoECapable;
        	if($scope.platformType.indexOf("C2960L-SM") != -1 ){
        		 $scope.portPoeStatus=false;
        		 $scope.loopDetectionDeviceStatus=false;
        	}      
            if($scope.platformType.indexOf("C1000") != -1){
				$scope.loopDetectionDeviceStatus=false;
			} 
			if($scope.platformType.indexOf("C1000SM") != -1){
				$scope.portPoeStatus=false;
				$scope.autoQosCheck=false;
			}  			
        },500)
        
        $scope.getPortGroupRangeDetails = function () {
            if ($scope.platformType.indexOf("CDB") != -1 || $scope.platformType.indexOf("3560CX") != -1 || $scope.platformType.indexOf("2960C") != -1 || $scope.platformType.indexOf("2960L") != -1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("2960+") != -1 || $scope.platformType.indexOf("S6650L") != -1 || $scope.platformType.indexOf("S5960L") != -1) {
                $scope.portGroupNumRangeUpto = "6";
                $scope.translatePortGroupNumRange = $scope.translatePortGroupNumRange.replace("6", $scope.portGroupNumRangeUpto);
            } else if ($scope.platformType.indexOf("2960XR") != -1) {
                $scope.portGroupNumRangeUpto = "48";
                $scope.translatePortGroupNumRange = $scope.translatePortGroupNumRange.replace("6", $scope.portGroupNumRangeUpto);
            } else if ($scope.platformType.indexOf("2960X") != -1 || ($scope.platformType.indexOf("S5960") != -1 && $scope.platformType.indexOf("S5960L") == -1)) {
                $scope.portGroupNumRangeUpto = "24";
                $scope.translatePortGroupNumRange = $scope.translatePortGroupNumRange.replace("6", $scope.portGroupNumRangeUpto);
            }
            if ($scope.platformType.indexOf("C2960X") != -1 || $scope.platformType.indexOf("C3560CX") != -1 || $scope.platformType.indexOf("2960L") != -1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") != -1 || $scope.platformType.indexOf("S5960") != -1) {
                $scope.visibleportMode = true;
            }
            if ($scope.platformType.indexOf("CDB") != -1) {
                $scope.showSeleconDetails = true;
            }
        };
        angular.extend($scope,{
			currentPortconfig: '',
            portsVoiceVlan: "",
            portconfigIPType:null,
            voiceVlanOption:"VLANID",
            portconfigPool:null,
            lacpPortPriority:null,
            ports: {
			    dhcpHostName: "",
                portConfigIp:"",
                portConfigSubnet:""
			}
        });
		$scope.diableApplyButton = function(){
			$timeout(function(){
                $scope.disablePortConfGlbApplyBtn = true;
				$scope.disablePortConfGlbCancelBtn=true;
			}, 1000);
		}
        $scope.portconfigIPTypeOptionsLoad = function () {
            $scope.portconfigIPTypeOptions = dataSourceService.iPTypeDataSource();
            $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[0].value;
        }
		$scope.portGroupType = null;
        $scope.portGroupTypeOptions = new kendo.data.ObservableArray([
                {"portGroupTypeText": translate('portconfig_portgroup_type_lacp'), "portGroupTypeValue": "LACP"},
                {"portGroupTypeText": translate('portconfig_portgroup_type_pagp'), "portGroupTypeValue": "PAgP"},
                {"portGroupTypeText": translate('portconfig_portgroup_type_on'), "portGroupTypeValue": "On"}
        ]);       
        $scope.flowControl = null;
        $scope.flowControlOptions = new kendo.data.ObservableArray([
                {"flowControlText": translate('port_config_flow_control_desired'), "flowControlValue": "desired"},
                {"flowControlText": translate('port_config_flow_control_off'), "flowControlValue": "off"},
                {"flowControlText": translate('port_config_flow_control_on'), "flowControlValue": "on"}
        ]);
        $scope.stpPortType = null;
        $scope.stpPortTypeList = new kendo.data.ObservableArray([                                                               
                {"stpPortText": translate('portconfig_options_edge'), "stpPortValue": "edge"},				
				{"stpPortText": translate('toggle_network'), "stpPortValue": "network"},
				{"stpPortText": translate('com_disable'), "stpPortValue": "disable"}
		]);
		$scope.overrideType = null;
        $scope.overrideTypeOptions = new kendo.data.ObservableArray([
                {"overrideTypeText": translate('portconfig_portgroup_type_override'), "overrideTypeValue": "override"},
                {"overrideTypeText": translate('portconfig_portgroup_type_string'), "overrideTypeValue": "string"}                
        ]);
		// Start of Datastructures required for the feature
		$scope.dhcpSnoopingVLANOptions = {
			editable : false,
			sortable : true,
			resizable : true,
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
				previousNext : true,
				info : true,
				refresh : true,
				pageSizes : gridCrudService.grid_page_sizes,
				buttonCount : 4
			},			
			scrollable: true,
			selectable: true,
			columns: [{
					"template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isDHCPVLANChecked(checked,dataItem)\"/>",
					sortable : false,
					width: "10%"
				},
				{
					field : "portsDHCPVlanId", 
					title : translate("vlan_id"), 
					width : "20%"
				},
				{
					field : "overrideType", 
					title : translate("portconfig_options_circuit_type"),
					width : "35%"
					
				},
				{
					field: "circuitString", 
					title: translate("portconfig_options_circuit_string"),
					width : "45%"					
			    }]
		};
        var portGenValidations = angular.element("#portsConfigGenForm").kendoValidator({
                rules: {
                    check: function (input) {
						var valMsg = input.data('checkMsg');
						if ((valMsg==undefined)) {
							return true;
						}
                        return validationService.validateCheck(input);
                    },
                    space: function (input) {
						var valMsg = input.data('spaceMsg');
						if ((valMsg==undefined)) {
							return true;
						}
                        return validationService.validateDataSpace(input);
                    },
                    range: function (input) {
						var valMsg = input.data('rangeMsg');
						if ((valMsg==undefined)) {
							return true;
						}
                        return validationService.validateRange(input);
                    },
					interfacerange:function(input){
						var valMsg = input.data('interfacerangeMsg');
						if ((valMsg==undefined)) {
							return true;
						}
						if($scope.intportConfDefault)
						{
							var fromVal = parseInt(angular.element("#intRangeFrom").val().split("/")[1]);
							var toVal = parseInt(angular.element("#accessPortsTo").val().split("/")[1]);
							if(toVal<fromVal){
								return false;
							}
						}else{
							return true;
						}
						return true;
					}
                }
            }).data("kendoValidator");
        var portSetValidations = angular.element("#portsConfigSetForm").kendoValidator({
            rules: {
                check: function (input) {
                    var valMsg = input.data('checkMsg');
                        if ((valMsg==undefined)) {
                            return true;
                        }
                    return validationService.validateCheck(input);
                },
                space: function (input) {
                    var valMsg = input.data('spaceMsg');
                        if ((valMsg==undefined)) {
                            return true;
                        }
                    return validationService.validateDataSpace(input);
                },
                range: function (input) {
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
				},
				maximum : function(input) {
                    return input.data('maximum') ? validationService.validateMaximumLength(input.val(), input.data('maximum')) : true;
                },
                minimum : function(input) {
                    return input.data('minimum') ? validationService.validateMinimumLength(input.val(), input.data('minimum')) : true;
                },
				checkVlanList:function(input){
					var valMsg = input.data('checkVlanListMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var regExp=/^[,-]+$/;
					var valStrHy=input.val().includes("--");
					var valStrCom=input.val().includes(",,");
					if(regExp.test(input.val()) || valStrHy || valStrCom || trim(input.val()) == ""){
						return false;
					}
					return true;
				},
                vlancheck: function (input) {
                    var valMsg = input.data('vlancheckMsg');
					if ((valMsg==undefined)){
                        return true;
					}
                    return true;
                },
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
                dupchanlgrp: function(input){
                    var valMsg = input.data('dupchanlgrpMsg');
					$scope.portgroupno = $scope.portgroupno === undefined ? "" : $scope.portgroupno;
                    if ((valMsg==undefined)) {
                        return true;
                    }
                    var isChannelGrpIsExist = false;
                    angular.forEach($scope.multiSelectedPort, function(msp, mspindex) {
                        if(msp.hasOwnProperty('channelGroup')){
                            mspindex += 1;
                            if(($scope.multiSelectedPort.length === mspindex && msp.channelGroup == $scope.portgroupno) || (msp.channelGroup == $scope.portgroupno)){
                                isChannelGrpIsExist = true;
                            }else{
                                isChannelGrpIsExist = false;
                            }
                        }
                    });
                    if(!isChannelGrpIsExist && $scope.portgroupno){
                        var findIntMatchWithGrpNum = $filter('filter')(showRunConfig, {"channelGroup":$scope.portgroupno}, true);
                        if(findIntMatchWithGrpNum.length > 0){
                            return false;
                        }
                    }
                    return true;
                }
            }
        }).data("kendoValidator");
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
        var portAdvValidations = angular.element("#portsConfigAdvForm").kendoValidator({
            rules: {
                check: function (input) {
                    return validationService.validateCheck(input);
                },
                space: function (input) {
                    return validationService.validateDataSpace(input);
                },
                range: function (input) {
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
				},
				mac: function(input) {
					    if((input.val()=="")){
							return true;
						}
                        var valMsg = input.data('macMsg');						
						if((valMsg==undefined)){
							return true;
						}else{
                        var RegEx='';
                        var str=input.val().trim();
                        if(str.indexOf(".")!=-1){
                            RegEx = /^([0-9A-Fa-f]{4}[.]){2}([0-9A-Fa-f]{4})$/;
                            if (RegEx.test(input.val())) {
                                return true;
                            } else {
                                return false;
                            }
                        }else if (str.indexOf(":")!=-1){
                            RegEx = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
                            if (RegEx.test(input.val())) {
                                return true;
                            } else {
                                return false;
                            }
                        }else if (str.indexOf("-")!=-1){
                            RegEx = /^([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})$/;
                            if (RegEx.test(input.val())) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                        }
                }
            }
        }).data("kendoValidator");
        $scope.loadDhcpPoolData = function(dhcpData){
            $scope.dhcpPoolDataSource = [];
            if(!angular.isUndefined(dhcpData)){
                for(var i = 0; i < dhcpData.length; i++){
                    $scope.dhcpPoolDataSource.push({text:dhcpData[i].name,value:dhcpData[i].name});
                }
            }
        };
        var showInterfacesStatusConfig=[];
        $scope.formatInterfaceName = function(){
            var showRunConfig=[];
            var interfaceStatusInfo=[];
            var intShowRun="";
            var portStatusConfigCLI="show running-config | s interface\n show interfaces status\n";
            if($scope.selectedSwitchId == 0) {
            showInterfacesStatusConfig = deviceCommunicatorCLI.getExecCmdOutput(portStatusConfigCLI);
            } else{
                var clusterIndex = $scope.selectedRootMemberIndex;
                if ($rootScope.deviceInfo.stackingInfo.type === "CLUSTER" && $rootScope.deviceInfo.clusterMembersInfo[clusterIndex].state != "Up") {
                    /* The cluster member is down */
                    return;
                }
             showInterfacesStatusConfig = clusterCmdService.getMultiShowCmdOutput(portStatusConfigCLI, clusterIndex);
            }
            var interfacesRunningConfig=showInterfacesStatusConfig[0].split("interface");
            var interfacesStatus=showInterfacesStatusConfig[1].split("\n");

            for (var i=1; i < interfacesStatus.length; i++) {
                var portsObj = {};
                portsObj["interfaceName"] = interfacesStatus[i].substring(0,8).trim();
                interfaceStatusInfo.push(portsObj)
            }
            for(var i = 1; i < interfacesRunningConfig.length; i++){
                var portsObj = {};
                intShowRun="interface "+interfacesRunningConfig[i];
                portsObj["PortName"] = executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
                portsObj["interfaceName"] = executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
                if(intShowRun.indexOf("no switchport")!=-1){
                    portsObj["isRouted"] = "no";
                }else{
                    portsObj["isRouted"] = "";
                }
                if(executeCliCmdService.getNextString(intShowRun,["channel-group"],["mode"]).trim()){
                    portsObj["channelGroup"] =executeCliCmdService.getNextString(intShowRun,["channel-group"],["mode"]).trim();
                    var channelGrpLine= getStringLineService.getLines(intShowRun,["channel-group"]);
                    portsObj["groupMode"] =executeCliCmdService.getNextString(channelGrpLine[0],["mode"],["\n"]).trim();
                }
                showRunConfig.push(portsObj);
            }
           for(var srconf = 0; srconf < showRunConfig.length; srconf++){
                if(showRunConfig[srconf].interfaceName.indexOf("TenGigabitEthernet")!=-1){
                    showRunConfig[srconf].interfaceName=showRunConfig[srconf].interfaceName.replace("TenGigabitEthernet","Te")
                    showRunConfig[srconf].PortName=showRunConfig[srconf].interfaceName;
                }else if(showRunConfig[srconf].interfaceName.indexOf("GigabitEthernet")!=-1){
                    showRunConfig[srconf].interfaceName=showRunConfig[srconf].interfaceName.replace("GigabitEthernet","Gi")
                    showRunConfig[srconf].PortName=showRunConfig[srconf].interfaceName;
                }else if(showRunConfig[srconf].interfaceName.indexOf("FastEthernet")!=-1){
                    showRunConfig[srconf].interfaceName=showRunConfig[srconf].interfaceName.replace("FastEthernet","Fa")
                    showRunConfig[srconf].PortName=showRunConfig[srconf].interfaceName;
                }
            }
            var showRunConfigAlt = [];
            angular.forEach(showRunConfig, function(src) {
                angular.forEach(interfaceStatusInfo, function(isi) {
                    if (src.interfaceName === isi.interfaceName) {
                        showRunConfigAlt.push(src);
                    }
                });
            });
            return showRunConfigAlt;
        };
        var ipAddressValidation = function (val) {
            if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(val)){
                return true;
            }
            else if (val == "0.0.0.0" || ''){
                return false;
            }
        }
        $scope.showRunConfigRecords = $scope.formatInterfaceName();
        $scope.portsStormControlStorm = null;
		$scope.autoQos = null;
        var portConfigIpOld="", portConfigSubnetOld="", portConfigIpTypeOld="", portConfigHostNameOld="", portConfigDHCPPoolOld="",portConfigPool="";
		$scope.portModeOld="";
        var l2L3ports = $scope.showRunConfigRecords;
    	var getPortDetails= function(portno, multiPortObjs) {
			$scope.isRoutedPort = false;
            l2L3ports = $scope.showRunConfigRecords;
            var findPortIsL3OrL2 = l2L3ports.map(function(e) {
                return e.PortName;
            }).indexOf(portno);
            if(findPortIsL3OrL2 != -1){
                if(l2L3ports[findPortIsL3OrL2].hasOwnProperty('isRouted') && l2L3ports[findPortIsL3OrL2].isRouted == "no"){
                    $scope.l3Port = "on";
                }else{
                    $scope.l3Port = "";
                }
            }
            $scope.portNumIdentity = portno;
            if(multiPortObjs){
                $rootScope.portNumIdentityMultiSelect = multiPortObjs;
                $rootScope.portSwitchIdentityMultiSelect = $scope.selectedSwitchId;
                if(multiPortObjs.length == 1){
                    $scope.multiSelectedPort[0].routed = $scope.l3Port;
                }
            }
            portDetails = portsDataSourceService.getPortData($scope.selectedPortId,$scope.selectedSwitchId);
            portInitialData = angular.copy(portDetails);
			$scope.speedDisable = false;
            $scope.duplexDisable = false;
            /*Display Values*/
            if($scope.platformType.indexOf("CDB")!=-1){
				$scope.speedDisable = false;
				$scope.duplexDisable = false;
				if(portno.indexOf("Gi") !=-1) {
					$scope.speedOptions = dataSourceService.speedOptions();
					$scope.showSeleconDetails=false;
				}else  {
					$scope.speedOptions = dataSourceService.speedSeleconOptions();
					$scope.showSeleconDetails=true;
				}
            } else {
    			$scope.speedOptions = dataSourceService.speedOptions();
                var result =portDetails.mediaCLIOP;
                if(result.indexOf("Not Present") != -1 || result.indexOf("SFP") != -1){
                    //Optical port
                    var portNo = $scope.selectedPortId.substr($scope.selectedPortId.indexOf("/")-1);
                    var inv = deviceCommunicator.getExecCmdOutput("show inventory | begin " + portNo);
                    if(inv==""){
                        //speed and duplex CANNOT be modified
                        $scope.speedDisable = true;
                        $scope.duplexDisable = true;
                    }else{
                        inv = inv.split("\n")[1];
                        if(inv != undefined && inv.indexOf("GLC-T") != -1){
                            //speed and duplex CAN be modified
                        	if($scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960L") !=-1){
                        		$scope.speedOptions = dataSourceService.speedOptionsCopperPort();
                        	}
                        } else {
                            //speed and duplex CANNOT be modified
                            $scope.speedDisable = true;
                            $scope.duplexDisable = true;
                        }
                    }
                } else {
                    //DO NOTHING
                    //speed and duplex CAN be modified
                }
        }
            if($scope.platformType.indexOf("2960+")!=-1 || $scope.platformType.indexOf("C1000FE")!=-1){
                var speedIndexFromOptions = $scope.speedOptions.options.data.map(function(e) {
                    return e.speedValue;
                }).indexOf("1000");
                $scope.speedOptions.options.data.splice(speedIndexFromOptions, 1);
            }
            $scope.autoNegoLimitOptions = dataSourceService.speedAutoOptions();
            $scope.duplexOptions = dataSourceService.duplexOptions();
            $scope.switchModeOptions = dataSourceService.switchModeOptions();
            $scope.stormControlOptions = dataSourceService.stormControlOptions();
			
            /*To Identify Actual Edit*/
            $scope.portsDuplex = null;
            $scope.switchMode = null;
            $timeout(function(){
				$scope.perpetualPoEOld= "";
                $scope.interfaceId = portDetails.PortId;                
                //General config
                $scope.portsDescription = portDetails.Description ? portDetails.Description : "";
                $scope.portsOldDescription = portDetails.Description ? portDetails.Description : "";
                if(portDetails.runSpeed==undefined || portDetails.runSpeed==""){
                     $scope.portsSpeed="auto";
                     $scope.portsOldSpeed="auto";
                     $scope.portsAutoSpeed="none";
                     $scope.portsOldAutoSpeed="none";
                     $scope.autoNegotiation=false;
                }else{
                	if(portDetails.runSpeed.indexOf("auto")!=-1){
                		speedArr=portDetails.runSpeed.split(" ");
                		if(speedArr.length>1){
                			$scope.portsSpeed=speedArr[0];
                			$scope.portsAutoSpeed=speedArr[1];
                			$scope.portsOldAutoSpeed=speedArr[1];
                		}else{
                			$scope.portsSpeed=portDetails.runSpeed;
                			$scope.portsAutoSpeed="none";
                			$scope.portsOldAutoSpeed="none";
                		}
                      	$scope.autoNegotiation=false;
                	}else{
                		$scope.portsSpeed = portDetails.Speed;
                		$scope.portsOldSpeed = portDetails.Speed;
                		$scope.portsAutoSpeed="none";
                		$scope.portsOldAutoSpeed="none";
                		$scope.autoNegotiation=true;
                   	}
                }
                $timeout(function(){
                    if(portDetails.runDuplex==undefined || portDetails.runDuplex==""){
                        $scope.portsDuplex="auto";
                        $scope.portsOldDuplex="auto";
                    }else{
                        $scope.portsDuplex = portDetails.Duplex;
                        $scope.portsOldDuplex = portDetails.Duplex;
                    }
                },50);
                $scope.portsStatus = portDetails.Status === "disabled" ? translate("toggle_down") : translate("toggle_up");
                $scope.portsOldStatus = portDetails.Status === "disabled" ? translate("toggle_down") : translate("toggle_up");
                //port settings
				$timeout(function(){
					$scope.switchMode = portDetails.SwitchMode === "static access" ? "access" : portDetails.SwitchMode;
                },50);
                $scope.switchOldMode = portDetails.SwitchMode === "static access" ? "access" : portDetails.SwitchMode;
                $scope.portsAccessVlan = portDetails.accessVlan;
                if (portDetails.voiceVlan!="none" &&  portDetails.voiceVlan!=""){  	
                   	if(portDetails.voiceVlan.indexOf("dot1p")!=-1){
                		$scope.voiceVlanOption="DOT1P";
                	}else{
                		 $scope.portsVoiceVlan = portDetails.voiceVlan;
                         $scope.portsOldVoiceVlan = portDetails.voiceVlan;
                         $scope.voiceVlanOption="VLANID";
                	}                	
                }else{
                    $scope.portsVoiceVlan = "";
                    $scope.portsOldVoiceVlan = "";
                    $scope.voiceVlanOption="VLANID";
                }
                $scope.portsAllowedVlan = portDetails.vlanIDs === "ALL" ? "all" : "notall";
                $scope.portsOldAllowedVlan = portDetails.vlanIDs === "ALL" ? "all" : "notall";
                $scope.portsAllowedVlanId = portDetails.vlanIDs !== "ALL" ? portDetails.vlanIDs : "";
                $scope.portsOldAllowedVlanId = portDetails.vlanIDs !== "ALL" ? portDetails.vlanIDs : "";
                $scope.portsNativeVlan = portDetails.nativeVlan;
                if(portDetails.portfast=="disable" || portDetails.portfast==undefined || portDetails.portfast==""){
                	 $scope.portsPortFast = translate("toggle_off");
                     $scope.portsOldPortFast = translate("toggle_off");
                }else{
                	$scope.portsPortFast = translate("toggle_on");
                    $scope.portsOldPortFast = translate("toggle_on");
                }
                //Adding pretzel 1.7 enhancement as part of port setting config
                $scope.portPriority = portDetails.portPriority;
                $scope.portPriorityOld = portDetails.portPriority;
                if(portDetails.flowControl && portDetails.flowControl!="" && portDetails.flowControl!=undefined){
                	$scope.flowControl = portDetails.flowControl;
                	$scope.flowControlOld = portDetails.flowControl;
                }else{
                	$scope.flowControl="off";
                	$scope.flowControlOld="off";
                }
                if(portDetails.portSecurity){
               	 	$scope.portSecurity = translate("com_enable");
                    $scope.portSecurityOld = translate("com_enable");
                }else{
               	 	$scope.portSecurity = translate("com_disable");
                    $scope.portSecurityOld = translate("com_disable");
                }
                if(portDetails.runningConfigSelectedPort.indexOf("no switchport") != -1){
					$scope.isRoutedPort = true;
				}else{
					$scope.isRoutedPort = false;
					if(portDetails.dhcpsnooping=="trust"){
						$scope.portsDhcpSnooping = translate("com_enable");
						$scope.portsOldDhcpSnooping = translate("com_enable");
					}else{
						$scope.portsDhcpSnooping = translate("com_disable");
						$scope.portsOldDhcpSnooping = translate("com_disable");
					}
				}
                
				
                if(portDetails.runningConfigSelectedPort.indexOf("ip verify source") != -1){
               	 	$scope.ipsgStatus = translate("com_enable");
               	 	$scope.ipsgOldStatus = translate("com_enable");
                }else{
               	 	$scope.ipsgStatus = translate("com_disable");
               	 	$scope.ipsgOldStatus = translate("com_disable");
                }
				
				if(portDetails.runningConfigSelectedPort.indexOf("ip address dhcp") != -1){
               	 	$scope.dhcpClientStatus = translate("com_enable");
               	 	$scope.dhcpClientOldStatus = translate("com_enable");
                }else{
               	 	$scope.dhcpClientStatus = translate("com_disable");
               	 	$scope.dhcpClientOldStatus = translate("com_disable");
                }
				
				if(portDetails.runningConfigSelectedPort.indexOf("ip dhcp relay information trusted") != -1){
               	 	$scope.dhcpRelayStatus = translate("com_enable");
               	 	$scope.dhcpRelayOldStatus = translate("com_enable");
                }else{
               	 	$scope.dhcpRelayStatus = translate("com_disable");
               	 	$scope.dhcpRelayOldStatus = translate("com_disable");
                }
				
				if(executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["switchport port-security mac-address"],["\n"]).trim()){
               	 	$scope.macAddress = executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["switchport port-security mac-address"],["\n"]).trim();
               	 	$scope.macAddressOldStatus = executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["switchport port-security mac-address"],["\n"]).trim();
                }else{
               	 	$scope.macAddress = "";
               	 	$scope.macAddressOldStatus = "";
                }
				
				if(executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["switchport port-security violation"],["\n"]).trim()){	
                    var tempViolation = executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["switchport port-security violation"],["\n"]).trim();
                    if(tempViolation.trim() == "protect" && tempViolation.indexOf("vlan") == -1){
						$scope.violationType = translate("portconfig_violation_options_protect");
						$scope.violationTypeOld = translate("portconfig_violation_options_protect");
                    }else if(tempViolation.trim() == "restrict" && tempViolation.indexOf("vlan") == -1){
						$scope.violationType = translate("portconfig_violation_options_restrict");
						$scope.violationTypeOld = translate("portconfig_violation_options_restrict");
                    }else if(tempViolation.indexOf("shutdown") != -1 && tempViolation.indexOf("vlan") != -1){	
						$scope.violationType = translate("portconfig_violation_options_shutdown");
						$scope.violationTypeOld = translate("portconfig_violation_options_shutdown");
						$scope.vlanCheckStatus = true;
						$scope.vlanCheckStatusOld = true;
                    }					
               	 	
                }else{
               	 	$scope.violationType = translate("portconfig_violation_options_shutdown");
               	 	$scope.violationTypeOld = translate("portconfig_violation_options_shutdown");
					$scope.vlanCheckStatus = false;
					$scope.vlanCheckStatusOld = false;
                }

                if(executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["ip dhcp snooping limit rate"],["\n"]).trim()){
					$scope.dhcpLimitRate = executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["ip dhcp snooping limit rate"],["\n"]).trim();
					$scope.dhcpOldLimitRate = executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["ip dhcp snooping limit rate"],["\n"]).trim();
                }else{
					$scope.dhcpLimitRate = "";
					$scope.dhcpOldLimitRate = "";
                }

                if(portDetails.runningConfigSelectedPort.indexOf("ip dhcp snooping information option allow-untrusted") != -1){
               	 	$scope.portsAllowUntrusted = translate("com_enable");
               	 	$scope.portsOldAllowUntrusted = translate("com_enable");
                }else{
               	 	$scope.portsAllowUntrusted = translate("com_disable");
               	 	$scope.portsOldAllowUntrusted = translate("com_disable");
                }
				
                //Adding LACP port and System priority
                $scope.lacpPortPriority=portDetails.lacpPortPriorityValue;
                $scope.oldlacpPortPriority=portDetails.lacpPortPriorityValue;
                
                $scope.lacpSysPriority=portDetails.lacpSysPriorityValue;
                $scope.oldlacpSysPriority=portDetails.lacpSysPriorityValue;
                
                if($scope.platformType.indexOf("CDB")!=-1){
                	$scope.eveClassification=portDetails.eveClassification;
                	$scope.eveClassificationOld=portDetails.eveClassification;                	
                }
                $scope.perpetualPoE=portDetails.perpetualPoE;
            	$scope.perpetualPoEOld=angular.copy(portDetails.perpetualPoE);
				//Advance config
				if(portDetails.stormControl == undefined || portDetails.stormControl ==""){
                	$scope.portsStormControlStorm = "none";
                	$scope.portsOldStormControlStorm = "none";
                }else{
                	$scope.portsStormControlStorm = portDetails.stormControl;
                	$scope.portsOldStormControlStorm = portDetails.stormControl;
                }
                $scope.portsStormControlBroadcast = portDetails.broadcast;
                $scope.portsStormControlMulticast = portDetails.multicast;
                $scope.portsStormControlUnicast = portDetails.unicast;
               //setting loop detect status and its value
                $scope.loopDetectStatus = portDetails.loopDetectStatus;
                $scope.loopDetectValue = portDetails.loopDetectValue;
                $scope.arpInspectionStatus = portDetails.arpInspectionStatus;
                $scope.arpLimitRate = portDetails.arpLimitRate;
                if(portDetails.mdixStatus){
                	$scope.mdixStatus = translate("com_enable") ;
                }else{
                	$scope.mdixStatus = translate("com_disable");
                }
				$scope.oldmdixStatus  = angular.copy($scope.mdixStatus)
                if(portDetails.cdpStatus){
                	$scope.cdpStatus = translate("com_enable") ;
                }else{
                	$scope.cdpStatus = translate("com_disable");
                }
                $scope.oldcdpStatus	= angular.copy($scope.cdpStatus);
                if(portDetails.lldpStatus){
                	$scope.lldpStatus = translate("com_enable") ;
                }else{
                	$scope.lldpStatus = translate("com_disable");
                } 
				$scope.oldlldpStatus = angular.copy($scope.lldpStatus);
                //setting the STP Extension values
                $scope.stpPortType=portDetails.stpPortType;
				$scope.oldstpPortType = angular.copy($scope.stpPortType);
                if(portDetails.stpBpdufilter){
                	$scope.stpBpdufilter = translate("com_enable") ;
                }else{
                	$scope.stpBpdufilter = translate("com_disable");
                }
                if(portDetails.stpBpduguard){
                	$scope.stpBpduguard = translate("com_enable") ;
                }else{
                	$scope.stpBpduguard = translate("com_disable");
                } 
                if(portDetails.stpLoopGuard){
                	$scope.stpLoopGuard = translate("com_enable") ;
                }else{
                	$scope.stpLoopGuard = translate("com_disable");
                } 
				$scope.oldStpLoopguard = angular.copy($scope.stpLoopGuard);
				$scope.oldStpBpdufilter = angular.copy($scope.stpBpdufilter);
				 $scope.oldStpBpduguard = angular.copy($scope.stpBpduguard);
             if(($scope.platformType.indexOf("C2960X") != -1 && $scope.platformType.indexOf("-LL") == -1) ||
            	  ($scope.platformType.indexOf("S5960") !=-1 && $scope.platformType.indexOf("S5960L") ==-1) ||
                  ($scope.platformType.indexOf("C3560CX") != -1) ||
                  ($scope.platformType.indexOf("2960C") != -1 && $scope.platformType.indexOf("-S") == -1)  ||
                  ($scope.platformType.indexOf("WS-C2960+") != -1 && $scope.platformType.indexOf("-S") == -1) ||
                  ($scope.platformType.indexOf("2960XR") != -1)  ||
                  ($scope.platformType.indexOf("2960CX") != -1) ||
                  ($scope.platformType.indexOf("2960L") != -1) || 
                  ($scope.platformType.indexOf("C1000") != -1) )  {            	   
					$scope.portSettingDeviceX = true;
					$scope.autoQosOptions = dataSourceService.autoQosOptions();	                    					
					if(portDetails.autoQOS == undefined || portDetails.autoQOS == ""){
						$scope.autoQos = "none";
						$scope.autoQosOld = "none";
					}else{
						$scope.autoQos = portDetails.autoQOS;
						$scope.autoQosOld = portDetails.autoQOS;
					}
				}else{					
					$scope.portSettingDeviceX = false;
				}				
				var dhcpSnoopingVlanList = portDetails.runningConfigSelectedPort.split("\n");
				$scope.dhcpSnoopingVLANValues = [];
				for (var i=0; i < dhcpSnoopingVlanList.length; i++) {
					if(executeCliCmdService.getNextString(dhcpSnoopingVlanList[i],["ip dhcp snooping vlan"],["\n"]).trim()){
						var partString = executeCliCmdService.getNextString(dhcpSnoopingVlanList[i],["ip dhcp snooping vlan"],["\n"]).trim();
						var partArray = partString.split(" ");
						var tempVlanID = partArray[0];					
						var tempOverrideType = partString.indexOf("override") != -1 ? translate("portconfig_portgroup_type_override") : translate("portconfig_portgroup_type_string");
					    if(partArray.length > 0){
							var tempCircuitString = partArray[partArray.length-1];						
						}
						$scope.dhcpSnoopingVLANValues.push({
							"portsDHCPVlanId":tempVlanID,
							"overrideType":tempOverrideType,
							"circuitString":tempCircuitString
						})
					}
				}
				
				$scope.dhcpSnoopingVLANData = new kendo.data.ObservableArray($scope.dhcpSnoopingVLANValues);
					$scope.dhcpSnoopingVLANDataSource = new kendo.data.DataSource({
						pageSize: 10,
						data: $scope.dhcpSnoopingVLANData,
						schema: {
							model: {
								fields: {}
							}
						}
				});
            },100);
			//portMode
			$scope.isportMode = true;
			if($scope.platformType.indexOf("C2960X") != -1 || $scope.platformType.indexOf("C3560CX") != -1 || $scope.platformType.indexOf("2960L") != -1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") != -1 || $scope.platformType.indexOf("S5960") != -1){
                if(portDetails.hasOwnProperty("dhcpPool")){
                    var showRunConfDhcpPool = getStringLineService.getLines(portDetails.dhcpPool,["ip dhcp pool"]);
                    $scope.dhcpPoolArr = [];
                    for (var i=0; i < showRunConfDhcpPool.length; i++) {
                        var scopeObj = {};
                        scopeObj["name"] = executeCliCmdService.getNextString(showRunConfDhcpPool[i],["ip dhcp pool "],["\n"]).trim();
                        $scope.dhcpPoolArr.push(scopeObj)
                    }
                }
				$scope.isRoutedMode = true;
				var findPortMode = portDetails.runningConfigSelectedPort;
				if(findPortMode.indexOf("no switchport") != -1){
                    $scope.ports.portConfigIp = "";
                    $scope.ports.portConfigSubnet = "";
                    $scope.ports.dhcpHostName = "";
                    if($scope.dhcpPoolDataSource && $scope.dhcpPoolDataSource.length > 0){
                        $scope.portconfigPool = $scope.dhcpPoolDataSource[0].value;
                        portConfigPool=$scope.dhcpPoolDataSource[0].value;
                    }
					$scope.isportMode = false;
					$scope.isRoutedMode = true;
					$scope.portMode = translate("portconfig_port_routed");
					$scope.portModeOld = "Routed";				
					if($scope.multiSelectedPort.length==1){
						var runningconfig =executeCliCmdService.getNextString(portDetails.runningConfigSelectedPort,["ip address"],["\n"]).trim();
						if(runningconfig!=""){	
							$scope.iptypeipv4 = true;
                            $timeout(function () {                            	
                                var spltIp = runningconfig.split(" ");
                                var findIpValidate = ipAddressValidation(spltIp[0]);
                                if(spltIp[0] == "pool"){
                                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[3].value;
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.portconfigPool = spltIp[1];
                                    portConfigPool=spltIp[1];
                                }else if(spltIp[0] == "dhcp"){
                                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[2].value;
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.ports.dhcpHostName = spltIp[2];
                                }else if(spltIp[0] != "" && findIpValidate) {
                                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[1].value;
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.ports.portConfigIp = spltIp[0];
                                    portConfigIpOld = spltIp[0];
                                }
                                if(spltIp[1]){
                                    var findSubNetMaskValidate = $scope.validateSubnetMask(spltIp[1]);
                                    if(findSubNetMaskValidate){
                                        $scope.ports.portConfigSubnet = spltIp[1];
                                        portConfigSubnetOld = spltIp[1];
                                    }
                                }
                            },1000);
						}else{
							 $scope.iptypeipv4 = false;
						    $timeout(function () {
                                $scope.portconfigIPType = "none";
                                portConfigIpTypeOld = $scope.portconfigIPType;                               
                            },1000);
						}						
						//Populating IPV6 list
						var arrIPV6 =new Array();
						var ipv6AutoConfigStatus=false;
						var ipv6DhcpStatus=false;
						var ipv6RapidCommitStatus=false;
                        $scope.iptypeipv6 = false;
						var ipv6List =getStringLineService.getLines(portDetails.runningConfigSelectedPort,["ipv6 address"]);
						if(ipv6List.length > 0){	
							$scope.iptypeipv6 = true;                            
                        	 for(var i = 0; i < ipv6List.length; i++){
                        		 var ipv6Address=executeCliCmdService.getNextString(ipv6List[i],["ipv6 address "],["\n"]).trim();
                        		 if(ipv6Address.indexOf("autoconfig")==-1 && ipv6Address.indexOf("dhcp")==-1){
                        			 arrIPV6.push({"name":ipv6Address});                          
                        		 } 
                        		 if(ipv6Address.indexOf("autoconfig")!=-1){
                        			 ipv6AutoConfigStatus=true;
                        		 }
                        		 if(ipv6Address.indexOf("dhcp")!=-1){
                        			 if(ipv6Address.indexOf("dhcp rapid-commit")!=-1){
                        				 ipv6RapidCommitStatus=true;
                        				 ipv6DhcpStatus=true;
                        			 }else{
                        				 ipv6DhcpStatus=true; 
                        			 }
                        		 }
                        	 }                            
						 }							
						 $timeout(function () {
							 $scope.logicalInterface.port.listIpb6Address=arrIPV6;
							 $scope.logicalInterface.port.oldlistIpb6Address=arrIPV6;
							 $scope.logicalInterface.port.dhcp=ipv6DhcpStatus;
						     $scope.logicalInterface.port.rapid=ipv6RapidCommitStatus;
						     $scope.logicalInterface.port.autoconfig=ipv6AutoConfigStatus;
						 },1000);
											 
					}else{
						if($scope.portgroupno){
						   var cliop="";
                           var portIPSubnet;                       
                           if(!$scope.selectedSwitchId) {
                        	   cliop = requestRoutingService.getShowCmdOutput("show running-config interface po"+$scope.portgroupno ,"showRunConfig");                        	  
                        	   portIPSubnet = cliop.ShowRunningGig.wnwebdata.ipaddress;
                           } else {
                               cliop = clusterCmdService.execShowClusterCmds($scope.selectedSwitchId,"show running-config interface po"+$scope.portgroupno);
                               portIPSubnet = cliop.split("ip address")[1].split("\n")[0].trim();
                           }                    
                           if($scope.multiSelectedPort.length==2 && portIPSubnet==""){
                        	   cliop = requestRoutingService.getShowCmdOutput("show running-config interface "+$scope.multiSelectedPort[0].uniqueId ,"showRunConfig");                        	  
                        	   portIPSubnet = cliop.ShowRunningGig.wnwebdata.ipaddress;
                           }                        
					        if(portIPSubnet){
					        	$scope.iptypeipv4 = true;
                                var result1 = portIPSubnet.split(" ");
                                var findIpValidate = ipAddressValidation(result1[0])
                                if(result1[0] == "pool"){
                                    $timeout(function () {
                                        $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[3].value;
                                    }, 1000);
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.portconfigPool = result1[1];
                                    portConfigPool= result1[1];
                                }else if(result1[0] == "dhcp"){
                                    $timeout(function () {
                                        $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[2].value;
                                    }, 1000);
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.ports.dhcpHostName = result1[2];
                                    portConfigHostNameOld = result1[1];
                                }else if(result1[0] != "" && findIpValidate) {
                                    $timeout(function () {
                                        $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[1].value;
                                    }, 1000);
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.ports.portConfigIp = result1[0];
                                    portConfigIpOld = result1[0];
                                }
                                if(result1[1]){
                                    var findSubNetMaskValidate = $scope.validateSubnetMask(result1[1]);
                                    if(findSubNetMaskValidate){
                                        $scope.ports.portConfigSubnet = result1[1];
                                        portConfigSubnetOld = result1[1];
                                    }
                                }
					        }else{
                                $timeout(function () {
                                    $scope.portconfigIPType = "none";
                                    portConfigIpTypeOld = $scope.portconfigIPType;
                                    $scope.iptypeipv4 = false;
                                },1000);
                                $scope.ports.portConfigIp = "";
                                $scope.ports.portConfigSubnet = "";
					        }
									
							//Populating IPV6 list
							var arrIPV6 =new Array();                       
	                        $scope.iptypeipv6 = false;
	                        var ipv6AutoConfigStatus=false;
	                        var ipv6DhcpStatus=false;
	                        var ipv6RapidCommitStatus=false;
	                        var ipv6PortChannel = deviceCommunicator.getExecCmdOutput("show running-config interface po"+$scope.portgroupno);
	                        if($scope.multiSelectedPort.length==2 && ipv6PortChannel.indexOf("ipv6 address")==-1){
	                        	ipv6PortChannel = deviceCommunicator.getExecCmdOutput("show running-config interface "+$scope.multiSelectedPort[0].uniqueId);
	                        }
					       	var ipv6List =getStringLineService.getLines(ipv6PortChannel,["ipv6 address"]);	
							if(ipv6List.length > 0){	
								$scope.iptypeipv6 = true;                            
	                        	 for(var i = 0; i < ipv6List.length; i++){
	                        		 var ipv6Address=executeCliCmdService.getNextString(ipv6List[i],["ipv6 address "],["\n"]).trim();
	                        		 if(ipv6Address.indexOf("autoconfig")==-1 && ipv6Address.indexOf("dhcp")==-1){
	                        			 arrIPV6.push({"name":ipv6Address});                          
	                        		 }   
	                        		 if(ipv6Address.indexOf("autoconfig")!=-1){
	                        			 ipv6AutoConfigStatus=true;
	                        		 }
	                        		 if(ipv6Address.indexOf("dhcp")!=-1){
	                        			 if(ipv6Address.indexOf("dhcp rapid-commit")!=-1){
	                        				 ipv6RapidCommitStatus=true;
	                        				 ipv6DhcpStatus=true;
	                        			 }else{
	                        				 ipv6DhcpStatus=true; 
	                        			 }
	                        		 }
	                        	 }                            
							 }	
							 $timeout(function () {
								 $scope.logicalInterface.port.listIpb6Address=arrIPV6;
								 $scope.logicalInterface.port.oldlistIpb6Address=arrIPV6;
								 $scope.logicalInterface.port.dhcp=ipv6DhcpStatus;
							     $scope.logicalInterface.port.rapid=ipv6RapidCommitStatus;
							     $scope.logicalInterface.port.autoconfig=ipv6AutoConfigStatus;
							 },1000);
												 
					        if (!$scope.$$phase){
					             $scope.$apply();
					        }
						}else{
                            $timeout(function () {
                                $scope.portconfigIPType = portConfigIpTypeOld;
                            },1000);
                            $scope.ports.portConfigIp = portConfigIpOld;
                            $scope.ports.portConfigSubnet = portConfigSubnetOld;
                            $scope.ports.dhcpHostName = portConfigHostNameOld
                        }
					}
				}else{
                    $scope.ports.portConfigIp = "";
                    portConfigIpOld = "";
                    $scope.ports.portConfigSubnet = "";
                    portConfigSubnetOld = "";
					$scope.isportMode = true;
					$scope.isRoutedMode = false;
					$scope.portMode = translate("com_switch");
					$scope.portModeOld = "Switch";
					$scope.iptypeipv6 = false;
					$scope.iptypeipv4 = false;
					$scope.logicalInterface.port.listIpb6Address=[];
					$scope.logicalInterface.port.oldlistIpb6Address=[];
					$scope.logicalInterface.port.dhcp=false;
				    $scope.logicalInterface.port.rapid=false;
				    $scope.logicalInterface.port.autoconfig=false;
				}
			}else {
				$scope.isportMode = true;
			}
            $scope.loadDhcpPoolData($scope.dhcpPoolArr);
            angular.element(".pageLoader").hide();
        };
        function setCharAt(str,index,chr) {
            if(index > str.length-1) {
                return str;
            }
            return str.substr(0,index) + chr + str.substr(index+1);
        }
        //Port setting LAG
        var oldPortGroupType="", oldPortgroupno="", oldKeepAliveMode=translate('com_disable');
        $scope.portSetingLAGLoading = function(multiSelectedPort, showRunConfig){     
            $scope.selectedPortsIntRecords = [];
            for(var sel = 0; sel < multiSelectedPort.length; sel++){
                var selectedPorts = $filter('filter')(showRunConfig, {interfaceName:multiSelectedPort[sel].uniqueId},true);
                $scope.selectedPortsIntRecords.push(selectedPorts[0]);
            }
            var retainGroupChannel = "", retainPortGroupType = "";
            angular.forEach($scope.selectedPortsIntRecords, function(value) {
                if (value.hasOwnProperty('channelGroup') && value.hasOwnProperty('groupMode')) {
                    retainGroupChannel = value.channelGroup;
                    retainPortGroupType = value.groupMode;
                    var isSameChannelGroup = $filter('filter')($scope.selectedPortsIntRecords, {channelGroup:value.channelGroup},true);
                    if($scope.selectedPortsIntRecords.length === isSameChannelGroup.length){
                        $scope.portgroupno = value.channelGroup;
                        oldPortgroupno = $scope.portgroupno;
                        if(value.groupMode === "passive"){
                            $timeout(function(){
                                $scope.portGroupType = $scope.portGroupTypeOptions[0].portGroupTypeValue;
                            },100);
                            oldPortGroupType = $scope.portGroupTypeOptions[0].portGroupTypeValue;
                            $scope.portGroupData.keepAliveMode = translate('com_disable');
                            oldKeepAliveMode = $scope.portGroupData.keepAliveMode;
                        }else if(value.groupMode === "on"){
                            $timeout(function(){
                                $scope.portGroupType = $scope.portGroupTypeOptions[2].portGroupTypeValue;
                            },100);
                                oldPortGroupType = $scope.portGroupTypeOptions[2].portGroupTypeValue;
                        }else if(value.groupMode === "active"){
                            $timeout(function(){
                                $scope.portGroupType = $scope.portGroupTypeOptions[0].portGroupTypeValue;
                            },100);
                            oldPortGroupType = $scope.portGroupTypeOptions[0].portGroupTypeValue;
                            $scope.portGroupData.keepAliveMode = translate('com_enable');
                            oldKeepAliveMode = $scope.portGroupData.keepAliveMode;
                        }else if(value.groupMode === "desirable"){
                            $timeout(function(){
                                $scope.portGroupType = $scope.portGroupTypeOptions[1].portGroupTypeValue;
                            },100);
                            oldPortGroupType = $scope.portGroupTypeOptions[1].portGroupTypeValue;
                            $scope.portGroupData.keepAliveMode = translate('com_enable');
                            oldKeepAliveMode = $scope.portGroupData.keepAliveMode;
                        }else if(value.groupMode === "auto"){
                            $timeout(function(){
                                $scope.portGroupType = $scope.portGroupTypeOptions[1].portGroupTypeValue;
                            },100);
                            oldPortGroupType = $scope.portGroupTypeOptions[1].portGroupTypeValue;
                            $scope.portGroupData.keepAliveMode = translate('com_disable');
                            oldKeepAliveMode = $scope.portGroupData.keepAliveMode;
                        }
                    }else{
                        $scope.portgroupno = retainGroupChannel;
                        oldPortgroupno = $scope.portgroupno;
                    }
                }else{
                    $scope.portgroupno = retainGroupChannel;
                    oldPortgroupno = $scope.portgroupno;
                    if(retainPortGroupType){
                        var groupTypeKeepalive = $scope.formatPortGroupType(retainPortGroupType);
                        $timeout(function(){
                            $scope.portGroupType = groupTypeKeepalive.type;
                        },100);
                        $scope.portGroupData.keepAliveMode = groupTypeKeepalive.keepalive;
                    }else{
                        $timeout(function(){
                            $scope.portGroupType = $scope.portGroupTypeOptions[0].portGroupTypeValue;
                        },100);
                        $scope.portGroupData.keepAliveMode = translate("com_enable");
                    }
                    oldPortGroupType = $scope.portGroupType;
                    oldKeepAliveMode = $scope.portGroupData.keepAliveMode;
                }
            });
        };
        $scope.formatPortGroupType = function(mode){
            if(mode === "passive"){
                return {type:$scope.portGroupTypeOptions[0].portGroupTypeValue,keepalive: translate('com_disable')};
            }else if(mode === "on"){
                return {type:$scope.portGroupTypeOptions[2].portGroupTypeValue,keepalive: translate('com_disable')};
            }else if(mode === "active"){
                return {type:$scope.portGroupTypeOptions[0].portGroupTypeValue,keepalive: translate('com_enable')};
            }else if(mode === "desirable"){
                return {type:$scope.portGroupTypeOptions[1].portGroupTypeValue,keepalive: translate('com_enable')};
            }else if(mode === "auto"){
                return {type:$scope.portGroupTypeOptions[1].portGroupTypeValue,keepalive: translate('com_disable')};
            }
        }
        $scope.setPortsGroups = function(interfaceNameArr, portName){
            var intNameList = "", firstInt = "", secondInt="", intList = "", count = 0, diffCount = 0;
                for(var j = 0; j < interfaceNameArr.length; j++){
                    if(j == 0){
                        firstInt = interfaceNameArr[j];
                    }else{
                        var intDiff = Number(interfaceNameArr[j]) - Number(interfaceNameArr[j - 1]);
                        if(intDiff == 1){
                            secondInt = interfaceNameArr[j];
                            intList = firstInt +"-"+ secondInt;
                        }else{
                            diffCount++;
                            if(intList == "" && count == 0){
                                intNameList += firstInt;
                                count++;
                            }else{
                                intNameList += intList;
                            }
                            if(intNameList != ""){
                                intNameList += ","+portName;
                            }
                            var nextCount;
                            if(interfaceNameArr[j+1]){
                                nextCount = Number(interfaceNameArr[j+1]) - Number(interfaceNameArr[j]);
                            }else{
                                intNameList += interfaceNameArr[j];
                                nextCount = undefined;
                            }
                            if(nextCount && nextCount != 1){
                                intNameList += interfaceNameArr[j];
                                count++;
                            }
                            firstInt = interfaceNameArr[j];
                            intList="";
                        }
                    }
                }
                var count1 = 0;
                if(diffCount == 0){
                    intNameList = intList;
                    count1++;
                }
                if(interfaceNameArr.length == 1){
                    intNameList = firstInt;
                }
                if(count1 == 0){
                    intNameList += intList;
                }
            return intNameList;
        };
        function removeDuplicates(arr){
            var unique_array = [];
            for(var i = 0;i < arr.length; i++){
                if(unique_array.indexOf(arr[i]) == -1){
                    unique_array.push(arr[i])
                }
            }
            return unique_array
        }
        /* Selected Ports as concatenating as strings
            For Example:
                (i) if Fa0/7 and Fa0/9  port selected without order string will be (Fa0/7,Fa0/9)
                (ii) if Fa0/7,Fa0/8 and Fa0/9 port selected with order string will be (Fa0/7-9)
        */
        $scope.formatSelectedPortsName = function(multiSelectedPort){
            var multiPorts = [], currentPortSel = [];
            multiPorts = $.map(multiSelectedPort, function(value) {
                var $portNumber = value.uniqueId;
                return [$portNumber];
            });
            multiPorts.sort($scope.naturalCompareSorting);
            var intFa1 = [], intGig1 = [], intTen1 = [], intFa = [], intGig = [], intTen = [];
            for(var p = 0; p < multiPorts.length; p++){
                if(multiPorts[p].split("/")[0].indexOf("Fa") != -1){
                    var multiPortsSplitSlash = multiPorts[p].split("/");
                    if(!$scope[multiPortsSplitSlash[0]]){
                        $scope[multiPortsSplitSlash[0]] = {
                            int: []
                        };
                    }
                    intFa1.push(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]);
                    if($scope[multiPortsSplitSlash[0]].int.indexOf(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]) === -1){
                        $scope[multiPortsSplitSlash[0]].int.push(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]);
                    }
                    intFa.push(multiPortsSplitSlash);
                }
                if(multiPorts[p].split("/")[0].indexOf("Gi") != -1){
                    var multiPortsSplitSlash = multiPorts[p].split("/");
                    if(!$scope[multiPortsSplitSlash[0]]){
                        $scope[multiPortsSplitSlash[0]] = {
                            int: []
                        };
                    }
                    intGig1.push(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]);
                    if($scope[multiPortsSplitSlash[0]].int.indexOf(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]) === -1){
                        $scope[multiPortsSplitSlash[0]].int.push(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]);
                    }
                    intGig.push(multiPortsSplitSlash);
                }
                if(multiPorts[p].split("/")[0].indexOf("Te") != -1){
                    var multiPortsSplitSlash = multiPorts[p].split("/");
                    if(!$scope[multiPortsSplitSlash[0]]){
                        $scope[multiPortsSplitSlash[0]] = {
                            int: []
                        };
                    }
                    intTen1.push(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]);
                    if($scope[multiPortsSplitSlash[0]].int.indexOf(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]) === -1){
                        $scope[multiPortsSplitSlash[0]].int.push(multiPortsSplitSlash[multiPortsSplitSlash.length - 1]);
                    }
                    intTen.push(multiPortsSplitSlash);
                }
            }
            var faListName = "", gigListName = "", teGigListName = "";
            if(intFa1.length > 0){
                for(var fa = 0; fa < intFa.length; fa++){
                    var arrIntType = intFa[fa];
                    $scope[arrIntType[0]].intType = arrIntType[0];
                    $scope[arrIntType[0]].switchId = arrIntType[1];
                    var intType;
                    if(arrIntType.length > 2){
                        intType = $scope[arrIntType[0]].intType+"/"+$scope[arrIntType[0]].switchId+"/";
                    }else{
                        intType = $scope[arrIntType[0]].intType+"/";
                    }
                    faListName = intType+$scope.setPortsGroups($scope[arrIntType[0]].int.sort($scope.naturalCompareSorting),intType);
                    currentPortSel.push(faListName);
                }
                currentPortSel = removeDuplicates(currentPortSel);
            }
            if(intGig1.length > 0){
                for(var gig = 0; gig < intGig.length; gig++){
                    var arrIntType = intGig[gig];
                    $scope[arrIntType[0]].intType = arrIntType[0];
                    $scope[arrIntType[0]].switchId = arrIntType[1];
                    var intType;
                    if(arrIntType.length > 2){
                        intType = $scope[arrIntType[0]].intType+"/"+$scope[arrIntType[0]].switchId+"/";
                    }else{
                        intType = $scope[arrIntType[0]].intType+"/";
                    }
                    gigListName = intType+$scope.setPortsGroups($scope[arrIntType[0]].int.sort($scope.naturalCompareSorting),intType);
                    currentPortSel.push(gigListName);
                }
                currentPortSel = removeDuplicates(currentPortSel);
            }
            if(intTen1.length > 0){
                for(var te = 0; te < intTen.length; te++){
                    var arrIntType = intTen[te];
                    $scope[arrIntType[0]].intType = arrIntType[0];
                    $scope[arrIntType[0]].switchId = arrIntType[1];
                    var intType;
                    if(arrIntType.length > 2){
                        intType = $scope[arrIntType[0]].intType+"/"+$scope[arrIntType[0]].switchId+"/";
                    }else{
                        intType = $scope[arrIntType[0]].intType+"/";
                    }
                    teGigListName = intType+$scope.setPortsGroups($scope[arrIntType[0]].int.sort($scope.naturalCompareSorting),intType);
                    currentPortSel.push(teGigListName);
                }
                currentPortSel = removeDuplicates(currentPortSel);
            }
            $scope.currentPortSelected = currentPortSel.toString();
            $scope.currentSwitchSelected = angular.copy($scope.selectedSwitchId);
        };
		$scope.getPower = function(id){
			$scope.selectedSwitchPoeCheck = false;
			if($rootScope.deviceInfo.isPoECapable){
					//Fetch power inline
					$scope.poeData = [];
					var powerStat = deviceCommunicator.getExecCmdOutput("show power inline \n");
					var arrPortsMonPower=powerStat.split("Interface")
					var arrPower=arrPortsMonPower[1].split("\n");
					for (var i=3; i < arrPower.length; i++) {
						var portsObj = {};
						var arrInnerWords = arrPower[i].split(" ");
						for (var k=0,j=1; k < arrInnerWords.length; k++) {
							if(arrInnerWords[k] == "") {
								continue;
							}
							if (j == 1) {
								portsObj["Interface"]=arrInnerWords[k].trim();
							}else if (j == 4) {
								portsObj["Power"]=arrInnerWords[k].trim();
							}
							j++;
						}
						$scope.poeData.push(portsObj)
					}
					if($scope.poeData.length > 0){
						$scope.poeData.forEach(function(input){
						if(input.Interface == id){
							$scope.selectedSwitchPoeCheck = true;
							}
						});
					}
				}
		}
        $scope.loadPortGroups = function(args, showRunConfig){
            $scope.portChannelGroup = "";
			$scope.getPower(args.uniqueId);
            var findPortChannelGroup = $filter('filter')(showRunConfig, {"interfaceName":args.uniqueId}, true);
            if(findPortChannelGroup.length > 0 && findPortChannelGroup[0].hasOwnProperty('channelGroup')){
                $scope.portChannelGroup = findPortChannelGroup[0].channelGroup;
                var findIntMatchWithGrpNum = $filter('filter')(showRunConfig, {"channelGroup":findPortChannelGroup[0].channelGroup}, true);
                if(findIntMatchWithGrpNum.length > 0){
                    $scope.tempMultiSelectedPort = [];
                    $scope.selectedGrpPorts = [];
                    $scope.multiSelectedPort = [];
                    for(var $match in findIntMatchWithGrpNum){
                        if (findIntMatchWithGrpNum.hasOwnProperty($match)) {
                            var intMatchId = {
                                uniqueId: findIntMatchWithGrpNum[$match].interfaceName,
                                channelGroup: findPortChannelGroup[0].channelGroup
                            };
                            $scope.multiSelectedPort.push(intMatchId);
                            $scope.tempMultiSelectedPort.push(intMatchId);
                            $scope.selectedGrpPorts.push(intMatchId);
                        }
                    }
                }
            }else{
                $scope.tempMultiSelectedPort = [];
                $scope.selectedGrpPorts = [];
                $scope.multiSelectedPort = [];
                args.default = "default";
                $scope.multiSelectedPort.push(args);
            }
            $scope.formatSelectedPortsName($scope.multiSelectedPort);
        };
        //getting list of interfaces in order
        var interfaceData=[{}];
        var showInterfaceStatusList=showInterfacesStatusConfig[1].split("\n");
        interfaceData[0].Port = showInterfaceStatusList[1].substring(0,8).trim();
        interfacesDataTemp= interfaceData;
        $scope.selectedPortId = interfaceData[0].Port;
		$scope.portNumIdentity = $scope.selectedPortId;
		$scope.currentPortconfig = $scope.selectedPortId;
        $scope.disablePortConfGlbApplyBtn=true;
        $scope.disablePortConfGlbCancelBtn=true;
        interfacesDataTemp[0].uniqueId = interfacesDataTemp[0].Port;
        interfacesDataTemp[0].single = true;
        var showRunConfig = $scope.showRunConfigRecords;
        $scope.loadPortGroups(interfaceData[0], showRunConfig);
        $scope.storedSelectedPort = $scope.multiSelectedPort[0];
        $timeout(function(){
            getPortDetails($scope.selectedPortId, $scope.multiSelectedPort);
        }, 10)
        $scope.getPortGroupRangeDetails();
        $scope.l2L3portConfig = [];
        $scope.cancelToDefaultInterface = function () {
            var l3PortIndex = $scope.multiSelectedPort.map(function(e) {
                return e.uniqueId;
            }).indexOf($scope.defaultPortName);
            if(l3PortIndex != -1){
                $scope.multiSelectedPort.splice(l3PortIndex, 1);
                $scope.formatSelectedPortsName($scope.multiSelectedPort);
                getPortDetails($scope.selectedPortId, $scope.multiSelectedPort);
                $scope.getPortGroupRangeDetails();
            }
        }
        var closeFunction = function(){
            $scope.cancelToDefaultInterface();
        }
        $scope.confirmationL3Port = function(portName) {
            $scope.defaultPortName = portName;
            $scope.defaultInt = dialogService.dialog({
                content : translate("portconfig_the_port")+portName+" "+translate("portconfig_the_newport_config_msg"),
                title : translate("msg_delete_confirmation_window"),
                messageType : "confirm",
                actionButtons : [{
                    text : translate("com_ok"),
                    callback : "saveDefaultInterface"
                }, {
                    text : translate("com_cancel")
                }],
                onClose:closeFunction
            });
        };
        $scope.$on("saveDefaultInterface", function() {
            $scope.saveToDefaultInterface($scope.defaultInt.data("kendoWindow"));
        });
        $scope.saveToDefaultInterface = function (popup) {
            var l3PortIndex = $scope.multiSelectedPort.map(function(e) {
                return e.uniqueId;
            }).indexOf($scope.defaultPortName);
            $scope.multiSelectedPort[l3PortIndex].default = "default";
            setTimeout(function() {
                popup.destroy();
            }, 500);
        };
        $scope.$watch('multiSelectedPort', function(nMSP, oMSP){
        	$timeout(function(){
	            if(nMSP.length == 1){
	                $scope.portConfigIpDisabled = false;
	                $scope.portConfigSubnetDisabled = false;
	            }else{
	                if($scope.portgroupno == "" || $scope.portgroupno == undefined){
	                    $scope.portConfigIpDisabled = true;
	                    $scope.portConfigSubnetDisabled = true;
	                }else{
	                	 $scope.portConfigIpDisabled = false;
	 	                 $scope.portConfigSubnetDisabled = false;
	                }
	            }
        	},500)   
        }, true);
        $scope.$on('portSelected', function(event, args) {
            angular.element("#stackSwitch_"+args.switch.id).show();
            $timeout(function(){
                $scope.visibleportMode = false;
				$scope.selectedSwitchPoeCheck = false;
                args.object.fromWhere = args.fromWhere;
                $scope.selectedSwitchId = args.object.switchId;
				var poeData = [];
				$scope.getPower(args.object.uniqueId);
                 args.object.poe;
                $scope.selectedRootMemberIndex;
                for(var ind = 0; ind < $rootScope.deviceInfo.clusterMembersInfo.length; ind++) {
                    if ($rootScope.deviceInfo.clusterMembersInfo[ind].sn == $scope.selectedSwitchId) {
                        $scope.selectedRootMemberIndex= ind;
                    }
                }
                if($scope.selectedSwitchId ==0){
                    $scope.platformType = $rootScope.deviceInfo.type;
                } else {
                    if($rootScope.deviceInfo.clusterMembersInfo[$scope.selectedRootMemberIndex].state != "Up") {
                    return;
                    /* member is down */
                    }
                    $scope.platformType = $rootScope.deviceInfo.clusterMembersInfo[$scope.selectedRootMemberIndex].deviceType;
                }
                var showRunConfig = $scope.formatInterfaceName();
                $scope.showRunConfigRecords = showRunConfig;
                if(args.event.ctrlKey || args.event.metaKey){
                    var isSinglePortSelected = angular.element(args.event.target).hasClass('selectSwitch');
                    if(!isSinglePortSelected){
                        if(args.object.hasOwnProperty('single')){
                            delete args.object.single;
                        }
                        var isPortAlreadyPresentIndexForMulti = $scope.multiSelectedPort.map(function(e) {
                            return e.uniqueId;
                        }).indexOf(args.object.uniqueId);
                        if(isPortAlreadyPresentIndexForMulti != -1){
                            var intNameId = args.object.uniqueId.split("/");
                            if($scope[intNameId[0]]){
                                var intIndex = $scope[intNameId[0]].int.indexOf(intNameId[intNameId.length - 1 ]);
                                $scope[intNameId[0]].int.splice(intIndex, 1);
                            }
                            args.object.mSelect = false;
                            $scope.multiSelectedPort.splice(isPortAlreadyPresentIndexForMulti,1);
                            if($scope.tempMultiSelectedPort){
                                var isPortAlreadyPresentIndexForTempMulti = $scope.tempMultiSelectedPort.map(function(e) {
                                    return e.uniqueId;
                                }).indexOf(args.object.uniqueId);
                                if($scope.tempMultiSelectedPort.length > 0 && $scope.tempMultiSelectedPort[isPortAlreadyPresentIndexForTempMulti]){
                                    $scope.tempMultiSelectedPort[isPortAlreadyPresentIndexForTempMulti].unselected=true;
                                }
                            }
                        }else{
                            args.object.mSelect = true;
                            if($scope.multiSelectedPort.length > 0){
                                if($scope.multiSelectedPort[0].routed == "on"){
                                    args.object.routed = "on";
                                }else{
                                    args.object.routed = "";
                                }
                            }
                            if($scope.tempMultiSelectedPort){
                                var unSelectPortsIndex = $scope.tempMultiSelectedPort.map(function(e) {
                                    return e.uniqueId;
                                }).indexOf(args.object.uniqueId);
                                if(unSelectPortsIndex != -1){
                                    delete $scope.tempMultiSelectedPort[unSelectPortsIndex].unselected;
                                }
                            }
                            var runningconfig = $scope.showRunConfigRecords.map(function(e) {
                                return e.interfaceName;
                            }).indexOf(args.object.uniqueId);
                            if($scope.showRunConfigRecords[runningconfig].hasOwnProperty('channelGroup')){
                                var channelGroup = $scope.showRunConfigRecords[runningconfig].channelGroup;
                                var findIntMatchWithGrpNum = $filter('filter')(showRunConfig, {"channelGroup":channelGroup}, true);
                                var isOne = true;
                                for(var $match1 in findIntMatchWithGrpNum){
                                    if ((findIntMatchWithGrpNum.hasOwnProperty($match1)) && (findIntMatchWithGrpNum[$match1].channelGroup != $scope.portChannelGroup)) {
                                        isOne = false;
                                    }
                                }
                                if(!isOne){
                                    /* do not allow multiple port selection across the cluster */
                                    if(args.object.switchId != $scope.currentSwitchSelected){
                                        //closeFunction();
                                        angular.element("#stackSwitch_"+args.switch.id).hide();
                                        return;
                                    }
                                    angular.element("#stackSwitch_"+args.switch.id).hide();
                                    //$scope.confirmationL3Port(args.object.uniqueId);
                                }
                            }else{
                                /* do not allow multiple port selection across the cluster */
                                if(args.object.switchId != $scope.currentSwitchSelected){
                                //closeFunction();
                                angular.element("#stackSwitch_"+args.switch.id).hide();
                                return;
                                }
                                angular.element("#stackSwitch_"+args.switch.id).hide();
                                //$scope.confirmationL3Port(args.object.uniqueId);
                            }
                            $scope.multiSelectedPort.push(args.object);
                        }
                    }
                    $scope.disablePortConfGlbApplyBtn=$scope.disablePortConfGlbCancelBtn=false;
                }else{
                    $scope.tempMultiSelectedPort = [];
                    $scope.selectedGrpPorts = [];
                    $scope.multiSelectedPort = [];
                    $scope.portChannelGroup = "";
                    var selectedPort = args.object;
                    $scope.storedSelectedPort = args.object;
                    $scope.portConfDefault = false;
                    for(var srcr = 0; srcr < $scope.showRunConfigRecords.length; srcr++){
                        var intN = $scope.showRunConfigRecords[srcr].PortName.split("/");
                        $scope[intN[0]] = {
                            int: []
                        }
                    }
                    var runningconfig1 = $scope.showRunConfigRecords.map(function(e) {
                        return e.interfaceName;
                    }).indexOf(args.object.uniqueId);
                    if($scope.showRunConfigRecords[runningconfig1].hasOwnProperty('channelGroup')){
                        $scope.multiSelectedPort = [];
                        var channelGroup = $scope.showRunConfigRecords[runningconfig1].channelGroup;
                        $scope.portChannelGroup = channelGroup;
                        var findIntMatchWithGrpNum = $filter('filter')(showRunConfig, {"channelGroup":channelGroup},true);
                        for(var $match2 in findIntMatchWithGrpNum){
                            if (findIntMatchWithGrpNum.hasOwnProperty($match2)) {
                                var intMatchId = {
                                    uniqueId: findIntMatchWithGrpNum[$match2].interfaceName,
                                    channelGroup: channelGroup
                                };
                                $scope.multiSelectedPort.push(intMatchId);
                                $scope.tempMultiSelectedPort.push(intMatchId);
                                $scope.selectedGrpPorts.push(intMatchId);
                            }
                        }
                    }else{
                        args.object.default = "default";
                        $scope.multiSelectedPort.push(args.object);
                    }
                    $scope.selectedPortId = selectedPort.uniqueId;
                    //Select the port in the grid
                    $scope.disablePortConfGlbApplyBtn=true;
                    $scope.disablePortConfGlbCancelBtn=true;
                    $scope.currentPortconfig = $scope.selectedPortId;
                    if (!$scope.$$phase){
                        $scope.$apply();
                    }
                    $scope.portSetingLAGLoading($scope.multiSelectedPort, showRunConfig);
                }
                $scope.formatSelectedPortsName($scope.multiSelectedPort);
                getPortDetails($scope.selectedPortId, $scope.multiSelectedPort);
                $scope.getPortGroupRangeDetails();
                angular.element("#portsConfigSetForm  span.k-tooltip-validation").hide();
                angular.element("#stackSwitch_"+args.switch.id).hide();
            }, 100);
        });
        //displaying multi selected port
        $scope.naturalCompareSorting = function(a, b) {
            var ax = [], bx = [];
            a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
            while(ax.length && bx.length) {
                var an = ax.shift();
                var bn = bx.shift();
                var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if(nn) {
                    return nn;
                }
            }
            return ax.length - bx.length;
        }
        $scope.allowdVlanOnChange = function(){
            $scope.disablePortConfGlbApplyBtn = $scope.disablePortConfGlbCancelBtn = false;
            angular.element("#portsConfigSetForm  span.k-tooltip-validation").hide();
            $scope.portsAllowedVlanId = "";
        }
        $scope.speedNegoOnChange = function(){
            $scope.disablePortConfGlbApplyBtn = $scope.disablePortConfGlbCancelBtn= false;
            if($scope.portsSpeed=="auto"){
            	$scope.autoNegotiation=false;
            	$scope.portsAutoSpeed="none";
            }else{
            	$scope.autoNegotiation=true;
            	$scope.portsAutoSpeed="none";
            }
        }
        $scope.isAllowedVlan = function () {
            return $scope.portsAllowedVlan === "notall" ? false : true;
        };

        $scope.validateDuplex = function () {
            var _selectedValue = $scope.portsSpeed;
            var duplValue = "half";
            if (_selectedValue === "1000") {
                duplValue = "full";
            }
            else {
                duplValue = $scope.portsDuplex;
            }
            $timeout(function () {
                $scope.portsDuplex = duplValue;
            }, 0);
        };
        angular.element("#duplex").on("focus", function (event,data) {
            $timeout(function(){
                $scope.validateDuplex(data);
            },0);
        });
        angular.element("#speed").on("focus", function (event,data) {
            $timeout(function(){
                $scope.validateDuplex(data);
            },0);
        });
        function changeObjToArr(a,key){
            var op = [];
            for(var a1 in a){
                if(a.hasOwnProperty(a1)){
                    op.push(a[a1][key]);
                }
            }
            return op;
        }
        // Send Entire CLi's to General Tab Configuration
        $scope.entirePortGenConf = function(multiSelectedPort, j){
            var portsConfigGenCLI = "";
            portsConfigGenCLI += "interface " + multiSelectedPort[j].uniqueId + "\n";
            if ($scope.portsDescription !== "") {
                portsConfigGenCLI += "description " + $scope.portsDescription + "\n";
            }
            else {
                portsConfigGenCLI += "no description" + "\n";
            }
			//applying duplex and speed
            if($scope.portsSpeed != "" && !$scope.speedDisable){
                portsConfigGenCLI += "speed " + $scope.portsSpeed + "\n";
            }
            if($scope.platformType.indexOf("CDB")!=-1){
                if($scope.currentPortconfig.indexOf("Gi") !=-1){
                    if (($scope.portsSpeed != "auto" || $scope.portsDuplex != "half") && ($scope.portsSpeed != "1000" || $scope.portsDuplex != "half") && ($scope.portsSpeed != "1000" || $scope.portsDuplex != "auto") ){
                        if(!$scope.duplexDisable){
                            portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                        }
                    }
                }else{
                   portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                }
            }else{
                if (($scope.portsSpeed != "auto" || $scope.portsDuplex != "half") && ($scope.portsSpeed != "1000" || $scope.portsDuplex != "half")){
                    if(!$scope.duplexDisable){
                        portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                    }
                }
                if ( ($scope.portsSpeed == "10" || $scope.portsSpeed == "100") && $scope.portsDuplex == "half"){
                    if(!$scope.duplexDisable){
                        portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                    }
                }
            }
            
            //applying port status
            if ($scope.portsStatus ===translate("toggle_up")) {
                portsConfigGenCLI += "no shutdown" + "\n";
            }
            else {
                portsConfigGenCLI += "shutdown" + "\n";
            }
            return portsConfigGenCLI;
        }
        // Send only those changed CLi's to General Tab Configuration
        $scope.onlyChangedPortGenConf = function(multiSelectedPort, j){
            var portsConfigGenCLI = "";
                portsConfigGenCLI += "interface " + multiSelectedPort[j].uniqueId + "\n";
            if($scope.portsOldDescription!=$scope.portsDescription){
                if ($scope.portsDescription !== "") {
                    portsConfigGenCLI += "description " + $scope.portsDescription + "\n";
                }
                else {
                    portsConfigGenCLI += "no description" + "\n";
                }
            }
            if(portDetails.Duplex!=$scope.portsDuplex){
                if($scope.platformType.indexOf("CDB")!=-1){
                    if($scope.currentPortconfig.indexOf("Gi") !=-1){
                        if (($scope.portsSpeed != "auto" || $scope.portsDuplex != "half") && ($scope.portsSpeed != "1000" || $scope.portsDuplex != "half") && ($scope.portsSpeed != "1000" || $scope.portsDuplex != "auto") ){
                            if($scope.duplexDisable == false){
                                portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                            }
                        }
                    }else{
                       portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                    }
                }else{
                    if (($scope.portsSpeed != "auto" || $scope.portsDuplex != "half") && ($scope.portsSpeed != "1000" || $scope.portsDuplex != "half")){
                        if($scope.duplexDisable == false){
                            portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                        }
                    }
                    if ( ($scope.portsSpeed == "10" || $scope.portsSpeed == "100") && $scope.portsDuplex == "half"){
                        if(!$scope.duplexDisable){
                            portsConfigGenCLI += "duplex " + $scope.portsDuplex + "\n";
                        }
                    }
                }
            }
            //applying duplex and speed
            if(($scope.portsOldSpeed!=$scope.portsSpeed) && ($scope.portsSpeed != "" && !$scope.speedDisable)){
                portsConfigGenCLI += "speed " + $scope.portsSpeed + "\n";
            }
            //applying port status
            if($scope.portsOldStatus!=$scope.portsStatus){
                if ($scope.portsStatus ===translate("toggle_up")) {
                    portsConfigGenCLI += "no shutdown" + "\n";
                }
                else {
                    portsConfigGenCLI += "shutdown" + "\n";
                }
            }
            return portsConfigGenCLI;
        };
        $scope.availableGroups = function (groups,assignedGroups) {
            var assignedGroupsIds = {};
            var groupsIds = {};
            var result = [];
            $scope[assignedGroups].forEach(function (el, i) {
              assignedGroupsIds[el.uniqueId] = $scope[assignedGroups][i];
            });

            $scope[groups].forEach(function (el, i) {
              groupsIds[el.uniqueId] = $scope[groups][i];
            });

            for (var i in groupsIds) {
                if (!assignedGroupsIds.hasOwnProperty(i)) {
                    result.push(groupsIds[i]);
                }
            }

            return result;
        }
        var checkLAGFields = function(portCurrentMode){
            oldPortGroupType = oldPortGroupType == null ? "LACP" : oldPortGroupType;
			if(portCurrentMode){
                if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                    if(oldPortgroupno === $scope.portgroupno && oldPortGroupType === $scope.portGroupType && oldKeepAliveMode === $scope.portGroupData.keepAliveMode && $scope.portModeOld === portCurrentMode){
                        return true;
                    }else{
                        return false;
                    }
               }else{
                   if(oldPortgroupno === $scope.portgroupno && oldPortGroupType === $scope.portGroupType && oldKeepAliveMode === $scope.portGroupData.keepAliveMode){
                        return true;
                    }else{
                        return false;
                    }
               }
            }else{
                  if(oldPortgroupno === $scope.portgroupno && oldPortGroupType === $scope.portGroupType && oldKeepAliveMode === $scope.portGroupData.keepAliveMode){
                    return true;
                  }else{
                    return false;
                  }
            }
        };
        var loadPortsChnGrp = function(portgroupno, showRunConfig){
            if(portgroupno){
                var findIntMatchWithGrpNum = $filter('filter')(showRunConfig, {"channelGroup":portgroupno}, true);
                if(findIntMatchWithGrpNum.length > 0){
                    $scope.multiSelectedPort = [];
                    for(var $match in findIntMatchWithGrpNum){
                        if (findIntMatchWithGrpNum.hasOwnProperty($match)) {
                            var intMatchId = {
                                uniqueId: findIntMatchWithGrpNum[$match].interfaceName,
                                channelGroup: portgroupno
                            };
                            $scope.multiSelectedPort.push(intMatchId);
                        }
                    }
                }
            }
        };
        var portConfGen = false, portConfSettingSwitch = false, portConfSettingRoute = false, portConfAdvSetting = false;
        $scope.saveGlobalPortConfig = function(){
            angular.element("body").addClass("busy");
            if(portGenValidations.validate() && portSetValidations.validate() && portAdvValidations.validate()) {
                // Instance created for save Ports General Configuration
                var savePortsGenConf = $scope.savePortsGenConf();
                // Instance created for save Ports Setting Configuration
                var savePortsSetConf = $scope.savePortsSetConf();
                // Instance created for save Ports Advance Configuration
               var savePortsAdvConf = $scope.savePortsAdvConf();
                var result = "";
                if(savePortsGenConf && savePortsGenConf!=""){
                    result = savePortsGenConf+"\n";
                }
                else if(savePortsSetConf && savePortsSetConf!=""){
                    result = savePortsSetConf+"\n";
                }
                else if(savePortsAdvConf && savePortsAdvConf!=""){
                    result = savePortsAdvConf+"\n";
                }
                if( (result == "") || (result.indexOf("Creating a port-channel interface Port-channel") != -1) || (result.indexOf("VLAN does not exist. Creating vlan") != -1) ){
                    notificationService.showNotification(translate('portsconfig_success_msg'), translate('com_config_success_title'), 'success');
                }else{
                    notificationService.showNotification(result, translate('com_config_fail_title'), 'error');
                }
                $timeout(function(){
                    // Configuration Updatation for Ports General
                    if(portConfGen){
                        portConfGen = false;
                        $scope.portConfDefault = false;
                        getPortDetails($scope.multiSelectedPort[0].uniqueId);
                        $scope.getPortGroupRangeDetails();
                    }
                    // Configuration Updatation for Ports Settings Switch & Routed
                    if(portConfSettingSwitch || portConfSettingRoute){
                        showRunConfig = $scope.formatInterfaceName();
                        l2L3ports = showRunConfig;
    					// Loads show running config
                        $scope.showRunConfigRecords = showRunConfig;
    					// Reload $scope.multiSelectedPort object with current channel-group
                        loadPortsChnGrp($scope.portgroupno, showRunConfig);
    					// Function for Formating selected ports Text display
                        $scope.formatSelectedPortsName($scope.multiSelectedPort);
    					// Function for Loading LAG Field
                        $scope.portSetingLAGLoading($scope.multiSelectedPort, showRunConfig);
                        $scope.tempMultiSelectedPort = angular.copy($scope.multiSelectedPort);
                        getPortDetails($scope.storedSelectedPort.uniqueId, $scope.multiSelectedPort);
                        $scope.getPortGroupRangeDetails();
                        if(portConfSettingRoute){
                            portConfSettingRoute = false;
                            var ipVal = $scope.ports.portConfigIp;
                            var subVal = $scope.ports.portConfigSubnet;
                            $scope.ipSet(ipVal ,subVal);
                        }else if(portConfSettingSwitch){
                            portConfSettingSwitch = false;
                        }
                    }
                    // Configuration Updatation for Ports Settings Routed
                    if(portConfAdvSetting){
                        portConfAdvSetting = false;
                        getPortDetails($scope.multiSelectedPort[0].uniqueId);
                        $scope.getPortGroupRangeDetails();
                    }
                    $scope.disablePortConfGlbApplyBtn=true;
                    $scope.disablePortConfGlbCancelBtn=true;
                },20);
            }else{
                // Select kendo-strip tab based on its Index
                /* if(!portGenValidations.validate()){
                    $scope.portsConfigTab.select(0);
                }else if(!portSetValidations.validate()){
                    $scope.portsConfigTab.select(1);
                }else if(!portAdvValidations.validate()){
                    $scope.portsConfigTab.select(2);
                } */
            }
            angular.element("body").removeClass("busy");
        }
        $scope.savePortsGenConf = function () {
            var portsConfigGenCLI = "";
        	var result="";
            if(portGenValidations.validate()) {
                portConfGen = true;
                var a = changeObjToArr($scope.multiSelectedPort, "uniqueId");
                var b = changeObjToArr($scope.selectedGrpPorts, "uniqueId");
                $scope.findUnique = a.filter(function(obj) {
                    return b.indexOf(obj) == -1;
                });
                for(var i = 0; i < $scope.findUnique.length; i++){
                    $scope.findUnique[i] = {uniqueId:$scope.findUnique[i]};
                }
                var extractMultiSelectedPort;
                if($scope.findUnique.length > 0){
                    extractMultiSelectedPort = $scope.availableGroups("multiSelectedPort","findUnique");
                }
                var checkOnlyLAGFields = checkLAGFields();
                var portChnlFlag = false, portChnlCount = 0;
                for(var j7 = 0; j7 < $scope.multiSelectedPort.length; j7++){
                    if((portChnlCount == 0) && ($scope.multiSelectedPort[j7].hasOwnProperty('channelGroup') && $scope.multiSelectedPort[j7].channelGroup == $scope.portgroupno)){
                        portChnlCount++;
                        portChnlFlag = true;
                    }
                    if($scope.findUnique.length > 0){
                        for(var u = 0; u < $scope.findUnique.length; u++){
                            if($scope.multiSelectedPort[j7].uniqueId === $scope.findUnique[u].uniqueId){
                               portsConfigGenCLI += $scope.entirePortGenConf($scope.multiSelectedPort, j7);
                            }
                        }
                    }else{
                        if(checkOnlyLAGFields){
                            portsConfigGenCLI += $scope.onlyChangedPortGenConf($scope.multiSelectedPort, j7);
                        }else{
                            portsConfigGenCLI += $scope.entirePortGenConf($scope.multiSelectedPort, j7);
                        }
                    }
                }
                if($scope.portgroupno){
                    var etherChannelArray = [{uniqueId:"Po"+$scope.portgroupno}];
                    // L3 switch configuration for port channel
                    if(portChnlFlag){
                        portsConfigGenCLI += $scope.onlyChangedPortGenConf(etherChannelArray, 0, "portChannel");
                    }else if(!portChnlFlag || portChnlCount == 0){
                        portsConfigGenCLI += $scope.entirePortGenConf(etherChannelArray, 0, "portChannel");
                    }
                }
                if(extractMultiSelectedPort && extractMultiSelectedPort.length > 0){
                    for(var extract = 0; extract < extractMultiSelectedPort.length; extract++){
                        if(checkOnlyLAGFields){
                            portsConfigGenCLI += $scope.onlyChangedPortGenConf(extractMultiSelectedPort, extract);
                        }else{
                            portsConfigGenCLI += $scope.entirePortGenConf(extractMultiSelectedPort, extract);
                        }
                    }
                }
                portsConfigGenCLI += "exit\n";
                $timeout(function() {
                     if(!$scope.selectedSwitchId){
                        result = requestRoutingService.getConfigCmdOutput(portsConfigGenCLI);
                    } else {
                        result = clusterCmdService.getMultiConfigPortCmdOutput(portsConfigGenCLI,$scope.selectedSwitchId);
                    }
                    portsConfigGenCLI = "";
                    return result;
                }, 10);
    		}else{
                return false;
            }
        };
        $scope.cancelPortsGenConf = function () {
            $scope.portsDescription = portInitialData.Description;
            $scope.portsSpeed = portInitialData.Speed;
            $scope.portsDuplex = portInitialData.Duplex;
            $scope.portsStatus =$scope.portsOldStatus;
            $scope.disablePortConfGlbCancelBtn=true;
            $scope.disablePortConfGlbApplyBtn=true;
            $scope.portConfDefault = false;
        };
        $scope.keepAliveOnChange = function(){
            $scope.disablePortConfGlbApplyBtn= false;
            $scope.disablePortConfGlbCancelBtn = false;
        };
        $scope.findPortsMode = function(type, keepAlive){
            if(type === "PAgP" && keepAlive === translate("com_disable")){
                return "auto";
            }else if(type === "PAgP" && keepAlive === translate("com_enable")){
                return "desirable";
            }else if(type === "LACP" && keepAlive === translate("com_disable")){
                return "passive";
            }else if(type === "LACP" && keepAlive === translate("com_enable")){
                return "active";
            }else if(type === "On"){
                return "on";
            }
        }
        // Method for change Object to Array
        function changeObjToArr(a,key){
            var op = [];
            for(var a1 in a){
                if(a.hasOwnProperty(a1)){
                    op.push(a[a1][key]);
                }
            }
            return op;
        }
		$scope.ipSet = function(ipVal,subVal){
			if($scope.portgroupno){
            $scope.ports.portConfigIp = ipVal;
                $scope.ports.portConfigSubnet =subVal;
			}
		}
        // Send only those changed CLi's to General Tab Configuration
        $scope.onlyChangedPortSetConf = function(multiSelectedPort, j, portChannel){
			var findUplinkPort = [];
			if($rootScope.uplinkPorts){
            findUplinkPort = $filter('filter')($rootScope.uplinkPorts, {"uniqueId":multiSelectedPort[j].uniqueId}, true);
			}
            var portsConfigSetCLI = "";
            if(multiSelectedPort[j].hasOwnProperty('default') && j != 0 && multiSelectedPort[j].routed === ""){
                portsConfigSetCLI += "default interface " + multiSelectedPort[j].uniqueId + "\n";
                delete $scope.multiSelectedPort[j]['default'];
            }
            portsConfigSetCLI += "interface " + multiSelectedPort[j].uniqueId + "\n";
            if(angular.isUndefined(portChannel)){
                var portGroupMode = $scope.findPortsMode($scope.portGroupType,$scope.portGroupData.keepAliveMode);
                var checkOnlyLAGFields = checkLAGFields("Switch");
                if(!checkOnlyLAGFields){
                    if($scope.portgroupno && (($scope.portgroupno != oldPortgroupno) || (!checkOnlyLAGFields)) ){
                          portsConfigSetCLI += "channel-group "+$scope.portgroupno+" mode "+portGroupMode+" \n";
                    }
                    else if((angular.isUndefined($scope.portgroupno) || $scope.portgroupno == "")) {
                        portsConfigSetCLI += "no channel-group \n";
                    }
                }
            }
           
            //LACP Port Priority
            if((multiSelectedPort[j].uniqueId.indexOf("Po")==-1) ){            
            	if($scope.lacpPortPriority!="" && $scope.lacpPortPriority!=undefined){
            			portsConfigSetCLI += "lacp port-priority "+$scope.lacpPortPriority+"\n";
            	}else{
            			portsConfigSetCLI += "no lacp port-priority \n";
            	}                	
            }
            
            
            if($scope.switchMode !== $scope.switchOldMode){
                portsConfigSetCLI += "switchport mode " + $scope.switchMode + "\n";
            }
            if ($scope.switchMode === "access" || $scope.switchMode === "dynamic auto" || $scope.switchMode === "dynamic desirable") {
                if($scope.portsAccessVlan !== portDetails.accessVlan){
                    if($scope.portsAccessVlan){
                        portsConfigSetCLI += "switchport access vlan " + $scope.portsAccessVlan + "\n";
                    }
                    else {
                        portsConfigSetCLI += "no switchport access vlan \n";
                    }
                }
                if($scope.voiceVlanOption=="DOT1P"){
                	portsConfigSetCLI += "mls qos trust cos\n";
                	portsConfigSetCLI += "switchport voice vlan dot1p \n";
                }else{
                	//if($scope.portsVoiceVlan !== $scope.portsOldVoiceVlan){
                        if($scope.portsVoiceVlan && $scope.portsVoiceVlan != 0 && $scope.portsVoiceVlan != ""){
                                portsConfigSetCLI += "switchport voice vlan " + $scope.portsVoiceVlan + "\n";
                        }else {
                            portsConfigSetCLI += "no switchport voice vlan" + "\n";
                        }
                    //}
                }
            }
            if ($scope.switchMode === "trunk" || $scope.switchMode === "dynamic auto" || $scope.switchMode === "dynamic desirable") {
                if ($scope.portsAllowedVlan === "all") {
                    if($scope.portsAllowedVlan !== $scope.portsOldAllowedVlan && $scope.portsAllowedVlan != undefined){
                          portsConfigSetCLI += "switchport trunk allowed vlan all" + "\n";
                    }
                }
                else {
                    if($scope.portsAllowedVlanId !== $scope.portsOldAllowedVlanId){
                        if(($scope.portsAllowedVlanId != "" || $scope.portsAllowedVlanId != 0)){
                            if($scope.portsAllowedVlanId != undefined ){
                                portsConfigSetCLI += "switchport trunk allowed vlan " + $scope.portsAllowedVlanId + "\n";
                            }
                        }else{
                            portsConfigSetCLI += "no switchport trunk allowed vlan \n";
                        }
                    }
                }
                if($scope.portsNativeVlan !== portDetails.nativeVlan){
                    if($scope.portsNativeVlan){
                        portsConfigSetCLI += "switchport trunk native vlan " + $scope.portsNativeVlan + "\n";
                    }else{
                        portsConfigSetCLI += "no switchport trunk native vlan \n";
                    }
                }
            }
            if($scope.portsPortFast !== $scope.portsOldPortFast){
                if ($scope.portsPortFast === translate("toggle_on")) {
                    portsConfigSetCLI += "spanning-tree portfast" + "\n";
                } else {
                    portsConfigSetCLI += "no spanning-tree portfast" + "\n";
                }
            }
            //Adding 1.7 enhanceemnt
            if($scope.portPriority !== $scope.portPriorityOld){
                if($scope.portPriority!=""){
                    portsConfigSetCLI += "spanning-tree port-priority " + $scope.portPriority + "\n";
                }else{
                    portsConfigSetCLI += "no spanning-tree port-priority \n";
                }
            }
            if($scope.flowControl !== $scope.flowControlOld){
                if($scope.flowControl!="off"){
                    portsConfigSetCLI += "flowcontrol receive " + $scope.flowControl + "\n";
                }else{
                    portsConfigSetCLI += "no flowcontrol receive \n";
                }
            }
            if($scope.switchMode != "dynamic auto" && $scope.switchMode != "dynamic desirable"){
            	if($scope.portSecurity !== $scope.portSecurityOld){
                    if ($scope.portSecurity === translate("com_enable")) {
                        portsConfigSetCLI += "switchport port-security \n";
                    } else {
                        portsConfigSetCLI += "no switchport port-security \n";
                    }
                }
            }
            
            
            if(($scope.portsDhcpSnooping != undefined) && ($scope.portsDhcpSnooping !== $scope.portsOldDhcpSnooping)){
                if ($scope.portsDhcpSnooping === translate("com_enable")) {
                    portsConfigSetCLI += "ip dhcp snooping trust" + "\n";
                } else {
                    portsConfigSetCLI += "no ip dhcp snooping trust" + "\n";
                }
            }
			
			if($scope.portsAllowUntrusted !== $scope.portsOldAllowUntrusted){
                if ($scope.portsAllowUntrusted === translate("com_enable")) {
                    portsConfigSetCLI += "ip dhcp snooping information option allow-untrusted" + "\n";
                } else {
                    portsConfigSetCLI += "no ip dhcp snooping information option allow-untrusted" + "\n";
                }
            }
			
			if($scope.dhcpLimitRate !== $scope.dhcpOldLimitRate){
                if($scope.dhcpLimitRate != "" && $scope.dhcpLimitRate != undefined){
                    portsConfigSetCLI += "ip dhcp snooping limit rate " + $scope.dhcpLimitRate + "\n";
                }else{
                    portsConfigSetCLI += "no ip dhcp snooping limit rate \n";
                }
            }
			
            if($scope.platformType.indexOf("CDB")!=-1 && findUplinkPort.length == 0 && angular.isUndefined(portChannel)){
                if($scope.eveClassification !== $scope.eveClassificationOld) {
                    if ($scope.eveClassification) {
                        portsConfigSetCLI+="power inline port 2-event \n";
                    }else{
                        portsConfigSetCLI+="no power inline port 2-event \n";
                    }
                }                
            }
			if((multiSelectedPort[j].uniqueId.indexOf("Po")==-1) ){
	            if($scope.perpetualPoE !== $scope.perpetualPoEOld && $rootScope.deviceInfo.isPoECapable) {
	                if ($scope.perpetualPoE) {
	                    portsConfigSetCLI+="power inline port poe-ha \n";
	                }else{
	                    portsConfigSetCLI+="no power inline port poe-ha \n";
	                }
	            }
            }
            portsConfigSetCLI+="exit \n";
            return portsConfigSetCLI;
        }
        // Send Entire CLi's to General Tab Configuration
        var newlyAddPorts = false;
        $scope.entirePortSetConf = function(multiSelectedPort, j, portChannel){
			var findUplinkPort = [];
			if($rootScope.uplinkPorts){
            findUplinkPort = $filter('filter')($rootScope.uplinkPorts, {"uniqueId":multiSelectedPort[j].uniqueId}, true);
			}
            var portsConfigSetCLI = "";
            if(multiSelectedPort[j].hasOwnProperty('default') && j != 0 && multiSelectedPort[j].routed === ""){
                portsConfigSetCLI += "default interface " + multiSelectedPort[j].uniqueId + "\n";
                delete $scope.multiSelectedPort[j]['default'];
            }
            portsConfigSetCLI += "interface " + multiSelectedPort[j].uniqueId + "\n";
            if(angular.isUndefined(portChannel)){
                var portGroupMode = $scope.findPortsMode($scope.portGroupType,$scope.portGroupData.keepAliveMode);
                var checkOnlyLAGFields = checkLAGFields("Switch");
                if(!checkOnlyLAGFields || newlyAddPorts){
                    if($scope.portgroupno){
                        portsConfigSetCLI += "channel-group "+$scope.portgroupno+" mode "+portGroupMode+" \n";
                    }
                    else if((angular.isUndefined($scope.portgroupno) || $scope.portgroupno == "")) {
                        portsConfigSetCLI += "no channel-group \n";
                    }
                }
            }
            
          //LACP Port Priority            
            if((multiSelectedPort[j].uniqueId.indexOf("Po")==-1)){
            	if($scope.lacpPortPriority!="" && $scope.lacpPortPriority!=undefined){
            			portsConfigSetCLI += "lacp port-priority "+$scope.lacpPortPriority+"\n";
            	}else{
            			portsConfigSetCLI += "no lacp port-priority \n";
            	}                	
            }
                portsConfigSetCLI += "switchport mode " + $scope.switchMode + "\n";
            if ($scope.switchMode === "access" || $scope.switchMode === "dynamic auto" || $scope.switchMode === "dynamic desirable") {
                if($scope.portsAccessVlan){
                    portsConfigSetCLI += "switchport access vlan " + $scope.portsAccessVlan + "\n";
                }
                else {
                    portsConfigSetCLI += "no switchport access vlan \n";
                }
                if($scope.voiceVlanOption=="DOT1P"){
                	portsConfigSetCLI += "mls qos trust cos\n";
                	portsConfigSetCLI += "switchport voice vlan dot1p \n";
                }else{
                	if($scope.portsVoiceVlan && $scope.portsVoiceVlan != 0 && $scope.portsVoiceVlan != ""){
                        portsConfigSetCLI += "switchport voice vlan " + $scope.portsVoiceVlan + "\n";
                	}else {
                		portsConfigSetCLI += "no switchport voice vlan" + "\n";
                	}
                }    
            }
            if ($scope.switchMode === "trunk" || $scope.switchMode === "dynamic auto" || $scope.switchMode === "dynamic desirable") {
                if ($scope.portsAllowedVlan === "all") {
                    if($scope.portsAllowedVlan != undefined){
                        portsConfigSetCLI += "switchport trunk allowed vlan all" + "\n";
                    }
                }
                else {
                    if(($scope.portsAllowedVlanId != "" || $scope.portsAllowedVlanId != 0)){
                        if($scope.portsAllowedVlanId != undefined ){
                            portsConfigSetCLI += "switchport trunk allowed vlan " + $scope.portsAllowedVlanId + "\n";
                        }
                    }else{
                        portsConfigSetCLI += "no switchport trunk allowed vlan \n";
                    }
                }
                if($scope.portsNativeVlan){
                    portsConfigSetCLI += "switchport trunk native vlan " + $scope.portsNativeVlan + "\n";
                }else{
                    portsConfigSetCLI += "no switchport trunk native vlan \n";
                }
            }
			if($scope.portsPortFast !== $scope.portsOldPortFast){
				if ($scope.portsPortFast === translate("toggle_on")) {
					portsConfigSetCLI += "spanning-tree portfast" + "\n";
				} else {
					portsConfigSetCLI += "no spanning-tree portfast" + "\n";
				}
			}
            //Adding 1.7 enhancement  
            if($scope.portPriority !== $scope.portPriorityOld){
                if($scope.portPriority!=""){
                    portsConfigSetCLI += "spanning-tree port-priority " + $scope.portPriority + "\n";
                }else{
                    portsConfigSetCLI += "no spanning-tree port-priority \n";
                }
            }
            if($scope.flowControl!="off"){
                portsConfigSetCLI += "flowcontrol receive " + $scope.flowControl + "\n";
            }else{
                portsConfigSetCLI += "no flowcontrol receive \n";
            }
            if($scope.switchMode != "dynamic auto" && $scope.switchMode != "dynamic desirable"){
        	    if ($scope.portSecurity === translate("com_enable")) {
                    portsConfigSetCLI += "switchport port-security \n";
                } else {
                    portsConfigSetCLI += "no switchport port-security \n";
                }               
            }
            if($scope.portsDhcpSnooping != undefined){
				if ($scope.portsDhcpSnooping === translate("com_enable")) {
					portsConfigSetCLI += "ip dhcp snooping trust" + "\n";
				} else {
					portsConfigSetCLI += "no ip dhcp snooping trust" + "\n";
				}
			}
            
			
			
            if ($scope.portsAllowUntrusted === translate("com_enable")) {
                portsConfigSetCLI += "ip dhcp snooping information option allow-untrusted" + "\n";
            } else {
                portsConfigSetCLI += "no ip dhcp snooping information option allow-untrusted" + "\n";
            } 
			
            if($scope.dhcpLimitRate != "" && $scope.dhcpLimitRate != undefined){
                portsConfigSetCLI += "ip dhcp snooping limit rate " + $scope.dhcpLimitRate + "\n";
            }else{
                portsConfigSetCLI += "no ip dhcp snooping limit rate \n";
            }
			
            if($scope.platformType.indexOf("CDB")!=-1 && findUplinkPort.length == 0 && angular.isUndefined(portChannel)){
                if ($scope.eveClassification) {
                    portsConfigSetCLI+="power inline port 2-event \n";
                }else{
                    portsConfigSetCLI+="no power inline port 2-event \n";
                }                
            }
            if((multiSelectedPort[j].uniqueId.indexOf("Po")==-1) ){
	             if($scope.perpetualPoE !== $scope.perpetualPoEOld && $rootScope.deviceInfo.isPoECapable) {
	                if ($scope.perpetualPoE) {
	                    portsConfigSetCLI+="power inline port poe-ha \n";
	                }else{
	                    portsConfigSetCLI+="no power inline port poe-ha \n";
	                }
	            }
            }
            portsConfigSetCLI+="exit \n";
            return portsConfigSetCLI;
        }
        $scope.savePortsSetConf = function () {
            var result="", portsConfigSetCLI = "", portModeConfigSetCLI="";
            if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                if ($scope.portMode == translate("portconfig_port_routed")) {
                    if(portSetValidations.validate()) {  
                    	                        
                    	//LACP System Priority
                    	if($scope.lacpSysPriority!=$scope.oldlacpSysPriority){
                        	if($scope.lacpSysPriority!="" && $scope.lacpSysPriority!=undefined){
                        		portModeConfigSetCLI += "lacp system-priority "+$scope.lacpSysPriority+"\n";
                        	}else{
                        		portModeConfigSetCLI += "no lacp system-priority \n";
                        	}                	
                        }                    	
                    	//Delete channel group
					    if($scope.portgroupno != oldPortgroupno) {					    	
					    	if(!angular.isUndefined(oldPortgroupno) && oldPortgroupno != ""){
					    		 portModeConfigSetCLI += "no interface port-channel "+oldPortgroupno+"\n";	
					    	}					    	  				    	
					    }                    	
                        portConfSettingRoute = true;
                        var unselectedIndexRoute = [];                        
                        if($scope.tempMultiSelectedPort){
                            for(var j = 0; j < $scope.tempMultiSelectedPort.length; j++){
                                if($scope.tempMultiSelectedPort[j].unselected){
                                    portModeConfigSetCLI += "interface " + $scope.tempMultiSelectedPort[j].uniqueId + "\n";
                                    portModeConfigSetCLI += "no channel-group \n";
                                    portModeConfigSetCLI += "exit \n";
                                    unselectedIndexRoute.push(j);
                                }
                            }
                            for(var _i1 = 0; _i1 < unselectedIndexRoute.length; _i1++ ){
                                $scope.tempMultiSelectedPort.splice(unselectedIndexRoute[_i1],1);
                            }
                        }
                        var checkOnlyLAGFields = checkLAGFields("Routed");
                        var oldPortGroupMode = $scope.findPortsMode(oldPortGroupType,oldKeepAliveMode);
                        for(var j6 = 0; j6 < $scope.multiSelectedPort.length; j6++){
                            if($scope.multiSelectedPort[j6].hasOwnProperty('default') && j6 != 0 && $scope.multiSelectedPort[j6].routed === "on"){
                                portModeConfigSetCLI += "default interface " + $scope.multiSelectedPort[j6].uniqueId + "\n";
                                delete $scope.multiSelectedPort[j6]['default'];
                            }
                        }
                        if(!checkOnlyLAGFields){
                            for(var j1 = 0; j1 < $scope.multiSelectedPort.length; j1++){
                                if($scope.portgroupno){
                                    portModeConfigSetCLI += "interface " + $scope.multiSelectedPort[j1].uniqueId + "\n";
                                    if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                                       portModeConfigSetCLI += "no switchport \n";
                                    }
                                    portModeConfigSetCLI += "no channel-group "+$scope.portgroupno+" mode "+oldPortGroupMode+" \n";
                                    portModeConfigSetCLI += "no ip address \n";
                                    portModeConfigSetCLI += "no ipv6 address \n";
                                    portModeConfigSetCLI += "exit \n";
                                }
                                else if((angular.isUndefined($scope.portgroupno) || $scope.portgroupno == "")) {
                                    portModeConfigSetCLI += "interface " + $scope.multiSelectedPort[j1].uniqueId + "\n";
                                    if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                                       portModeConfigSetCLI += "no switchport \n";
                                    }
                                    portModeConfigSetCLI += "no channel-group \n";
                                    portModeConfigSetCLI += "no ip address \n";
                                    portModeConfigSetCLI += "no ipv6 address \n";
                                    portModeConfigSetCLI += "exit \n";
                                }
                            }
                            if($scope.portgroupno){
    								portModeConfigSetCLI +="interface Po" + $scope.portgroupno + "\n";
    								if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
    								   portModeConfigSetCLI += "no switchport \n";
    								}
    								portModeConfigSetCLI += "exit\n";
    						}
                        }
                        $scope.ports.portConfigIp = $scope.ports.portConfigIp == undefined ? "": $scope.ports.portConfigIp;
                        $scope.ports.portConfigSubnet = $scope.ports.portConfigSubnet == undefined ? "": $scope.ports.portConfigSubnet;
						if($scope.portgroupno && $scope.multiSelectedPort.length > 1){
                            portModeConfigSetCLI +="interface Po" + $scope.portgroupno + "\n";                                      	
                            if($scope.portconfigIPType == "static"){
                                if($scope.ports.portConfigIp != "" && $scope.ports.portConfigSubnet != ""){
                                    portModeConfigSetCLI += "ip address " + $scope.ports.portConfigIp + " " +  $scope.ports.portConfigSubnet + "\n";
                                }
                            }else if($scope.portconfigIPType == "dhcp"){
                                portModeConfigSetCLI += "ip address dhcp hostname " + $scope.ports.dhcpHostName + "\n";
                            }else if($scope.portconfigIPType == "pool"){
                            	//portModeConfigSetCLI += "switchport \n";
                            	portModeConfigSetCLI += "no switchport \n";
                            	if(portConfigPool && portConfigPool!=""){
                            		portModeConfigSetCLI += "no ip address pool " + portConfigPool + "\n";
                            	}
                                portModeConfigSetCLI += "ip address pool " + $scope.portconfigPool + "\n";
                            }else if($scope.portconfigIPType == "none"){
                                portModeConfigSetCLI += "no ip address \n";
                            }
                            if($scope.logicalInterface.port.oldlistIpb6Address.length > 0){
                            	portModeConfigSetCLI += "no ipv6 address \n";                            	
                            }
                            for(var i = 0; i < $scope.logicalInterface.port.listIpb6Address.length; i++){
                            	portModeConfigSetCLI += "ipv6 address "+$scope.logicalInterface.port.listIpb6Address[i].name+"\n";  
                            }                            
                            
                            if($scope.logicalInterface.port.rapid==false){
                            	portModeConfigSetCLI += "no ipv6 address dhcp rapid-commit\n"; 
                            }
                            if($scope.logicalInterface.port.dhcp==true){
                            	if($scope.logicalInterface.port.rapid==true){
                            		portModeConfigSetCLI += "ipv6 address dhcp rapid-commit\n";	
                            	}else{
                            		portModeConfigSetCLI += "ipv6 address dhcp\n"; 
                            	}
                            }else{
                            	portModeConfigSetCLI += "no ipv6 address dhcp\n";
                            }
                            
                            if($scope.logicalInterface.port.autoconfig==true){
                            	portModeConfigSetCLI += "ipv6 address autoconfig\n"; 
                            }else{
                            	portModeConfigSetCLI += "no ipv6 address autoconfig\n";
                            }
                            portModeConfigSetCLI += "exit\n";
						}
                        var portGroupMode = $scope.findPortsMode($scope.portGroupType,$scope.portGroupData.keepAliveMode);
					    for(var j = 0; j < $scope.multiSelectedPort.length; j++){
                            portModeConfigSetCLI += "interface " + $scope.multiSelectedPort[j].uniqueId + "\n";
                            //LACP Port Priority            
                           	if($scope.lacpPortPriority!="" && $scope.lacpPortPriority!=undefined){
                            		portModeConfigSetCLI += "lacp port-priority "+$scope.lacpPortPriority+"\n";
                            }else{
                            		portModeConfigSetCLI += "no lacp port-priority \n";
                            }                           
							var isOneTime = true;
							var addChannelGrpStatus=false;
							if(!checkOnlyLAGFields){
							     isOneTime = false;
							     if( $scope.portgroupno && (($scope.portgroupno != oldPortgroupno) || (!checkOnlyLAGFields))){
							            portModeConfigSetCLI += "channel-group "+$scope.portgroupno+" mode "+portGroupMode+" \n";
							            addChannelGrpStatus=true;
							      }else if((angular.isUndefined($scope.portgroupno) || $scope.portgroupno == "")) {
							            portModeConfigSetCLI += "no channel-group \n";
							      }
							}
							
							if(!$scope.multiSelectedPort[j].hasOwnProperty('channelGroup') && isOneTime && $scope.portgroupno){
								portModeConfigSetCLI += "no switchport \n";
							    portModeConfigSetCLI += "channel-group "+$scope.portgroupno+" mode "+portGroupMode+" \n";
							    addChannelGrpStatus=true;
							}
						    if($scope.multiSelectedPort.length == 1){                            
							    if($scope.portconfigIPType == "static"){
                                    if($scope.ports.portConfigIp != portConfigIpOld || $scope.ports.portConfigSubnet != portConfigSubnetOld || addChannelGrpStatus==true){
                                        if($scope.ports.portConfigIp != "" && $scope.ports.portConfigSubnet != ""){
                                            portModeConfigSetCLI += "ip address " + $scope.ports.portConfigIp + " " +  $scope.ports.portConfigSubnet + "\n";
                                        }
                                    }
                                }else if($scope.portconfigIPType == "dhcp"){
                                    portModeConfigSetCLI += "ip address dhcp hostname " + $scope.ports.dhcpHostName + "\n";
                                }else if($scope.portconfigIPType == "pool"){
                                	//portModeConfigSetCLI += "switchport \n";
                                	portModeConfigSetCLI += "no switchport \n";
                                	if(portConfigPool && portConfigPool!=""){
                                		portModeConfigSetCLI += "no ip address pool " + portConfigPool + "\n";
                                	}
                                    portModeConfigSetCLI += "ip address pool " + $scope.portconfigPool + "\n";
                                }else if($scope.portconfigIPType == "none"){
                                    portModeConfigSetCLI += "no ip address \n";
                                }
						        if($scope.logicalInterface.port.oldlistIpb6Address.length > 0){
	                            	portModeConfigSetCLI += "no ipv6 address\n";                            	
	                            }
					            for(var i = 0; i < $scope.logicalInterface.port.listIpb6Address.length; i++){
	                            	portModeConfigSetCLI += "ipv6 address "+$scope.logicalInterface.port.listIpb6Address[i].name+"\n";  
	                            }					            
	                            
					            if($scope.logicalInterface.port.rapid==false){
	                            	portModeConfigSetCLI += "no ipv6 address dhcp rapid-commit\n"; 
	                            }
	                            if($scope.logicalInterface.port.dhcp==true){
	                            	if($scope.logicalInterface.port.rapid==true){
	                            		portModeConfigSetCLI += "ipv6 address dhcp rapid-commit\n";	
	                            	}else{
	                            		portModeConfigSetCLI += "ipv6 address dhcp\n"; 
	                            	}
	                            }else{
	                            	portModeConfigSetCLI += "no ipv6 address dhcp\n";
	                            }
	                            
	                            if($scope.logicalInterface.port.autoconfig==true){
	                            	portModeConfigSetCLI += "ipv6 address autoconfig\n"; 
	                            }else{
	                            	portModeConfigSetCLI += "no ipv6 address autoconfig\n"; 
	                            }
                            }
							portModeConfigSetCLI += "exit\n";
						}
					    if(!$scope.selectedSwitchId){
						   result = requestRoutingService.getConfigCmdOutput(portModeConfigSetCLI);
                        } else {
                            result = clusterCmdService.getMultiConfigPortCmdOutput(portModeConfigSetCLI,$scope.selectedSwitchId);
                        }
                        portModeConfigSetCLI = "";
                        return result;
                    }else{
                        return false;
                    }
				}
			}
            if($scope.portMode === translate("com_switch")){
                if(portSetValidations.validate()) {
                    portConfSettingSwitch = true;
                  //LACP System Priority
                	if($scope.lacpSysPriority!=$scope.oldlacpSysPriority){
                    	if($scope.lacpSysPriority!="" && $scope.lacpSysPriority!=undefined){
                    		portsConfigSetCLI += "lacp system-priority "+$scope.lacpSysPriority+"\n";
                    	}else{
                    		portsConfigSetCLI += "no lacp system-priority \n";
                    	}                	
                    }
                	//Delete channel group
				    if($scope.portgroupno != oldPortgroupno){
				    	if(!angular.isUndefined(oldPortgroupno) && oldPortgroupno != ""){
				    		portsConfigSetCLI += "no interface port-channel "+oldPortgroupno+"\n";
				    	}
				    }
                    var unselectedIndex = [];
                    if($scope.tempMultiSelectedPort){
                        for(var j9 = 0; j9 < $scope.tempMultiSelectedPort.length; j9++){
                            if($scope.tempMultiSelectedPort[j9].unselected){
                                portsConfigSetCLI += "interface " + $scope.tempMultiSelectedPort[j9].uniqueId + "\n";
                                portsConfigSetCLI += "no channel-group \n";
                                portsConfigSetCLI += "exit \n";
                                unselectedIndex.push(j9);
                            }
                        }
                        for(var _i = 0; _i < unselectedIndex.length; _i++ ){
                            $scope.tempMultiSelectedPort.splice(unselectedIndex[_i],1);
                        }
                    }
                    var a = changeObjToArr($scope.multiSelectedPort, "uniqueId");
                    var b = changeObjToArr($scope.selectedGrpPorts, "uniqueId");
                    $scope.findUnique = a.filter(function(obj) {
                        return b.indexOf(obj) == -1;
                    });
                    for(var i = 0; i < $scope.findUnique.length; i++){
                        $scope.findUnique[i] = {uniqueId:$scope.findUnique[i]};
                    }
                    var extractMultiSelectedPort;
                    if($scope.findUnique.length > 0){
                        extractMultiSelectedPort = $scope.availableGroups("multiSelectedPort","findUnique");
                    }
                    var checkOnlyLAGFields = checkLAGFields("Switch");
                    var oldPortGroupMode = $scope.findPortsMode(oldPortGroupType,oldKeepAliveMode);
                    if(!checkOnlyLAGFields){
                        for(var j1 = 0; j1 < $scope.multiSelectedPort.length; j1++){
                            if($scope.portgroupno){
                                portsConfigSetCLI += "interface " + $scope.multiSelectedPort[j1].uniqueId + "\n";
                                if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                                   portsConfigSetCLI += "switchport \n";
                                }
                                portsConfigSetCLI += "no channel-group "+$scope.portgroupno+" mode "+oldPortGroupMode+" \n";
                                portsConfigSetCLI += "exit \n";
                            }
                            else if((angular.isUndefined($scope.portgroupno) || $scope.portgroupno == "")) {
                                portsConfigSetCLI += "interface " + $scope.multiSelectedPort[j1].uniqueId + "\n";
                                if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                                   portsConfigSetCLI += "switchport \n";
                                }
                                portsConfigSetCLI += "no channel-group \n";
                                portsConfigSetCLI += "exit \n";
                            }
                        }
                        if($scope.portgroupno){
                            portsConfigSetCLI +="interface Po" + $scope.portgroupno + "\n";
                            if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
                                portsConfigSetCLI += "switchport \n";
                            }
                            portsConfigSetCLI += "exit\n";
                       }
                    }
                    var portChnlFlag = false, portChnlCount = 0;
                    for(var j8 = 0; j8 < $scope.multiSelectedPort.length; j8++){
                        if((portChnlCount == 0) && ($scope.multiSelectedPort[j8].hasOwnProperty('channelGroup') && $scope.multiSelectedPort[j8].channelGroup == $scope.portgroupno)){
                            portChnlCount++;
                            portChnlFlag = true;
                        }
                        if($scope.findUnique.length > 0){
                            for(var u = 0; u < $scope.findUnique.length; u++){
                                if($scope.multiSelectedPort[j8].uniqueId === $scope.findUnique[u].uniqueId){
                                    newlyAddPorts = true;
                                    portsConfigSetCLI += $scope.entirePortSetConf($scope.multiSelectedPort, j8);
                                }
                            }
                        }else{
                            newlyAddPorts = false;
                            if(checkOnlyLAGFields){
                                portsConfigSetCLI += $scope.onlyChangedPortSetConf($scope.multiSelectedPort, j8);
                            }else{
                                portsConfigSetCLI += $scope.entirePortSetConf($scope.multiSelectedPort, j8);
                            }
                        }
                    }
                    // CLI configuration for port channel
                    if($scope.portgroupno){
                        var etherChannelArray = [{uniqueId:"Po"+$scope.portgroupno}];
                        // L3 switch configuration for port channel
                        if(portChnlFlag){
                            portsConfigSetCLI += $scope.onlyChangedPortSetConf(etherChannelArray, 0, "portChannel");
                        }else if(!portChnlFlag || portChnlCount == 0){
                            portsConfigSetCLI += $scope.entirePortSetConf(etherChannelArray, 0, "portChannel");
                        }
                    }
                    if(extractMultiSelectedPort && extractMultiSelectedPort.length > 0){
                        for(var extract = 0; extract < extractMultiSelectedPort.length; extract++){
                            if(checkOnlyLAGFields){
                                portsConfigSetCLI += $scope.onlyChangedPortSetConf(extractMultiSelectedPort, extract);
                            }else{
                                portsConfigSetCLI += $scope.entirePortSetConf(extractMultiSelectedPort, extract);
                            }
                        }
                    }
                
                    if(!$scope.selectedSwitchId){
                       result = requestRoutingService.getConfigCmdOutput(portsConfigSetCLI);
                    } else {
                        result = clusterCmdService.getMultiConfigPortCmdOutput(portsConfigSetCLI,$scope.selectedSwitchId);
                    }
                    portsConfigSetCLI = "";
                    return result;
                }else{
                    return false;
                }
            }
        };
        $scope.cancelPortsSetConf = function () {
            var showRunConfig = $scope.formatInterfaceName();
            $scope.portSetingLAGLoading($scope.multiSelectedPort, showRunConfig);
            angular.element("#portsConfigSetForm  span.k-tooltip-validation").hide();
            $scope.switchMode = portInitialData.SwitchMode === "static access" ? "access" : portInitialData.SwitchMode;
            if(portInitialData.voiceVlan.indexOf("dot1p")!=-1){
            	$scope.voiceVlanOption="DOT1P";
            }else{
            	$scope.voiceVlanOption="VLANID";
            	$scope.portsVoiceVlan = portInitialData.voiceVlan === "none" ? "" : portInitialData.voiceVlan;
            }    
            $scope.portsAccessVlan = portInitialData.accessVlan;
            $scope.portsAllowedVlan = portInitialData.vlanIDs === "ALL" ? "all" : "notall";
            $scope.portsAllowedVlanId = portInitialData.vlanIDs !== "ALL" ? portDetails.vlanIDs : "";
            $scope.portsNativeVlan = portInitialData.nativeVlan;
            $scope.portsPortFast = portInitialData.portfast ? translate("toggle_on") : translate("toggle_off");
            //Adding 1.7 enhancement code
            $scope.portPriority = portInitialData.portPriority;          
            if(portInitialData.flowControl && portInitialData.flowControl!="" && portInitialData.flowControl!=undefined){
            	$scope.flowControl = portDetails.flowControl;
            }else{
            	$scope.flowControl="off";            
            }
            if(portDetails.portSecurity){
           	 	$scope.portSecurity = translate("com_enable");
            }else{
           	 	$scope.portSecurity = translate("com_disable");
            }
			
			if($scope.portsDhcpSnooping != undefined){
				if(portInitialData.dhcpsnooping=="trust"){
					$scope.portsDhcpSnooping = translate("com_enable") ;
				}else{
					$scope.portsDhcpSnooping = translate("com_disable");
				}
			}
            
             
            $scope.lacpPortPriority=portInitialData.lacpPortPriorityValue;
            $scope.disablePortConfGlbCancelBtn=true;
            $scope.disablePortConfGlbApplyBtn=true;
            $scope.portgroupno = oldPortgroupno;
            $scope.portGroupType = oldPortGroupType;
            $scope.portGroupData.keepAliveMode = oldKeepAliveMode;
			if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
				$scope.portMode = $scope.portMode ? translate("com_switch") : translate("portconfig_port_routed");
				getPortDetails($scope.selectedPortId);
                $scope.getPortGroupRangeDetails();
			}else{
                getPortDetails($scope.selectedPortId, $scope.multiSelectedPort);
                $scope.getPortGroupRangeDetails();
            }
        };
		$scope.portGroupNumberOnChange = function(){
            $scope.disablePortConfGlbApplyBtn=$scope.disablePortConfGlbCancelBtn = false
			if($scope.multiSelectedPort.length>1){
			    if($scope.portgroupno != ""){
					$scope.portConfigIpDisabled = false;
					$scope.portConfigSubnetDisabled = false;
				}if($scope.portgroupno == "" || $scope.portgroupno == undefined){
					$scope.portConfigIpDisabled = true;
					$scope.portConfigSubnetDisabled = true;
				}
			}
		}
		$scope.changePortMode = function(){
            $scope.disablePortConfGlbApplyBtn  = false;
			$scope.disablePortConfGlbCancelBtn = false;
			// Port Mode
			if($scope.platformType.indexOf("C2960X") != -1 || $scope.platformType.indexOf("C3560CX") != -1 || $scope.platformType.indexOf("2960L") != -1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
				if($scope.portMode == translate("portconfig_port_routed")){
					$scope.isportMode = false;
                    $scope.isRoutedMode = true;
                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[0].value;
				}else{
					$scope.switchMode = "access";
					$scope.isportMode = true;
					$scope.isRoutedMode = false;
				}
			}
		};
		
		// Layer2 VLAN Form validation
		$scope.dhcpSnoopingVLANValidations={
			rules: {
				check: function (input) {
                    var valMsg = input.data('checkMsg');
                        if ((valMsg==undefined)) {
                            return true;
                        }
                    return validationService.validateCheck(input);
                },
				space: function (input) {
                    var valMsg = input.data('spaceMsg');
                        if ((valMsg==undefined)) {
                            return true;
                        }
                    return validationService.validateDataSpace(input);
                },
                range: function (input) {
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
				},
				vlancheck: function (input) {
                    var valMsg = input.data('vlancheckMsg');
					if ((valMsg==undefined)){
                        return true;
					}
                    return true;
                },				
				maximum : function(input) {
                    return input.data('maximum') ? validationService.validateMaximumLength(input.val(), input.data('maximum')) : true;
                },
                minimum : function(input) {
                    return input.data('minimum') ? validationService.validateMinimumLength(input.val(), input.data('minimum')) : true;
                }
			}
		};
		
		var vlanEditData1={
			portsDHCPVlanId: null,
			overrideType: translate("portconfig_portgroup_type_override"),
			circuitString: null
		};
		
		$scope.addDHCPSnoopingVLAN = function(){
			$scope.vlanEditData = angular.copy(vlanEditData1);
			angular.element("#dhcpSnoopingVLANForm  span.k-tooltip-validation").hide();
			$scope.dhcpSnoopingVLANGridWindow.open().center();
			$scope.isEditModeFlag = false;
			$scope.disableDeleteButton = true;
		};
		
		$scope.dhcpSnoopingVlanCancel = function() {
			$timeout(function(){
				angular.element("#dhcpSnoopingVLANForm  span.k-tooltip-validation").hide();				
				$scope.dhcpSnoopingVLANGridWindow.close();				
				angular.element('#dhcpSnoopingVLANGrid').data('kendoGrid').refresh();
				$scope.disableDeleteButton = true;
			});
		};
		
		$scope.vlanEditData = {
			portsDHCPVlanId: null,
			overrideType: translate("portconfig_portgroup_type_override"),
			circuitString: null
		}
		
		$scope.onSelectDHCPSnoopingVLANHandler = function(data){            			
			$scope.vlanEditData.portsDHCPVlanId = data.portsDHCPVlanId;
			$scope.vlanEditData.overrideType = data.overrideType;
			$scope.vlanEditData.circuitString = data.circuitString;
			angular.element("#dhcpSnoopingVLANForm  span.k-tooltip-validation").hide();
			$scope.dhcpSnoopingVLANGridWindow.open().center();
			$scope.isEditModeFlag = true;
			$scope.disableDeleteButton = true;
		}
		
		$scope.saveDhcpSnoopingVlanData = function(){			
            $scope.dhcpSnoopingVLANValidator.hideMessages();
            if (!$scope.dhcpSnoopingVLANValidator.validate()) {
                return;
            }
			var portsConfigDHCPSnoopingVlanCLI = "";
			portsConfigDHCPSnoopingVlanCLI += "interface " + $scope.interfaceId + "\n";
			if($scope.vlanEditData.overrideType == translate("portconfig_portgroup_type_override")){
				portsConfigDHCPSnoopingVlanCLI += "ip dhcp snooping vlan "+ $scope.vlanEditData.portsDHCPVlanId + " information option format-type circuit-id "+ $scope.vlanEditData.overrideType + " string " + $scope.vlanEditData.circuitString + "\n";
			}else if($scope.vlanEditData.overrideType == translate("portconfig_portgroup_type_string")){
				portsConfigDHCPSnoopingVlanCLI += "ip dhcp snooping vlan "+ $scope.vlanEditData.portsDHCPVlanId + " information option format-type circuit-id "+ $scope.vlanEditData.overrideType + " " + $scope.vlanEditData.circuitString + "\n";
			}
			portsConfigDHCPSnoopingVlanCLI += "exit\n";
			$scope.dhcpSnoopingVLANGridWindow.close().center();
			
			if(portsConfigDHCPSnoopingVlanCLI != ''){
				var result = requestRoutingService.getConfigCmdOutput(portsConfigDHCPSnoopingVlanCLI);
				if( (result == "") || (result.indexOf("Creating a port-channel interface Port-channel") != -1) || (result.indexOf("VLAN does not exist. Creating vlan") != -1) ){
					notificationService.showNotification(translate('portsconfig_success_msg'), translate('com_config_success_title'), 'success');
				}else{
					notificationService.showNotification(result, translate('com_config_fail_title'), 'error');
				}
			}
			if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
				$scope.portMode = $scope.portMode ? translate("com_switch") : translate("portconfig_port_routed");
				getPortDetails($scope.selectedPortId);
                $scope.getPortGroupRangeDetails();
			}else{
                getPortDetails($scope.selectedPortId, $scope.multiSelectedPort);
                $scope.getPortGroupRangeDetails();
            }
			
		}
		
		/**
         * Select dhcp Snooping VLAN
         */
		 
		$scope.delDHCPSnoopingVlanArray = [];
        $scope.isDHCPVLANChecked = function(checked, dataItem) {
            if (!checked) {
                var index = $scope.delDHCPSnoopingVlanArray.indexOf(dataItem.portsDHCPVlanId);
                if (index > -1) {
                    $scope.delDHCPSnoopingVlanArray.splice(index, 1);
                }

            } else {
                $scope.delDHCPSnoopingVlanArray.push(dataItem);
            }
            $scope.disableDeleteButton = $scope.delDHCPSnoopingVlanArray.length === 0;
            
        };
		
		/**
         * Delelete Confirmation window for dhcpSnooping VLAN Data
         */
        $scope.showDeleteWindow = function() {
            $scope.dlg1 = dialogService.dialog({
                content: translate("msg_delete_confirmation"),
                title: translate("msg_delete_confirmation_window"),
                messageType: "confirm",
                actionButtons: [{
                    text: translate("com_ok"),
                    callback: "okDeleteDHCPVlan"
                }, {
                    text: translate("com_cancel"),
                    callback: "cancelDel"
                }]
            });

        };
        $scope.$on("okDeleteDHCPVlan", function() {
            if ($scope.dlg1) {
                $scope.dlg1.data("kendoWindow").close();
            }
            $scope.deleteSelectedDHCPSnoopingVLAN();
        });
        $scope.$on("cancelDel", function() {
            if ($scope.dlg1) {
                $scope.dlg1.data("kendoWindow").close();
            }
        });
		
		$scope.deleteSelectedDHCPSnoopingVLAN = function(){			
			var selectedItem = $scope.delDHCPSnoopingVlanArray;
            $scope.delDHCPSnoopingVlanArray = [];
			var portsConfigDHCPSnoopingVlanCLI = "";
			portsConfigDHCPSnoopingVlanCLI += "interface " + $scope.interfaceId + "\n";
            for (var i = 0; i < selectedItem.length; i++) {
				if(selectedItem[i].overrideType != "" && selectedItem[i].overrideType == translate("portconfig_portgroup_type_override")){
					portsConfigDHCPSnoopingVlanCLI += "no ip dhcp snooping vlan "+ selectedItem[i].portsDHCPVlanId + " information option format-type circuit-id "+ selectedItem[i].overrideType + " string\n";
				}else if(selectedItem[i].overrideType != "" && selectedItem[i].overrideType == translate("portconfig_portgroup_type_string")){
					portsConfigDHCPSnoopingVlanCLI += "no ip dhcp snooping vlan "+ selectedItem[i].portsDHCPVlanId + " information option format-type circuit-id "+ selectedItem[i].overrideType + "\n";
				}
			}
			portsConfigDHCPSnoopingVlanCLI += "exit\n";
			
			if(portsConfigDHCPSnoopingVlanCLI != ''){
				var result = requestRoutingService.getConfigCmdOutput(portsConfigDHCPSnoopingVlanCLI);
				if( (result == "") || (result.indexOf("Creating a port-channel interface Port-channel") != -1) || (result.indexOf("VLAN does not exist. Creating vlan") != -1) ){
					notificationService.showNotification(translate('portsconfig_success_msg'), translate('com_config_success_title'), 'success');
				}else{
					notificationService.showNotification(result, translate('com_config_fail_title'), 'error');
				}
				$scope.disableDeleteButton = true;
			}
			if($scope.platformType.indexOf("C2960X")!=-1 || $scope.platformType.indexOf("C3560CX")!=-1 || $scope.platformType.indexOf("2960L")!=-1 || $scope.platformType.indexOf("C1000") != -1 || $scope.platformType.indexOf("S6650L") !=-1 || $scope.platformType.indexOf("S5960") !=-1){
				$scope.portMode = $scope.portMode ? translate("com_switch") : translate("portconfig_port_routed");
				getPortDetails($scope.selectedPortId);
                $scope.getPortGroupRangeDetails();
			}else{
                getPortDetails($scope.selectedPortId, $scope.multiSelectedPort);
                $scope.getPortGroupRangeDetails();
            }
			
		}
		
        $scope.onlyChangedPortAdvConf = function(multiSelectedPort, j){
            var portsConfigAdvCLI = "";
            if(!$scope.portgroupno){
                portsConfigAdvCLI += "interface " + multiSelectedPort[j].uniqueId + "\n";
            }else{
                portsConfigAdvCLI += "interface po" + $scope.portgroupno + "\n";
            }
            if($scope.portsOldStormControlStorm!=$scope.portsStormControlStorm){
                if ($scope.portsStormControlStorm === "shutdown") {
                    portsConfigAdvCLI += "no storm-control action trap" + "\n";
                    portsConfigAdvCLI += "storm-control action shutdown" + "\n";
                }
                else if ($scope.portsStormControlStorm === "trap") {
                    portsConfigAdvCLI += "storm-control action trap" + "\n";
                    portsConfigAdvCLI += "no storm-control action shutdown" + "\n";
                }
                else {
                    portsConfigAdvCLI += "no storm-control action trap" + "\n";
                    portsConfigAdvCLI += "no storm-control action shutdown" + "\n";
                }
            }
            if(portDetails.broadcast!=$scope.portsStormControlBroadcast){
                if ($scope.portsStormControlBroadcast !== "" && $scope.portsStormControlBroadcast != undefined) {
                    portsConfigAdvCLI += "storm-control broadcast level " + $scope.portsStormControlBroadcast + "\n";
                }
                else {
                    portsConfigAdvCLI += "no storm-control broadcast level " + "\n";
                }
            }
            if(portDetails.multicast!=$scope.portsStormControlMulticast){
                if ($scope.portsStormControlMulticast !== "" && $scope.portsStormControlMulticast != undefined) {
                    portsConfigAdvCLI += "storm-control multicast level " + $scope.portsStormControlMulticast + "\n";
                }
                else {
                    portsConfigAdvCLI += "no storm-control multicast level " + "\n";
                }
            }
            if(portDetails.unicast!=$scope.portsStormControlUnicast){
                if ($scope.portsStormControlUnicast !== "" && $scope.portsStormControlUnicast != undefined) {
                    portsConfigAdvCLI += "storm-control unicast level " + $scope.portsStormControlUnicast + "\n";
                }
                else {
                    portsConfigAdvCLI += "no storm-control unicast level " + "\n";
                }
            }
            if(!$scope.portgroupno && !$scope.check2960Plus &&!$scope.checkCDB){
	            if(portDetails.loopDetectStatus!=$scope.loopDetectStatus || portDetails.loopDetectValue!=$scope.loopDetectValue){
	            	if ($scope.loopDetectionDeviceStatus == true) {
		                if ($scope.loopDetectStatus == true) {
		                	if($scope.loopDetectValue!=""){
		                		portsConfigAdvCLI += "loopdetect "+$scope.loopDetectValue+"\n";
		                	}else{
		                		portsConfigAdvCLI += "loopdetect \n";
		                	}                    
		                } else {
		                	portsConfigAdvCLI += "no loopdetect \n";
		                }
	            	}  
	            }
            }
			if(!$scope.check2960Plus){
				if(portDetails.arpInspectionStatus!=$scope.arpInspectionStatus){
					if ($scope.arpInspectionStatus==true) {
						portsConfigAdvCLI += "ip arp inspection trust \n";
					}else {
						portsConfigAdvCLI += "no ip arp inspection trust \n";
					}
				}
				if(portDetails.arpLimitRate!=$scope.arpLimitRate){
					if ($scope.arpLimitRate !== "" && $scope.arpLimitRate != undefined) {
						portsConfigAdvCLI += "ip arp inspection limit rate "+$scope.arpLimitRate+"\n";
					}else {
						portsConfigAdvCLI += "no ip arp inspection limit rate \n";
					}
				}
			}
            if(!$scope.portgroupno){
	            if($scope.oldmdixStatus!=$scope.mdixStatus){
	                if ($scope.mdixStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "mdix auto \n";
	                }else {
	                    portsConfigAdvCLI += "no mdix auto \n";
	                }
	            }
	            if($scope.oldcdpStatus!=$scope.cdpStatus){
	                if ($scope.cdpStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "cdp enable \n";
	                }else {
	                    portsConfigAdvCLI += "no cdp enable \n";
	                }
	            }
	            if($scope.oldlldpStatus !=$scope.lldpStatus){
	                if ($scope.lldpStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "lldp receive \n";
	                }else {
	                    portsConfigAdvCLI += "no lldp receive \n";
	                }
	            }
				if($scope.ipsgOldStatus !=$scope.ipsgStatus){
	                if ($scope.ipsgStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "ip verify source \n";
	                }else {
	                    portsConfigAdvCLI += "no ip verify source \n";
	                }
	            }
	            
	            if($scope.dhcpRelayOldStatus !=$scope.dhcpRelayStatus){
	                if ($scope.dhcpRelayStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "ip dhcp relay information trusted \n";
	                }else {
	                    portsConfigAdvCLI += "no ip dhcp relay information trusted \n";
	                }
	            }
				
				if($scope.dhcpClientOldStatus !=$scope.dhcpClientStatus){
	                if ($scope.dhcpClientStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "ip address dhcp \n";
	                }else {
	                    portsConfigAdvCLI += "no ip address dhcp \n";
	                }
	            }
            }
            //configuring STP Extensions
			
            if($scope.oldstpPortType!=$scope.stpPortType){
            	portsConfigAdvCLI += "spanning-tree portfast "+$scope.stpPortType+" \n";
            }
            if($scope.oldStpBpdufilter !=$scope.stpBpdufilter){
                if ($scope.stpBpdufilter== translate("com_enable")) {
                    portsConfigAdvCLI += "spanning-tree bpdufilter enable \n";
                }else {
                    portsConfigAdvCLI += "spanning-tree bpdufilter disable \n";
                }
            }
            if($scope.oldStpBpduguard !=$scope.stpBpduguard){
                if ($scope.stpBpduguard== translate("com_enable")) {
                    portsConfigAdvCLI += "spanning-tree bpduguard enable \n";
                }else {
                    portsConfigAdvCLI += "spanning-tree bpduguard disable \n";
                }
            }
            if($scope.oldStpLoopguard !=$scope.stpLoopGuard){
                if ($scope.stpLoopGuard== translate("com_enable")) {
                    portsConfigAdvCLI += "spanning-tree guard loop \n";
                }else {
                    portsConfigAdvCLI += "no spanning-tree guard loop \n";
                }
            }
			if($scope.macAddressOldStatus!=$scope.macAddress){
				if($scope.macAddress !== "" && $scope.macAddress != undefined){
					portsConfigAdvCLI += "switchport port-security mac-address "+$scope.macAddress+" \n";					
				}            	
            }
			if($scope.violationTypeOld!=$scope.violationType || ($scope.violationType == translate("portconfig_violation_options_shutdown") && $scope.vlanCheckStatus!=$scope.vlanCheckStatusOld)){
				if($scope.violationType !== "" && $scope.violationType != undefined){
					if($scope.violationType == translate("portconfig_violation_options_shutdown") && $scope.vlanCheckStatus == true){
						portsConfigAdvCLI += "switchport port-security violation "+$scope.violationType+" vlan"+" \n";
					}else{
						portsConfigAdvCLI += "switchport port-security violation "+$scope.violationType+" \n";
					}
				}            	
            }
            return portsConfigAdvCLI;
        }
        $scope.entirePortAdvConf = function(multiSelectedPort, j){
            var portsConfigAdvCLI = "";
            if(!$scope.portgroupno){
                portsConfigAdvCLI += "interface " + multiSelectedPort[j].uniqueId + "\n";
            }else{
                portsConfigAdvCLI += "interface po" + $scope.portgroupno + "\n";
            }
            if ($scope.portsStormControlStorm === "shutdown") {
                portsConfigAdvCLI += "no storm-control action trap" + "\n";
                portsConfigAdvCLI += "storm-control action shutdown" + "\n";
            }
            else if ($scope.portsStormControlStorm === "trap") {
                portsConfigAdvCLI += "storm-control action trap" + "\n";
                portsConfigAdvCLI += "no storm-control action shutdown" + "\n";
            }
            else {
                portsConfigAdvCLI += "no storm-control action trap" + "\n";
                portsConfigAdvCLI += "no storm-control action shutdown" + "\n";
            }
            if ($scope.portsStormControlBroadcast !== "" && $scope.portsStormControlBroadcast != undefined) {
                portsConfigAdvCLI += "storm-control broadcast level " + $scope.portsStormControlBroadcast + "\n";
            }
            else {
                portsConfigAdvCLI += "no storm-control broadcast level " + "\n";
            }
            if ($scope.portsStormControlMulticast !== "" && $scope.portsStormControlMulticast != undefined) {
                portsConfigAdvCLI += "storm-control multicast level " + $scope.portsStormControlMulticast + "\n";
            }
            else {
                portsConfigAdvCLI += "no storm-control multicast level " + "\n";
            }
            if ($scope.portsStormControlUnicast !== "" && $scope.portsStormControlUnicast != undefined) {
                portsConfigAdvCLI += "storm-control unicast level " + $scope.portsStormControlUnicast + "\n";
            }
            else {
                portsConfigAdvCLI += "no storm-control unicast level " + "\n";
            }
            if(!$scope.portgroupno && !$scope.check2960Plus &&!$scope.checkCDB){
            	if ($scope.loopDetectionDeviceStatus == true) {
		            if ($scope.loopDetectStatus == true) {
		               	if($scope.loopDetectValue!=""){
		               		portsConfigAdvCLI += "loopdetect "+$scope.loopDetectValue+"\n";
		               	}else{
		               		portsConfigAdvCLI += "loopdetect \n";
		               	}                    
		            } else{
		            	portsConfigAdvCLI += "no loopdetect \n";
		            }
            	}  
            }
			if(!$scope.check2960Plus){
				if($scope.arpInspectionStatus ==true) {
					portsConfigAdvCLI += "ip arp inspection trust \n";
				}else {
					portsConfigAdvCLI += "no ip arp inspection trust\n";
				}
				if($scope.arpLimitRate !== "" && $scope.arpLimitRate != undefined) {
					portsConfigAdvCLI += "ip arp inspection limit rate "+$scope.arpLimitRate+"\n";
				}else {
					portsConfigAdvCLI += "no ip arp inspection limit rate\n";
				}            
			}
            if(!$scope.portgroupno){
	            if($scope.oldmdixStatus!=$scope.mdixStatus){
	                if ($scope.mdixStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "mdix auto \n";
	                }else {
	                    portsConfigAdvCLI += "no mdix auto \n";
	                }
	            }
	            if($scope.oldcdpStatus!=$scope.cdpStatus){
	                if ($scope.cdpStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "cdp enable \n";
	                }else {
	                    portsConfigAdvCLI += "no cdp enable \n";
	                }
	            }
	            if($scope.oldlldpStatus !=$scope.lldpStatus){
	                if ($scope.lldpStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "lldp receive \n";
	                }else {
	                    portsConfigAdvCLI += "no lldp receive \n";
	                }
	            }
				if($scope.ipsgOldStatus !=$scope.ipsgStatus){
	                if ($scope.ipsgStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "ip verify source \n";
	                }else {
	                    portsConfigAdvCLI += "no ip verify source \n";
	                }
	            }
	            if($scope.dhcpRelayOldStatus !=$scope.dhcpRelayStatus){
	                if ($scope.dhcpRelayStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "ip dhcp relay information trusted \n";
	                }else {
	                    portsConfigAdvCLI += "no ip dhcp relay information trusted \n";
	                }
	            }
				if($scope.dhcpClientOldStatus !=$scope.dhcpClientStatus){
	                if ($scope.dhcpClientStatus== translate("com_enable")) {
	                    portsConfigAdvCLI += "ip address dhcp \n";
	                }else {
	                    portsConfigAdvCLI += "no ip address dhcp \n";
	                }
	            }
            }
            //configuring the STP Extension
            if($scope.oldstpPortType != $scope.stpPortType && $scope.stpPortType != undefined) {
            	portsConfigAdvCLI += "spanning-tree portfast "+$scope.stpPortType+"\n";
            }
			if($scope.oldStpBpdufilter !=$scope.stpBpdufilter){
                if ($scope.stpBpdufilter== translate("com_enable")) {
                    portsConfigAdvCLI += "spanning-tree bpdufilter enable \n";
                }else {
                    portsConfigAdvCLI += "spanning-tree bpdufilter disable \n";
                }
            }
            if($scope.oldStpBpduguard!=$scope.stpBpduguard){
                if ($scope.stpBpduguard== translate("com_enable")) {
                    portsConfigAdvCLI += "spanning-tree bpduguard enable \n";
                }else {
                    portsConfigAdvCLI += "spanning-tree bpduguard disable \n";
                }
            }
            if($scope.oldStpLoopguard !=$scope.stpLoopGuard){
                if ($scope.stpLoopGuard== translate("com_enable")) {
                    portsConfigAdvCLI += "spanning-tree guard loop \n";
                }else {
                    portsConfigAdvCLI += "no spanning-tree guard loop \n";
                }
            }
			if($scope.macAddressOldStatus!=$scope.macAddress){
				if($scope.macAddress !== "" && $scope.macAddress != undefined){
					portsConfigAdvCLI += "switchport port-security mac-address "+$scope.macAddress+" \n";					
				}            	
            }
			if($scope.violationTypeOld!=$scope.violationType || ($scope.violationType == translate("portconfig_violation_options_shutdown") && $scope.vlanCheckStatus!=$scope.vlanCheckStatusOld)){
				if($scope.violationType !== "" && $scope.violationType != undefined){
					if($scope.violationType == translate("portconfig_violation_options_shutdown") && $scope.vlanCheckStatus == true){
						portsConfigAdvCLI += "switchport port-security violation "+$scope.violationType+" vlan"+" \n";
					}else{
						portsConfigAdvCLI += "switchport port-security violation "+$scope.violationType+" \n";
					}
				}            	
            }
            return portsConfigAdvCLI;
        }
        $scope.savePortsAdvConf = function () {
        	var result="";
        	var isAutoQOS=false;
            var portsConfigAdvCLI = "";
            if(portAdvValidations.validate()) {
            portConfAdvSetting = true;
            for(var j = 0; j < $scope.multiSelectedPort.length; j++){
                var a = changeObjToArr($scope.multiSelectedPort, "uniqueId");
                var b = changeObjToArr($scope.selectedGrpPorts, "uniqueId");
                $scope.findUnique = a.filter(function(obj) {
                    return b.indexOf(obj) == -1;
                });
                for(var i = 0; i < $scope.findUnique.length; i++){
                    $scope.findUnique[i] = {uniqueId:$scope.findUnique[i]};
                }
                var extractMultiSelectedPort;
                if($scope.findUnique.length > 0){
                    extractMultiSelectedPort = $scope.availableGroups("multiSelectedPort","findUnique");
                }
                var checkOnlyLAGFields = checkLAGFields();
                var portChnlFlag = false, portChnlCount = 0;
                for(var j = 0; j < $scope.multiSelectedPort.length; j++){
                    if((portChnlCount == 0) && ($scope.multiSelectedPort[j].hasOwnProperty('channelGroup') && $scope.multiSelectedPort[j].channelGroup == $scope.portgroupno)){
                        portChnlCount++;
                        portChnlFlag = true;
                    }
                    if($scope.findUnique.length > 0){
                        for(var u = 0; u < $scope.findUnique.length; u++){
                            if($scope.multiSelectedPort[j].uniqueId === $scope.findUnique[u].uniqueId){
                                portsConfigAdvCLI += $scope.entirePortAdvConf($scope.multiSelectedPort, j);
                            }
                        }
                    }else{
                        if(checkOnlyLAGFields){
                            portsConfigAdvCLI += $scope.onlyChangedPortAdvConf($scope.multiSelectedPort, j);
                        }else{
                            portsConfigAdvCLI += $scope.entirePortAdvConf($scope.multiSelectedPort, j);
                        }
                    }
                }
                if($scope.portgroupno){
                    var etherChannelArray = [{uniqueId:"Po"+$scope.portgroupno}];
                    // L3 switch configuration for port channel
                    if(portChnlFlag){
                        portsConfigAdvCLI += $scope.onlyChangedPortAdvConf(etherChannelArray, 0, "portChannel");
                    }else if(!portChnlFlag || portChnlCount == 0){
                        portsConfigAdvCLI += $scope.entirePortAdvConf(etherChannelArray, 0, "portChannel");
                    }
                }
                if(extractMultiSelectedPort && extractMultiSelectedPort.length > 0){
                    for(var extract = 0; extract < extractMultiSelectedPort.length; extract++){
                        if(checkOnlyLAGFields){
                            portsConfigAdvCLI += $scope.onlyChangedPortAdvConf(extractMultiSelectedPort, extract);
                        }else{
                            portsConfigAdvCLI += $scope.entirePortAdvConf(extractMultiSelectedPort, extract);
                        }
                    }
                }
                if(!$scope.portgroupno){
				if($scope.autoQos && $scope.autoQosOld != $scope.autoQos){
				  isAutoQOS=true;
                  if($scope.autoQos==="none"){
                		portsConfigAdvCLI += "no auto qos " +$scope.autoQosOld+"\n";
				  }else{
						if($scope.autoQos === "voip trust"){
							if($scope.autoQosOld!="none"){
							   portsConfigAdvCLI += "no auto qos " +$scope.autoQosOld+ "\n";
							}
							portsConfigAdvCLI += "exit \n";
							portsConfigAdvCLI += "no auto qos srnd4 \n";
							portsConfigAdvCLI += "interface " + $scope.interfaceId + "\n";
							portsConfigAdvCLI += "auto qos voip trust \n";
						}else{
							if($scope.autoQosOld!="none"){
								portsConfigAdvCLI += "no auto qos " +$scope.autoQosOld+ "\n";
								portsConfigAdvCLI += "auto qos " +$scope.autoQos+ "\n";
							}else{
								portsConfigAdvCLI += "auto qos " +$scope.autoQos+ "\n";
							}
						}
				   }
				 }
               }
            }
            if(isAutoQOS){
            	portsConfigAdvCLI += "exit \n";
            	if($scope.platformType.indexOf("2960L") != -1 || $scope.platformType.indexOf("C1000") != -1){            		
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 2 threshold 1 2\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 2 threshold 2 3\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 16 17 18 19 20 21 22 23\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 26 27 28 29 30 31 34 35\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 36 37 38 39\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 2 24\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 4 threshold 1 8 9 11 13 15\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 4 threshold 2 10 12 14\n";    				
    				portsConfigAdvCLI+="mls qos\n";
            	}else{
            		portsConfigAdvCLI+="mls qos map policed-dscp  0 10 18 24 46 to 8\n";
    				portsConfigAdvCLI+="mls qos map cos-dscp 0 8 16 24 32 46 48 56\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 1 threshold 3 4 5\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 2 threshold 1 2\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 2 threshold 2 3\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 2 threshold 3 6 7\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 3 threshold 3 0\n";
    				portsConfigAdvCLI+="mls qos srr-queue output cos-map queue 4 threshold 3 1\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 1 threshold 3 32 33 40 41 42 43 44 45\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 1 threshold 3 46 47\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 16 17 18 19 20 21 22 23\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 26 27 28 29 30 31 34 35\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 1 36 37 38 39\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 2 24\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 3 48 49 50 51 52 53 54 55\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 2 threshold 3 56 57 58 59 60 61 62 63\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 3 threshold 3 0 1 2 3 4 5 6 7\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 4 threshold 1 8 9 11 13 15\n";
    				portsConfigAdvCLI+="mls qos srr-queue output dscp-map queue 4 threshold 2 10 12 14\n";
    				portsConfigAdvCLI+="mls qos queue-set output 1 threshold 1 100 100 50 200\n";
    				portsConfigAdvCLI+="mls qos queue-set output 1 threshold 2 125 125 100 400\n";
    				portsConfigAdvCLI+="mls qos queue-set output 1 threshold 3 100 100 100 400\n";
    				portsConfigAdvCLI+="mls qos queue-set output 1 threshold 4 60 150 50 200\n";
    				portsConfigAdvCLI+="mls qos queue-set output 1 buffers 15 25 40 20\n";
    				portsConfigAdvCLI+="mls qos\n";
            	}				
            }
            if(!$scope.selectedSwitchId) {
               result = requestRoutingService.getConfigCmdOutput(portsConfigAdvCLI);
            } else {
                result = clusterCmdService.getMultiConfigPortCmdOutput(portsConfigAdvCLI,$scope.selectedSwitchId);
            }
            portsConfigAdvCLI = "";
            return result;
            }
			else {
			   return false;
			}
        };
        $scope.cancelPortsAdvConf = function () {
            getPortDetails($scope.selectedPortId);
            $scope.getPortGroupRangeDetails();
            $timeout(function(){
                $scope.portsStormControlStorm = portInitialData.stormControl === "" ? "none" : portInitialData.stormControl;
            },100);
            $scope.portsStormControlBroadcast = portInitialData.broadcast;
            $scope.portsStormControlMulticast = portInitialData.multicast;
            $scope.portsStormControlUnicast = portInitialData.unicast;
            $scope.loopDetectStatus = portInitialData.loopDetectStatus;
            $scope.loopDetectValue = portInitialData.loopDetectValue;
            $scope.arpInspectionStatus = portInitialData.arpInspectionStatus;
            $scope.arpLimitRate = portInitialData.arpLimitRate;
            $scope.mdixStatus = portInitialData.mdixStatus;
            $scope.cdpStatus = portInitialData.cdpStatus;
            $scope.lldpStatus = portInitialData.lldpStatus;
            $scope.stpPortType = portInitialData.stpPortType;
            $scope.stpBpdufilter = portInitialData.stpBpdufilter;
            $scope.stpBpduguard = portInitialData.stpBpduguard;
            $scope.stpLoopGuard = portInitialData.stpLoopGuard;            
            $scope.disablePortConfGlbApplyBtn=true;
            $scope.disablePortConfGlbCancelBtn=true;
        };
              
        $scope.addIpv6Address = function () {        	
            if (!portSetValidations.validate()) {
                  return;
            } 
            var ipv6Type = $scope.logicalInterface.port.ipv6type;
            var linkAddress = $scope.logicalInterface.port.vlanIPV6Address;
            var ipv6Address = $scope.logicalInterface.port.vlanIPV6Address;
            var ipv6SubType = $scope.logicalInterface.port.ipv6SubType;
            $scope.disablePortConfGlbApplyBtn = false;
            $scope.disablePortConfGlbCancelBtn = false
            var name = "";
            var isValidIpv6 = true;
            if( ipv6Address=="" || ipv6Address==null || ipv6Address==undefined ){
            	return ;
            }
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
            for (index = 0; index < $scope.logicalInterface.port.listIpb6Address.length; index++) {
                     if($scope.logicalInterface.port.listIpb6Address[index].name==finalObj.name){
                         find=true;
                         return false;
                     }
            }
            if(!find){
                $scope.logicalInterface.port.listIpb6Address.push(finalObj);
                $scope.logicalInterface.port.layer3IpV6Address ="";
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
		            $scope.disablePortConfGlbApplyBtn = false;
		            $scope.disablePortConfGlbCancelBtn = false
		};
    }
]);
