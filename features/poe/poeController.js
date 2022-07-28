/**
 Description: Power Management Controller for managing POE supported devices
 Feb 2020
 Copyright (c) 2020-2021 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller('poeCtrl', ['$rootScope','$scope','$timeout', '$filter', 'gridCrudService','requestRoutingService','dataSourceService','dialogService','validationService','notificationService',
	function($rootScope,$scope,$timeout, $filter, gridCrudService,requestRoutingService,dataSourceService,dialogService,validationService,notificationService) {
		var translate = $filter("translate");
		var pollingForPoE;
        var polling = false;
		$scope.isFESwitch=false;
		$scope.isPoECapable = $rootScope.deviceInfo.isPoECapable;		
		angular.element(".btnView").hide();
		angular.element(".pageLoader").show();
        //var preference = preferencesService.getPreferences();
        $scope.psuStatus = {
            POWERDOWN:"#c94926",
            POWERUP:"#26c977",
            NOTPRESENT:"#95a39c"
        };

        // PoE Table Object
        $scope.poeInterface = {
            interface: "",            
            adminType: "Disabled",
			status: "",
            power: "",
            maxPower: "",
            device: "",
            poeClass: "",
            consumption: ""
        }
		//global power object
		$scope.globalPower = {
            supported : 0.0,
            supportedClone: 0.0,
            used: 0.0,
            available: 0.0,
            minPowerSupported: 0.0,
            maxPowerSupported: 0.0
        }
		
		$scope.power = {
            "min" : 0.0,
            "max" : 0.0,
            "range" : "",
            "placeHolder": ""
        }
		
		$scope.maxPower = {
            "min": 0.0,
            "max" : 0.0,
            "range" : "",
            "placeHolder": ""
        }
		$scope.isEditWindowOpened = false;
        $scope.pollingInterval = 30000;
        // Only IE switch's have global power configuration
        $scope.isPoeGlobalConfig = false;
        // Both IE and non IE device allows interface level power configuration
        $scope.isPoeInterfaceConfig = true;
		$scope.isIESwitch = false;
		$scope.isHellcat = false;
		$scope.isRAFlavour = false;
		$scope.isMacallan = false;
		
		$scope.emptyPoEValueMsg = translate("poe_js_empty_poe_value");
		
		var versionInfo = requestRoutingService.getShowCmdOutput("show version","overviewshVer");
        var deviceType = versionInfo.ShowVersion.name;		
		var versionInfoRockwell = requestRoutingService.getShowCmdOutput("show version | sec SKU Brand Name");		
		$scope.platFormName = deviceType;
		$scope.isMacallan = deviceType.indexOf("C94") > -1;
		$scope.psu1Status = {};
        $scope.psu2Status = {};
        $scope.psu1StatusText = "";
        $scope.psu2StatusText = "";
		$scope.psu1 = false;
		$scope.psu2 = false;
		
		var example = deviceCommunicator.getInterfaceType("GigabitEthernet", true);
		
		if(deviceType !="" && (deviceType.match("IE%-") != -1 && deviceType.match("IE%-") != null || deviceType.indexOf("1783%-") != -1  &&  deviceType.indexOf("1783%-") != null || deviceType.indexOf("ESS") != -1  || deviceType.indexOf("IEM%-") != -1 && deviceType.indexOf("IEM%-") != null)){
			$scope.isIESwitch = true;
		}
		
		if(deviceType !="" && deviceType.indexOf("ESS") != -1){
			$scope.isHellcat = true;
		}
		
		if(versionInfoRockwell !="" && versionInfoRockwell.indexOf("Rockwell") != -1){
			$scope.isRAFlavour = true;
		}
		
		if($scope.isRAFlavour){
			var poeString = "";
			var tmpAry = $scope.platFormName.split("-");
            $scope.isPoeGlobalConfig = true;
			$scope.powerConsumption = true;	
			$scope.UPOE = false;
        }else if($scope.isIESwitch) {
			var poeString = "";
			var tmpAry = $scope.platFormName.split("-");
			poeString = tmpAry[2];
			$scope.UPOE = poeString.indexOf("U") > -1 ? true : false;
            $scope.isPoeGlobalConfig = true;
			$scope.powerConsumption = true;
        }else{
			var poeString = "";
			var tmpAry = $scope.platFormName.split("-");
			poeString = tmpAry[tmpAry.length - 1];
			$scope.UPOE = poeString.indexOf("U") > -1 ? true : false;
			$scope.powerConsumption = false;
        }	

		$scope.adminType = null;
		$scope.adminModeOptions = new kendo.data.ObservableArray([
                {"adminText": translate('com_disabled'), "adminValue": "Disabled"},
                {"adminText": translate('com_auto'), "adminValue": "Auto"},
				{"adminText": translate('com_ipaddress_static'), "adminValue": "Static"}
        ]);
		
		$scope.poeValidations = {
            rules : {
                globalrange : function(input) {
                    return input.data('globalrange') ? validationService.validateExactRange(input.val(), input.data('globalrange')) : true;
                },
                range : function(input) {
                    return input.data('range') ? validationService.validateExactRange(input.val(), input.data('range')) : true;
                }
            }
        };
		
		//Kendo Grid options
		$scope.poeInterfaceGridOptions = {
			editable : false,
			sortable : true,
			reorderable: true,
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
			scrollable: false,
			selectable: true,
			pageable: {
				  messages: {
					  display: translate("com_page_display"), //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
					  empty: translate("com_page_empty"),
					  page: translate("com_page_pagetext"),
					  of:translate("com_page_of"),  //{0} is total amount of pages
					  itemsPerPage: translate("com_page_itemsPerPage"),
					  first: translate("com_page_first"),
					  previous: translate("com_page_previous"),
					  next: translate("com_page_next"),
					  last: translate("com_page_last"),
					  refresh: translate("com_page_refresh"),
					  morePages: translate("com_page_morePage")
				   },
				   previousNext: true,
				   info: true,
				   refresh: true,
				   pageSizes : gridCrudService.grid_page_sizes,				   
				   buttonCount : 5
			},
			columns : [{
				field: "interface",
                title: translate("portconfig_general_interface"),
				width:20
			}, {
				field: "adminType",
                title: translate("com_mode"),
				width:20
			}, {
				field : "status",
                title : translate("com_status"),
				width:20
			}, {
				field : "power",
                title :  translate("poe_js_power"),
				width:20
			}, {
				field: "maxPower",
                title: translate("poe_js_max_power"),
				width:20
			}, {
                field : "consumption",
                title : translate("poe_js_overridePower"),
                width: 100,
                hidden : !$scope.powerConsumption
            },  {
				field : "device",
                title : translate("com_device"),
				width:20
			}, {
				field : "poeClass",
                title : translate("poe_js_class"),
				width:20
			}]
		};
		
		
		
		$scope.validateMode = function (){
            if($scope.poeInterfaceData) {
                var selectedRow = $scope.poeInterfaceData.map(function(item){return item.interface}).indexOf($scope.selectedPoeInterface);
                var mode = $scope.poeInterface.adminType;
                if (mode === "Disabled"){
                    $scope.poeInterface.power = 0.0;
                    $scope.poeInterface.maxPower = +$scope.maxPower.max + ".0";
                } else if (mode === "Auto"){
                    $scope.poeInterface.power = 0.0;
                    $scope.poeInterface.maxPower = $scope.poeInterfaceData[selectedRow].maxPower;
                } else if (mode === "Static"){
                    if (parseFloat($scope.poeInterface.power,10) === 0) {
                        $scope.poeInterface.power =  $scope.poeInterfaceData[selectedRow].power;
                    }
                    $scope.poeInterface.maxPower = $scope.poeInterfaceData[selectedRow].maxPower;
                }
                $scope.poeInterfaceFormValidator.hideMessages();
            }
        };
		var switchViewData = {};
		var masterViewData = {};
		
		
		$scope.poeGlobalValues = {
			module:"",
			avialablePower:"",
			usedPower:"",
			remainingPower:""
		}
		
		$scope.getGlobalPowerData = function(){
			var switchViewCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show power inline");			
			if(switchViewCLIOP[0] != undefined && switchViewCLIOP[0] != ""){
				var globalArray = switchViewCLIOP[0].split("Interface")[0].split("\n");	
				var count = 0;
				var moduleIndex=0;
				var avilableIndex=0;
				var usedIndex=0;
				var remainingIndex=0;
				var masterViewIndex=0;
				var switchIndex=0;
				switchViewData.module=[];
				switchViewData.available=[];
				switchViewData.used=[];
				switchViewData.remaining=[];
				masterViewData.masterData=[];
                if($rootScope.deviceInfo.type.indexOf("FE") != -1 || $rootScope.deviceInfo.type.indexOf("S5960L") != -1 || $rootScope.deviceInfo.type.indexOf("S6650L") != -1){
					$scope.isFESwitch=true;
					for(var i=0; i<globalArray.length; i++){
						if(globalArray[i] != undefined && globalArray[i] != ""){
							var globalPowerData = (globalArray[i].trim()).replace(/\s+/g,",").split(",");
							if(globalPowerData != undefined && globalPowerData != ""){
								for(var j=0;j<globalPowerData.length;j++){
									if(globalPowerData[j] != undefined && globalPowerData[j] != ""){
										var powerValue = globalPowerData[j].split(":");
										for(var k=0; k<powerValue.length; k++){
											if(powerValue[k].indexOf("Available") != -1){
												if(powerValue[k+1] != undefined && powerValue[k+1] != ""){													
													$scope.globalPower.supported = (powerValue[k+1].split("("))[0] != "" ? (powerValue[k+1].split("("))[0] : "0.0";
												}
												k++;
											}else if(powerValue[k].indexOf("Used") != -1){
												if(powerValue[k+1] != undefined && powerValue[k+1] != ""){
													$scope.globalPower.used = (powerValue[k+1].split("("))[0] != "" ? (powerValue[k+1].split("("))[0] : "0.0";
												}
												k++;
											}else if(powerValue[k].indexOf("Remaining") != -1){
												if(powerValue[k+1] != undefined && powerValue[k+1] != ""){
													$scope.globalPower.available = (powerValue[k+1].split("("))[0] != "" ? (powerValue[k+1].split("("))[0] : "0.0";
												}
												k++;
											}
										}
									}
								}
							}
						}
					}
                }else{
					$scope.isFESwitch=false;
					for(var i=3 ; i<globalArray.length; i++){
						if(globalArray[i] != undefined && globalArray[i] != ""){
							var moduleObject={};
							var powerAvilableObject={};
							var powerUsedObject={};
							var powerRemainingObject={};
							count++;							
							var globalPowerData = (globalArray[i].trim()).replace(/\s+/g,",").split(",");
							if(globalPowerData != undefined && globalPowerData != "" && globalPowerData.length == 4){								
								for(var j=0; j<globalPowerData.length; j++){
									if(j == 0){                                        											
										moduleObject.module="Switch "+globalPowerData[j];										
										switchViewData.module[moduleIndex]=moduleObject;
										moduleIndex++;
									}else if(j == 1){										
										powerAvilableObject.available=globalPowerData[j];										
										switchViewData.available[avilableIndex]=powerAvilableObject;
										avilableIndex++;
									}else if(j == 2){										
										powerUsedObject.used=globalPowerData[j];										
										switchViewData.used[usedIndex]=powerUsedObject;
										usedIndex++;
									}else if(j == 3){										
										powerRemainingObject.remaining=globalPowerData[j];										
										switchViewData.remaining[remainingIndex]=powerRemainingObject;																				
										remainingIndex++;										
									}
								}
								if(count == 5){
									masterViewData.masterData[masterViewIndex]=switchViewData;
									masterViewIndex++;
									switchViewData={};
									remainingIndex=0;
									usedIndex=0;
									avilableIndex=0;
									moduleIndex=0;
									count=0;
									switchViewData.module=[];
									switchViewData.available=[];
									switchViewData.used=[];
									switchViewData.remaining=[];																		
								}
								
							
							}
							
						
						}
					}					
					if(count !=5 && count >0){
						masterViewData.masterData[masterViewIndex]=switchViewData;
						switchViewData={};
						remainingIndex=0;
						usedIndex=0;
						avilableIndex=0;
						moduleIndex=0;
						count=0;
						switchViewData.module=[];
						switchViewData.available=[];
						switchViewData.used=[];
						switchViewData.remaining=[];					    						
					}
					$scope.switchData = masterViewData;
					
                }					
				
			}
			if($scope.isIESwitch){
				var poePortStatusCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show env power");
				if(poePortStatusCLIOP[0] != undefined && poePortStatusCLIOP[0] != ""){				
					if(poePortStatusCLIOP[0].indexOf("SW") != -1 && poePortStatusCLIOP[0].indexOf("PID") != -1 && poePortStatusCLIOP[0].indexOf("Pwr") != -1){
						var count = 1;
						var portstatus = poePortStatusCLIOP[0].split("SW")[1].split("\n");
						for(var i=2 ; i<portstatus.length ; i++){
							if(portstatus[i].indexOf("Not Present") != -1 && count == 1){
								$scope.psu1 = true;
								$scope.getPSUStatusAndText("NOTPRESENT");								
								count++;
							}else if(portstatus[i].indexOf("Not Present") == -1 && count == 1){
								var fAry = (portstatus[i].trim()).replace(/\s+/g,",").split(",");
								if(fAry.length == 7){
									if(fAry[3] != undefined && fAry[3] != ""){
										$scope.psu1 = true;
										if(fAry[3].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(fAry[3].trim() == "Disabled" || fAry[3].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}									
								}else if(fAry.length == 8){
									if(fAry[4] != undefined && fAry[4] != ""){
										$scope.psu1 = true;
										if(fAry[4].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(fAry[4].trim() == "Disabled" || fAry[4].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}
								}								
								count++;
							}
							if(portstatus[i].indexOf("Not Present") != -1 && count == 2){
								$scope.psu2 = true;
								$scope.getPSUStatusAndText("NOTPRESENT");								
							}else if(portstatus[i].indexOf("Not Present") == -1 && count == 2){
								var sAry = (portstatus[i].trim()).replace(/\s+/g,",").split(",");
								if(sAry.length == 7){
									if(sAry[3] != undefined && sAry[3] != ""){
										$scope.psu2 = true;
										if(sAry[3].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(sAry[3].trim() == "Disabled" || sAry[3].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}									
								}else if(sAry.length == 8){
									if(sAry[4] != undefined && sAry[4] != ""){
										$scope.psu2 = true;
										if(sAry[4].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(sAry[4].trim() == "Disabled" || sAry[4].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}
								}							    
							}
						
						}
					
					}else if(poePortStatusCLIOP[0].indexOf("POWER SUPPLY") != -1){
						var count = 1;
						var portstatus = poePortStatusCLIOP[0].split("\n");
						for(var i=0; i<portstatus.length; i++){
							if(portstatus[i].indexOf("POWER SUPPLY") != -1 && portstatus[i].indexOf("Not Present") != -1 && count == 1){
								$scope.psu1 = true;
								$scope.getPSUStatusAndText("NOTPRESENT");								
								count++;
							}else if(portstatus[i].indexOf("POWER SUPPLY") != -1 && count == 1){
								var fAry = (portstatus[i].trim()).replace(/\s+/g,",").split(",");
								if(fAry.length == 6){
									if(fAry[5] != undefined && fAry[5] != ""){
										$scope.psu1 = true;
										if(fAry[5].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(fAry[5].trim() == "Disabled" || fAry[5].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}									
								}else if(fAry.length == 7){
									if(fAry[6] != undefined && fAry[6] != ""){
										$scope.psu1 = true;
										if(fAry[6].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(fAry[6].trim() == "Disabled" || fAry[6].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}
								}								
								count++;									
							}
							if(portstatus[i].indexOf("POWER SUPPLY") != -1 && portstatus[i].indexOf("Not Present") != -1 && count == 2){
								$scope.psu2 = true;
								$scope.getPSUStatusAndText("NOTPRESENT");								
							}else if(portstatus[i].indexOf("POWER SUPPLY") != -1 && count == 2){
								var sAry = (portstatus[i].trim()).replace(/\s+/g,",").split(",");
								if(sAry.length == 6){
									if(sAry[5] != undefined && sAry[5] != ""){
										$scope.psu2 = true;
										if(sAry[5].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(sAry[5].trim() == "Disabled" || sAry[5].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}									
								}else if(sAry.length == 7){
									if(sAry[6] != undefined && sAry[6] != ""){
										$scope.psu2 = true;
										if(sAry[6].trim() == "OK"){
											$scope.getPSUStatusAndText("POWERUP");
										}else if(sAry[6].trim() == "Disabled" || sAry[6].trim() == "disabled"){
											$scope.getPSUStatusAndText("POWERDOWN");
										}else{
											$scope.getPSUStatusAndText("POWERDOWN");
										}
									}
								}								
							}
						}
					}
				}
		    }
			$scope.getPowerInterfaceData();
		};
		
		$scope.getPSUStatusAndText = function(portStatus) {
			if($scope.psu1){
				switch (portStatus) {
					case 'NOTPRESENT':
									$scope.psu1Status = { color : $scope.psuStatus.NOTPRESENT }
									$scope.psu1StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
					case 'POWERUP':
									$scope.psu1Status = { color : $scope.psuStatus.POWERUP }
									$scope.psu1StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
					case 'POWERDOWN':
									$scope.psu1Status = { color : $scope.psuStatus.POWERDOWN }
									$scope.psu1StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
					default:    
									$scope.psu1Status = { color : $scope.psuStatus.POWERDOWN }
									$scope.psu1StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
				}
			}
			if($scope.psu2){
				switch (portStatus) {
					case 'NOTPRESENT':
									$scope.psu2Status = { color : $scope.psuStatus.NOTPRESENT }
									$scope.psu2StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
					case 'POWERUP':
									$scope.psu2Status = { color : $scope.psuStatus.POWERUP }
									$scope.psu2StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
					case 'POWERDOWN':
									$scope.psu2Status = { color : $scope.psuStatus.POWERDOWN }
									$scope.psu2StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
					default:    
									$scope.psu2Status = { color : $scope.psuStatus.POWERDOWN }
									$scope.psu2StatusText = translate("poe_js_psu_status_" + portStatus);
									break;
				}
			}
            
        }
		
		$scope.getPowerInterfaceData = function(){	
			$timeout(function(){
			var powerStatus = requestRoutingService.getShowCmdOutput("show power inline", "poe");
			$scope.poeInterfaceDataValues = [];
			if(powerStatus.entry.ShowPower.PowerTable.entry.length > 0){				
				for(var i=1 ; i<powerStatus.entry.ShowPower.PowerTable.entry.length; i++){
					$scope.poeInterfaceDataValues.push({
						"interface":powerStatus.entry.ShowPower.PowerTable.entry[i]["interfaceName"] != undefined ? powerStatus.entry.ShowPower.PowerTable.entry[i]["interfaceName"] : "",
						"adminType":$scope.getAdminValue(powerStatus.entry.ShowPower.PowerTable.entry[i]["adminName"]),
						"status":powerStatus.entry.ShowPower.PowerTable.entry[i]["operValue"] != undefined ? powerStatus.entry.ShowPower.PowerTable.entry[i]["operValue"] : "",
						"power":powerStatus.entry.ShowPower.PowerTable.entry[i]["powerValue"] != undefined ? powerStatus.entry.ShowPower.PowerTable.entry[i]["powerValue"] : "",
						"maxPower":powerStatus.entry.ShowPower.PowerTable.entry[i]["maxValue"] != undefined ? powerStatus.entry.ShowPower.PowerTable.entry[i]["maxValue"] : "",
						"device":powerStatus.entry.ShowPower.PowerTable.entry[i]["deviceValue"] != undefined ? powerStatus.entry.ShowPower.PowerTable.entry[i]["deviceValue"] : "",
						"poeClass":powerStatus.entry.ShowPower.PowerTable.entry[i]["classValue"] != undefined ? powerStatus.entry.ShowPower.PowerTable.entry[i]["classValue"] : ""
					})
					
				}
				$scope.poeInterfaceData = new kendo.data.ObservableArray($scope.poeInterfaceDataValues);
				$scope.poeInterfaceDataSource = new kendo.data.DataSource({
					pageSize: 10,
					data: $scope.poeInterfaceData,
					schema: {
						model: {
							fields: {}
						}
					}
				});
				if($scope.poeInterfaceDataValues != undefined && $scope.poeInterfaceDataValues != ""){
					$scope.getDefaultPoEValues($scope.poeInterfaceDataValues);
				}
				
			}
			},100);	
            if($scope.isPoECapable == true){
				angular.element(".btnView").show();
				angular.element(".pageLoader").hide();
			}
			
		};
		
		$scope.getDefaultPoEValues = function(data){
            var totalPort = data.length;
            var wattValue = $scope.UPOE ? 60.0 : 30.0;
            if($scope.globalPower.maxPowerSupported === 0){
                $scope.globalPower.minPowerSupported = 4.0;
                $scope.globalPower.maxPowerSupported = totalPort * wattValue;
            }
            var total = $scope.globalPower.maxPowerSupported + 1;
            $scope.globalPowerRange = $scope.globalPower.minPowerSupported + " - " + total;
            $scope.globalPowerPlaceHolder = $scope.globalPower.minPowerSupported + " - "+ $scope.globalPower.maxPowerSupported;
            $scope.emptyPoEValueMsg = translate("poe_js_empty_poe_value");
            $scope.invalidPoEValueMsg = translate("poe_js_invalid_globalPowerValue") + $scope.globalPowerPlaceHolder;
            $scope.power.min = $scope.maxPower.min = 4.0;
            $scope.power.max = $scope.maxPower.max = wattValue;
            var max = $scope.maxPower.max + 1;
            $scope.maxPower.range = $scope.maxPower.min + " - " + max;
            $scope.maxPower.placeHolder = $scope.maxPower.min + " - " + $scope.maxPower.max;
            $scope.emptyPowerMsg = translate("poe_js_empty_power_value");
            $scope.emptyMaxPowerMsg = translate("poe_js_empty_maxPower_value")
            $scope.invalidPowerMsg = translate("poe_js_invalid_powerValue") + $scope.maxPower.placeHolder;
            $scope.invalidMaxPowerMsg = translate("poe_js_invalid_maxPowerValue") + $scope.maxPower.placeHolder;
        }
	    
		$scope.getAdminValue = function(adminValue){
			var mode = "";
			if(adminValue != undefined && adminValue != "" && adminValue == 'auto'){
				mode = "Auto";
			}else if(adminValue != undefined && adminValue != "" && adminValue == 'static'){
				mode = "Static";
			}else if(adminValue != undefined && adminValue != ""){
				mode = "Disabled";
			}
			return mode;
		}
        
		$scope.showEditTabsOnClick = function(data) {
			var tempAdminType = data.adminType;
            $scope.members = [];
            $scope.selectedPoeInterface = data.interface;
            $scope.isEditWindowOpened = true;
            $scope.poeInterface.interface = data.interface;			
			$scope.poeInterface.adminType = tempAdminType;			
            $scope.poeInterface.status = data.status;
            $scope.poeInterface.power= data.power;
            $scope.poeInterface.maxPower = data.maxPower;
            if ($scope.powerConsumption) { $scope.poeInterface.consumption = data.consumption; }
            $scope.poeInterface.device = data.device;
            $scope.poeInterface.poeClass = data.poeClass;			
            $scope.$broadcast('openEditDialog:poeInterfaceWindow',translate("poe_js_poeInterface_edit") + $scope.selectedPoeInterface);			
        };
		
	    $scope.applyPowerInterface = function() {
            if (!$scope.poeInterfaceFormValidator.validate()) {
                return;
            }            
            $scope.isEditWindowOpened = false;
			var result = "";
			var poeConfigCLI = "";
            $scope.$broadcast("closeAddEditKendoWindow:poeInterfaceWindow");
			if($scope.selectedPoeInterface != undefined && $scope.selectedPoeInterface != ""){
				poeConfigCLI += "interface " + $scope.selectedPoeInterface + "\n";
			}
			if($scope.poeInterface.adminType != undefined && $scope.poeInterface.adminType != ""){
				if($scope.poeInterface.adminType == "Disabled"){
					poeConfigCLI += "power inline never\n";
				}else if($scope.poeInterface.adminType == "Auto" && $scope.poeInterface.maxPower != undefined && $scope.poeInterface.maxPower != ""){
					poeConfigCLI += "power inline auto max " + ($scope.poeInterface.maxPower)*1000 + "\n";
				}else if($scope.poeInterface.adminType == "Static" && $scope.poeInterface.power != undefined && $scope.poeInterface.power != ""){
					poeConfigCLI += "power inline static max " + ($scope.poeInterface.power)*1000 + "\n";
				}
				poeConfigCLI +="end";
			}
			
			if(poeConfigCLI != undefined && poeConfigCLI != ""){
				var result = requestRoutingService.getConfigCmdOutput(poeConfigCLI);
				if(result==""){
					notificationService.showNotification(translate('poe_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			poeConfigCLI = "";
			$scope.getGlobalPowerData();            
        };
		
		$scope.onCancel = function() {
			$scope.poeInterfaceFormValidator.hideMessages();
		}
		
        $scope.getGlobalPowerData();
		$scope.validateMode();
		//$scope.getPowerInterfaceData();
		
	}]);
