/**
 Description: Controller for Netflow
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('netFlowCtrl', ['$scope','$rootScope','$timeout', '$filter', 'gridCrudService','requestRoutingService','dataSourceService','dialogService','notificationService','executeCliCmdService','validationService','getStringLineService',
	function($scope,$rootScope,$timeout, $filter, gridCrudService,requestRoutingService,dataSourceService,dialogService,notificationService,executeCliCmdService,validationService,getStringLineService) {
		var trimVal=$filter('trimValue');
		var translate = $filter("translate");
		var deviceType = $rootScope.deviceInfo.type;
		// $scope Variables are declared using angular.extend method.
		angular.extend($scope, {
			netFlowTemplateDataSource: [{nftText: translate("nft_application"), nftValue:'defaultApplicationTraffic', nftShort:'dat'},
                        {nftText: translate("nft_serverUtil"), nftValue:'defaultServerUtilization', nftShort:'dsu'},
                        {nftText: translate("nft_security"), nftValue:'defaultSecurity', nftShort:'ds'},
                        {nftText: translate("nft_capacityPlan"), nftValue:'defaultCapacityPlanning', nftShort:'dcp'},
                        {nftText: translate("nft_stealthWatch"), nftValue:'defaultStealthWatch', nftShort:'dsw'}],

            samplingMethodDataSource: [{samplingMethodText: translate("nf_sampling_deterministic"), samplingMethodValue:'deterministic'},
                        {samplingMethodText: translate("nf_sampling_random"), samplingMethodValue:'random'}],
            netFlowTemplateType: '',
            switchExportAddType: '',
            samplingMethodType: '',
            inputCapIntType: '',
            samplingMethodRangeType: '',
            collectorIpAddress: '',
            switchExportAddress: [],
            inputCaptureInterface: [],
            samplerMethodRange: [],
            selectedNetFlowMonitorsArray: [],
            monitorUnitName: 'dM',
            countNetFlow: 0,
            diableCreateButton: true,
            diableCancelButton: true,
            enableDeleteBtn: true,
            fullNetFlowSupport:false
		});
		angular.element(".btnView").hide();
		angular.element(".pageLoader").show();
		// Find the current Device
		if(deviceType.indexOf("2960X") != -1 || (deviceType.indexOf("S5960") != -1 && deviceType.indexOf("S5960L") == -1) || deviceType.indexOf("2960XR") != -1 || deviceType.indexOf("3560CX") != -1){
			var fullNetFlow = {samplingMethodText: translate("nf_sampling_fullnetflow"), samplingMethodValue:'fullnetflow'};
			$scope.samplingMethodDataSource.push(fullNetFlow);
			$scope.fullNetFlowSupport = true;
		}
		//validation
        var netFlowFormValidations = angular.element("#netFlowForm").kendoValidator({
            rules: {
                validateip: function (input) {
					if (angular.isUndefined(input.data('validateIp'))) {
						return true;
					}
					var value = input.val();
					if (validationService.validateIpAddress(value) == false && validationService.validateIpv6Address(value) == false) {
						return false;
					}
					else {
						return true;
					}
                },
                dataspace: function (input) {
                    return validationService.validateDataSpace(input);
                },
                check: function (input) {
                    var valMsg = input.data('checkMsg');
                        if ((valMsg==undefined)) {
                            return true;
                        }
                    return validationService.validateCheck(input);
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
        }).data("kendoValidator");

        // The Function to convert Ip Address to Hex Values.
        $scope.convertIpAddressToHex = function(ipAddress){
        	ipAddress = ipAddress.toString();
        	var splitDotFromIpAdd = ipAddress.split('.'), result = "";
        	for(var i = 0; i < splitDotFromIpAdd.length; i++){
        		if(Number(splitDotFromIpAdd[i]) < 15){
        			result += "0";
        		}
        			result += parseInt(splitDotFromIpAdd[i]).toString(16);
        	}
        	return result;
        }
        $scope.netFlowMonitorsGridOptions = {
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
				refresh: false,
                // This page size variable is written in datasourceService.js file.
                pageSizes: gridCrudService.grid_page_sizes,
                buttonCount: 4
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
			scrollable:false,
            selectable: true,
            columns: [
                {
                    "template": "<input type=\"checkbox\"  ng-model=\"checkedNFMonitor\" ng-click=\"isChecked(checkedNFMonitor,dataItem,'Community')\"  />",
                    sortable: false,
                    width: 40
                },
                {
                    field: "SamplerInterFaces",
		            title: translate("nf_interface")
                },
                {
                    field: "NetflowTemplate",
                    title : translate("nf_template")
                },
                {
                    field: "Collector",
                    title : translate("nf_collector")
                },
                {
                    field: "Switch",
                    title : translate("nf_switch")
                },
                {
                    field: "samplingField",
                    title : translate("nf_sampling")
                }
            ]
        };
    //Initial load function for this controller
       $scope.loadGridData = function () {
        	var netFlowCLI="show flow monitor\n show flow interface\n show running-config | section interface\n show flow exporter\n show sampler\n";
        	var netFlowCLIOP = deviceCommunicatorCLI.getExecCmdOutput(netFlowCLI);
           	//Filling the interface drop down
       		var showInterfaces=[];
    		var interfacesRunningConfig=netFlowCLIOP[2].split("interface");
    		for(var i = 1; i < interfacesRunningConfig.length; i++){
    			var intObj={};
    			intShowRun="interface "+interfacesRunningConfig[i];
                arrIntShowRun=	intShowRun.split("\n");
				if( arrIntShowRun[0].indexOf("Ethernet")!=-1 || arrIntShowRun[0].indexOf("Te")!=-1|| arrIntShowRun[0].indexOf("Bluetooth")!=-1 || arrIntShowRun[0].indexOf("Loopback")!=-1 || arrIntShowRun[0].indexOf("Vlan")!=-1){
					intObj["interfaceName"]= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
					intObj["ipAddress"]= executeCliCmdService.getNextString(intShowRun,["ip address"],["\n"]).trim().split(" ")[0];
					showInterfaces.push(intObj);
				}
    		}
    		//Setting show flow exporter list
    		var showFlowExporterList=[];
    		var exporterDetails="";
    		var showFlowOP=netFlowCLIOP[3].split("Flow Exporter");
    		for(var i = 1; i < showFlowOP.length; i++){
    			var expoterObj={};
    			exporterDetails="Flow Exporter "+showFlowOP[i];
    			expoterObj["exporterName"]= executeCliCmdService.getNextString(exporterDetails,["Flow Exporter"],[":"]).trim();
    			expoterObj["collectorIpAddress"]= executeCliCmdService.getNextString(exporterDetails,["Destination IP address:"],["\n"]).trim();
    			expoterObj["switchIpAddress"]= executeCliCmdService.getNextString(exporterDetails,["Source IP address:"],["\n"]).trim();
    			expoterObj["interface"]= executeCliCmdService.getNextString(exporterDetails,["Source Interface:"],["\n"]).trim();
    			showFlowExporterList.push(expoterObj);
    		}
            //Setting show sampler list
            var showSamplerList=[];
            var samplerDetails="";
            var showsamplerOP=netFlowCLIOP[4].split("Sampler");
            for(var i = 1; i < showsamplerOP.length; i++){
                var samplerObj={};
                samplerDetails="Sampler "+showsamplerOP[i];
                samplerObj["samplerName"]= executeCliCmdService.getNextString(samplerDetails,["Sampler"],[":"]).trim();
                samplerObj["samplerType"]= executeCliCmdService.getNextString(samplerDetails,["Type:"],["\n"]).trim();
                showSamplerList.push(samplerObj);
            }
            angular.forEach(showInterfaces, function (inter) {
                if (inter.interfaceName.indexOf("TenGigabitEthernet") != -1) {
                    inter.interfaceName = inter.interfaceName.replace("TenGigabitEthernet", "Te");
                } else if (inter.interfaceName.indexOf("FastEthernet") != -1) {
                    inter.interfaceName = inter.interfaceName.replace("FastEthernet", "Fa");
                } else if (inter.interfaceName.indexOf("GigabitEthernet") != -1) {
                    inter.interfaceName = inter.interfaceName.replace("GigabitEthernet", "Gi");
                } else if (inter.interfaceName.indexOf("Bluetooth") != -1) {
                    inter.interfaceName = inter.interfaceName.replace("Bluetooth", "Bl");
                } else if (inter.interfaceName.indexOf("Loopback") != -1) {
                    inter.interfaceName = inter.interfaceName.replace("Loopback", "Lo");
                }
                if(inter.ipAddress != 'unassigned' && inter.ipAddress != ""){
    				var switchExportAddress = {
        				"text": inter.interfaceName+"_"+inter.ipAddress,
        				"ipAddress":inter.ipAddress,
        				"name":inter.interfaceName
        			};
                    $scope.switchExportAddress.push(switchExportAddress);
    			}
                $scope.inputCaptureInterface.push(inter);
    		});
    		var min = 32, max = 1032;
    		for (var i = min; i <= max; i++) {
    			$scope.samplerMethodRange.push(""+i);
    		}
	        $scope.netFlowMonitorsGridData = new kendo.data.ObservableArray([]);
	        //show flow monitor
	        var showFlowInterface = "";
	        var strCLIOutput = netFlowCLIOP[0];
	        var START_FLOW_MONITOR = ["Flow Monitor "];
	        var START_FLOW_RECORD = ["Flow Record:"];
            var START_FLOW_EXPORTER = ["Flow Exporter:"];
	        var END_FLOW_MONITOR = [":"];
	        var END_OUTPUT = ["\n"];
	        var arrFlowMonitor=strCLIOutput.split("Flow Monitor");
            showFlowInterface =netFlowCLIOP[1];
            var showFlowIntSamplers = getStringLineService.getLines(showFlowInterface,['traffic(ip): ']);
	        var ipv6Samplers = getStringLineService.getLines(showFlowInterface,['traffic(ipv6): ']);
            showFlowIntSamplers = showFlowIntSamplers.concat(ipv6Samplers);
            var showFlowIntMonitors = getStringLineService.getLines(showFlowInterface,['monitor: ']);
            var netFlowMonitorObj = {};
            var showRunConfigInterface = [];
            $scope.showFlowIntRecords = [];
            //Associated Interface values
            var intStrCLIOutput = netFlowCLIOP[2];
            var showRunConfigSecInterface = intStrCLIOutput.split("interface ");
            for(var inter = 1; inter < showRunConfigSecInterface.length; inter++){
                if(showRunConfigSecInterface[inter].indexOf("ip flow monitor")!=-1){
                    showRunConfigInterface.push(showRunConfigSecInterface[inter]);
                } else if(showRunConfigSecInterface[inter].indexOf("ipv6 flow monitor")!=-1){
                    showRunConfigInterface.push(showRunConfigSecInterface[inter]);
                }
            }
            //Associated Interface values Ends
            for (var i = 1; i < arrFlowMonitor.length; i++) {
	         	var flowMonitor=arrFlowMonitor[i];
	         	flowMonitor="Flow Monitor "+flowMonitor;
	         	var flowMonitorName = executeCliCmdService.getNextString(flowMonitor,START_FLOW_MONITOR,END_FLOW_MONITOR);
	         		flowMonitorName = flowMonitorName.trim();
	         	var flowRecord = executeCliCmdService.getNextString(flowMonitor,START_FLOW_RECORD,END_OUTPUT);
	         		flowRecord = flowRecord.trim();
                var flowExporter = executeCliCmdService.getNextString(flowMonitor,START_FLOW_EXPORTER,END_OUTPUT);
                if(flowExporter !== ""){
                    var flowExporterValue = flowExporter.trim().replace(/ *\([^)]*\) */g, "");
                    for(var shwInt = 0; shwInt < showFlowIntSamplers.length; shwInt++){
			            var showFlowIntSamplerNames = "";
                    	if(showFlowIntSamplers[shwInt].indexOf("traffic(ipv6):") != -1){
                    		showFlowIntSamplerNames = showFlowIntSamplers[shwInt].split("traffic(ipv6):")[1].trim();
                    	} else {
                    		showFlowIntSamplerNames = showFlowIntSamplers[shwInt].split("traffic(ip):")[1].trim();
                    	}
                        var showFlowIntMonitorNames = showFlowIntMonitors[shwInt].split("FNF:  monitor: ")[1].trim();
                        if(showFlowIntMonitorNames === flowMonitorName){
                            if(showFlowIntSamplerNames.indexOf("sampler ")!=-1){
                                var allSamplerNames = showFlowIntSamplerNames.split("sampler")[1].trim();
                                //find the show sampler index which is matched
                                var findSamplerIndex = $filter('filter')(showSamplerList, {"samplerName":allSamplerNames},true);
                                netFlowMonitorObj.Sampling = findSamplerIndex[0].samplerType;
                                netFlowMonitorObj.samplingField = $filter('filter')($scope.samplingMethodDataSource, {"samplingMethodValue":netFlowMonitorObj.Sampling})[0].samplingMethodText;
                                netFlowMonitorObj.SamplerName = allSamplerNames;
                            }else{
                                netFlowMonitorObj.Sampling = "fullnetflow";
                                netFlowMonitorObj.samplingField = $filter('filter')($scope.samplingMethodDataSource, {"samplingMethodValue":netFlowMonitorObj.Sampling})[0].samplingMethodText;
                                netFlowMonitorObj.SamplerName = "";
                            }
                        }
                    }
             		var netFlowTemplateTemp = $filter('filter')($scope.netFlowTemplateDataSource, {"nftValue":flowRecord});
                    //find the showflow expoter index which is matching with the monitor flow exporter
                    var findExporterIndex = $filter('filter')(showFlowExporterList, {"exporterName":flowExporterValue},true);
                    if(findExporterIndex[0].collectorIpAddress){
                        netFlowMonitorObj.Collector = findExporterIndex[0].collectorIpAddress;
                    }
                    if(netFlowTemplateTemp.length > 0){
        			    netFlowMonitorObj.NetflowTemplate =  netFlowTemplateTemp[0].nftText;
                    }
	        		netFlowMonitorObj.FlowRecord = flowRecord;
	        		netFlowMonitorObj.FlowExporter = flowExporterValue;
	        		netFlowMonitorObj.FlowMonitorName = flowMonitorName;
	        		netFlowMonitorObj.Interface = findExporterIndex[0].interface;
	        		netFlowMonitorObj.Switch = findExporterIndex[0].switchIpAddress;
                    if(showRunConfigInterface.length > 0){
                        for(var cInter = 0; cInter < showRunConfigInterface.length; cInter++){
                            if(showRunConfigInterface[cInter].indexOf(netFlowMonitorObj.FlowMonitorName) !== -1){
                                var interfaceMonSampIntName = "";
                                if(showRunConfigInterface[cInter].indexOf("ip flow monitor") != -1){
                                	interfaceMonSampIntName = showRunConfigInterface[cInter].split("ip flow monitor ");
                                } else {
                                 	interfaceMonSampIntName = showRunConfigInterface[cInter].split("ipv6 flow monitor ");
                                }
                                var intNames = interfaceMonSampIntName[0].trim();
                                var intExtraHasNames = intNames.split(" ");
                                if(intExtraHasNames.length > 0){
                                    intNames = intExtraHasNames[0];
                                }
                                netFlowMonitorObj.SamplerInterFaces = intNames;
                            }else{
                                netFlowMonitorObj.SamplerInterFaces = "";
                            }
                            if(netFlowMonitorObj.SamplerInterFaces !== ""){
                                $scope.netFlowMonitorsGridData.push(netFlowMonitorObj);
                            }
                        }
                    }
                }
            }
	        $scope.netFlowMonitorsGridDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.netFlowMonitorsGridData
			});
			angular.element(".btnView").show();
			angular.element(".pageLoader").hide();
        }
		$timeout(function(){
			$scope.loadGridData();
		},10);
        $scope.isChecked = function (checked, dataItem) {
        	if (!checked) {
                $scope.countNetFlow = $scope.countNetFlow - 1;
                var index = $scope.selectedNetFlowMonitorsArray.indexOf(dataItem);
                if (index > -1) {
                    $scope.selectedNetFlowMonitorsArray.splice(index, 1);
                }
            } else {
                $scope.countNetFlow = $scope.countNetFlow + 1;
                $scope.selectedNetFlowMonitorsArray.push(dataItem);
            }

            if ($scope.selectedNetFlowMonitorsArray.length > 0) {
                $scope.enableDeleteBtn = false;
            } else {
                $scope.enableDeleteBtn = true;
            }
        };
        $scope.rowSelected = function () {
			$scope.disableApplyButton = true;
			if ($scope.netFlowMonitorsGridDataSource.hasChanges() === false) {
                $scope.disableApplyButton = false;
            } else if ($scope.netFlowMonitorsGridDataSource.hasChanges() === true) {
                $scope.disableApplyButton = false;
            }
        };
        $scope.deleteBtnFunction = function (popup) {
        	$scope.disableApplyButton = false;
            var netFlowConfigCLI = "";
            for (var monitorIndex = 0; monitorIndex < $scope.selectedNetFlowMonitorsArray.length; monitorIndex++) {
            	// Remove Associate Interface records.
		var ipType = ($scope.selectedNetFlowMonitorsArray[monitorIndex].NetflowTemplate == "Capacity Planning")?"no ipv6":"no ip";
                if($scope.selectedNetFlowMonitorsArray[monitorIndex].Sampling !== "fullnetflow"){
                    netFlowConfigCLI += "interface "+$scope.selectedNetFlowMonitorsArray[monitorIndex].SamplerInterFaces+"\n";
                	netFlowConfigCLI += ipType + " flow monitor "+$scope.selectedNetFlowMonitorsArray[monitorIndex].FlowMonitorName+" sampler "+$scope.selectedNetFlowMonitorsArray[monitorIndex].SamplerName+" input \n";
                    netFlowConfigCLI +=  "exit \n";
                }else{
                    netFlowConfigCLI += "interface "+$scope.selectedNetFlowMonitorsArray[monitorIndex].SamplerInterFaces+"\n";
                    netFlowConfigCLI += ipType + " flow monitor "+$scope.selectedNetFlowMonitorsArray[monitorIndex].FlowMonitorName+" input \n";
                    netFlowConfigCLI +=  "exit \n";
                }
                // Remove flow monitor records.
                netFlowConfigCLI += "no flow monitor "+$scope.selectedNetFlowMonitorsArray[monitorIndex].FlowMonitorName+" \n";
                $scope.netFlowMonitorsGrid.dataSource.remove($scope.selectedNetFlowMonitorsArray[monitorIndex]);
                // Remove sampler records.
                if($scope.selectedNetFlowMonitorsArray[monitorIndex].Sampling !== "fullnetflow"){
                    netFlowConfigCLI += "no sampler "+$scope.selectedNetFlowMonitorsArray[monitorIndex].SamplerName+" \n";
                }
                // Remove flow exporter records.
                netFlowConfigCLI += "no flow exporter "+$scope.selectedNetFlowMonitorsArray[monitorIndex].FlowExporter+" \n";
            }
            var result = requestRoutingService.getConfigCmdOutput(netFlowConfigCLI);
            if(result!=""){
            	var exceptionalCase_1 = result.indexOf("Remove from all clients before deleting.");
            }
            if(result=="" || exceptionalCase_1 != -1){
            	notificationService.showNotification(translate('nf_delete_success_msg'),translate('com_config_success_title'),'success');
            }else{
            	notificationService.showNotification(result,translate('com_config_fail_title'),'error');
            }
            $scope.selectedNetFlowMonitorsArray = [];
            $scope.enableDeleteBtn = true;
            popup.close();
        };
        $scope.deleteConfirmation = function() {
			$scope.confirmationNetFlow('delete');
		};
        $scope.confirmationNetFlow = function() {
        	var inter=[];
        	angular.forEach($scope.selectedNetFlowMonitorsArray, function(val){
        		inter.push(val.SamplerInterFaces);
        	});
			$scope.dlgNetFlow = dialogService.dialog({
				content : translate("nf_msg_delete_confirmation")+"<br/>"+inter,
				title : translate("msg_delete_confirmation_window"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "netFlowDeleteConfirmation"
				}, {
					text : translate("com_cancel")
				}]
			});
		};
		$scope.$on("netFlowDeleteConfirmation", function() {
			$scope.deleteBtnFunction($scope.dlgNetFlow.data("kendoWindow"));
		});
        $scope.fnCancel = function(){
            $scope.samplingMethodType = $scope.samplingMethodDataSource[0].samplingMethodValue;
            $scope.inputCapIntType = $scope.inputCaptureInterface[0].interfaceName;
            $scope.switchExportAddType = $scope.switchExportAddress[0].text;
            $scope.collectorIpAddress = "";
            angular.element("#samplerRangeContainer input").val("");
            $timeout(function(){
                //hiding the validator popup messges.
                netFlowFormValidations.hideMessages();
            },50)
        }
        $scope.manualGridRefresh = function(){
        	var grid = angular.element("#netFlowMonitorsGrid").data("kendoGrid");
            grid.dataSource = $scope.netFlowMonitorsGridDataSource;
            $scope.netFlowMonitorsGridDataSource.read();
            grid.refresh();
        }
        $scope.findCLICMDIsAlreadyExists = function(recordName, CLICommand){
            var recordCLI = deviceCommunicator.getExecCmdOutput(CLICommand);
            if(recordCLI.indexOf(recordName) !== -1){
                return true;
            }else{
                return false;
            }
        }

        $scope.findNetFlowTemplateIsAlreadyExists = function(netflowTemplate){
            var netflowTemplateRecord = deviceCommunicator.getExecCmdOutput("show flow record\n");
            if(netflowTemplateRecord.indexOf(netflowTemplate) !== -1){
                return true;
            }else{
                return false;
            }
        }
        // Create button event listener
        $scope.createNetFlow = function(){
            $scope.samplingMethodRangeType = angular.element("#samplerRangeContainer input").val();
            var flowRecordIsOneTime = $scope.findNetFlowTemplateIsAlreadyExists($scope.netFlowTemplateType);
            var exporterIsOneTime = $scope.findCLICMDIsAlreadyExists("export_"+$scope.switchExportAddType.split("/").join("_")+"_"+$scope.collectorIpAddress, "show flow exporter\n");
            var samplerIsOneTime = $scope.findCLICMDIsAlreadyExists("Sampler "+$scope.samplingMethodType+"_1_"+$scope.samplingMethodRangeType, "show sampler\n");
            var interfaceIsOneTime;
            if(netFlowFormValidations.validate()){
        		if($scope.netFlowMonitorsGrid._data.length > 0){
                    interfaceIsOneTime = $filter('filter')($scope.netFlowMonitorsGrid._data, {"SamplerInterFaces":$scope.inputCapIntType});
        		}else{
        			interfaceIsOneTime = [];
        		}
        		if(interfaceIsOneTime.length == 0){
	        		var netFlowConfigCLI = '';
		        	// CLI command for Record creation (Netflow Template)
		        	if($scope.netFlowTemplateType.indexOf("ApplicationTraffic")!=-1 && !flowRecordIsOneTime){
		        		netFlowConfigCLI += "flow record "+$scope.netFlowTemplateType+"\n";
		        		netFlowConfigCLI += "match ipv4 protocol \n";
		        		netFlowConfigCLI += "match ipv4 source address \n";
		        		netFlowConfigCLI += "match ipv4 destination address \n";
		        		netFlowConfigCLI += "match transport source-port \n";
		        		netFlowConfigCLI += "match transport destination-port \n";
		        		netFlowConfigCLI += "collect transport tcp flags \n";
		        		netFlowConfigCLI += "collect counter packets permanent \n";
		        		netFlowConfigCLI += "collect timestamp sys-uptime first \n";
		        		netFlowConfigCLI += "collect timestamp sys-uptime last \n";
		        		netFlowConfigCLI +=  "exit \n";
		        	}else if($scope.netFlowTemplateType.indexOf("ServerUtilization")!=-1 && !flowRecordIsOneTime){
		        		netFlowConfigCLI += "flow record "+$scope.netFlowTemplateType+"\n";
		        		netFlowConfigCLI += "match ipv4 protocol \n";
		        		netFlowConfigCLI += "match ipv4 source address \n";
		        		netFlowConfigCLI += "match ipv4 destination address \n";
		        		netFlowConfigCLI += "match transport source-port \n";
		        		netFlowConfigCLI += "match transport destination-port \n";
		        		netFlowConfigCLI += "collect interface input \n";
		        		if(!$scope.fullNetFlowSupport){
                            netFlowConfigCLI += "collect interface output \n";
                        }
		        		netFlowConfigCLI += "collect counter packets permanent \n";
		        		netFlowConfigCLI +=  "exit \n";
		        	}else if($scope.netFlowTemplateType.indexOf("Security")!=-1 && !flowRecordIsOneTime){
		        		netFlowConfigCLI += "flow record "+$scope.netFlowTemplateType+"\n";
		        		netFlowConfigCLI += "match ipv4 tos \n";
		        		netFlowConfigCLI += "match ipv4 protocol \n";
		        		netFlowConfigCLI += "match ipv4 source address \n";
		        		netFlowConfigCLI += "match ipv4 destination address \n";
		        		netFlowConfigCLI += "match transport source-port \n";
		        		netFlowConfigCLI += "match transport destination-port \n";
                        if(!$scope.fullNetFlowSupport){
    		        		netFlowConfigCLI += "collect transport icmp ipv4 type \n";
    		        		netFlowConfigCLI += "collect transport icmp ipv4 code \n";
                        }
		        		netFlowConfigCLI += "collect transport tcp flags \n";
		        		netFlowConfigCLI += "collect counter packets permanent \n";
		        		netFlowConfigCLI += "collect timestamp sys-uptime first \n";
		        		netFlowConfigCLI += "collect timestamp sys-uptime last \n";
		        		netFlowConfigCLI +=  "exit \n";
		        	}else if($scope.netFlowTemplateType.indexOf("CapacityPlanning")!=-1 && !flowRecordIsOneTime){
		        		netFlowConfigCLI += "flow record "+$scope.netFlowTemplateType+"\n";
		        		netFlowConfigCLI += "match ipv6 protocol \n";
		        		netFlowConfigCLI += "match ipv6 source address \n";
		        		netFlowConfigCLI += "match ipv6 destination address \n";
		        		netFlowConfigCLI += "match transport source-port \n";
		        		netFlowConfigCLI += "match transport destination-port \n";
		        		netFlowConfigCLI += "collect interface input \n";
		        		if(!$scope.fullNetFlowSupport){
                            netFlowConfigCLI += "collect interface output \n";
                        }
		        		netFlowConfigCLI += "collect counter packets permanent \n";
		        		netFlowConfigCLI +=  "exit \n";
		        	}else if($scope.netFlowTemplateType.indexOf("StealthWatch")!=-1 && !flowRecordIsOneTime){
		        		netFlowConfigCLI += "flow record "+$scope.netFlowTemplateType+"\n";
		        		netFlowConfigCLI += "match datalink mac source address input \n";
		        		netFlowConfigCLI += "match datalink mac destination address input \n";
		        		netFlowConfigCLI += "match ipv4 tos \n";
		        		netFlowConfigCLI += "match ipv4 protocol \n";
		        		netFlowConfigCLI += "match ipv4 source address \n";
		        		netFlowConfigCLI += "match ipv4 destination address \n";
		        		netFlowConfigCLI += "match transport source-port \n";
		        		netFlowConfigCLI += "match transport destination-port \n";
		        		netFlowConfigCLI += "collect transport tcp flags \n";
		        		netFlowConfigCLI += "collect interface input \n";
		        		if(!$scope.fullNetFlowSupport){
                            netFlowConfigCLI += "collect interface output \n";
                        }
		        		netFlowConfigCLI += "collect counter bytes long \n";
		        		netFlowConfigCLI += "collect counter packets long \n";
		        		netFlowConfigCLI += "collect counter packets perma \n";
		        		netFlowConfigCLI += "collect timestamp sys-uptime first \n";
		        		netFlowConfigCLI += "collect timestamp sys-uptime last \n";
		        		netFlowConfigCLI +=  "exit \n";
		        	}
		        	var source_interface = $filter('filter')($scope.switchExportAddress, {"text":$scope.switchExportAddType})
		        		,shortNameOfNFTemplate = $filter('filter')($scope.netFlowTemplateDataSource, {"nftValue":$scope.netFlowTemplateType})
		        		,switchExportAddressToHex = $scope.convertIpAddressToHex(source_interface[0].ipAddress.toString())
		        		,collectoIpAddressToHex = $scope.convertIpAddressToHex($scope.collectorIpAddress.toString());
		        	// CLI command for Exporter (Switch Export IP address)
					var colIpAddress = ""
					if($scope.collectorIpAddress.indexOf(":")!=-1){
						colIpAddress = "IPV6"
					}else{
						colIpAddress = $scope.collectorIpAddress
					}
                    if(!exporterIsOneTime){
    		        	netFlowConfigCLI += "flow exporter export_"+$scope.switchExportAddType.split("/").join("_")+"_"+colIpAddress+" \n";
    		        	netFlowConfigCLI += "destination "+$scope.collectorIpAddress+" \n";
    		        	netFlowConfigCLI += "source "+source_interface[0].name+" \n";
    		        	netFlowConfigCLI +=  "transport udp 2055 \n";
    		        	netFlowConfigCLI +=  "exit \n";
                    }
		        	// CLI command for Sampling (Sampling Method)
                    if($scope.samplingMethodType !== "fullnetflow" && !samplerIsOneTime){
                        netFlowConfigCLI += "sampler "+$scope.samplingMethodType+"_1_"+$scope.samplingMethodRangeType+" \n";
    		        	netFlowConfigCLI += "mode "+$scope.samplingMethodType+" 1 out-of "+$scope.samplingMethodRangeType+" \n";
    		        	netFlowConfigCLI +=  "exit \n";
                    }
		        	//CLI command for Create a flow monitor
		        	netFlowConfigCLI += "flow monitor "+$scope.monitorUnitName+shortNameOfNFTemplate[0].nftShort+"X"+source_interface[0].name.split("/").join("_")+"_"+switchExportAddressToHex+"_"+collectoIpAddressToHex+$scope.inputCapIntType.replace(/\//g,"_")+" \n";
		        	netFlowConfigCLI += "exporter export_"+$scope.switchExportAddType.split("/").join("_")+"_"+colIpAddress+" \n";
		        	netFlowConfigCLI += "record "+$scope.netFlowTemplateType+" \n";
		        	netFlowConfigCLI += "exit \n";
                    //CLI command for Associate to an interface
		    var ipType = ($scope.netFlowTemplateType.indexOf("CapacityPlanning")!=-1)?"ipv6":"ip";
                    if($scope.samplingMethodType !== "fullnetflow"){
                        netFlowConfigCLI += "interface "+$scope.inputCapIntType+" \n";
    			        netFlowConfigCLI += ipType + " flow monitor "+$scope.monitorUnitName+shortNameOfNFTemplate[0].nftShort+"X"+source_interface[0].name.split("/").join("_")+"_"+switchExportAddressToHex+"_"+collectoIpAddressToHex+$scope.inputCapIntType.replace(/\//g,"_")+" sampler "+$scope.samplingMethodType+"_1_"+$scope.samplingMethodRangeType+" input \n";
    			        netFlowConfigCLI += "exit \n";
                    }else{
                        netFlowConfigCLI += "interface "+$scope.inputCapIntType+" \n";
                        netFlowConfigCLI += ipType + " flow monitor "+$scope.monitorUnitName+shortNameOfNFTemplate[0].nftShort+"X"+source_interface[0].name.split("/").join("_")+"_"+switchExportAddressToHex+"_"+collectoIpAddressToHex+$scope.inputCapIntType.replace(/\//g,"_")+" input \n";
                        netFlowConfigCLI += "exit \n";
                    }
                    var result = requestRoutingService.getConfigCmdOutput(netFlowConfigCLI);
		            if(result==""){
		                notificationService.showNotification(translate('nf_success_msg'),translate('com_config_success_title'),'success');
		            }else{
		                notificationService.showNotification(result,translate('com_config_fail_title'),'error');
		            }
                    $scope.loadGridData();
		        	$scope.manualGridRefresh();
                    $scope.samplingMethodType = $scope.samplingMethodDataSource[0].samplingMethodValue;
                    $scope.inputCapIntType = $scope.inputCaptureInterface[0].interfaceName;
                    $scope.switchExportAddType = $scope.switchExportAddress[0].text;
		            $scope.collectorIpAddress = '';
		            angular.element("#samplerRangeContainer input").val("");
		            $timeout(function(){
                        //hiding the validator popup messges.
		            	netFlowFormValidations.hideMessages();
		            },10);
	        	}else{
                    if(interfaceIsOneTime.length > 0){
    	        		notificationService.showNotification(translate('nf_interface_warning_msg'),translate('nf_config_warning_title'),'error');
                    }
	        	}
        	}
			$scope.selectedNetFlowMonitorsArray = [];
			$scope.enableDeleteBtn = true;
        }
	}]);
