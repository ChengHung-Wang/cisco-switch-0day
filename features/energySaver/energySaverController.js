/**
 Description: EnergySaver Controller
 Copyright (c) 2017 by Cisco Systems, Inc.
 All rights reserved.
 */
 'use strict';
 app.register.controller('energyCtrl', ['$scope', 'dataSourceService','$filter','validationService','dialogService','$timeout','gridCrudService','requestRoutingService','executeCliCmdService','$rootScope','getStringLineService','notificationService',
	function($scope, dataSourceService,$filter,validationService,dialogService,$timeout,gridCrudService,requestRoutingService,executeCliCmdService,$rootScope,getStringLineService,notificationService) {
		   var translate = $filter("translate");
		   $rootScope.portNumIdentity = ""; // To Reset port selection in switches
		 //Start Code for Client Tab
			var showCDPDetails;
	        var showLldpDetails;
			$scope.esView = false;
			angular.element(".pageLoader").show();
	        var remove_duplicates = function(showCDPDetails, showLldpDetails) {
				for (var i in showCDPDetails) {
	                 for (var j in showLldpDetails) {
	                	 if(showLldpDetails[j].ClientName == showCDPDetails[i].ClientName || showLldpDetails[j].SwitchPort == showCDPDetails[i].SwitchPort){
	                         showLldpDetails.splice(j, 1);
	                         break;
	                      }
	                 }
	            }
	            if (typeof showLldpDetails == "object") {
	            	  if(showLldpDetails!=""){
						 showCDPDetails = showCDPDetails.concat(showLldpDetails);
					  }
	            }
	            return showCDPDetails;
	        }
	        $scope.showCDP = function(){
	        	showCDPDetails = requestRoutingService.getShowCmdOutput("show cdp neighbors detail", "clientsShowCdpNeighborsDetail");
	            if(angular.isUndefined(showCDPDetails.showCdpNeighborsDetail.wnwebdata)){
	                showCDPDetails = undefined;
	            }else if(!angular.isArray(showCDPDetails.showCdpNeighborsDetail.wnwebdata)){
	                showCDPDetails = [showCDPDetails.showCdpNeighborsDetail.wnwebdata];
	            }else{
	                showCDPDetails = showCDPDetails.showCdpNeighborsDetail.wnwebdata;
	            }
	            showLldpDetails = requestRoutingService.getShowCmdOutput("show lldp neighbors detail", "clientsShowLldpNeighborsDetail");
	            if(angular.isUndefined(showLldpDetails.showLldpNeighborsDetail.wnwebdata)){
	                showLldpDetails = undefined;
	            }else if(!angular.isArray(showLldpDetails.showLldpNeighborsDetail.wnwebdata)){
	                showLldpDetails = [showLldpDetails.showLldpNeighborsDetail.wnwebdata];
	            }else{
	                showLldpDetails = showLldpDetails.showLldpNeighborsDetail.wnwebdata;
	            }
	            if(showLldpDetails==undefined){
	            	showLldpDetails = [];
	            }
	           	var deviceInterfaceLldp=null;
	           	for (var Lldp in showLldpDetails) {
					if (showLldpDetails.hasOwnProperty(Lldp)) {
						if(showLldpDetails[Lldp].hasOwnProperty('ClientName')){
							showLldpDetails[Lldp].ClientName = showLldpDetails[Lldp].ClientName.replace('.', "");
						}
						deviceInterfaceLldp=showLldpDetails[Lldp].SwitchPort
						if(deviceInterfaceLldp.indexOf("Te")!=-1){
							deviceInterfaceLldp=deviceInterfaceLldp.replace("Te", "TenGigabitEthernet");
						}else if(deviceInterfaceLldp.indexOf("Gi")!=-1){
							deviceInterfaceLldp=deviceInterfaceLldp.replace("Gi", "GigabitEthernet");
						}else if(deviceInterfaceLldp.indexOf("Fa")!=-1){
							deviceInterfaceLldp=deviceInterfaceLldp.replace("Fa","FastEthernet");
						}
						showLldpDetails[Lldp].SwitchPort = deviceInterfaceLldp;
					}
				}
	           	if(typeof showCDPDetails != "object") {
	                showCDPDetails = showLldpDetails;
	            } else {
	               showCDPDetails =  remove_duplicates(showCDPDetails, showLldpDetails);
	            }
				showCDPDetails = $filter("filter")(showCDPDetails);
	            var showDeviceClassifier =requestRoutingService.getShowCmdOutput("show device classifier attached", "clientsShowDeviceClassifierAttached");
				if (typeof showDeviceClassifier == "object" && !showDeviceClassifier.length){
	                showDeviceClassifier = [showDeviceClassifier];
	            }
	            if(showDeviceClassifier[0].showDeviceClassifierAttached.wnwebdata!='')
	            {
	                showDeviceClassifier = showDeviceClassifier[0].showDeviceClassifierAttached.wnwebdata.entry;
	                showDeviceClassifier.pop();
	                showDeviceClassifier.shift();
	                showDeviceClassifier = $filter("filter")(showDeviceClassifier);
	            }else{
	                showDeviceClassifier = showDeviceClassifier[0].showDeviceClassifierAttached.wnwebdata;
	            }
	            for (var i in showCDPDetails) {
	              if(showCDPDetails[i].hasOwnProperty("Capabilities")){
	                var deviceInterface=null;
	                for (var j in showDeviceClassifier) {
						if (showDeviceClassifier.hasOwnProperty(j)) {
							deviceInterface=showCDPDetails[i].SwitchPort;
							if(deviceInterface.indexOf("TenGigabitEthernet")!=-1){
								deviceInterface=deviceInterface.replace("TenGigabitEthernet","Te")
							}else if(deviceInterface.indexOf("GigabitEthernet")!=-1){
								deviceInterface=deviceInterface.replace("GigabitEthernet","Gi")
							}else if(deviceInterface.indexOf("FastEthernet")!=-1){
								deviceInterface=deviceInterface.replace("FastEthernet","Fa")
							}
							if (deviceInterface == showDeviceClassifier[j].SwitchPort && showCDPDetails[i].Manufacturer == showDeviceClassifier[j].Manufacturer){
								showCDPDetails[i].MAC = showDeviceClassifier[j].MAC;
							}
						}
	                }
	             }
	            }
	            var appleClient = 0;
	            if(showCDPDetails != undefined){
	            	appleClient= showCDPDetails.length;
	            } else {
	            	showCDPDetails = [];
	            }
	            var deviceInterface1=null;
	            for (var i in showDeviceClassifier) {
	            	if(showDeviceClassifier[i].hasOwnProperty("Manufacturer")){
		            	if(showDeviceClassifier[i].Manufacturer.indexOf("APPLE")!=-1){
		            		showCDPDetails[appleClient]={};
			            	showCDPDetails[appleClient].MAC = showDeviceClassifier[i].MAC;
			            	deviceInterface1=showDeviceClassifier[i].SwitchPort;
		                	showCDPDetails[appleClient].SwitchPort = deviceInterface1;
			            	showCDPDetails[appleClient].ClientName = showDeviceClassifier[i].ClientName;
			            	showCDPDetails[appleClient].Manufacturer = showDeviceClassifier[i].Manufacturer;
			            	appleClient++;
		            	}
	            	}
	            }
	            showCDPDetails = appleCheck(showCDPDetails, showDeviceClassifier);
	        }
	        function appleCheck(showCDPDetails, showDeviceClassifier){
	            for(var appleC = 0; appleC < showCDPDetails.length; appleC++){
	                if(showCDPDetails[appleC].hasOwnProperty("Manufacturer") ){
	                    var appleCount = 0;
	                    for (var i in showDeviceClassifier) {
	                        if(showCDPDetails[appleC] && (showDeviceClassifier[i].SwitchPort == showCDPDetails[appleC].SwitchPort)){
	                                appleCount++;
	                                if(appleCount > 1){
	                                    showCDPDetails.splice(appleC, 1);
	                                    appleCount = 0;
	                                }
	                        }
	                    }
	                }else{
	                    // Just adding non apple client
	                }
	            }
	            return showCDPDetails;
	        }
//End Code for Client Tab
//Start Code for Port Tab
			$scope.diableESApplyButton=true;
			$scope.diableESCancelButton=true;
			var esHstatus="",eeeHstatus="",interfaceHStatusInfo=[],eeeStatuschanged=false,interfaceList=[];
		//Getting List of Available interface
				var intListCLI="show ip interface brief\n show interfaces status\n";
	            var interfaceListOP = deviceCommunicatorCLI.getExecCmdOutput(intListCLI);
	      		var showInterfaceStatusList=[];
	    		var arrIterfaceStatus=interfaceListOP[1].split("\n");
	     		for (var i=1; i < arrIterfaceStatus.length; i++) {
	       			if(arrIterfaceStatus[i].indexOf("Not Present")==-1){
	     				var portsObj = {};
	         			var interfaceName= arrIterfaceStatus[i].substring(0,8).trim();
	           			if(interfaceName.indexOf("Po") == -1){
	         				portsObj["portName"] = interfaceName;
	         				showInterfaceStatusList.push(portsObj);
						}
	     			}
	     		}
	   	//Loading ES main function
		    var interfaceStatusInfo=[];
			$scope.LoadPortDetails=function(){
				//ES domain details
				interfaceStatusInfo=[];
				var energyDomainCLI="show energywise domain\n show running-config | s interface\n";
	            var energyDomainOP = deviceCommunicatorCLI.getExecCmdOutput(energyDomainCLI);
	            if(energyDomainOP[0].indexOf("EnergyWise is Disabled")!=-1){
			    	$scope.domainStatus = translate("com_disable");
			    	esHstatus=translate("com_disable");
			    }else{
			    	$scope.domainStatus = translate("com_enable");
			    	esHstatus=translate("com_enable");
			    }
	    	//EEE availabale interfaces
	            var allInterfaceConfigList=[];
	            var interfacesRunningConfig=energyDomainOP[1].split("interface");
	            for(var irc = 1; irc < interfacesRunningConfig.length; irc++){
	            	var deviceInterface="";
	                var intShowRun="interface "+interfacesRunningConfig[irc];
	                var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
	    			if(interfaceName.indexOf("Port") != -1 || interfaceName.indexOf("Vlan") != -1 || interfaceName.indexOf("Bluetooth") != -1 || interfaceName.indexOf("Loopback") != -1 || interfaceName=="FastEthernet0"){
						continue;
					}
	    			if(interfaceName.indexOf("TenGigabitEthernet")!=-1){
                		deviceInterface=interfaceName.replace("TenGigabitEthernet","Te");
                	}else if(interfaceName.indexOf("GigabitEthernet")!=-1){
                		deviceInterface=interfaceName.replace("GigabitEthernet","Gi");
                	}else if(interfaceName.indexOf("FastEthernet")!=-1){
                		deviceInterface=interfaceName.replace("FastEthernet","Fa");
                	}else if(interfaceName.indexOf("Port-channel")!=-1){
                		deviceInterface=interfaceName.replace("Port-channel","Po");
                	}
	    			var interfaceIndex = showInterfaceStatusList.map(function(e) {
	                    return e.portName;
	                }).indexOf(deviceInterface);
	    			if(interfaceIndex!=-1){
	    				var portsObj = {};
	    				portsObj["portName"]=interfaceName;
		    			portsObj["showRun"]=intShowRun;
		    			allInterfaceConfigList.push(portsObj);
	    			}
	            }
				var interfaceEEECli = "";
		   		for (var i=0; i < allInterfaceConfigList.length; i++) {
	       				var portsObj = {};
						portsObj["showRunConf"]= allInterfaceConfigList[i].showRun;
						portsObj["Port"] = allInterfaceConfigList[i].portName;
						portsObj["macAddress"] = "None";
						portsObj["macId"] = "mac"+i;
						portsObj["macspinId"] = "macspin"+i;
						interfaceStatusInfo.push(portsObj)
	    	    }
	    		//EEE Status of interface
	    		var eeeEnableStatusCount=0;
	    		for (var i=0; i < interfaceStatusInfo.length; i++) {
					var eeeStatus = false;
					if(interfaceStatusInfo[i].showRunConf.indexOf("no power efficient-ethernet") != -1){
						eeeStatus = false;
					}else{
						eeeStatus = true;
						eeeEnableStatusCount++;
					}
	                interfaceStatusInfo[i].eeeStatus = eeeStatus;
	                interfaceStatusInfo[i].eeeStatusId ="eeeStatusId"+i;
					interfaceStatusInfo[i].eeeStatusSpinId ="eeeStatusSpinId"+i;
					interfaceStatusInfo[i].eeeStatuschanged = eeeStatuschanged;
	            }
	    		if(interfaceStatusInfo.length==eeeEnableStatusCount){
			    	$scope.eeeGStatus = translate("com_enable");
			    	eeeHstatus=translate("com_enable");
			    }else{
			    	$scope.eeeGStatus = translate("com_disable");
			    	eeeHstatus=translate("com_disable");
			    }
	    		
	    		//Client MAC address details
	            for (var i=0; i <interfaceStatusInfo.length; i++) {
	            	for (var j=0; j <showCDPDetails.length; j++) {
	            		if(interfaceStatusInfo[i].Port==showCDPDetails[j].SwitchPort){
	            			if(showCDPDetails[j].MAC){
	            				 interfaceStatusInfo[i].macAddress = showCDPDetails[j].MAC;
	            			}
	            		}
	            	}
	            }
	            interfaceHStatusInfo=interfaceStatusInfo;
				angular.element(".pageLoader").hide();
				$scope.esView = true;
	       }
		   $scope.portsGridOptions = {
				    editable: false,
		            sortable: true,
		            reorderable: true,
		            scrollable: false,
		            selectable: true,
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
		                previousNext: true,
		                info: true,
		                refresh: true,
		                pageSizes: gridCrudService.grid_page_sizes,
		                buttonCount: 5
		            },
		            columns: [
			                    {
									field: "Port",
									title: translate("portconfig_general_interface")
								},
								{
									field: "macId",
									hidden:true
								},
								{
									field: "macspinId",
									hidden:true
								},
								{
									field: "eeeStatusId",
									hidden:true
								},
								{
									field: "eeeStatusSpinId",
									hidden:true
								},
								{
									field: "eeeStatuschanged",
									hidden:true
								},
								{
									field: "macAddress",
									template: "#if (macAddress == 'None') { # <i class='' id='#= macspinId #'></i><img src='../resources/images/play_icon_off.png' width='20' id='#= macId #' class='noPointer' ng-click=\"sendWOL('#= macId #','#= macAddress #','#= macspinId #')\" /> # }else{# <i class='' id='#= macspinId #'></i><img src='../resources/images/play_icon_on.png' width='20' class='' id='#= macId #' ng-click=\"sendWOL('#= macId #','#= macAddress #','#= macspinId #')\" /> #} #",
									title: "WOL"
								},
								{
									field: "eeeStatus",
									template: "#if (eeeStatuschanged == true) { if (eeeStatus == true) { # <img src='../resources/images/switchon_icon.png' width='20' class='imgDisabled'/> # } else{# <img src='../resources/images/switchoff_icon.png' width='20' class='imgDisabled' /> #}} else { if (eeeStatus == true) { # <i class='' id='#= eeeStatusSpinId #'></i><img src='../resources/images/switchon_icon.png' id='#= eeeStatusId #' width='20' class='' ng-click=\"setEEE(0,'#= Port #','#= eeeStatusId #','#= eeeStatusSpinId #')\" /> # } else{# <i class='' id='#= eeeStatusSpinId #'></i><img src='../resources/images/switchoff_icon.png' class='' id='#= eeeStatusId #' width='20' ng-click=\"setEEE(1,'#= Port #','#= eeeStatusId #','#= eeeStatusSpinId #')\" /> #}} #",
									title: "EEE"
								}
							]
		};
		// Manual refresh the kendo ui grid table
		$scope.manualGridRefresh = function() {
			 for (var i=0; i < interfaceStatusInfo.length; i++) {
				interfaceStatusInfo[i].eeeStatuschanged = eeeStatuschanged;
             }
		     $timeout(function(){
		     	var grid = angular.element("#portsGrid").data("kendoGrid");
		        $scope.formGridData = new kendo.data.ObservableArray(interfaceStatusInfo);
		        $scope.portsDataSource = new kendo.data.DataSource({
		               pageSize: 10,
		               data: $scope.formGridData
		        });
		        grid.dataSource = $scope.portsDataSource;
		        $scope.portsDataSource.read();
		        grid.refresh();
		     },100);
		}
	   //Init load
		$timeout(function(){
		   $scope.showCDP();
		   $scope.LoadPortDetails();
		   $scope.manualGridRefresh();
		},10);
       //WOL Code Start
		$scope.sendWOL=function(macId,macAddress,macspinId){
			if(macAddress!="None" && $scope.domainStatus == translate("com_enable")){
				angular.element("#"+macId).hide();
				angular.element("#"+macspinId).attr("class", "fa fa-refresh fa-spin spinCust");
				 $timeout(function(){
					 var showWOL = requestRoutingService.getShowCmdOutput("energywise query importance 1 name * wol mac "+macAddress+"");
					 notificationService.showNotification(showWOL,translate('wol_success_title'),'success');
					 angular.element("#"+macspinId).attr("class", "");
					 angular.element("#"+macId).show();
					 angular.element("#"+macId).attr("src", "../resources/images/play_icon_on.png");
				 },100);
			}
		}
	   //WOL Code End
	   //EEE Code Start
		$scope.setEEE=function(status,interfaceName,eeeStatusId,eeeStatusSpinId){
		    angular.element("#"+eeeStatusId).hide();
		    angular.element("#"+eeeStatusSpinId).attr("class", "fa fa-refresh fa-spin spinCust");
			 $timeout(function(){
				 var configEEECLI="";
					configEEECLI="interface "+interfaceName+"\n";
					if(status==0){
						configEEECLI+="no power efficient-ethernet auto \n"
					}else{
						configEEECLI+="power efficient-ethernet auto \n"
					}
					var result = requestRoutingService.getConfigCmdOutput(configEEECLI);
					 if(result==""){
		               notificationService.showNotification(translate('eee_success_msg'),translate('com_config_success_title'),'success');
		           }else{
		               notificationService.showNotification(result,translate('com_config_fail_title'),'error');
		           }
				   $scope.cancelESGlobalConfig();
			 },100);
		}
	   //EEE CODE End
		$scope.applyESPorts = function(evt){
			$scope.diableESCancelButton = true;
			evt=evt.target;
			angular.element(evt).button('loading');
            $scope.showTick = false;
            $timeout(function(){
				var statusCli = "";
				if(esHstatus!=$scope.domainStatus){
					if($scope.domainStatus == translate("com_enable")){
						statusCli += "energywise domain cisco security shared-secret 0 cisco \n";
					}else{
						statusCli += "no energywise domain \n";
					}
				}
				if(eeeHstatus!=$scope.eeeGStatus || eeeStatuschanged==true){
					if($scope.eeeGStatus == translate("com_enable")){
						for (var i=0; i < interfaceHStatusInfo.length; i++) {
							statusCli +="interface "+interfaceHStatusInfo[i].Port+" \n";
							statusCli +="power efficient-ethernet auto \n";
						}
					}else{
						for (var i=0; i < interfaceHStatusInfo.length; i++) {
							statusCli +="interface "+interfaceHStatusInfo[i].Port+" \n";
							statusCli +="no power efficient-ethernet auto \n";
						}
					}
				}
				if(statusCli!=""){
					var result = requestRoutingService.getConfigCmdOutput(statusCli);
					if(result==""){
		                    notificationService.showNotification(translate('es_success_msg'),translate('com_config_success_title'),'success');
		            }else{
		                    notificationService.showNotification(result,translate('com_config_fail_title'),'error');
		            }
			 }
			 angular.element(evt).button('reset');
             $scope.showTick = true;
          	 $scope.cancelESGlobalConfig();
          },50);
	 }
	//Cancel action code
		$scope.esGlobalStatusChange = function(){
			if(esHstatus != $scope.domainStatus){
				$scope.diableESApplyButton = false;
				$scope.diableESCancelButton = false;
			}else{
				$scope.diableESApplyButton = true;
				$scope.diableESCancelButton = true;
			}
		}
		$scope.eeeGlobalStatusOnChange = function(){
			$scope.diableESApplyButton = false;
			$scope.diableESCancelButton = false;
			eeeStatuschanged=true;
			$scope.manualGridRefresh();
		}
		$scope.cancelESGlobalConfig = function(){
			eeeStatuschanged=false;
			$scope.LoadPortDetails();
			$scope.manualGridRefresh();
			$timeout(function(){
				$scope.diableESApplyButton = true;
				$scope.diableESCancelButton = true;
			},200);
		}
		 $scope.$on('portSelected', function(event, args) {
            var selectedPort = args.object;
             //Select the port in the grid
            if(selectedPort!=null) {
 				var nIndex;
 				angular.forEach($scope.portsGrid._data, function($value,$index){
 					var allElement = $scope.portsGrid.tbody[0].childNodes[$index];
					var deviceInterface= $value.Port;
					if(deviceInterface.indexOf("TenGigabitEthernet")!=-1){
						deviceInterface=deviceInterface.replace("TenGigabitEthernet","Te")
					} else if(deviceInterface.indexOf("GigabitEthernet")!=-1){
						deviceInterface=deviceInterface.replace("GigabitEthernet","Gi")
					}else if(deviceInterface.indexOf("FastEthernet")!=-1){
						deviceInterface=deviceInterface.replace("FastEthernet","Fa")
					}else if(deviceInterface.indexOf("Port-channel")!=-1){
						deviceInterface=deviceInterface.replace("Port-channel","Po")
					}
 					angular.element(allElement).removeClass("k-state-selected");
 					if(deviceInterface == selectedPort.uniqueId){
 						nIndex = $index;
 						var curElement = $scope.portsGrid.tbody[0].childNodes[nIndex];
 						angular.element(curElement).addClass("k-state-selected");
 					}
 				});
            }
            else{
            	$scope.currentPort = "";
				$rootScope.portNumIdentity = "";
            }
        });
 //End Code for Port Tab
		$scope.es = {};
 //customizing energywise domain start
		$scope.showEnergy = function(){
			$scope.energy = {};
			$scope.es.domainName = null;
			$scope.sharedSecret = null;
			$scope.energyValue = null;
			$scope.es.energyNameText = null;
			$scope.es.portnoValue = null;
			$scope.energy.domainip = "";
			$scope.domaininterface1 = null;
			$scope.$broadcast('openAddDialog:esGridWindow', translate('es_config_domain_edit_title'));
			angular.element("#esForm span.k-tooltip-validation").hide();
			$scope.loadeEnergywiseDomain();
		}
		var trimVal=$filter('trimValue');
		$scope.esValidations = {
			rules : {
				validateip : function(input) {
					if (input.val()){
						if (angular.isUndefined(input.data('validateIp'))) {
							return true;
						}if (validationService.validateIPAddress(input)) {
							return true;
						}
						else {
							return false;
						}
					}
					return true;
				},
				port: function(input){
					var valMsg = input.data('portMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if($scope.energywiseRoute == null || $scope.energywiseRoute == "None"){
						return true;
					}else{
						if(input.val() == "") {
							return false;
						}
					}
					return true;
				},
				range: function (input) {
					if(input.val()){
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
				}
			}
		};

		angular.extend($scope, {
			sharedSecret: null,
			DopwdValue: null,
			energyValue: null,
			energywiseRoute:null,
			interfaceDomainData:null
		});
		$scope.loadEnergywiseData = function(){
			$timeout(function(){
				$scope.interfaceData = dataSourceService.interfaceData();
				$scope.sharedSecret = $scope.interfaceData.options.data[0].interfaceValue;
				$scope.pwdData = dataSourceService.pwdData();
				$scope.energyValue = $scope.pwdData.options.data[0].pwdValue;
				$scope.energywiseData = dataSourceService.energywiseData();
				$scope.energywiseRoute = $scope.energywiseData.options.data[0].energywiseValue;
			}, 1000);
		}
		$scope.applyDomainPopup = function(){
			if ($scope.esValidator.validate()) {
				var domainCli = "";
				if($scope.es.domainName && $scope.es.domainName != ""){
					domainCli += "energywise domain "+ $scope.es.domainName +" ";
				}
				if($scope.sharedSecret && $scope.sharedSecret != ""){
					domainCli += "security "+ $scope.sharedSecret + " ";
				}
				if($scope.energyValue && $scope.energyValue != ""){
					domainCli += $scope.energyValue + " ";
				}
				if($scope.es.energyNameText && $scope.es.energyNameText != ""){
					domainCli += $scope.es.energyNameText + " ";
				}
				if($scope.es.portnoValue && $scope.es.portnoValue != ""){
					domainCli += "protocol udp port "+ $scope.es.portnoValue + " ";
					if($scope.energywiseRoute && $scope.energywiseRoute == "interface"){
						domainCli += "interface "+ $scope.domaininterface1 + " \n";
					}
					if($scope.energywiseRoute && $scope.energywiseRoute == "ip"){
						domainCli += "ip "+ $scope.energy.domainip + " \n";
					}
				}
				domainCli += "\n exit \n";
				var result = requestRoutingService.getConfigCmdOutput(domainCli);
				 if(result==""){
                    notificationService.showNotification(translate('es_config_success_msg'),translate('com_config_success_title'),'success');
                }else{
                    notificationService.showNotification(result,translate('com_config_fail_title'),'error');
                }
				$scope.diableApplyButton = true;
				$scope.cancelButton = true;
				$scope.loadeEnergywiseDomain();
			}
		}
		$scope.loadeEnergywiseDomain = function(){
		    var domainCLI="show running-config partition common | in energywise domain\n";
            var domainCLIOP = deviceCommunicatorCLI.getExecCmdOutput(domainCLI);
			var interfaceOptions=[];
			var showSRBrList=interfaceListOP[0].split("\n");
			if(showSRBrList){
				for (var i=1; i < showSRBrList.length; i++) {
					var interfaceName= showSRBrList[i].substring(0,22).trim();
					interfaceOptions.push({
						"interfaceDomainDataName": interfaceName,
						"interfaceDomainDataValue": interfaceName
					});
				}
			}
			$scope.interfaceDomainData = new kendo.data.ObservableArray(interfaceOptions);
			$scope.staticRoutingGridData = new kendo.data.ObservableArray([]);
			var strCLIOutput1 = domainCLIOP[0];
			var findEnergyDomain = strCLIOutput1.split(" ");
			if(findEnergyDomain.length > 1){
				$scope.domainStatus = translate("com_enable");
				esHstatus=translate("com_enable");
				$scope.es.domainName = findEnergyDomain[2];
				$scope.sharedSecret = findEnergyDomain[4];
				$scope.energyValue = findEnergyDomain[5];
				$scope.es.energyNameText = findEnergyDomain[6];
				$scope.es.portnoValue = findEnergyDomain[10];
				$scope.energywiseRoute = findEnergyDomain[11];
				if($scope.energywiseRoute == "ip"){
					$scope.energy.domainip = findEnergyDomain[12];
				}else if($scope.energywiseRoute == "interface"){
					$scope.domaininterface1 = findEnergyDomain[12];
				}else{
					$scope.energywiseRoute = $scope.energywiseData.options.data[0].energywiseValue;
				}
			}else{
				$scope.domainStatus = translate("com_disable");
				esHstatus=translate("com_disable");
				$scope.es.domainName = null;
				$scope.sharedSecret = $scope.interfaceData.options.data[0].interfaceValue;
				$scope.energyValue =  $scope.pwdData.options.data[0].pwdValue;
				$scope.es.energyNameText = null;
				$scope.es.portnoValue = null;
				$scope.energy.domainip = "";
				$scope.energywiseRoute = $scope.energywiseData.options.data[0].energywiseValue;
				$scope.domaininterface1 = null;
			}
		}
	// customizing energywise domain end
	// clients page start
			$scope.PowerLevel = null;
			$scope.communityAccessModeOptions = [translate("poe_full"),translate("poe_sleep"),translate("poe_hibernate"),translate("poe_shut")];
			$scope.clientsGridOptions = {
					sortable : true,
					scrollable : false,
					selectable : true,
					editable:true,
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
					columns : [
						{
							field: "ClientName",
							title: translate("es_clients")
						},
						{
							field: "SwitchPort",
							title: translate("ports_monitoring_description_switchport")
						},
						{
							field: "PowerLevel",
							title: translate("es_powerlevel"),
							attributes: {style: "cursor:pointer"},
							editor: function (container, options) {
								container.append(angular.element('<select kendo-drop-down-list="PowerLevel" ng-model="PowerLevel" name="PowerLevelName" id="PowerLevelID" k-data-source="communityAccessModeOptions" k-on-change="getPoeValue('+options.field+')" data-bind="value:'+options.field+' "></select>'));
							}
						}
					]
				};

	var	lastPoeValue = "";
	$scope.getPoeValue = function(changeVal){
		$scope.diableApplyButton = false;
		$scope.cancelButton = false;
		lastPoeValue = changeVal;
		if($scope.clientsApplyAll){
			$scope.checkApplyAll();
		}
	}
	$scope.diableApplyButton = true;
	$scope.cancelButton = true;
	$scope.checkApplyAll = function(){
		if(lastPoeValue != "" && $scope.clientsApplyAll){
			$scope.diableApplyButton = false;
			$scope.cancelButton = false;
			for(var c=0;c<$scope.clientsGridData.length;c++){
				$scope.clientsGridData[c].PowerLevel = lastPoeValue;
			}
			$scope.clientsGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.clientsGridData
			});
			lastPoeValue = "";
		}
	}
	$scope.oldClientsGridData = new kendo.data.ObservableArray([]);
	$scope.clientsGridData = new kendo.data.ObservableArray([]);
	var energyHClientStatus = "";
	$scope.loadClientPoe = function(){
			var energyPOEInterfaceCLI="show energywise domain\n",energyPOEInterface =[];
			for (var i=0; i < showCDPDetails.length; i++) {
				energyPOEInterfaceCLI+="show running-config interface "+showCDPDetails[i].SwitchPort+"\n"
			}
			if(energyPOEInterfaceCLI!=""){
				energyPOEInterface = deviceCommunicatorCLI.getExecCmdOutput(energyPOEInterfaceCLI);
			}
		    if(energyPOEInterface[0].indexOf("EnergyWise is Disabled")!=-1){
			    energyHClientStatus=translate("com_disable");
				esHstatus=translate("com_disable");
			}else{
			    energyHClientStatus=translate("com_enable");
				esHstatus=translate("com_enable");
			}
			$scope.clientsGridData = new kendo.data.ObservableArray([]);
			for (var loopVariable = 0; loopVariable < showCDPDetails.length; loopVariable++) {
					var clientData = {
						ClientName: "",
						SwitchPort: "",
						PowerLevel: ""
					}
					clientData.ClientName = showCDPDetails[loopVariable].ClientName;
					clientData.SwitchPort = showCDPDetails[loopVariable].SwitchPort;
					if(energyPOEInterface[parseFloat(loopVariable)+1].indexOf("energywise level") != -1){
							if(energyPOEInterface[parseFloat(loopVariable)+1].indexOf("recurrence") != -1){
								clientData.PowerLevel=getPowerLevelDes(executeCliCmdService.getNextString(energyPOEInterface[parseFloat(loopVariable)+1],["energywise level "],["recurrence"]).trim());
							}else{
								clientData.PowerLevel=getPowerLevelDes(executeCliCmdService.getNextString(energyPOEInterface[parseFloat(loopVariable)+1],["energywise level "],["\n"]).trim());
							}
					}else{
						clientData.PowerLevel=getPowerLevelDes("10");
					}
					$scope.clientsGridData.push(clientData);
			}
			$scope.oldClientsGridData = angular.copy($scope.clientsGridData);
			$scope.diableApplyButton = true;
			$scope.cancelButton = true;
			loadGrid();
	}
	var oneTimeEx = true;
	$scope.loadClientTab = function(){
		if(oneTimeEx){
			oneTimeEx = false;
			$scope.loadClientPoe();
		}
	}
	$scope.keepAliveOnChange = function(){
		if(energyHClientStatus != $scope.domainStatus || esHstatus != $scope.domainStatus){
			$scope.diableApplyButton = false;
			$scope.cancelButton = false;
		}else{
			$scope.diableApplyButton = true;
			$scope.cancelButton = true;
		}
		loadGrid();
	}
	$scope.cancelSwitchConfig = function(){
        $scope.domainStatus = esHstatus;
		$scope.loadClientPoe();
	}
	function loadGrid(){
		var editStatus = true;
		if($scope.domainStatus == translate("com_disable")){
			editStatus = false;
		}
		$timeout(function(){
			var grid = angular.element("#clientsGrid").data("kendoGrid");
			$scope.clientsGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.clientsGridData,
				schema: {
				  model: {
					id: "ClientName",
					fields: {
					  ClientName: {editable:false},
					  SwitchPort: {editable:false},
					  PowerLevel: {editable:editStatus}
					}
				  }
				}
			});
			grid.dataSource = $scope.clientsGridDataSource;
			$scope.clientsGridDataSource.read();
			grid.refresh();
		 },100);
    }
	function getPowerLevelDes(pl){
		var desc = "";
		if(pl == "10"){
			desc = translate("poe_full");
		}else if(pl == "2"){
			desc = translate("poe_sleep");
		}else if(pl == "1"){
			desc = translate("poe_hibernate");
		}else if(pl == "0"){
			desc = translate("poe_shut");
		}else{
			desc = translate("ntp_none");
		}
		return desc;
	}
	function getPowerLevelValue(val){
		var value = "";
		if(val == translate("poe_full")){
			value = "10";
		}else if(val == translate("poe_sleep")){
			value = "2";
		}else if(val == translate("poe_hibernate")){
			value = "1";
		}else if(val == translate("poe_shut")){
			value = "0";
		}else{
			value = translate("ntp_none");
		}
		return value;
	}
	$scope.applyClients = function(){
		var configPowerCLI="";
		var disStatusCount=0;
		if(energyHClientStatus!=$scope.domainStatus){
			if($scope.domainStatus == translate("com_enable")){
				configPowerCLI += "energywise domain cisco security shared-secret 0 cisco \n";
			}else{
				configPowerCLI += "no energywise domain \n";
				disStatusCount++;
			}
		}
		if(disStatusCount==0){
			for(var p=0;p<$scope.clientsGridData.length;p++){
				configPowerCLI +="interface "+$scope.clientsGridData[p].SwitchPort+"\n";
				configPowerCLI +="energywise level "+getPowerLevelValue($scope.clientsGridData[p].PowerLevel)+"\n";
			}
		}
		if(configPowerCLI != ""){
		   var result = requestRoutingService.getConfigCmdOutput(configPowerCLI);
		   if(result==""){
			   notificationService.showNotification(translate('poe_success_msg'),translate('com_config_success_title'),'success');
		   }else{
			   notificationService.showNotification(result,translate('com_config_fail_title'),'error');
		   }
		}
		$scope.diableApplyButton = true;
		$scope.cancelButton = true;
		$scope.loadClientPoe();
	}
	// clients page end
}]);
