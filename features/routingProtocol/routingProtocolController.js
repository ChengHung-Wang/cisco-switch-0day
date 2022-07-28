/**
Description: Controller for Routing Protocol
Copyright (c) 2018 by Cisco Systems, Inc.
All rights reserved.
*/
app.register.controller('routingProtocolCtrl', ['$scope','$rootScope', '$filter', 'gridCrudService', 'requestRoutingService', 'validationService', 'notificationService', 'executeCliCmdService','dataSourceService','dialogService','$timeout','getStringLineService',
    function($scope, $rootScope,$filter, gridCrudService, requestRoutingService, validationService, notificationService, executeCliCmdService, dataSourceService, dialogService,$timeout,getStringLineService) {
		var translate = $filter("translate");
		var trimVal=$filter('trimValue');
	    
		$scope.eigrpTabStatus=true;
		$timeout(function(){
			if($rootScope.deviceInfo.type.indexOf("3560CX")!=-1 || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1){
				$scope.eigrpTabStatus=true;
			}else{
				$scope.eigrpTabStatus=false;
			}
		},50);			 
		$scope.tabChange = function(tab){         		
			if(tab === 'RIP'){
				$scope.loadRIP();
			} else if(tab === 'EIGRP'){
				$scope.loadEIGRP();
			} else{
				$scope.loadRIP();
			}			
		}
	//RIP CODE STARTS	
	$scope.networkRequiredMsg=false;
	$scope.networkInvalidIPMsg=false;
	$scope.networkGridRequiredMsg=false;
	$scope.neighbourRequiredMsg=false;
	$scope.neighbourInvalidIPMsg=false;
	$scope.neighbourGridRequiredMsg=false;
    $scope.authkeyRequiredMsg=false;	
	
	$scope.loadRIP= function(){	
        $scope.ripDelBtn = true;		
		$scope.maxPathList = dataSourceService.ripMaxpathDataSource1();
        $scope.ripGridOptions = {
            editable: false,
            sortable: true,
            filterable: false,
            scrollable: false,
            selectable: true,
            pageable: {
                messages: {
                    display: translate("com_page_display"),
                    empty: translate("com_page_empty"),
                    page: translate("com_page_pagetext"),
                    of: translate("com_page_of"),
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
                pageSizes: gridCrudService.grid_page_sizes,
                buttonCount: 5
            },
            columns: [{
                    "template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isRipDeleteChecked(checked,dataItem)\" />",
                    sortable: false,
                    width: "10px"
                },{
                    field: "version",
                    title: translate('management_snmp_host_version'),
                    attributes: {
                        style: "text-align:center"
                    }
                },
                {
                    field: "network",
                    title: translate('toggle_network')
                }, {
                    field: "neighbours",
                    title: translate('rip_neighbors')
                }
            ]
        };		
        $scope.kendoWindow = {
            isEditMode: true
        };
		// Edit RIP Row		
		$scope.editRIPData = function(data){			
			angular.element("#ripForm  span.k-tooltip-validation").hide();
			$scope.networkAddress = "";
            $scope.neighbour = "";
			$scope.authkeyInput = "";	
			$scope.passiveInterfaceData = new kendo.data.ObservableArray([]);
			$scope.passiveInterfaceGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.passiveInterfaceData
			});
			$scope.ipv4SplitHorizonInterfaceData = new kendo.data.ObservableArray([]);
			$scope.splitHorizonDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.ipv4SplitHorizonInterfaceData
			});
			$scope.authkeyData = new kendo.data.ObservableArray([]);
			$scope.authkeyInterfaceGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.authkeyData
			});
			$scope.selectedMode = "basic";
			$scope.advanceView = true;
			$scope.addNetworkView = false;
            $scope.addNeighbourView = false;
			$scope.kendoWindow.isEditMode = false;
			$scope.createRipWindow.open().center();				
			$scope.processNetworkGridData(data);
			$scope.processNeighbourGridData(data);			
			if(passiveInterfaces.length>0){
				$scope.passiveInterfaceCheckbox=true;
				$scope.passiveInterfacelist = $scope.interfaceOptions[0].ripVlanValue; 
				$scope.processPassiveInterfaceGridData(data);
			}
			else if($scope.interfaceOptions.length > 0){
				$scope.passiveInterfacelist = $scope.interfaceOptions[0].ripVlanValue; 
			}
			else{
              $scope.passiveInterfacelist = "";
			}
			if($scope.interfaceEditSplit.length>0){
				$scope.splitHorizonCheckbox=true;
				$scope.SplitHorizonDisabledInterface = $scope.interfaceOptions[0].ripVlanValue;
				$scope.processDisableInterfaceGridData(data);
			}
			else if($scope.interfaceOptions.length > 0){
				$scope.SplitHorizonDisabledInterface = $scope.interfaceOptions[0].ripVlanValue;
			}
			else{
              $scope.SplitHorizonDisabledInterface = "";
			}
			if(authkeyEditData.length>0){
				$scope.authkeyCheckbox=true;
				$scope.authkeyInterfacelist = $scope.authkeyInterfaceOptions[0].authkeyInterfaceValue;
				$scope.processAuthkeyGridData(data);
			}
			else if($scope.authkeyInterfaceOptions.length > 0){
				   $scope.authkeyInterfacelist = $scope.authkeyInterfaceOptions[0].authkeyInterfaceValue;						
			}
			else{			  
			    $scope.authkeyInterfacelist = "";
			}  				
			$scope.ripVersion = ripVersionDevice == 1 ? "version1":"version2";
			if(flushTimeCheck!= ""){
				$scope.timersCheckbox = true;
				}				
			$scope.flushtime = flushTimeCheck;
			$scope.updatetime = updateTimeCheck;
			$scope.invalidtime = InvalidTimeCheck;
			$scope.holddown = holdTimeCheck;			
            $timeout(function(){			
			     $scope.autoSummaryCheckbox = autoSummaryCheck;
			},100);
			$scope.distance = distance;
			}
		    $scope.maxPathLoading = function() {
			$timeout(function(){
			  $scope.maxPathDropDown = maxPathCheck.trim();	
			},400);
		}; 
		// Add Rip Row
        $scope.addRipRow = function() {
			angular.element("#ripForm  span.k-tooltip-validation").hide();
            $scope.advanceView = true;
            $scope.addNetworkView = true;
            $scope.addNeighbourView = true;
            $scope.selectedMode = "basic";
			$scope.ripVersion = "version1";
            $scope.kendoWindow.isEditMode = true;
            $scope.networkAddress = "";
            $scope.neighbour = "";
			$scope.distance = "";
            $scope.timersCheckbox = false;
			$scope.flushtime = "";
			$scope.updatetime = "";
			$scope.invalidtime = "";
			$scope.holddown = "";
            $scope.autoSummaryCheckbox = false;
            $scope.splitHorizonCheckbox = false;  
            $scope.authkeyCheckbox = false;						
            $scope.createRipWindow.open().center();	
            $scope.maxPathDropDown = $scope.maxPathList.options.data[0].maxPathValue;				
            if($scope.interfaceOptions.length > 0){				
				$scope.SplitHorizonDisabledInterface = $scope.interfaceOptions[0].ripVlanValue;	
			}
			else{
			  $scope.SplitHorizonDisabledInterface = "";
			}				
            if($scope.interfaceOptions.length > 0){
				$scope.passiveInterfacelist = $scope.interfaceOptions[0].ripVlanValue; 
			}
			else{
              $scope.passiveInterfacelist = "";
			}	
			if($scope.authkeyInterfaceOptions.length > 0){
            $scope.authkeyInterfacelist = $scope.authkeyInterfaceOptions[0].authkeyInterfaceValue;	
			}else{
               $scope.authkeyInterfacelist = "";	
			}	
            $scope.addNetworksData = new kendo.data.ObservableArray([]);
			$scope.addNetworkGridDataSource = new kendo.data.DataSource({
			pageSize: 5,
			data: $scope.addNetworksData
			});		
			$scope.addNeighboursData = new kendo.data.ObservableArray([]);
			$scope.addNeighbourGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.addNeighboursData
			});
			$scope.ipv4SplitHorizonInterfaceData = new kendo.data.ObservableArray([]);
			$scope.splitHorizonDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.ipv4SplitHorizonInterfaceData
			});
			$scope.passiveInterfaceData = new kendo.data.ObservableArray([]);
			$scope.passiveInterfaceGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.passiveInterfaceData
			});
			$scope.authkeyInput = null;			
			$scope.authkeyData = new kendo.data.ObservableArray([]);
			$scope.authkeyInterfaceGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.authkeyData
			});
        }
		// save RIP Data
        var ipRoutingCount = 0;       
        if($rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1 || $rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960C")!=-1){
			$scope.disableHorizonCheckbox = true;
		}else{
			$scope.disableHorizonCheckbox = false;
		}
        $scope.saveRipData = function(data) {
            var ripConfigCLI = "";			
            var ripVersion = $scope.ripVersion;
            var ripNetwork = $scope.addNetworkGridDataSource;
            var ripNeighbour = $scope.addNeighbourGridDataSource;
            var advFlushTime = $scope.flushtime;
            var advUpdateTime = $scope.updatetime;
            var advInvalidTime = $scope.invalidtime;
            var advHolddown = $scope.holddown;
			var passiveInterface = $scope.passiveInterfaceGridDataSource;
            var splitHorizon = $scope.splitHorizonDataSource;
			var authkeyValue = $scope.authkeyInput;
			var authkeyInterface = $scope.authkeyInterfaceGridDataSource;
			var ripDistance = $scope.distance;
			$scope.networkGridRequiredMsg=false;
			$scope.neighbourGridRequiredMsg=false;
			var maxPath = $scope.maxPathDropDown;			
			$timeout(function(){			
				if(parseFloat($scope.addNetworkGridDataSource.options.data.length) > 0 && parseFloat($scope.addNeighbourGridDataSource.options.data.length) > 0){			
					$scope.networkGridRequiredMsg=false;
					$scope.neighbourGridRequiredMsg=false;
				}
				else if(parseFloat($scope.addNetworkGridDataSource.options.data.length) > 0 && parseFloat($scope.addNeighbourGridDataSource.options.data.length) == 0){			
					$scope.networkGridRequiredMsg=false;
					$scope.neighbourGridRequiredMsg=true;
					return false;
				}
				else if(parseFloat($scope.addNetworkGridDataSource.options.data.length) == 0 && parseFloat($scope.addNeighbourGridDataSource.options.data.length) > 0){			
					$scope.networkGridRequiredMsg=true;
					$scope.neighbourGridRequiredMsg=false;
					return false;
				}
				else{				
					$scope.networkGridRequiredMsg=true;
					$scope.neighbourGridRequiredMsg=true;
					return false;
				}
			   if(ipRoutingCount == 0){
					ripConfigCLI = "ip routing \n";
					ipRoutingCount++;
				}
            ripConfigCLI += "router rip \n";
            ripConfigCLI += "version " + $scope.ripVersion.substring(7, 8) + " \n";
             if (ripNetwork != "") {
				for(var i=0;i<$scope.addNetworkGridDataSource.options.data.length;i++)
				{
					ripNetwork[i]=$scope.addNetworkGridDataSource.options.data[i].networkAddress;
					ripConfigCLI += "network " + ripNetwork[i] + " \n";
				}
            }
			if(deletedRipNetworks.length>0)
			{
				var deletedCheck = deletedRipNetworks.split("\n");
				for(var i=0;i<deletedCheck.length-1;i++)
				ripConfigCLI += "no network " + deletedCheck[i] + " \n";
                deletedRipNetworks ="";			
			}
			if (ripNeighbour != "") {
				for(var i=0;i<$scope.addNeighbourGridDataSource.options.data.length;i++){
					 ripNeighbour[i] = $scope.addNeighbourGridDataSource.options.data[i].neighbour;
					 ripConfigCLI += "neighbor " + ripNeighbour[i] + " \n";
				}
               
            }
			if(deleteRipNeighbors.length>0){
				var deletedNeighborCheck = deleteRipNeighbors.split("\n");
				for(var i=0;i<deletedNeighborCheck.length-1;i++)
				ripConfigCLI += "no neighbor " + deletedNeighborCheck[i] + " \n";
                deleteRipNeighbors ="";			
			}			
            if ($scope.timersCheckbox == true) {
                ripConfigCLI += "timer basic " + $scope.updatetime + " " + $scope.invalidtime + " " + $scope.holddown + " " + $scope.flushtime + " \n";
            } else {
                ripConfigCLI += "no timer basic \n"
            }
            if ($scope.autoSummaryCheckbox == true) {
                ripConfigCLI += "no auto-summary \n";
            } else {
                ripConfigCLI += "auto-summary \n";
            }
			if($scope.passiveInterfaceCheckbox == true){
				for(var i=0;i<$scope.passiveInterfaceGridDataSource.options.data.length;i++){
					 passiveInterface[i] = $scope.passiveInterfaceGridDataSource.options.data[i].passiveInterfacelist;					
					 ripConfigCLI += "passive-interface " + passiveInterface[i]+" \n";
				}
			}
			if(deletePassiveCheck.length>0){
				var deletedPassiveInterCheck = deletePassiveCheck.split("\n");
				for(var i=0;i<deletedPassiveInterCheck.length-1;i++)
				ripConfigCLI += "no passive-interface " + deletedPassiveInterCheck[i] + " \n";
                deletePassiveCheck ="";	
			}
			if(maxPath != ""){
				 ripConfigCLI += "maximum-paths " + maxPath +" \n";
			}						
             if($scope.splitHorizonCheckbox == true) {
                for(var i=0;i<$scope.splitHorizonDataSource.options.data.length;i++){
                splitHorizon[i] = $scope.splitHorizonDataSource.options.data[i].SplitHorizonDisabledInterface;				
                ripConfigCLI += "interface " + splitHorizon[i] + " \n";                     
                ripConfigCLI += "no ip split-horizon \n"; 
                ripConfigCLI += "exit \n";
				}				
            }	
			if(deleteSplitHorizonCheck.length>0){
				var deleteDisableSplitHorizon = deleteSplitHorizonCheck.split("\n");
				for(var i=0;i<deleteDisableSplitHorizon.length-1;i++){
				ripConfigCLI += "interface " + deleteDisableSplitHorizon[i] + " \n";
				ripConfigCLI += "ip split-horizon \n";
				ripConfigCLI += "exit \n";
				}
                deleteSplitHorizonCheck ="";	
			}
			if($scope.authkeyCheckbox == true){
				for(var i=0;i<$scope.authkeyInterfaceGridDataSource.options.data.length;i++){
					if($scope.authkeyInterfaceGridDataSource.options.data[i].authkeyInterfacelist!=''&&$scope.authkeyInterfaceGridDataSource.options.data[i].authkeyInput!=''){					
					ripConfigCLI += "interface " + $scope.authkeyInterfaceGridDataSource.options.data[i].authkeyInterfacelist + " \n";
                    ripConfigCLI += "ip rip auth key-chain "+ $scope.authkeyInterfaceGridDataSource.options.data[i].authkeyInput +" \n"; 
                    ripConfigCLI += "exit \n";
					}					
				}
			}
			if(deleteAuthkeyCheck.length>0){
				var deletedAuthkeyInterCheck = deleteAuthkeyCheck.split("\n");
				var  deleteAuthkeyInterface = deleteInterfaceCheck.split("\n");
				for(var i=0;i<deletedAuthkeyInterCheck.length-1;i++){
				ripConfigCLI += "interface " + deletedAuthkeyInterCheck[i] + " \n";
				ripConfigCLI += "no ip rip auth key-chain "+ deleteAuthkeyInterface[i] +"\n";
				ripConfigCLI += "exit \n";
				}
                deleteAuthkeyCheck ="";
				deleteInterfaceCheck = "";
			}
            if(ripDistance != ""){
				ripConfigCLI += "router rip \n";
				ripConfigCLI += "distance " + $scope.distance +" \n";
			}			
            cliPush(ripConfigCLI);
			if(data=='add')
            $scope.ripGrid.dataSource.add({
                "version": ripVersion.substring(7, 8),
                "network": ripNetwork,
                "neighbours": ripNeighbour
            });
			else{
				var selectedItem = $scope.ripGrid.dataItem($scope.ripGrid.select());
				selectedItem.version = ripVersion.substring(7, 8);
				selectedItem.network = ripNetwork;
				selectedItem.neighbours = ripNeighbour;
			}
			$scope.interfaceEditSplit = [];
			authkeyEditData = [];
			authkeyValue = [];
			$scope.ripLoadInterface();			
			},100);
			$scope.createRipWindow.close();	
        }
		// RIP Delete functionality
        $scope.delRipArray = [];		
        $scope.isRipDeleteChecked = function(checked,dataItem){
			if (checked == false) {
                var index = $scope.delRipArray.indexOf(dataItem);
                if (index > -1) {
                    $scope.delRipArray.splice(index, 1);
                }
            } else {
                $scope.delRipArray.push(dataItem);
            }
            if ($scope.delRipArray.length > 0) {
                $scope.ripDelBtn = false;
            } else {
                $scope.ripDelBtn = true;
            }
			
		}	
		$scope.$on("okDelete", function() {
            $scope.dlg.data("kendoWindow").close();
            $scope.deleteRipRow();           
        });
		$scope.deleteRipRow = function(){ 
		     $scope.ripDelBtn = true;
             var selectedItem = $scope.delRipArray;
			 var ripDeleteCLI = "no router rip"; 
             cliPush(ripDeleteCLI);
			 for(var item in selectedItem){
				 $scope.ripGrid.dataSource.remove(selectedItem[item]);
			 }
			  $timeout(function(){
				$scope.ripAddBtn = false;	
			  },200);			 
	 		}
		$scope.$on("cancel", function() {
            $scope.dlg.data("kendoWindow").close();
        });
		$scope.ripDeleteConfirm	= function(){
			 $scope.dlg = dialogService.dialog({
                content: translate('msg_delete_confirmation'),
                title: translate('msg_delete_confirmation_window'),
                messageType: "confirm",
                actionButtons: [{
                    text: translate('com_ok'),
                    callback: "okDelete"
                }, {
                    text: translate('com_cancel'),
                    callback: "cancel"
                }]
            });
		}
       //show network data in Edit		
		$scope.processNetworkGridData = function(data) {          
			$scope.addNetworksData = new kendo.data.ObservableArray([]);
			for(var i=0;i<network.length;i++)
			{
			$scope.addNetworksData.push({
             "networkAddress": network[i]
            });
			}
			 $scope.addNetworkGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.addNetworksData
			});			
        };
		 //show neighbour data in Edit
		$scope.processNeighbourGridData = function(data){
			$scope.addNeighboursData = new kendo.data.ObservableArray([]);
			for(var i=0;i<neighbours.length;i++){
				$scope.addNeighboursData.push({
				 "neighbour": neighbours[i]
				});				
			}
			$scope.addNeighbourGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.addNeighboursData
			});
		}
		 //show passive interface data in Edit
		$scope.processPassiveInterfaceGridData = function(data){
			$scope.passiveInterfaceData = new kendo.data.ObservableArray([]);
			for(var i = 0;i<passiveInterfaces.length-1;i++){
				$scope.passiveInterfaceData.push({
					"passiveInterfacelist":passiveInterfaces[i]
				});			
			}
			$scope.passiveInterfaceGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.passiveInterfaceData
			});

		}
		//show disable split horizon data in Edit
		$scope.processDisableInterfaceGridData = function(data){			
			$scope.ipv4SplitHorizonInterfaceData = new kendo.data.ObservableArray([]);
			for(var i = 0;i<$scope.interfaceEditSplit.length;i++){
				$scope.ipv4SplitHorizonInterfaceData.push({
					"SplitHorizonDisabledInterface":$scope.interfaceEditSplit[i]
				});			
			}
			$scope.splitHorizonDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.ipv4SplitHorizonInterfaceData
			});

		}
		//show auth key data in Edit
		$scope.processAuthkeyGridData = function(data){	
		$scope.authkeyData = new kendo.data.ObservableArray([]);				
			for(var i = 0;i<authkeyEditData.length;i++){
				$scope.authkeyData.push({
					"authkeyInput":authkeyValue[i],
					"authkeyInterfacelist":authkeyEditData[i]
				});			
			}
			$scope.authkeyInterfaceGridDataSource = new kendo.data.DataSource({
				pageSize: 5,
				data: $scope.authkeyData
			});				
		}
		// rip configuration data
        function cliPush(cli) {
            if (cli != "") {
                var result = requestRoutingService.getConfigCmdOutput(cli);
                if (result == "") {
                    notificationService.showNotification(translate('rip_config_success_msg'), translate('com_config_success_title'), 'success');
                } else {
                    notificationService.showNotification(result, translate('com_config_fail_title'), 'error');
                }
				$scope.ripLoadInterface();

            }
        }
	  // rip loading data  
		var network = [],neighbours = [],passiveInterfaces = [];
		var ripVersionDevice = "",flushTimeCheck = "",InvalidTimeCheck = "",holdTimeCheck = "",updateTimeCheck = "",maxPathCheck="",autoSummaryCheck = true,distance="";
		$scope.interfaceOptions = [];
		$scope.interfaceEditSplit = [];
		$scope.authkeyInterfaceOptions = [];
		var authkeyEditData = [];
		var authkeyValue = [];		           
		$scope.ripLoadInterface = function() {
			var m = 0,k=0;
            $scope.ripLoadGridData = [];
            var ripLoadCLI = "show ip protocols \n show running-config | s interface \n";
            var ripLoadCLIOP = deviceCommunicatorCLI.getExecCmdOutput(ripLoadCLI);			
			var interfacesRunningConfig= ripLoadCLIOP[1].split("interface");
	        for(var irc = 1; irc < interfacesRunningConfig.length; irc++){
	           var deviceInterface="";	            	
	           var intShowRun="interface "+interfacesRunningConfig[irc];
              if(intShowRun.indexOf("no switchport")!=-1 && !(intShowRun.indexOf("no ip split-horizon")!=-1)){
				   var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();				 
				  if(interfaceName.indexOf("Port-channel") != -1)
					  continue;
				   var interfaceOptions = {
                    "ripVlanText": interfaceName,
                    "ripVlanValue": interfaceName
                };
                $scope.interfaceOptions.push(interfaceOptions);
			   }			   
			  if(intShowRun.indexOf("no switchport")!=-1 && (intShowRun.indexOf("no ip split-horizon")!=-1)){
				   var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();				 
				  if(interfaceName.indexOf("Port-channel") != -1)
					  continue;				   
                $scope.interfaceEditSplit[m] = interfaceName;
                m++;
			   }
			   if(intShowRun.indexOf("no switchport")!=-1 && intShowRun.indexOf("no ip address") == -1){
				   var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();				 
				  if(interfaceName.indexOf("Port-channel") != -1)
					  continue;
				 var authkeyInterfaceOptions = {
                    "authkeyInterfaceText": interfaceName,
                    "authkeyInterfaceValue": interfaceName
                };				  
                $scope.authkeyInterfaceOptions.push(authkeyInterfaceOptions);				
			   }
			   if(intShowRun.indexOf("no switchport")!=-1 && intShowRun.indexOf("ip rip authentication")!= -1){
				   var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
                   var authkeyName= executeCliCmdService.getNextString(intShowRun,["ip rip authentication key-chain"],["\n"]).trim();				   
				  if(interfaceName.indexOf("Port-channel") != -1)
					  continue;
				authkeyEditData[k] = interfaceName;
				authkeyValue[k] = authkeyName;
                k++;			
			   }			   
            } 
            if (ripLoadCLIOP[0].indexOf("Routing Protocol is \"rip\"") != -1) {
                ripLoadCLIOP = ripLoadCLIOP[0].split("\n");
				
                var flag = 0,flagcheck = 0,flagcheck1 = 0,flagcheck2=0,flagcheck3 = 0,flagcheck4 = false,k = 0,m = 0,n=0;
                for (var i = 0; i < ripLoadCLIOP.length; i++) {
					if(ripLoadCLIOP[i].indexOf("Routing Protocol is \"rip\"") != -1)
					 flagcheck4 = true;
				    if(flagcheck4 == true){
					if (ripLoadCLIOP[i].indexOf("Sending updates every") > 0) {
                        updateTimeCheck = ripLoadCLIOP[i].split(" ")[5];
                    }
					if (ripLoadCLIOP[i].indexOf("Invalid after") > 0) {
                        InvalidTimeCheck = ripLoadCLIOP[i].split(" ")[4];
						holdTimeCheck = ripLoadCLIOP[i].split(" ")[8].substring(0,ripLoadCLIOP[i].split(" ")[8].length-1);
						flushTimeCheck = ripLoadCLIOP[i].split(" ")[11];
                    }
					if (ripLoadCLIOP[i].indexOf("Neighbor(s):") > 0) {
                        flagcheck = 1;
                    }
                    if (ripLoadCLIOP[i].indexOf("Default version contro") > 0) {
                        flag = 1;
                        ripVersionDevice = ripLoadCLIOP[i].substring(40, 41);
                    }
                    if (flagcheck == 1 && flag == 0) {
                        neighbours[k] = ripLoadCLIOP[i + 1];
                        k++;
                    }					
					if(ripLoadCLIOP[i].indexOf("Automatic network summarization is not in effect") !=-1){
						autoSummaryCheck = true;
					}
					if(ripLoadCLIOP[i].indexOf("Automatic network summarization is in effect") !=-1){
						autoSummaryCheck = false;
					}
					
					if(ripLoadCLIOP[i].indexOf("Maximum path:") > 0)
					{
					  	maxPathCheck = ripLoadCLIOP[i].substring(16,18);
					}					
                    if (ripLoadCLIOP[i].indexOf("Routing for Networks:") > 0) {
                        flagcheck1 = 1;
                    }
                   if (ripLoadCLIOP[i].indexOf('Passive Interface(s):') > 0){
                        flagcheck2 = 1;										
					}
					if(ripLoadCLIOP[i].indexOf('Routing Information Sources:') > 0)
						flagcheck3 = 1;
                    
					if(flagcheck2 == 1 && flagcheck3 ==0){
					    passiveInterfaces[n] = ripLoadCLIOP[i + 1];
						n++;
					}
					if (flagcheck1 == 1&& flagcheck2 == 0 && flagcheck3 ==0) {
                        network[m] = ripLoadCLIOP[i + 1];
                        m++;
                    }
					if(ripLoadCLIOP[i].indexOf("Distance:") > 0){					
						distance =executeCliCmdService.getNextString(ripLoadCLIOP[i],["Distance: (default is "],[")"]).trim();
						break;
					  }
					}
                }
                var neighbourRemoveLast = neighbours.pop();
                var neighboursData = neighbours.join(",");
				var neighworkRemoveLast = network.pop();
                var networkData = network.join(",");
								
               $scope.ripLoadGridData.push({
                "version": ripVersionDevice,
                "network": networkData,
                "neighbours": neighboursData

            })
            $scope.ripDataSource = new kendo.data.DataSource({
                pageSize: 10,
                data: $scope.ripLoadGridData
            });
			if($scope.ripLoadGridData.length>0){
				$scope.ripAddBtn = true;
			}
			else{
				$scope.ripAddBtn = false;
			}
			}
            
        }
        $scope.ripLoadInterface();
        $scope.cancelRipData = function() {
            $scope.createRipWindow.close();
        }  
		 function validateIPAddressCustom(ipaddress) {  
				if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
					return true; 
				}  			
			return false; 
		  } 
       //Add network data to network grid		
        $scope.addNetwork = function() {   
           $scope.networkRequiredMsg=false;
	       $scope.networkInvalidIPMsg=false;
           $timeout(function(){			
			   if(angular.element("#networkAddress").val().trim()=="" ){
					$scope.networkRequiredMsg=true;
					$scope.networkInvalidIPMsg=false;
					return false;
			   } else if(!validateIPAddressCustom(angular.element("#networkAddress").val().trim())){
					$scope.networkRequiredMsg=false;
					$scope.networkInvalidIPMsg=true;
					return false;
			   } else if($scope.networkAddress != '' && $scope.networkAddress != undefined) {
						$scope.networkRequiredMsg=false;
						$scope.networkInvalidIPMsg=false;
						var networkflag = false;					
						var temp = {};
						temp.networkAddress = $scope.networkAddress;
						for(var i=0;i<$scope.addNetworksData.length;i++)
						{
						   if($scope.addNetworksData[i].networkAddress.trim() == $scope.networkAddress)
						   {
							 networkflag = true;
							break;
						   }
						}
						if(networkflag == false)
						 $scope.addNetworksData.push(temp);
				}		   
				$scope.networkAddress = '';	
		   },100);
        }
        $scope.addNetworkGridOptions = {
            editable: false,
            sortable: true,
            pageable: {
                info: false,
                refresh: false,
                pageSizes: false,
                previousNext: true,
                numeric: true
            },
			filterable : false,
            scrollable: false,
            selectable: true,
            columns: [{
                    field: "networkAddress",
                    title: translate('toggle_network'),
                    editable: false,
                    width: "1px"
                },
                {
                    title: translate('rip_remove'),
                    width: "10px",
                    template: "<div class='k-grid-delete' ng-click=\"removeNetwork(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
                }
            ]
        }
        $scope.deletedNetworks = []; 
		var deletedRipNetworks = "";
        $scope.removeNetwork = function(dataItem) {
            var index = $scope.addNetworksData.map(function(e) {
                return e.networkAddress;
            }).indexOf(dataItem.networkAddress);
            if (index != -1) {
                if (!$scope.addNetworksData[index].created) {
                    $scope.deletedNetworks.push($scope.addNetworksData[index]);
                }
                deletedRipNetworks += $scope.addNetworksData[index].networkAddress+"\n"; 
				$scope.addNetworksData.splice(index, 1);			
            }
        } 
         //Add neighbours data to neighbours grid		
        $scope.addNeighbours = function() {
			$scope.neighbourRequiredMsg=false;
			$scope.neighbourInvalidIPMsg=false;	
			$timeout(function(){			
				if(angular.element("#neighbour").val().trim()=="" ){
						$scope.neighbourRequiredMsg=true;
						$scope.neighbourInvalidIPMsg=false;
						return false;
				}else if(!validateIPAddressCustom(angular.element("#neighbour").val().trim())){
					$scope.neighbourRequiredMsg=false;
					$scope.neighbourInvalidIPMsg=true;
					return false;
				} 	
				else if ($scope.neighbour != '' && $scope.neighbour != undefined ) {
					$scope.neighbourRequiredMsg=false;
			        $scope.neighbourInvalidIPMsg=false;
					var neighborFlag = false;					
					var temp = {};
					temp.neighbour = $scope.neighbour;
					for(var i = 0;i<$scope.addNeighboursData.length;i++){
						if($scope.addNeighboursData[i].neighbour.trim() == $scope.neighbour)
						   {
							   neighborFlag = true;
							   break;
						   }
					}
					if(neighborFlag == false)
					$scope.addNeighboursData.push(temp);
				}
				$scope.neighbour = '';	
			},100);			
        }
        $scope.addNeighbourGridOptions = {
            editable: false,
            sortable: true,
            pageable: {
                info: false,
                refresh: false,
                pageSizes: false,
                previousNext: true,
                numeric: true
            },
			filterable :false,
            scrollable: false,
            selectable: true,
            columns: [{
                    field: "neighbour",
                    title: translate('rip_neighbours'),
                    editable: false,
                    width: "1px"
                },
                {
                    title: translate('rip_remove'),
                    width: "10px",
                    template: "<div class='k-grid-delete' ng-click=\"removeNeighbour(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
                }
            ]
        }
        $scope.deletedNeighbours = [];
		var deleteRipNeighbors = "";
        $scope.removeNeighbour = function(dataItem) {
            var index = $scope.addNeighboursData.map(function(e) {
                return e.neighbour;
            }).indexOf(dataItem.neighbour);
            if (index != -1) {
                if (!$scope.addNeighboursData[index].created) {
                    $scope.deletedNeighbours.push($scope.addNeighboursData[index]);
                }
				deleteRipNeighbors += $scope.addNeighboursData[index].neighbour+"\n";
                $scope.addNeighboursData.splice(index, 1);
            }
        }
		$scope.popuptop ='';
        $scope.changeBasic = function() {
            $scope.advanceView = true;			
        }		
        $scope.changeAdvance = function() {
            $scope.advanceView = false;
			var topVal = angular.element('.k-window').css('top').split('px')[0];
			$scope.popuptop = topVal + "px";
			var newTop = topVal - (topVal*.95);
			angular.element('.k-window').css('top',newTop+"px");
			angular.element('.routingProtocolDiv').css('height',($(window).height() * 0.75) + 'px');
			angular.element('.routingProtocolDiv').css('overflow-x','hidden');
        }		
      	//Add Disable split horizon data to  grid 
         $scope.addDisableSplitHorizon = function() {			 
            if ($scope.SplitHorizonDisabledInterface != '' && $scope.SplitHorizonDisabledInterface != undefined) {
                var splitHorizonFlag = false;
				var temp = {};
                temp.SplitHorizonDisabledInterface = $scope.SplitHorizonDisabledInterface;
                for(var i=0;i<$scope.ipv4SplitHorizonInterfaceData.length;i++){
					if($scope.ipv4SplitHorizonInterfaceData[i].SplitHorizonDisabledInterface.trim() == $scope.SplitHorizonDisabledInterface){
						splitHorizonFlag = true;
						break;
					}
				}
					if(splitHorizonFlag == false)
					$scope.ipv4SplitHorizonInterfaceData.push(temp);
	            
            }			
        }	
        $scope.deletedipv4SplitHorizonInteraceList = [];
		var deleteSplitHorizonCheck = "";
        $scope.removeSplitHorizonInterface = function(dataItem) {
            var index = $scope.ipv4SplitHorizonInterfaceData.map(function(e) {
                return e.SplitHorizonDisabledInterface;
            }).indexOf(dataItem.SplitHorizonDisabledInterface);
            if (index != -1) {
                if (!$scope.ipv4SplitHorizonInterfaceData[index].created) {
                    $scope.deletedipv4SplitHorizonInteraceList.push($scope.ipv4SplitHorizonInterfaceData[index]);
                }
				deleteSplitHorizonCheck += $scope.ipv4SplitHorizonInterfaceData[index].SplitHorizonDisabledInterface+"\n";
                $scope.ipv4SplitHorizonInterfaceData.splice(index, 1);
            }
        }

        $scope.splitHorizonGridOptions = {
            editable: false,
            sortable: true,
            pageable: {
                info: false,
                refresh: false,
                pageSizes: false,
                previousNext: true,
                numeric: true
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
            scrollable: false,
            selectable: true,
            columns: [{
                    field: "SplitHorizonDisabledInterface",
                    title: translate('portconfig_general_interface'),
                    editable: false,
                    width: "1px"
                },
                {
                    title: translate('rip_remove'),
                    width: "10px",
                    template: "<div class='k-grid-delete' ng-click=\"removeSplitHorizonInterface(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
                }
            ]
        }; 
       	//Add passive interface data to  grid 		
		$scope.addPassiveInterface = function(){
			if ($scope.passiveInterfacelist != '' && $scope.passiveInterfacelist != undefined) {
				 var passiveFlag = false;
				 var temp = {};
                 temp.passiveInterfacelist = $scope.passiveInterfacelist;
				 for(var i = 0;i<$scope.passiveInterfaceData.length;i++){
					 if($scope.passiveInterfaceData[i].passiveInterfacelist.trim() == $scope.passiveInterfacelist){
						 passiveFlag = true;
						 break;
					 }
				 }
				 if(passiveFlag == false)
					$scope.passiveInterfaceData.push(temp); 
				 
			}
		}
		$scope.deletePassiveInteraceList = [];
		var deletePassiveCheck = "";
		$scope.removePassiveInterface = function(dataItem){
			 var index = $scope.passiveInterfaceData.map(function(e) {
                return e.passiveInterfacelist;
            }).indexOf(dataItem.passiveInterfacelist);
            if (index != -1) {
                if (!$scope.passiveInterfaceData[index].created) {
                    $scope.deletePassiveInteraceList.push($scope.passiveInterfaceData[index]);
                }
				deletePassiveCheck += $scope.passiveInterfaceData[index].passiveInterfacelist+"\n";
                $scope.passiveInterfaceData.splice(index, 1);
            }
		}
        $scope.passiveInterfaceGridOptions = {
            editable: false,
            sortable: true,
            pageable: {
                info: false,
                refresh: false,
                pageSizes: false,
                previousNext: true,
                numeric: true
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
            scrollable: false,
            selectable: true,
            columns: [{
                field: "passiveInterfacelist",
                title: translate('portconfig_general_interface'),
                editable: false,
                width: "1px"
            },{
                    title: translate('rip_remove'),
                    width: "10px",
                    template: "<div class='k-grid-delete' ng-click=\"removePassiveInterface(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
                }]
        };
        $scope.distanceCheckboxGridOptions = {
            editable: false,
            sortable: true,
            pageable: {
                info: false,
                refresh: false,
                pageSizes: false,
                previousNext: true,
                numeric: true
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
            scrollable: false,
            selectable: true,
            columns: [{
                    field: "prefix",
                    title: translate('staticrouting_prefix'),
                    editable: false,
                    width: "1px"
                },
                {
                    field: "distance",
                    title: translate('rip_distance'),
                    editable: false,
                    width: "1px"
                }
            ]
        }
		//Auth key grid 
         $scope.authkeyInterfaceGridOptions = {
            editable: false,
            sortable: true,
            pageable: {
                info: false,
                refresh: false,
                pageSizes: false,
                previousNext: true,
                numeric: true
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
            scrollable: false,
            selectable: true,
            columns: [ {
                field: "authkeyInput",
                title: translate('auth_key'),
                editable: false,
                width: "1px"
            },{
                    field: "authkeyInterfacelist",
                    title: translate('portconfig_general_interface'),
                    editable: false,
                    width: "1px"
                },{
                    title: translate('rip_remove'),
                    width: "10px",
                    template: "<div class='k-grid-delete' ng-click=\"removeAuthkeyInterface(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
                }]
        };
        //Auth key add to grid
		$scope.addAuthKey = function(){
			$scope.authkeyRequiredMsg = false;
			$timeout(function(){
			if(angular.element("#authkeyInput").val().trim()=="" ){
						$scope.authkeyRequiredMsg = true;
						return false;
			}
			else if ($scope.authkeyInput != null&&($scope.authkeyInterfacelist != '' && $scope.authkeyInterfacelist != undefined)) {
				$scope.authkeyRequiredMsg = false;
				 var authkeyFlag = false;
				 var temp = {};
				 temp.authkeyInput = $scope.authkeyInput;
                 temp.authkeyInterfacelist = $scope.authkeyInterfacelist;
				 for(var i = 0;i<$scope.authkeyData.length;i++){
					 if($scope.authkeyData[i].authkeyInput.trim() == $scope.authkeyInput || $scope.authkeyData[i].authkeyInterfacelist.trim() == $scope.authkeyInterfacelist){
						 authkeyFlag = true;
						 break;
					 }
				 }
				 if(authkeyFlag == false)
					$scope.authkeyData.push(temp); 
			}
			$scope.authkeyInput= '';
			},100);
		}
		//Remove auth key from grid
		$scope.deleteauthkeyInteraceList = [];
		var deleteAuthkeyCheck = "";
		var deleteInterfaceCheck = "";
		$scope.removeAuthkeyInterface = function(dataItem){
			 var index = $scope.authkeyData.map(function(e) {
                return e.authkeyInput;
            }).indexOf(dataItem.authkeyInput);
            if (index != -1) {
                if (!$scope.authkeyData[index].created) {
                    $scope.deleteauthkeyInteraceList.push($scope.authkeyData[index]);
                }
                deleteAuthkeyCheck += $scope.authkeyData[index].authkeyInterfacelist+"\n";
				deleteInterfaceCheck += $scope.authkeyData[index].authkeyInput+"\n";				
                $scope.authkeyData.splice(index, 1);
            }
		}
           // RIP validations
       $scope.ripFormValidations = {
			rules : {				
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
                        else return true;
                    }else{
                        return true;
                    }
                }
			}
		}
	}
    $scope.loadRIP();
	//RIP CODE ENDS
	
	//EIGRP CODE STARTS
	$scope.loadEIGRP= function(){
		$scope.kendoWindow = {isEditMode:true };
		$scope.disableDeleteButton=true;
		$scope.updateipv4Flag = false;
		$scope.updateipv6Flag = false;
		$scope.popuptop = '';
		angular.extend($scope, {
			routingProtocolModel:{
				virtualInstance: null,
				selectedMode: "",
				protocol:"",
				ipv4unicast: "",
				ipv4as: "",
				ipv4asval : "",
				ipv6unicast: "",
				ipv6as: "",
				ipv6asval: "",
				routerid:null,
				ipv6routerid:null,
				network : false,
				networkipaddress:"",
				networkipwildcard:"",
				disablesplithorizon : "",
				ipv6disablesplithorizon : "",
				outgoinginterface : "",
				outgoinginterface_ipv6 : "",
				interface1: null,
				ipv6interface1: null,
				interface2: null,
				interface2_ipv6: null,
				routerIP : null,
				routerIP_ipv6 : null,
				variance : null,
				redistribute: null,
				processID : null,
				authkey : null,
				stub : false,
				receive_only : false,
				stub : false,
				receive_only : false,
				redistribute_top : false,
				static : false,
				summary : false,
				stub_ipv6 : false,
				receive_only_ipv6 : false,
				redistribute_top_ipv6 : false,
				static_ipv6 : false,
				summary_ipv6 : false,
				variance_ipv6 : null,
				redistribute_ipv6: null,
				authkey_ipv6 : null,
				enablebestpractices : false,
				enablebestpractices_ipv6 : false
			}
		});
		// Start of Datastructures required for the feature
		$scope.routingProtocolGridOptions = {
			editable: false,
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
				refresh : true,
				pageSizes: gridCrudService.grid_page_sizes,
				buttonCount: 5
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
			scrollable: false,
			selectable: true,
			columns: [
				{
					"template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"selectRows(checked,dataItem)\"  />", sortable: false
				},
				{
					field: "protocol", title: translate("switch_type")
				},
				{
					field: "virtualInstance", title: translate("eigrp_virtual_instance")
				},
				{
					field: "as", title: translate("eigrp_as")
				}
			]
		};

		$scope.validateSubnetMask = function(value) {
			if(value == undefined){
				return false;
			} else {
				var wildcardArr = ['0.0.0.0','0.0.0.1','0.0.0.3','0.0.0.7','0.0.0.15','0.0.0.31','0.0.0.63','0.0.0.127','0.0.0.255','0.0.1.255','0.0.3.255','0.0.7.255','0.0.15.255','0.0.31.255','0.0.63.255','0.0.127.255','0.0.255.255','0.1.255.255','0.3.255.255','0.7.255.255','0.15.255.255','0.31.255.255','0.63.255.255','0.127.255.255','0.255.255.255','1.255.255.255','3.255.255.255','7.255.255.255','15.255.255.255','31.255.255.255','255.255.255.255','255.0.0.0'];
				if (wildcardArr.indexOf(value) != -1) {
					return true;
				}
				var subnetRegex = "^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$";
				if (new RegExp(subnetRegex).test(value)) {
					return true;
				}
			}
			return false;
		};
		$scope.validateduplicates = function(value, field) {
			var validateGrid = angular.element("#routingProtocolGrid").data("kendoGrid");
			var validateGridData = validateGrid.dataSource.data();
			for(var i=0;i<validateGridData.length;i++){
				validateGridData[i];
				if(field == 'virtualInstance'){
					if(trimVal(value).toUpperCase()== trimVal(validateGridData[i].virtualInstance).toUpperCase()){
						return false;
					}
				}
				if(field == 'as'){
					if(trimVal(validateGridData[i].as).indexOf("/") != -1){
						if(trimVal(value)== trimVal(validateGridData[i].as).split('/')[0] || trimVal(value)== trimVal(validateGridData[i].as).split('/')[1]){
							return false;
						}
					}else{
						if(trimVal(value)== trimVal(validateGridData[i].as)){
							return false;
						}
					}
				}
			}
			return true;
		};
		$scope.validateVirtualInstance = function(value) {
			if(value == undefined){
				return false;
			} else {
				var Regex = ".*[a-zA-Z]+.*";
				if (new RegExp(Regex).test(value)) {
					return true;
				}
			}
			return false;
		};
		// Refresh button trigger
		angular.element("#routingProtocolGrid").delegate(".k-pager-refresh", "click", function(){
			$scope.disableDeleteButton = true;
			$scope.selectedArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		});
		// popup function
		var myWindow = angular.element("#window");
		myWindow.kendoWindow({
			modal: true,
			width: "900px",
			title: translate("eigrp_route"),
			visible: false,
			actions: [
				"Close"
			]
		}).data("kendoWindow").center();
		$scope.addRoutingProtocol = function() {
			myWindow.data("kendoWindow").open().center();
			angular.element('.routingProtocolDiv').css('height','auto');
			$scope.kendoWindow.isEditMode = true;
			$scope.routingProtocolModel.selectedMode = "basic";
			$scope.routingProtocolModel.virtualInstance = null;
			$scope.routingProtocolModel.protocol = "IPv4";
			$scope.routingProtocolModel.ipv4unicast = false;
			$scope.routingProtocolModel.ipv4as = true;
			$scope.routingProtocolModel.ipv4asval = null;
			$scope.routingProtocolModel.ipv6unicast = false;
			$scope.routingProtocolModel.ipv6as = true;
			$scope.routingProtocolModel.ipv6asval = null;		
			$scope.updateipv4Flag = false;
			$scope.updateipv6Flag = false;
			$scope.routingProtocolModel.routerid = null;
			$scope.routingProtocolModel.ipv6routerid = null;
			$scope.routingProtocolModel.networkipaddress = null;		
			$scope.routingProtocolModel.networkipwildcard = null;		
			$scope.routingProtocolModel.disablesplithorizon = false;	
			$scope.routingProtocolModel.ipv6disablesplithorizon = false;	
			$scope.routingProtocolModel.outgoinginterface = false;	
			$scope.routingProtocolModel.outgoinginterface_ipv6 = false;	
			$scope.routingProtocolModel.interface1 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.interface2 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.ipv6interface1 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.interface2_ipv6 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.stub = false;	
			$scope.routingProtocolModel.receive_only = false;	
			$scope.routingProtocolModel.redistribute_top = false;
			$scope.routingProtocolModel.static = false;	
			$scope.routingProtocolModel.summary = false;	
			$scope.routingProtocolModel.routerIP = null;
			$scope.routingProtocolModel.routerIP_ipv6 = null;
			$scope.routingProtocolModel.variance = null;
			$scope.routingProtocolModel.redistribute = $scope.redistributeOptions[0].redistributeName;
			$scope.routingProtocolModel.authkey = null;
			$scope.routingProtocolModel.enablebestpractices = false;
			$scope.routingProtocolModel.processID = null;
			$scope.routingProtocolModel.network = false;
			$scope.routingProtocolModel.stub_ipv6 = false;	
			$scope.routingProtocolModel.receive_only_ipv6 = false;	
			$scope.routingProtocolModel.redistribute_top_ipv6 = false;	
			$scope.routingProtocolModel.static_ipv6 = false;	
			$scope.routingProtocolModel.summary_ipv6 = false;	
			$scope.routingProtocolModel.processID_ipv6 = null;
			$scope.routingProtocolModel.variance_ipv6 = null;
			$scope.routingProtocolModel.authkey_ipv6 = null;
			$scope.routingProtocolModel.enablebestpractices_ipv6 = false;
			$scope.routingProtocolModel.redistribute_ipv6 = $scope.redistributeOptions[0].redistributeName;
			$scope.routingProtocolNetworkData = new kendo.data.ObservableArray([]);
			$scope.networkGridDataSource = new kendo.data.DataSource({
				pageSize:10,
				data: $scope.routingProtocolNetworkData
			});
			$scope.routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
			$scope.splitHorizonDataSource = new kendo.data.DataSource({
				pageSize:10,
				data: $scope.routingProtocolSplitHorData
			});
			$scope.routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
			$scope.outgoingInterfaceSource = new kendo.data.DataSource({
				pageSize:10,
				data: $scope.routingProtocolInterfaceData
			});
			$scope.ipv6routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
			$scope.ipv6splitHorizonDataSource = new kendo.data.DataSource({
				pageSize:10,
				data: $scope.ipv6routingProtocolSplitHorData
			});
			$scope.ipv6_routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
			$scope.ipv6_outgoingInterfaceSource = new kendo.data.DataSource({
				pageSize:10,
				data: $scope.ipv6_routingProtocolInterfaceData
			});
			angular.element("#routingProtocolForm  span.k-tooltip-validation").hide();
		};
		$scope.cancelAddEditKendoWindow = function(){
			myWindow.data("kendoWindow").close();
		};
		var addRoutingProtocolModel = {
			selectedMode: "",
			virtualInstance: null,
			protocol: "",
			ipv4unicast: "",
			ipv4as: "",
			ipv4asval : "",
			ipv6unicast: "",
			ipv6as: "",
			ipv6asval: "",
			routerid:null,
			ipv6routerid:null,
			network : false,
			networkipaddress:"",
			networkipwildcard:"",
			disablesplithorizon : "",
			ipv6disablesplithorizon : "",
			outgoinginterface : "",
			outgoinginterface_ipv6 : "",
			interface1: null,
			ipv6interface1: null,
			interface2: null,
			interface2_ipv6: null,
			routerIP : null,
			routerIP_ipv6 : null,
			variance : null,
			redistribute: null,
			authkey : null,
			stub : false,
			receive_only : false,
			redistribute_top : false,
			static : false,
			summary : false,
			stub_ipv6 : false,
			receive_only_ipv6 : false,
			redistribute_top_ipv6 : false,
			static_ipv6 : false,
			summary_ipv6 : false,
			enablebestpractices : false,
			processID : null,
			variance_ipv6 : null,
			redistribute_ipv6: null,
			processID_ipv6 : null,
			authkey_ipv6 : null,
			enablebestpractices_ipv6 : false
		};
		$scope.cancelAddEditKendoWindow = function(){
			myWindow.data("kendoWindow").close();
			angular.element('#routingProtocolGrid').data('kendoGrid').refresh();
			$scope.selectedArray = [];
			$scope.disableDeleteButton=true;
		};
		$scope.doneAddEditKendoWindow = function () { 
			if($scope.routingProtocolValidations.validate()) { 
				addRoutingProtocolModel.selectedMode = $scope.routingProtocolModel.selectedMode;
				addRoutingProtocolModel.virtualInstance = $scope.routingProtocolModel.virtualInstance;
				addRoutingProtocolModel.protocol = $scope.routingProtocolModel.protocol;
				if(addRoutingProtocolModel.protocol == 'IPv4' || addRoutingProtocolModel.protocol == 'IPv4/IPv6'){
					addRoutingProtocolModel.ipv4unicast = $scope.routingProtocolModel.ipv4unicast;
					addRoutingProtocolModel.ipv4asval = $scope.routingProtocolModel.ipv4asval;
				}
				if(addRoutingProtocolModel.protocol == 'IPv6' || addRoutingProtocolModel.protocol == 'IPv4/IPv6'){
					addRoutingProtocolModel.ipv6unicast = $scope.routingProtocolModel.ipv6unicast;
					addRoutingProtocolModel.ipv6asval = $scope.routingProtocolModel.ipv6asval;
				}
				if( addRoutingProtocolModel.protocol == 'IPv4' ){
					addRoutingProtocolModel.as = addRoutingProtocolModel.ipv4asval;
				}else if( addRoutingProtocolModel.protocol == 'IPv6' ){
					addRoutingProtocolModel.as = addRoutingProtocolModel.ipv6asval;
				}else if( addRoutingProtocolModel.protocol == 'IPv4/IPv6' ){
					addRoutingProtocolModel.as = addRoutingProtocolModel.ipv4asval + '/'+addRoutingProtocolModel.ipv6asval;
				}
				if(addRoutingProtocolModel.selectedMode == "advance" && (addRoutingProtocolModel.protocol == 'IPv4' || addRoutingProtocolModel.protocol == 'IPv4/IPv6') ){
					if($scope.routingProtocolModel.routerid !== "" && $scope.routingProtocolModel.routerid !== null){
						addRoutingProtocolModel.routerid = $scope.routingProtocolModel.routerid;
					}else{
						addRoutingProtocolModel.routerid = null;
					}
					addRoutingProtocolModel.networks= [];
					if($scope.routingProtocolModel.network == true){ 
						for(var i=0; i< $scope.routingProtocolNetworkData.length; i++){
							addRoutingProtocolModel.networks.push($scope.routingProtocolNetworkData[i]);
						}
					}
					addRoutingProtocolModel.splitinterfaces= [];
					if($scope.routingProtocolModel.disablesplithorizon == true){ 
						for(var i=0; i< $scope.routingProtocolSplitHorData.length; i++){
							addRoutingProtocolModel.splitinterfaces.push($scope.routingProtocolSplitHorData[i]);
						}
					}
					addRoutingProtocolModel.outgoinginterfaces= [];
					if($scope.routingProtocolModel.outgoinginterface == true){
						for(var i=0; i< $scope.routingProtocolInterfaceData.length; i++){
							addRoutingProtocolModel.outgoinginterfaces.push($scope.routingProtocolInterfaceData[i]);
						}
					}
					if($scope.routingProtocolModel.variance !== "" && $scope.routingProtocolModel.variance !== null){
						addRoutingProtocolModel.variance = $scope.routingProtocolModel.variance;
					}else{
						addRoutingProtocolModel.variance = null;
					}
					if($scope.routingProtocolModel.redistribute !== "" && $scope.routingProtocolModel.redistribute !== null){
						addRoutingProtocolModel.redistribute = $scope.routingProtocolModel.redistribute;
						if($scope.routingProtocolModel.redistribute == 'Ospf'){
							addRoutingProtocolModel.processID = $scope.routingProtocolModel.processID;
						}
					}
					if($scope.routingProtocolModel.enablebestpractices == true){ 
						addRoutingProtocolModel.enablebestpractices = $scope.routingProtocolModel.enablebestpractices;
					}
					if($scope.routingProtocolModel.authkey !== "" && $scope.routingProtocolModel.authkey !== null){ 
						addRoutingProtocolModel.authkey = $scope.routingProtocolModel.authkey;
					}else{
						addRoutingProtocolModel.authkey = null;
					}
					addRoutingProtocolModel.stub = $scope.routingProtocolModel.stub;
					addRoutingProtocolModel.receive_only = $scope.routingProtocolModel.receive_only;
					addRoutingProtocolModel.redistribute_top = $scope.routingProtocolModel.redistribute_top;
					addRoutingProtocolModel.static = $scope.routingProtocolModel.static;
					addRoutingProtocolModel.summary = $scope.routingProtocolModel.summary;
				}
				if(addRoutingProtocolModel.selectedMode == "advance" && (addRoutingProtocolModel.protocol == 'IPv6' || addRoutingProtocolModel.protocol == 'IPv4/IPv6') ){
					addRoutingProtocolModel.ipv6splitinterfaces= [];
					addRoutingProtocolModel.ipv6outgoinginterfaces= [];
					if($scope.routingProtocolModel.ipv6routerid !== "" && $scope.routingProtocolModel.ipv6routerid !== null){
						addRoutingProtocolModel.ipv6routerid = $scope.routingProtocolModel.ipv6routerid;
					}else{
						addRoutingProtocolModel.ipv6routerid = null;
					}
					if($scope.routingProtocolModel.ipv6disablesplithorizon == true){ 
						for(var i=0; i< $scope.ipv6routingProtocolSplitHorData.length; i++){
							addRoutingProtocolModel.ipv6splitinterfaces.push($scope.ipv6routingProtocolSplitHorData[i]);
						}
					}
					if($scope.routingProtocolModel.outgoinginterface_ipv6 == true){
						for(var i=0; i< $scope.ipv6_routingProtocolInterfaceData.length; i++){
							addRoutingProtocolModel.ipv6outgoinginterfaces.push($scope.ipv6_routingProtocolInterfaceData[i]);
						}
					}
					if($scope.routingProtocolModel.variance_ipv6 !== "" && $scope.routingProtocolModel.variance_ipv6 !== null){
						addRoutingProtocolModel.variance_ipv6 = $scope.routingProtocolModel.variance_ipv6;
					}else{
						addRoutingProtocolModel.variance_ipv6 = null;
					}
					if($scope.routingProtocolModel.redistribute_ipv6 !== "" && $scope.routingProtocolModel.redistribute_ipv6 !== null){
						addRoutingProtocolModel.redistribute_ipv6 = $scope.routingProtocolModel.redistribute_ipv6;
						if($scope.routingProtocolModel.redistribute_ipv6 == 'Ospf'){
							addRoutingProtocolModel.processID_ipv6 = $scope.routingProtocolModel.processID_ipv6;
						}
					}
					addRoutingProtocolModel.stub_ipv6 = $scope.routingProtocolModel.stub_ipv6;
					addRoutingProtocolModel.receive_only_ipv6 = $scope.routingProtocolModel.receive_only_ipv6;
					addRoutingProtocolModel.redistribute_top_ipv6 = $scope.routingProtocolModel.redistribute_top_ipv6;
					addRoutingProtocolModel.static_ipv6 = $scope.routingProtocolModel.static_ipv6;
					addRoutingProtocolModel.summary_ipv6 = $scope.routingProtocolModel.summary_ipv6;
					
					if($scope.routingProtocolModel.enablebestpractices_ipv6 == true){ 
						addRoutingProtocolModel.enablebestpractices_ipv6 = $scope.routingProtocolModel.enablebestpractices_ipv6;
					}
					if($scope.routingProtocolModel.authkey_ipv6 !== "" && $scope.routingProtocolModel.authkey_ipv6 !== null){ 
						addRoutingProtocolModel.authkey_ipv6 = $scope.routingProtocolModel.authkey_ipv6;
					}else{
						addRoutingProtocolModel.authkey_ipv6 = null;
					}
				}
				addRoutingProtocolModel.created = true;
				$scope.routingProtocolGridData.push(addRoutingProtocolModel);
				$scope.applyRoutingProtocol();
				myWindow.data("kendoWindow").close();
			}
		};
		$scope.interfaceOptions = [];
		$scope.redistributeOptions = [{
										redistributeName : translate('ntp_none'),
										redistributeValue : 'None'
									},{
										redistributeName : translate('routing_protocols_eigrp_connected'),
										redistributeValue : 'Connected'
									}, {
										redistributeName : translate('routing_protocols_eigrp_ospf'),
										redistributeValue : 'Ospf'
									}];
		$scope.onSelectRoutingProtocolHandler = function(data) {
			$scope.routingProtocolModel.redistribute = null;	
			$scope.selectedRoute = angular.copy(data);
			angular.element("#routingProtocolForm  span.k-tooltip-validation").hide();
			$scope.kendoWindow.isEditMode = false;
			$scope.routingProtocolModel = angular.copy(data); 
			$scope.routingProtocolModel.ipv4as = true;
			$scope.routingProtocolModel.ipv6as = true;
			$scope.routingProtocolModel.interface1 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.interface2 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.ipv6interface1 = $scope.interfaceOptions[0].interfaceName;
			$scope.routingProtocolModel.interface2_ipv6 = $scope.interfaceOptions[0].interfaceName;
			//$scope.routingProtocolModel.selectedMode = 'basic';
			$scope.changeBasicAdvance();
			if($scope.routingProtocolModel.protocol == "IPv4"){
				$scope.updateipv6Flag = true;
				$scope.updateipv4Flag = false;
			}else if($scope.routingProtocolModel.protocol == "IPv6"){
				$scope.updateipv4Flag = true;
				$scope.updateipv6Flag = false;
			} else{
				$scope.updateipv4Flag = true;
				$scope.updateipv6Flag = true;
			}
			if($scope.routingProtocolModel.protocol == "IPv4" || $scope.routingProtocolModel.protocol == "IPv4/IPv6"){
				$scope.routingProtocolModel.ipv4unicast = true;
				$scope.routingProtocolModel.ipv4as = true;
				if($scope.routingProtocolModel.protocol == "IPv4/IPv6"){
					$scope.routingProtocolModel.ipv4asval = $scope.routingProtocolModel.as.split('/')[0];	
				}else{
					$scope.routingProtocolModel.ipv4asval = $scope.routingProtocolModel.as;	
				}
				
				//load split horizon data
				if($scope.routingProtocolModel.splitinterfaces && $scope.routingProtocolModel.splitinterfaces.length > 0){ 
					$scope.routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
					for(var k =0 ;k < $scope.routingProtocolModel.splitinterfaces.length; k++){ 
						var temp = {};
						temp.network= $scope.routingProtocolModel.splitinterfaces[k].network;
						$scope.routingProtocolSplitHorData.push(temp);
					}
					$scope.splitHorizonDataSource = new kendo.data.DataSource({
						pageSize:10,
						data: $scope.routingProtocolSplitHorData
					});
				}else{
					$scope.routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
					$scope.splitHorizonDataSource = new kendo.data.DataSource({
						pageSize:10,
						data: $scope.routingProtocolSplitHorData
					});
				}
				//load outgoing interface neighbors
				if($scope.routingProtocolModel.outgoinginterfaces && $scope.routingProtocolModel.outgoinginterfaces.length > 0){ 
					$scope.routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
					for(var k =0 ;k < $scope.routingProtocolModel.outgoinginterfaces.length; k++){ 
						var temp = {};
						temp.interfacename= $scope.routingProtocolModel.outgoinginterfaces[k].interfacename;
						temp.peerrouterip= $scope.routingProtocolModel.outgoinginterfaces[k].peerrouterip;
						$scope.routingProtocolInterfaceData.push(temp);
					}
					$scope.outgoingInterfaceSource = new kendo.data.DataSource( {
						pageSize:10,
						data: $scope.routingProtocolInterfaceData
					}); 
				}else{
					$scope.routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
					$scope.outgoingInterfaceSource = new kendo.data.DataSource( {
						pageSize:10,
						data: $scope.routingProtocolInterfaceData
					}); 
				}
			}
			if($scope.routingProtocolModel.protocol == "IPv6"  || $scope.routingProtocolModel.protocol == "IPv4/IPv6"){
				$scope.routingProtocolModel.ipv6unicast = true;
				$scope.routingProtocolModel.ipv6as = true;
				if($scope.routingProtocolModel.protocol == "IPv4/IPv6"){
					$scope.routingProtocolModel.ipv6asval = $scope.routingProtocolModel.as.split('/')[1];	
				}else{
					$scope.routingProtocolModel.ipv6asval = $scope.routingProtocolModel.as;
				}
				//load split horizon data
				if($scope.routingProtocolModel.splitinterfacesipv6.length > 0){ 
					$scope.ipv6routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
					for(var k =0 ;k < $scope.routingProtocolModel.splitinterfacesipv6.length; k++){ 
						var temp = {};
						temp.ipv6network= $scope.routingProtocolModel.splitinterfacesipv6[k].network;
						$scope.ipv6routingProtocolSplitHorData.push(temp);
					}
					$scope.ipv6splitHorizonDataSource = new kendo.data.DataSource(
					{
						pageSize:10,
						data: $scope.ipv6routingProtocolSplitHorData
					});
				}else{
					$scope.ipv6routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
					$scope.ipv6splitHorizonDataSource = new kendo.data.DataSource( {
						pageSize:10,
						data: $scope.ipv6routingProtocolSplitHorData
					});
				}
				//load outgoing interface neighbors
				if($scope.routingProtocolModel.outgoinginterfacesipv6.length > 0){ 
					$scope.ipv6_routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
					for(var k =0 ;k < $scope.routingProtocolModel.outgoinginterfacesipv6.length; k++){ 
						var temp = {};
						temp.ipv6_interfacename= $scope.routingProtocolModel.outgoinginterfacesipv6[k].interfacename;
						temp.ipv6_peerrouterip= $scope.routingProtocolModel.outgoinginterfacesipv6[k].peerrouterip;
						$scope.ipv6_routingProtocolInterfaceData.push(temp);
					}
					$scope.ipv6_outgoingInterfaceSource = new kendo.data.DataSource({
						pageSize:10,
						data: $scope.ipv6_routingProtocolInterfaceData
					});
				}else{
					$scope.ipv6_routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
					$scope.ipv6_outgoingInterfaceSource = new kendo.data.DataSource({
						pageSize:10,
						data: $scope.ipv6_routingProtocolInterfaceData
					});
				}					
			}
			//load network data to network grid
			if($scope.routingProtocolModel.networks.length > 0){ 
				$scope.routingProtocolNetworkData = new kendo.data.ObservableArray([]);
				for(var k =0 ;k < $scope.routingProtocolModel.networks.length; k++){ 
					var temp = {};
					temp.network= $scope.routingProtocolModel.networks[k].network;
					temp.wildcard = $scope.routingProtocolModel.networks[k].wildcard;
					$scope.routingProtocolNetworkData.push(temp);
					$scope.networkGridDataSource = new kendo.data.DataSource({
						pageSize:10,
						data: $scope.routingProtocolNetworkData
					});
				}
			}else{
				$scope.routingProtocolNetworkData = new kendo.data.ObservableArray([]);
				$scope.networkGridDataSource = new kendo.data.DataSource({
					pageSize:10,
					data: $scope.routingProtocolNetworkData
				});
			}
			myWindow.data("kendoWindow").open().center();
			
		};
		$scope.redistributeLAGLoading = function() {
			if($scope.routingProtocolModel.redistribute != '' && $scope.routingProtocolModel.redistribute != null){ 
				angular.element("#redistribute").data('kendoDropDownList').value($scope.routingProtocolModel.redistribute); 
			}else{
				$scope.routingProtocolModel.redistribute = $scope.redistributeOptions[0].redistributeName;
			}
		}; 
		$scope.redistributeIpv6LAGLoading = function() {
			if($scope.routingProtocolModel.redistribute_ipv6 != '' && $scope.routingProtocolModel.redistribute_ipv6 != null){ 
				angular.element("#redistribute_ipv6").data('kendoDropDownList').value($scope.routingProtocolModel.redistribute_ipv6);
			}else{
				$scope.routingProtocolModel.redistribute_ipv6 = $scope.redistributeOptions[0].redistributeName;
			}				
		};
		$scope.updateRoutingProtocolChange = function() {
			if($scope.routingProtocolValidations.validate())
			{
				var selSRIndex = $scope.routingProtocolGrid.dataSource.indexOf($scope.routingProtocolModel);
				var isUpdated = false;
				angular.forEach($scope.routingProtocolGridData[selSRIndex], function(value, upKey) {
					if($scope.routingProtocolGridData[selSRIndex][upKey] != $scope.routingProtocolModel[upKey]){
						isUpdated = true;
					}
				});
				if(isUpdated){
					$scope.routingProtocolGridData[selSRIndex].networks= [];
					$scope.routingProtocolGridData[selSRIndex].splitinterfaces= [];
					$scope.routingProtocolGridData[selSRIndex].outgoinginterfaces= [];
					$scope.routingProtocolGridData[selSRIndex].ipv6network= [];
					$scope.routingProtocolGridData[selSRIndex].ipv6splitinterfaces= [];
					$scope.routingProtocolGridData[selSRIndex].ipv6outgoinginterfaces= [];
					$scope.routingProtocolGridData[selSRIndex].protocol = $scope.routingProtocolModel.protocol;
					$scope.routingProtocolGridData[selSRIndex].virtualInstance = $scope.routingProtocolModel.virtualInstance;
					$scope.routingProtocolGridData[selSRIndex].selectedMode = $scope.routingProtocolModel.selectedMode;
					if($scope.routingProtocolModel.protocol == 'IPv4' || $scope.routingProtocolModel.protocol == 'IPv4/IPv6'){
						$scope.routingProtocolGridData[selSRIndex].ipv4unicast = $scope.routingProtocolModel.ipv4unicast;
						$scope.routingProtocolGridData[selSRIndex].ipv4asval = $scope.routingProtocolModel.ipv4asval;
						if($scope.routingProtocolModel.selectedMode == "advance"){
							//Router id edit
							if($scope.routingProtocolModel.routerid != $scope.selectedRoute.routerid){
								if($scope.routingProtocolModel.routerid == undefined){
									$scope.routingProtocolGridData[selSRIndex].routerid = null;
								}else{
									$scope.routingProtocolGridData[selSRIndex].routerid = $scope.routingProtocolModel.routerid;
								}
							}else{
								$scope.routingProtocolGridData[selSRIndex].routerid = $scope.selectedRoute.routerid;
							}
							//split network edit
							if($scope.routingProtocolModel.network == true){ 
								for(var i=0; i< $scope.routingProtocolNetworkData.length; i++){
									$scope.routingProtocolGridData[selSRIndex].networks.push($scope.routingProtocolNetworkData[i]);
								}
							}
							//split interfaces edit
							if($scope.routingProtocolModel.disablesplithorizon == true){ 
								for(var i=0; i< $scope.routingProtocolSplitHorData.length; i++){
									$scope.routingProtocolGridData[selSRIndex].splitinterfaces.push($scope.routingProtocolSplitHorData[i]);
								}
							}
							//outgoing i/f edit
							if($scope.routingProtocolModel.outgoinginterface == true){ 
								for(var i=0; i< $scope.routingProtocolInterfaceData.length; i++){
									$scope.routingProtocolGridData[selSRIndex].outgoinginterfaces.push($scope.routingProtocolInterfaceData[i]);
								}
							}
							//stub data
							$scope.routingProtocolGridData[selSRIndex].stub = ($scope.routingProtocolModel.stub != $scope.selectedRoute.stub) ? $scope.routingProtocolModel.stub : $scope.selectedRoute.stub;
							$scope.routingProtocolGridData[selSRIndex].receive_only = ($scope.routingProtocolModel.receive_only != $scope.selectedRoute.receive_only) ? $scope.routingProtocolModel.receive_only : $scope.selectedRoute.receive_only;
							$scope.routingProtocolGridData[selSRIndex].redistribute_top = ($scope.routingProtocolModel.redistribute_top != $scope.selectedRoute.redistribute_top) ? $scope.routingProtocolModel.redistribute_top : $scope.selectedRoute.redistribute_top;
							$scope.routingProtocolGridData[selSRIndex].static = ($scope.routingProtocolModel.static != $scope.selectedRoute.static) ? $scope.routingProtocolModel.static : $scope.selectedRoute.static;
							$scope.routingProtocolGridData[selSRIndex].summary = ($scope.routingProtocolModel.summary != $scope.selectedRoute.summary) ? $scope.routingProtocolModel.summary : $scope.selectedRoute.summary;
							//Variance edit
							if($scope.routingProtocolModel.variance != $scope.selectedRoute.variance){
								if($scope.routingProtocolModel.variance == undefined){
									$scope.routingProtocolGridData[selSRIndex].variance = null;
								}else{
									$scope.routingProtocolGridData[selSRIndex].variance = $scope.routingProtocolModel.variance;
								}
							}else{
								$scope.routingProtocolGridData[selSRIndex].variance = $scope.selectedRoute.variance;
							}
							//Redistribute edit
							if($scope.routingProtocolModel.redistribute != null && $scope.routingProtocolModel.redistribute != $scope.selectedRoute.redistribute){
								$scope.routingProtocolGridData[selSRIndex].redistribute = $scope.routingProtocolModel.redistribute;
								if($scope.routingProtocolModel.redistribute == 'Ospf'){
									$scope.routingProtocolGridData[selSRIndex].processID = $scope.routingProtocolModel.processID;
								}
							}else{
								$scope.routingProtocolGridData[selSRIndex].redistribute = $scope.selectedRoute.redistribute;
								if($scope.selectedRoute.redistribute == 'Ospf'){
									$scope.routingProtocolGridData[selSRIndex].processID = $scope.selectedRoute.processID;
								}
							}
							//Auth key edit
							if($scope.routingProtocolModel.authkey != null && $scope.routingProtocolModel.authkey != $scope.selectedRoute.authkey){
								$scope.routingProtocolGridData[selSRIndex].authkey = $scope.routingProtocolModel.authkey;
							}else{
								$scope.routingProtocolGridData[selSRIndex].authkey = $scope.selectedRoute.authkey;
							}
							//Enable best practices
							if($scope.routingProtocolModel.enablebestpractices && $scope.routingProtocolModel.enablebestpractices != $scope.selectedRoute.enablebestpractices){
								$scope.routingProtocolGridData[selSRIndex].enablebestpractices = $scope.routingProtocolModel.enablebestpractices;
							}else{
								$scope.routingProtocolGridData[selSRIndex].enablebestpractices = $scope.selectedRoute.enablebestpractices;
							}
						}
					}
					if($scope.routingProtocolModel.protocol == 'IPv6' || $scope.routingProtocolModel.protocol == 'IPv4/IPv6'){
						$scope.routingProtocolGridData[selSRIndex].ipv6unicast = $scope.routingProtocolModel.ipv6unicast;
						$scope.routingProtocolGridData[selSRIndex].ipv6asval = $scope.routingProtocolModel.ipv6asval;
						if($scope.routingProtocolModel.selectedMode == "advance"){
							//Router id edit
							if($scope.routingProtocolModel.ipv6routerid != $scope.selectedRoute.ipv6routerid){
								if($scope.routingProtocolModel.ipv6routerid == undefined){
									$scope.routingProtocolGridData[selSRIndex].ipv6routerid = null;
								}else{
									$scope.routingProtocolGridData[selSRIndex].ipv6routerid = $scope.routingProtocolModel.ipv6routerid;
								}		
							}else{
								$scope.routingProtocolGridData[selSRIndex].ipv6routerid = $scope.selectedRoute.ipv6routerid;
							}
							//split interfaces edit
							if($scope.routingProtocolModel.ipv6disablesplithorizon == true){ 
								for(var i=0; i< $scope.ipv6routingProtocolSplitHorData.length; i++){
									$scope.routingProtocolGridData[selSRIndex].ipv6splitinterfaces.push($scope.ipv6routingProtocolSplitHorData[i]);
								}
							}
							//outgoing i/f edit
							if($scope.routingProtocolModel.outgoinginterface_ipv6 == true){ 
								for(var i=0; i< $scope.ipv6_routingProtocolInterfaceData.length; i++){
									$scope.routingProtocolGridData[selSRIndex].ipv6outgoinginterfaces.push($scope.ipv6_routingProtocolInterfaceData[i]);
								}
							}
							//stub data
							$scope.routingProtocolGridData[selSRIndex].stub_ipv6 = ($scope.routingProtocolModel.stub_ipv6 != $scope.selectedRoute.stub_ipv6) ? $scope.routingProtocolModel.stub_ipv6 : $scope.selectedRoute.stub_ipv6;
							$scope.routingProtocolGridData[selSRIndex].receive_only_ipv6 = ($scope.routingProtocolModel.receive_only_ipv6 != $scope.selectedRoute.receive_only_ipv6) ? $scope.routingProtocolModel.receive_only_ipv6 : $scope.selectedRoute.receive_only_ipv6;
							$scope.routingProtocolGridData[selSRIndex].redistribute_top_ipv6 = ($scope.routingProtocolModel.redistribute_top_ipv6 != $scope.selectedRoute.redistribute_top_ipv6) ? $scope.routingProtocolModel.redistribute_top_ipv6 : $scope.selectedRoute.redistribute_top_ipv6;
							$scope.routingProtocolGridData[selSRIndex].static_ipv6 = ($scope.routingProtocolModel.static_ipv6 != $scope.selectedRoute.static_ipv6) ? $scope.routingProtocolModel.static_ipv6 : $scope.selectedRoute.static_ipv6;
							$scope.routingProtocolGridData[selSRIndex].summary_ipv6 = ($scope.routingProtocolModel.summary_ipv6 != $scope.selectedRoute.summary_ipv6) ? $scope.routingProtocolModel.summary_ipv6 : $scope.selectedRoute.summary_ipv6;
							//Variance edit
							if($scope.routingProtocolModel.variance_ipv6 != $scope.selectedRoute.variance_ipv6){
								if($scope.routingProtocolModel.variance_ipv6 == undefined){
									$scope.routingProtocolGridData[selSRIndex].variance_ipv6 = null;
								}else{
									$scope.routingProtocolGridData[selSRIndex].variance_ipv6 = $scope.routingProtocolModel.variance_ipv6;
								}
							}else{
								$scope.routingProtocolGridData[selSRIndex].variance_ipv6 = $scope.selectedRoute.variance_ipv6;
							}
							//Redistribute edit
							if($scope.routingProtocolModel.redistribute_ipv6 != null && $scope.routingProtocolModel.redistribute_ipv6 != $scope.selectedRoute.redistribute_ipv6){
								$scope.routingProtocolGridData[selSRIndex].redistribute_ipv6 = $scope.routingProtocolModel.redistribute_ipv6;
								if($scope.routingProtocolModel.redistribute_ipv6 == 'Ospf'){
									$scope.routingProtocolGridData[selSRIndex].processID_ipv6 = $scope.routingProtocolModel.processID_ipv6;
								}
							}else{
								$scope.routingProtocolGridData[selSRIndex].redistribute_ipv6 = $scope.selectedRoute.redistribute_ipv6;
								if($scope.selectedRoute.redistribute_ipv6 == 'Ospf'){
									$scope.routingProtocolGridData[selSRIndex].processID_ipv6 = $scope.selectedRoute.processID_ipv6;
								}
							}
							//Auth key edit
							if($scope.routingProtocolModel.authkey_ipv6 != null && $scope.routingProtocolModel.authkey_ipv6 != $scope.selectedRoute.authkey_ipv6){
								$scope.routingProtocolGridData[selSRIndex].authkey_ipv6 = $scope.routingProtocolModel.authkey_ipv6;
							}else{
								$scope.routingProtocolGridData[selSRIndex].authkey_ipv6 = $scope.selectedRoute.authkey_ipv6;
							}
							//Enable best practices
							if($scope.routingProtocolModel.enablebestpractices_ipv6 && $scope.routingProtocolModel.enablebestpractices_ipv6 != $scope.selectedRoute.enablebestpractices_ipv6){
								$scope.routingProtocolGridData[selSRIndex].enablebestpractices_ipv6 = $scope.routingProtocolModel.enablebestpractices_ipv6;
							}else{
								$scope.routingProtocolGridData[selSRIndex].enablebestpractices_ipv6 = $scope.selectedRoute.enablebestpractices_ipv6;
							}
						}
					}
					if( $scope.routingProtocolModel.protocol == 'IPv4' ){
						$scope.routingProtocolGridData[selSRIndex].as = $scope.routingProtocolModel.ipv4asval;
					}else if( $scope.routingProtocolModel.protocol == 'IPv6' ){
						$scope.routingProtocolGridData[selSRIndex].as = $scope.routingProtocolModel.ipv6asval;
					}else if( $scope.routingProtocolModel.protocol == 'IPv4/IPv6' ){
						$scope.routingProtocolGridData[selSRIndex].as = $scope.routingProtocolModel.ipv4asval + '/'+$scope.routingProtocolModel.ipv6asval;
					}
					$scope.routingProtocolGridData[selSRIndex].dirty = true;
					$scope.routingProtocolGrid.refresh();
				}
				if(isUpdated == true){
					$scope.applyRoutingProtocol();
				}
				myWindow.data("kendoWindow").close();
			}
		};
		$scope.selectedArray = [];
		$scope.selectRows = function (checked, dataItem) {
			if (checked == false) {
				var index = $scope.selectedArray.indexOf(dataItem);
				if (index > -1) {
					$scope.selectedArray.splice(index, 1);
					if($scope.selectedArray.length === 0){
						$scope.disableDeleteButton = true;
					}
				}
			}
			else {
				$scope.disableDeleteButton = false;
				$scope.selectedArray.push(dataItem);
			}
		};
		$scope.showDeleteWindow = function (value) {
			if (value) {
				$scope.deleteRoutingProtocolWindow.open().center();
				$scope.disableApplyButton = false;
			} else {
				$scope.disableDeleteButton = true;
				$scope.loadRoutingProtocol();
				$scope.deleteRoutingProtocolWindow.close();
			}
		};
		$scope.deleteRoutingProtocols = function() {
			$scope.deleteProtocolArray = [];
			$scope.deleteRoutingProtocolWindow.close();
			for (var index = 0; index < $scope.selectedArray.length; index++) {
				$scope.routingProtocolGrid.dataSource.remove($scope.selectedArray[index]);
				$scope.deleteProtocolArray.push($scope.selectedArray[index]); 
			}
			$scope.disableDeleteButton = true;
			$scope.selectedArray = [];
			$scope.applyRoutingProtocol();
		};
		function filterCommunity(data1, data2) {
			var a = angular.copy(data1);
			var b = angular.copy(data2);
			for (var i = 0, len = a.length; i < len; i++) {
				for (var j = 0, len2 = b.length; j < len2; j++) {
					if ((a[i].protocol == b[j].protocol) && (a[i].virtualInstance == b[j].virtualInstance)  && (a[i].as == b[j].as) && (a[i].routerid == b[j].routerid) && (a[i].ipv6routerid == b[j].ipv6routerid) && (a[i].variance == b[j].variance) && (a[i].variance_ipv6 == b[j].variance_ipv6) && (a[i].authkey == b[j].authkey) && (a[i].authkey_ipv6 == b[j].authkey_ipv6)  && (a[i].stub == b[j].stub) && (a[i].stub_ipv6 == b[j].stub_ipv6) && (a[i].receive_only == b[j].receive_only) && (a[i].receive_only_ipv6 == b[j].receive_only_ipv6) && (a[i].redistribute_top == b[j].redistribute_top) && (a[i].redistribute_top_ipv6 == b[j].redistribute_top_ipv6) && (a[i].static == b[j].static) && (a[i].static_ipv6 == b[j].static_ipv6) && (a[i].summary == b[j].summary) && (a[i].summary_ipv6 == b[j].summary_ipv6) && (a[i].enablebestpractices == b[j].enablebestpractices) && (a[i].enablebestpractices_ipv6 == b[j].enablebestpractices_ipv6)  && (JSON.stringify(a[i].splitinterfaces) == JSON.stringify(b[j].splitinterfaces)) && (JSON.stringify(a[i].ipv6splitinterfaces) == JSON.stringify(b[j].ipv6splitinterfaces)) && (JSON.stringify(a[i].outgoinginterfaces) == JSON.stringify(b[j].outgoinginterfaces)) && (JSON.stringify(a[i].ipv6outgoinginterfaces) == JSON.stringify(b[j].ipv6outgoinginterfaces)) && (JSON.stringify(a[i].networks) == JSON.stringify(b[j].networks)) && (a[i].redistribute == b[j].redistribute) && (a[i].processID == b[j].processID) && (a[i].redistribute_ipv6 == b[j].redistribute_ipv6) && (a[i].processID_ipv6 == b[j].processID_ipv6) ) {
						b.splice(j, 1);
						len2 = b.length;
					}
				}
			}
			return b;
		}
		var isOneTime = true;
		$scope.dhcpexcludedCommunityPristineData = {};
		$scope.applyRoutingProtocol = function(){ //apply function
			var pristineDatastatic = angular.copy($scope.dhcpexcludedCommunityPristineData);
			var currentDataTemp = angular.copy($scope.routingProtocolGrid.dataSource._data);
			var createRoutingProtocol = filterCommunity(pristineDatastatic, currentDataTemp); 
			var deleteRoutingProtocol = filterCommunity(currentDataTemp, pristineDatastatic);
			var routingProtocolConfigCLI = "";
			if(angular.isDefined(deleteRoutingProtocol) && deleteRoutingProtocol.length > 0){
				for(var i=0;i<deleteRoutingProtocol.length;i++){
					routingProtocolConfigCLI += "no router eigrp "+ deleteRoutingProtocol[i].virtualInstance + " \n";				
				}
			}
			if(isOneTime){
				isOneTime = false;
				routingProtocolConfigCLI += "ip routing \n";
			} 
			if(createRoutingProtocol.length > 0 ){
				for(var crind = 0;crind<createRoutingProtocol.length;crind++){ 
					if(createRoutingProtocol[crind].protocol == "IPv6" || createRoutingProtocol[crind].protocol == "IPv4/IPv6"){ //CLI FOR IPV6
						routingProtocolConfigCLI += "ipv6 unicast-routing \n";
					}
					//cli for virtual instance both ipv4 & ipv6
					routingProtocolConfigCLI += "router eigrp "+ createRoutingProtocol[crind].virtualInstance + " \n"; 
					//FOR IPV4
					if(createRoutingProtocol[crind].protocol == "IPv4" || createRoutingProtocol[crind].protocol == "IPv4/IPv6"){ 
						if(createRoutingProtocol[crind].ipv4unicast == true){
							routingProtocolConfigCLI += "address-family ipv4 unicast autonomous-system "+ createRoutingProtocol[crind].ipv4asval + " \n";
						}else{
							routingProtocolConfigCLI += "address-family ipv4 autonomous-system "+ createRoutingProtocol[crind].ipv4asval + " \n";
						}
						//CLI FOR ADVANCED CONFIG STARTS
						routingProtocolConfigCLI += $scope.getAdvancedData(createRoutingProtocol[crind]) != ''  ? $scope.getAdvancedData(createRoutingProtocol[crind]) : '';
						//CLI FOR ADVANCED CONFIG ENDS
						if( createRoutingProtocol[crind].protocol == "IPv4/IPv6"){ //CLI FOR IPV6
							routingProtocolConfigCLI += "exit-address-family \n";
						}
					}
					//FOR IPV6
					if(createRoutingProtocol[crind].protocol == "IPv6"  || createRoutingProtocol[crind].protocol == "IPv4/IPv6"){
						if(createRoutingProtocol[crind].ipv6unicast == true){
							routingProtocolConfigCLI += "address-family ipv6 unicast autonomous-system "+ createRoutingProtocol[crind].ipv6asval + " \n";
						}else{
							routingProtocolConfigCLI += "address-family ipv6 autonomous-system "+ createRoutingProtocol[crind].ipv6asval + " \n";
						}
						//CLI FOR ADVANCED CONFIG STARTS
						routingProtocolConfigCLI += $scope.getAdvancedDataIpv6(createRoutingProtocol[crind]) != ''  ? $scope.getAdvancedDataIpv6(createRoutingProtocol[crind]) : '';
						//CLI FOR ADVANCED CONFIG ENDS
					}
					
				}
				routingProtocolConfigCLI += "exit \n";
			}
			if(routingProtocolConfigCLI != ''){
				var result = requestRoutingService.getConfigCmdOutput(routingProtocolConfigCLI);
				if(result==""){
					notificationService.showNotification(translate('eigrp_success_msg'),translate('com_config_success_title'),'success');
					$scope.loadRoutingProtocol();
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			routingProtocolConfigCLI = "";
		};
		$scope.getAdvancedData = function(data){ 
			var cli = "";
			if(data.selectedMode == "advance" && (data.protocol == "IPv4"||data.protocol == "IPv4/IPv6") ){
				if(data.routerid !== "" && data.routerid !== null){
					cli += "eigrp router-id "+ data.routerid + " \n";
				}else{
					cli += "no eigrp router-id \n";
				}
				if(data.network != '' && data.network.length > 0){
					for(var j=0; j< data.network.length; j++){
						if(data.network[j].network != '' && data.network[j].wildcard != ''){
							cli += "network " + data.network[j].network +" " + data.network[j].wildcard + "\n";
						}
					}
				}else{
					//update cli
				}
				if(data.networks && data.networks != "" && data.networks.length > 0){
					for(var j=0; j< data.networks.length; j++){
						if(data.networks[j].network != "" && data.networks[j].network != undefined){
							if(data.networks[j].wildcard != "" && data.networks[j].wildcard != undefined){
								cli += "network " + data.networks[j].network +" " + data.networks[j].wildcard + "\n";
							}else{
								cli += "network " + data.networks[j].network +" 0.255.255.255" + "\n";
							}
						}
					}
				}else{
					//update cli
				}
				if(data.splitinterfaces != '' && data.splitinterfaces.length > 0){
					for(var j=0; j< data.splitinterfaces.length; j++){
						if(data.splitinterfaces[j].network != ''){
							cli += "af-interface  " + data.splitinterfaces[j].network +"\n"+"no split-horizon \n"+"exit-af-interface \n";
						}
					} 
				}else{
					//update cli
				}
				if(data.outgoinginterfaces != '' && data.outgoinginterfaces.length > 0){
					for(var j=0; j< data.outgoinginterfaces.length; j++){
						if(data.outgoinginterfaces[j].interface2 != '' && data.outgoinginterfaces[j].routerIP != ''){
							cli += "neighbor  " + data.outgoinginterfaces[j].peerrouterip +" " +  data.outgoinginterfaces[j].interfacename +" \n";
						}
					} 
				}else{
					//update cli
				}
				
				if(data.stub == true){
					if(data.receive_only == true){
						cli += "eigrp stub receive-only \n"
					}else{
						cli += " eigrp stub  "
						if(data.redistribute_top == true){
							cli += " redistributed  "
						}
						if(data.static == true){
							cli += " static  "
						}
						if(data.summary == true){
							cli += " summary  "
						}
						cli += "\n"
					}
				}
				if(data.enablebestpractices == true){
					cli += " metric weights 0 0 1 0 0 0 0 \n";
					cli += " eigrp log-neighbor-changes \n"
					cli += " eigrp log-neighbor-warnings \n"
				}
				cli += "topology base \n";
				if(data.variance != '' && data.variance != null){
					cli += "variance  " + data.variance + " \n"
				}else{
					
				}
				if(data.redistribute != '' && data.redistribute != null && data.redistribute != 'None'){
					if(data.redistribute == "Ospf"){
						cli += "redistribute ospf "+ data.processID + "  \n";
					}else if(data.redistribute == "Connected"){
						cli += "redistribute connected \n"
					}
				}
				if(data.enablebestpractices == true){
					cli += "eigrp event-log-size 500 \nmaximum-paths 4 \ndistance eigrp 90 170 \n"
				}
				cli += "exit-af-topology \n";
				cli += "af-interface default \n";
				if(data.authkey != '' && data.authkey != null ){
					cli += "authentication key-chain "+data.authkey+"\n";
				}
				if(data.enablebestpractices == true){
					cli += " passive-interface \n";
					cli += " no hello-interval \n";
					cli += " no hold-time \n";
					cli += " authentication mode md5 \n";
				}
			}
			return cli;
		};
		$scope.getAdvancedDataIpv6 = function(data){ 
			var cli = "";
			if(data.selectedMode == "advance" && (data.protocol == "IPv6"||data.protocol == "IPv4/IPv6") ){
				if(data.ipv6routerid !== "" && data.ipv6routerid !== null){
					cli += "eigrp router-id "+ data.ipv6routerid + " \n";
				}else{
					cli += "no eigrp router-id \n";
				}
				if(data.ipv6splitinterfaces != '' && data.ipv6splitinterfaces.length > 0){
					for(var j=0; j< data.ipv6splitinterfaces.length; j++){
						if(data.ipv6splitinterfaces[j].ipv6network != ''){
							cli += "af-interface  " + data.ipv6splitinterfaces[j].ipv6network +"\n"+"no split-horizon \n"+"exit-af-interface \n";
						}
					} 
				}else{
					//update cli
				}
				if(data.ipv6outgoinginterfaces != '' && data.ipv6outgoinginterfaces.length > 0){
					for(var j=0; j< data.ipv6outgoinginterfaces.length; j++){
						if(data.ipv6outgoinginterfaces[j].interface2_ipv6 != '' && data.ipv6outgoinginterfaces[j].routerIP_ipv6 != ''){
							cli += "neighbor  " + data.ipv6outgoinginterfaces[j].ipv6_peerrouterip +" " +  data.ipv6outgoinginterfaces[j].ipv6_interfacename +" \n";
						}
					} 
				}else{
					//update cli
				}
				if(data.stub_ipv6 == true){
					if(data.receive_only_ipv6 == true){
						cli += "eigrp stub receive-only \n"
					}else{
						cli += " eigrp stub  "
						if(data.redistribute_top_ipv6 == true){
							cli += " redistributed  "
						}
						if(data.static_ipv6 == true){
							cli += " static  "
						}
						if(data.summary_ipv6 == true){
							cli += " summary  "
						}
						cli += "\n"
					}
				}
				if(data.enablebestpractices_ipv6 == true){
					cli += " metric weights 0 0 1 0 0 0 0 \n";
					cli += " eigrp log-neighbor-changes \n"
					cli += " eigrp log-neighbor-warnings \n"
				}
				cli += "topology base \n";
				if(data.variance != '' && data.variance_ipv6 != null){
					cli += "variance  " + data.variance_ipv6 + " \n"
				}else{
					
				}
				if(data.redistribute_ipv6 != '' && data.redistribute_ipv6 != null && data.redistribute_ipv6 != 'None'){
					if(data.redistribute_ipv6 == "Ospf"){
						cli += "redistribute ospf "+ data.processID_ipv6 + "  \n";
					}else if(data.redistribute_ipv6 == "Connected"){
						cli += "redistribute connected \n"
					}
				}
				if(data.enablebestpractices_ipv6 == true){
					cli += "eigrp event-log-size 500 \nmaximum-paths 4 \ndistance eigrp 90 170 \n"
				}
				cli += "exit-af-topology \n";
				cli += "af-interface default \n";
				if(data.authkey_ipv6 != '' && data.authkey_ipv6 != null ){
					cli += "authentication key-chain "+data.authkey_ipv6+"\n";
				}
				if(data.enablebestpractices_ipv6 == true){
					cli += " passive-interface \n";
					cli += " no hello-interval \n";
					cli += " no hold-time \n";
					cli += " authentication mode md5 \n";
				}
			}
			return cli;
		};
		$scope.loadRoutingProtocol = function(){ //loading the kendo grid
			var routingProtocolOptions=[],interfaceOptions = [];
			var routingProtocolNames="";
			var protocolNext = "";
			var virtualInstanceNext = "";
			var asNext = "";
		
			//Sending all the required CLIs
			var routingProtocolCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show run | sec router eigrp \n show ip int brief \n");
			var arrStatus=routingProtocolCLIOP[1].split("\n");
    		for (var i=1; i < arrStatus.length; i++) {    			
    			var interfaceName= arrStatus[i].substring(0,22).trim();	    			
				interfaceOptions = {
					"interfaceName": interfaceName,
					"interfaceValue": interfaceName
				};
				$scope.interfaceOptions.push(interfaceOptions);				
    	    }
			var protocolsRunningConfig=routingProtocolCLIOP[0].split("router eigrp "); 
			$scope.routingProtocolGridData = new kendo.data.ObservableArray([]);
			for(var i = 1; i < protocolsRunningConfig.length; i++){
				var tempRoutingProtocolModel = {
						protocol: null,
						virtualInstance: null,
						as: "",
						routerid: "",
						ipv6routerid: "",
						network : false,
						networks : ""
				};
				intShowRun="router eigrp "+protocolsRunningConfig[i];
				routingProtocolNames= executeCliCmdService.getNextString(intShowRun,["router eigrp "],["\n"]).trim();
				tempRoutingProtocolModel.virtualInstance = routingProtocolNames;
				tempRoutingProtocolModel.protocol = '';
				tempRoutingProtocolModel.routerid = '';
				tempRoutingProtocolModel.ipv6routerid = '';
				tempRoutingProtocolModel.networks = [];
				tempRoutingProtocolModel.splitinterfaces = [];
				tempRoutingProtocolModel.splitinterfacesipv6 = [];
				tempRoutingProtocolModel.outgoinginterfaces = [];
				tempRoutingProtocolModel.outgoinginterfacesipv6 = [];
				if( intShowRun.indexOf("address-family ") != -1){
					protocols = intShowRun.split("address-family ");
					for(var j=1;j< protocols.length; j++){ 
						protocols[j]="address-family "+protocols[j];
						if(j != 1){
							tempRoutingProtocolModel.protocol += '/';
						}
						tempRoutingProtocolModel.protocol += protocols[j].split(' ')[1] == 'ipv4' ? 'IPv4' : (protocols[j].split(' ')[1] == 'ipv6' ? 'IPv6' : 'IPv4/IPv6');
						//get basic/advanced
						if( protocols[j].indexOf("eigrp router-id ") != -1 || protocols[j].indexOf("network ") != -1 || protocols[j].indexOf("no split-horizon") != -1 || protocols[j].indexOf("neighbor ") != -1 || protocols[j].indexOf("variance ") != -1 || protocols[j].indexOf("redistribute ") != -1 || protocols[j].indexOf("authentication key-chain ") != -1 || protocols[j].indexOf("metric weights ") != -1){
							tempRoutingProtocolModel.selectedMode = 'advance';
						}else{
							tempRoutingProtocolModel.selectedMode = 'basic';
						}
						//Get router id 
						if( protocols[j].indexOf("eigrp router-id ") != -1){
							routerids = protocols[j].split("eigrp router-id "); 
							routerids = "router-id " + routerids[1];
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.routerid = routerids.split(' ')[1];
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.ipv6routerid = routerids.split(' ')[1];
							}
						}
						//Get network data
						if( protocols[j].indexOf("network ") != -1){
							tempRoutingProtocolModel.network = true;
							networks = protocols[j].split("network "); 
							for(var l=1;l< networks.length; l++){ 
								networks[l]="network "+networks[l];
								networks[l]= executeCliCmdService.getNextString(networks[l],["network "],["\n"]).trim();
								var temp = {};
								temp.network= networks[l].split(' ')[0];
								temp.wildcard = networks[l].split(' ')[1];
								tempRoutingProtocolModel.networks.push(temp); 
							}
						}
						//Get disable split horizon
						if( protocols[j].indexOf("no split-horizon") != -1){
							horizons = protocols[j].split("af-interface "); 
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.disablesplithorizon = true;
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.ipv6disablesplithorizon = true;
							}
							for(var l=1;l< horizons.length; l++){
								horizons[l]="af-interface "+horizons[l];
								horizons[l]= executeCliCmdService.getNextString(horizons[l],["af-interface "],["\n"]).trim();
								var temp = {};
								temp.network= horizons[l];
								if(protocols[j].split(' ')[1] == 'ipv4'){
									tempRoutingProtocolModel.splitinterfaces.push(temp);
								}
								if(protocols[j].split(' ')[1] == 'ipv6'){
									tempRoutingProtocolModel.splitinterfacesipv6.push(temp);
								}
							}
						}
						//Get outgoing interfaces
						if( protocols[j].indexOf("neighbor ") != -1){
							neighbors = protocols[j].split("neighbor "); 
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.outgoinginterface = true;
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.outgoinginterface_ipv6 = true;
							}
							for(var l=1;l< neighbors.length; l++){
								neighbors[l]="neighbor "+neighbors[l];
								neighbors[l]= executeCliCmdService.getNextString(neighbors[l],["neighbor "],["\n"]).trim();
								var temp = {};
								temp.interfacename= neighbors[l].split(' ')[1]; 
								temp.peerrouterip= neighbors[l].split(' ')[0]; 
								if(protocols[j].split(' ')[1] == 'ipv4'){
									tempRoutingProtocolModel.outgoinginterfaces.push(temp);
								}
								if(protocols[j].split(' ')[1] == 'ipv6'){
									tempRoutingProtocolModel.outgoinginterfacesipv6.push(temp);
								}
							}
						}
						//get stub and other data
						if( protocols[j].indexOf("eigrp stub ") != -1){
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.stub = true;
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.stub_ipv6 = true;
							}
							if(protocols[j].indexOf("receive-only")!= -1){
								if(protocols[j].split(' ')[1] == 'ipv4'){
									tempRoutingProtocolModel.receive_only = true;
								}
								if(protocols[j].split(' ')[1] == 'ipv6'){
									tempRoutingProtocolModel.receive_only_ipv6 = true;
								}
							}else{
								if(protocols[j].split(' ')[1] == 'ipv4'){
									tempRoutingProtocolModel.receive_only = false;
									tempRoutingProtocolModel.static = protocols[j].indexOf("static ")!= -1 ? true : false;
									tempRoutingProtocolModel.redistribute_top = protocols[j].indexOf("redistributed")!= -1 ? true : false;
									tempRoutingProtocolModel.summary = protocols[j].indexOf("summary ")!= -1 ? true : false;
								}
								if(protocols[j].split(' ')[1] == 'ipv6'){
									tempRoutingProtocolModel.receive_only_ipv6 = false;
									tempRoutingProtocolModel.static_ipv6 = protocols[j].indexOf("static ")!= -1 ? true : false;
									tempRoutingProtocolModel.redistribute_top_ipv6 = protocols[j].indexOf("redistributed")!= -1 ? true : false;
									tempRoutingProtocolModel.summary_ipv6 = protocols[j].indexOf("summary ")!= -1 ? true : false;
								}
							}
						}
						//Get variance
						if( protocols[j].indexOf("variance ") != -1){
							variances = protocols[j].split("variance "); 
							variances = "variance " + variances[1];
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.variance = variances.split(' ')[1];
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.variance_ipv6 = variances.split(' ')[1];
							}
						}
						//get redistribute
						if( protocols[j].indexOf("redistribute ") != -1){
							redistributes = protocols[j].split("redistribute "); 
							redistributes = "redistribute " + redistributes[1];
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.redistribute = redistributes.split(' ')[1];
								tempRoutingProtocolModel.redistribute = tempRoutingProtocolModel.redistribute.charAt(0).toUpperCase() + tempRoutingProtocolModel.redistribute.slice(1).trim();
								if(tempRoutingProtocolModel.redistribute == 'Ospf'){
									if( protocols[j].indexOf("redistribute ospf ") != -1){
										processids = protocols[j].split("redistribute ospf "); 
										processids = "redistribute-ospf " + processids[1];
										if(protocols[j].split(' ')[1] == 'ipv4'){
											tempRoutingProtocolModel.processID = processids.split(' ')[1].trim();
										}
										if(protocols[j].split(' ')[1] == 'ipv6'){
											tempRoutingProtocolModel.processID = processids.split(' ')[1].trim();
										}
									}
								}
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.redistribute_ipv6 = redistributes.split(' ')[1];
								tempRoutingProtocolModel.redistribute_ipv6 = tempRoutingProtocolModel.redistribute_ipv6.charAt(0).toUpperCase() + tempRoutingProtocolModel.redistribute_ipv6.slice(1).trim();
								if(tempRoutingProtocolModel.redistribute_ipv6 == 'Ospf'){
									if( protocols[j].indexOf("redistribute ospf ") != -1){
										processids = protocols[j].split("redistribute ospf "); 
										processids = "redistribute-ospf " + processids[1];
										if(protocols[j].split(' ')[1] == 'ipv4'){
											tempRoutingProtocolModel.processID_ipv6 = processids.split(' ')[1].trim();
										}
										if(protocols[j].split(' ')[1] == 'ipv6'){
											tempRoutingProtocolModel.processID_ipv6 = processids.split(' ')[1].trim();
										}
									}
								}
							}
						}else{
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.redistribute= $scope.redistributeOptions[0].redistributeName;
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.redistribute_ipv6 = $scope.redistributeOptions[0].redistributeName;
							}
						}
						//auth key authentication key-chain 
						if( protocols[j].indexOf("authentication key-chain ") != -1){
							keys = protocols[j].split("authentication key-chain "); 
							keys = "authentication-key-chain " + keys[1];
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.authkey = keys.split(' ')[1];
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.authkey_ipv6 = keys.split(' ')[1];
							}
						}
						//Enable best practices  metric weights 
						if( protocols[j].indexOf("metric weights ") != -1){
							if(protocols[j].split(' ')[1] == 'ipv4'){
								tempRoutingProtocolModel.enablebestpractices = true;
							}
							if(protocols[j].split(' ')[1] == 'ipv6'){
								tempRoutingProtocolModel.enablebestpractices_ipv6 = true;
							}
						}else{
							tempRoutingProtocolModel.enablebestpractices = false;
							tempRoutingProtocolModel.enablebestpractices_ipv6 = false;
						}
					}
					systems = intShowRun.split("autonomous-system ");
					tempRoutingProtocolModel.as = '';
					for(var j=1;j< systems.length; j++){ 
						systems[j]="autonomous-system "+systems[j];
						if(j != 1){
							tempRoutingProtocolModel.as += '/';
						}
						tempRoutingProtocolModel.as += systems[j].split(' ')[1];
					}
				}else{
					continue;
				}
				$scope.routingProtocolGridData.push(tempRoutingProtocolModel);
			}
			$scope.dhcpexcludedCommunityPristineData = {};
			$scope.dhcpexcludedCommunityPristineData = angular.copy($scope.routingProtocolGridData);
			$scope.routingProtocolDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.routingProtocolGridData
			});
			angular.element(".pageLoader").hide();
			angular.element(".btnView").show();
		}
		$timeout(function(){
			$scope.loadRoutingProtocol();	
		},10);
		
		//ADVANCED EIGRP OPTIONS FOR IPV4 / (IPV4/IPV6)
		$scope.changeBasicAdvance = function(){
			if($scope.routingProtocolModel.selectedMode == 'advance'){
				var topVal = angular.element('.k-window').css('top').split('px')[0];
				$scope.popuptop = topVal + "px";
				var newTop = topVal - (topVal*.95);
				angular.element('.k-window').css('top',newTop+"px");
				angular.element('.routingProtocolDiv').css('height',($(window).height() * 0.75) + 'px');
				angular.element('.routingProtocolDiv').css('overflow-x','hidden');
			}else{
				/* angular.element('.k-window').css('top',$scope.popuptop);
				angular.element('.routingProtocolDiv').css('height','auto'); */
				myWindow.data("kendoWindow").open().center();
				angular.element('.routingProtocolDiv').css('height','auto');
			}
		};
		
		//Network grid
		$scope.networkGridOptions = { 
			editable: false,
			sortable: true,
			pageable: {
				info: false,
				refresh: false, 
				pageSizes: false,
				previousNext: true,
				numeric: true
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
			scrollable: false,
			selectable: true,
			columns: [{
					field: "network",
					title: translate('toggle_network'),
					editable: false,
					width: "1px"
				},
				{
					field: "wildcard",
					title: translate('wild_card'),
					editable: false,
					width: "1px"
				},
				{
					title: translate('com_remove'),
					width: "10px",
					template: "<div class='k-grid-delete' ng-click=\"removeNetwork(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
				}
			]
		};
		$scope.routingProtocolNetworkData = new kendo.data.ObservableArray([]);
		$scope.networkGridDataSource = new kendo.data.DataSource(
		{
			pageSize:10,
			data: $scope.routingProtocolNetworkData
		});
		$scope.addNetworkData = function(){ //add network data to the network grid
			if(($scope.routingProtocolModel.networkipaddress != null && $scope.routingProtocolModel.networkipaddress != "") && ($scope.routingProtocolModel.networkipwildcard!= null && $scope.routingProtocolModel.networkipwildcard!= "") && $scope.routingProtocolValidations.validateInput(angular.element("input[name=networkipaddress]")) && $scope.routingProtocolValidations.validateInput(angular.element("input[name=networkipwildcard]"))){
				var valAccepted = false
				if($scope.routingProtocolNetworkData.length>0){
					var valueToBeChecked = $scope.routingProtocolModel.networkipaddress;
					var parameterToBeChecked = "network";
					if($scope.checkduplicates(valueToBeChecked, parameterToBeChecked, "networkGrid")){
						valAccepted = true;
					}else{
						valAccepted = false;
					}
				}else{
					valAccepted = true;
				}
				if(valAccepted){
					var temp = {};
					temp.network=$scope.routingProtocolModel.networkipaddress;
					temp.wildcard =$scope.routingProtocolModel.networkipwildcard;
					$scope.routingProtocolNetworkData.push(temp);
				}
				$scope.routingProtocolModel.networkipaddress = '';
				$scope.routingProtocolModel.networkipwildcard = '';
			}
		};
		$scope.checkduplicates = function(value, field, grid) {
			var validateGrid = angular.element("#"+grid).data("kendoGrid");
			var validateGridData = validateGrid.dataSource.data();
			for(var i=0;i<validateGridData.length;i++){
				if(field == "network"){
					if(trimVal(value)== trimVal(validateGridData[i].network)){ 
						return false;
					}
				}
				if(field == "peerrouterip"){
					if(trimVal(value)== trimVal(validateGridData[i].peerrouterip)){ 
						return false;
					}
				}
				if(field == "ipv6network"){
					if(trimVal(value)== trimVal(validateGridData[i].ipv6network)){ 
						return false;
					}
				}
				if(field == "ipv6_peerrouterip"){
					if(trimVal(value)== trimVal(validateGridData[i].ipv6_peerrouterip)){ 
						return false;
					}
				}
			}
			return true;
		};
		$scope.deleteNewtork = new kendo.data.ObservableArray([])
		$scope.removeNetwork = function(dataItem){
			var index = $scope.routingProtocolNetworkData.map(function(e) {
				return e.network;
			}).indexOf(dataItem.network);
			if(index != -1){
				if(!$scope.routingProtocolNetworkData[index].created){
					$scope.deleteNewtork.push($scope.routingProtocolNetworkData[index]);            
				}

				$scope.routingProtocolNetworkData.splice(index, 1);
			}
		};
		//split horizon grid
		$scope.splitHorizonGridOptions = { 
			editable: false,
			sortable: true,
			pageable: {
				info: false,
				refresh: false,
				pageSizes: false,
				previousNext: true,
				numeric: true
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
			scrollable: false,
			selectable: true,
			columns: [{
					field: "network",
					title: translate('portconfig_general_interface'),
					editable: false,
					width: "1px"
				},
				{
					title: translate('com_remove'),
					width: "10px",
					template: "<div class='k-grid-delete' ng-click=\"removeSplitHorizon(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
				}
			]
		};
		$scope.routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
		$scope.splitHorizonDataSource = new kendo.data.DataSource(
		{
			pageSize:10,
			data: $scope.routingProtocolSplitHorData
		});
		$scope.addSplitHorizonData = function(){ //add network data to the network grid
			if($scope.routingProtocolModel.interface1 !=''){
				var valAccepted = false
				if($scope.routingProtocolSplitHorData.length>0){
					var valueToBeChecked = $scope.routingProtocolModel.interface1;
					var parameterToBeChecked = "network";
					if($scope.checkduplicates(valueToBeChecked, parameterToBeChecked, "splitHorizonGrid")){
						valAccepted = true;
					}else{
						valAccepted = false;
					}
				}else{
					valAccepted = true;
				}
				if(valAccepted){
					var temp = {};
					temp.network=$scope.routingProtocolModel.interface1;
					$scope.routingProtocolSplitHorData.push(temp);
				}
			}
		};
		$scope.deleteSplitHorizon = new kendo.data.ObservableArray([])
		$scope.removeSplitHorizon = function(dataItem){
			var index = $scope.routingProtocolSplitHorData.map(function(e) {
				return e.network;
			}).indexOf(dataItem.network);
			if(index != -1){
				if(!$scope.routingProtocolSplitHorData[index].created){
					$scope.deleteSplitHorizon.push($scope.routingProtocolSplitHorData[index]);            
				}
				$scope.routingProtocolSplitHorData.splice(index, 1);
			}
		};
		//outgoing interface grid
		$scope.outgoingInterfaceGridOptions = { 
			editable: false,
			sortable: true,
			pageable: {
				info: false,
				refresh: false,
				pageSizes: false,
				previousNext: true,
				numeric: true
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
			scrollable: false,
			selectable: true,
			columns: [{
					field: "interfacename",
					title: translate('portconfig_general_interface'),
					editable: false,
					width: "1px"
				},
				{
					field: "peerrouterip",
					title: translate('peer_router'),
					editable: false,
					width: "1px"
				},
				{
					title: translate('com_remove'),
					width: "10px",
					template: "<div class='k-grid-delete' ng-click=\"removeOutgoingInterface(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
				}
			]
		};
		$scope.routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
		$scope.outgoingInterfaceSource = new kendo.data.DataSource(
		{
			pageSize:10,
			data: $scope.routingProtocolInterfaceData
		});
		$scope.addOutgoingInterface = function(){ //add network data to the network grid
			if($scope.routingProtocolModel.interface2 != null && $scope.routingProtocolModel.interface2 != "" && $scope.routingProtocolModel.routerIP != null && $scope.routingProtocolModel.routerIP != "" && $scope.routingProtocolValidations.validateInput(angular.element("input[name=routerIP]"))){
				var valAccepted = false
				if($scope.routingProtocolInterfaceData.length>0){
					var valueToBeChecked = $scope.routingProtocolModel.routerIP;
					var parameterToBeChecked = "peerrouterip";
					if($scope.checkduplicates(valueToBeChecked, parameterToBeChecked, "outgoingInterfaceGrid")){
						valAccepted = true;
					}else{
						valAccepted = false;
					}
				}else{
					valAccepted = true;
				}
				if(valAccepted){
					var temp = {};
					temp.interfacename=$scope.routingProtocolModel.interface2;
					temp.peerrouterip=$scope.routingProtocolModel.routerIP;
					$scope.routingProtocolInterfaceData.push(temp);
				}
				$scope.routingProtocolModel.routerIP = '';
			}
		};
		$scope.deleteInterface = new kendo.data.ObservableArray([])
		$scope.removeOutgoingInterface = function(dataItem){
			var index = $scope.routingProtocolInterfaceData.map(function(e) {
				return e.interfacename;
			}).indexOf(dataItem.interfacename);
			if(index != -1){
				if(!$scope.routingProtocolInterfaceData[index].created){
					$scope.deleteInterface.push($scope.routingProtocolInterfaceData[index]);            
				}
				$scope.routingProtocolInterfaceData.splice(index, 1);
			}

		};
		//ADVANCED EIGRP OPTIONS FOR IPV6 / (IPV4/IPV6)
		//split horizon grid
		$scope.ipv6splitHorizonGridOptions = { 
			editable: false,
			sortable: true,
			pageable: {
				info: false,
				refresh: false,
				pageSizes: false,
				previousNext: true,
				numeric: true
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
			scrollable: false,
			selectable: true,
			columns: [{
					field: "ipv6network",
					title: translate('portconfig_general_interface'),
					editable: false,
					width: "1px"
				},
				{
					title: translate('com_remove'),
					width: "10px",
					template: "<div class='k-grid-delete' ng-click=\"ipv6removeSplitHorizon(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
				}
			]
		};
		$scope.ipv6routingProtocolSplitHorData = new kendo.data.ObservableArray([]);
		$scope.ipv6splitHorizonDataSource = new kendo.data.DataSource(
		{
			pageSize:10,
			data: $scope.ipv6routingProtocolSplitHorData
		});
		$scope.ipv6addSplitHorizonData = function(){ //add network data to the network grid
			if($scope.routingProtocolModel.ipv6interface1 !=''){
				var valAccepted = false
				if($scope.ipv6routingProtocolSplitHorData.length>0){
					var valueToBeChecked = $scope.routingProtocolModel.ipv6interface1;
					var parameterToBeChecked = "ipv6network";
					if($scope.checkduplicates(valueToBeChecked, parameterToBeChecked, "ipv6splitHorizonGrid")){
						valAccepted = true;
					}else{
						valAccepted = false;
					}
				}else{
					valAccepted = true;
				}
				if(valAccepted){
					var temp = {};
					temp.ipv6network=$scope.routingProtocolModel.ipv6interface1;
					$scope.ipv6routingProtocolSplitHorData.push(temp);
				}
			}
		};
		$scope.ipv6deleteSplitHorizon = new kendo.data.ObservableArray([])
		$scope.ipv6removeSplitHorizon = function(dataItem){
			var index = $scope.ipv6routingProtocolSplitHorData.map(function(e) {
				return e.ipv6network;
			}).indexOf(dataItem.ipv6network);
			if(index != -1){
				if(!$scope.ipv6routingProtocolSplitHorData[index].created){
					$scope.ipv6deleteSplitHorizon.push($scope.ipv6routingProtocolSplitHorData[index]);            
				}
				$scope.ipv6routingProtocolSplitHorData.splice(index, 1);
			}
		};
		//outgoing interface grid
		$scope.ipv6_outgoingInterfaceGridOptions = { 
			editable: false,
			sortable: true,
			pageable: {
				info: false,
				refresh: false,
				pageSizes: false,
				previousNext: true,
				numeric: true
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
			scrollable: false,
			selectable: true,
			columns: [{
					field: "ipv6_interfacename",
					title: translate('portconfig_general_interface'),
					editable: false,
					width: "10px"
				},
				{
					field: "ipv6_peerrouterip",
					title: translate('peer_router'),
					editable: false,
					width: "10px"
				},
				{
					title: translate('com_remove'),
					width: "10px",
					template: "<div class='k-grid-delete' ng-click=\"removeOutgoingInterfaceIpv6(dataItem)\"><span class=\"fa pl-delete\"></span></div>"
				}
			]
		};
		$scope.ipv6_routingProtocolInterfaceData = new kendo.data.ObservableArray([]);
		$scope.ipv6_outgoingInterfaceSource = new kendo.data.DataSource(
		{
			pageSize:10,
			data: $scope.ipv6_routingProtocolInterfaceData
		});
		$scope.addOutgoingInterfaceIpv6 = function(){ //add network data to the network grid
			if($scope.routingProtocolModel.interface2_ipv6 != null && $scope.routingProtocolModel.interface2_ipv6 != "" && $scope.routingProtocolModel.routerIP_ipv6 != null  && $scope.routingProtocolModel.routerIP_ipv6 != "" && $scope.routingProtocolValidations.validateInput(angular.element("input[name=routerIP_ipv6]"))){
				var valAccepted = false
				if($scope.ipv6_routingProtocolInterfaceData.length>0){
					var valueToBeChecked = $scope.routingProtocolModel.routerIP_ipv6;
					var parameterToBeChecked = "ipv6_peerrouterip";
					if($scope.checkduplicates(valueToBeChecked, parameterToBeChecked, "ipv6_outgoingInterfaceGrid")){
						valAccepted = true;
					}else{
						valAccepted = false;
					}
				}else{
					valAccepted = true;
				}
				if(valAccepted){
					var temp = {};
					temp.ipv6_interfacename=$scope.routingProtocolModel.interface2_ipv6;
					temp.ipv6_peerrouterip=$scope.routingProtocolModel.routerIP_ipv6;
					$scope.ipv6_routingProtocolInterfaceData.push(temp);
				}
				$scope.routingProtocolModel.routerIP_ipv6 = '';
			}
		};
		$scope.deleteInterfaceIpv6 = new kendo.data.ObservableArray([])
		$scope.removeOutgoingInterfaceIpv6 = function(dataItem){
			var index = $scope.ipv6_routingProtocolInterfaceData.map(function(e) {
				return e.ipv6_interfacename;
			}).indexOf(dataItem.ipv6_interfacename);
			if(index != -1){
				if(!$scope.ipv6_routingProtocolInterfaceData[index].created){ 
					$scope.deleteInterfaceIpv6.push($scope.ipv6_routingProtocolInterfaceData[index]);            
				}

				$scope.ipv6_routingProtocolInterfaceData.splice(index, 1);
			}

		};	
	}
	//EIGRP CODE ENDS
	//Routing protocl validations for eigrp
	$scope.routingProtocolValidations = {
		rules: {
			range:function(input){
				return input.val()!== "" ? validationService.validateRange(input) : true;
			},
			validatevirtualinstance: function(input){
				return input.data('validatevirtualinstanceMsg') ? $scope.validateVirtualInstance(input.val())  : true;
			},
			duplicatevirtualinstance:function(input){
				return input.data('duplicatevirtualinstanceMsg') ? $scope.validateduplicates(input.val(),'virtualInstance')  : true;
			},
			duplicateas:function(input){
				return input.data('duplicateasMsg') ? $scope.validateduplicates(input.val(),'as')  : true;
			},
			validateip:function(input){
				return input.val()!== "" ? validationService.validateIPAddress(input) : true;
			},
			validatesubnet: function(input){
				if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255"){
					return true;
				}
				else{
					return input.data('validatesubnetMsg') && input.val()!== "" ? $scope.validateSubnetMask(input.val())  : true;
				}
			},
			ipv6 : function(input) {
				return input.val()!== "" && input.data('ipv6Msg') ? validationService.validateIpv6Address(input.val()) : true;
			}
		}
	};
	    
	}]);
