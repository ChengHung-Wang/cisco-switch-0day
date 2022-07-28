/**
Description: Controller for Static Routing
Copyright (c) 2017 by Cisco Systems, Inc.
All rights reserved.
*/
app.register.controller('staticRoutingCtrl', ['$scope','$timeout', '$filter' , 'validationService', 'notificationService', 'requestRoutingService' , 'gridCrudService','executeCliCmdService','getStringLineService', function ($scope, $timeout, $filter,  validationService, notificationService, requestRoutingService, gridCrudService,executeCliCmdService,getStringLineService) {
	var translate = $filter("translate");
	$scope.kendoWindow = {isEditMode:true };
	$scope.disableDeleteButton=true;
	$scope.disableApplyButton = true;
	$scope.editStatus=false;
	angular.extend($scope, {
		staticRouteModel:{
			ipType: "IPV4",
			interface1: null,
			ip: null,
			routeType: "",
			metric: null,
			prefix: null,
			prefixMask: null,
			routePath: "",
			nextHopIp2:""
		}
	});
	angular.element(".btnView").hide();
	angular.element(".pageLoader").show();
    // Start of Datastructures required for the feature
    $scope.staticRoutingGridOptions = {
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
                "template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"selectRows(checked,dataItem)\"  />", attributes: {style: "text-align:center"}, sortable: false
            },
            {
                field: "ipType", title: translate("staticrouting_ip_type")
            },
            {
                field: "prefix", title: translate("staticrouting_prefix")
            },
            {
                field: "prefixMask", title: translate("staticrouting_prefix_mask")
            },
            {
                field: "routePath", title: translate("staticrouting_next_hop_interface")
            },
            {
                field: "metric", title: translate("staticrouting_metric_distance")
            }
        ]
    };
	$scope.staticRoutingValidations = {
		rules: {
			validateip: function (input) {				
					return validationService.validateIPAddress(input);				
			},
			validatesubnet: function(input){				
					if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255"){
						return true;
					}
					else{
						return input.data('validatesubnetMsg') ? $scope.validateSubnetMask(input.val())  : true;
					}				
			},
			range:function(input){				
				  return validationService.validateRange(input);				
			},
			ipv6 : function(input) {
				return input.val()!== "" && input.data('ipv6Msg') ? validationService.validateIpv6Address(input.val()) : true;
			}
		}
	};
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
	// Refresh button trigger
	angular.element("#staticRoutingGrid").delegate(".k-pager-refresh", "click", function(){
		$scope.disableDeleteButton = true;
        $scope.selectedArray = [];
        if (!$scope.$$phase){
			$scope.$apply();
        }
	});
	$scope.ipv4Status=true;
	$scope.ipv6Status=false;
	$scope.onIpTypeChange= function(){
		if($scope.staticRouteModel.ipType=="IPV4"){
			$scope.ipv4Status=true;
			$scope.ipv6Status=false;
		}else{
			$scope.ipv4Status=false;
			$scope.ipv6Status=true;
		}
	}
	// popup function
	var myWindow = angular.element("#window");
	myWindow.kendoWindow({
		modal: true,
		width: "700px",
		title: translate("staticrouting_static_route"),
		visible: false,
		actions: [
			"Close"
		]
	}).data("kendoWindow").center();
    $scope.addStaticRoute = function() {
		myWindow.data("kendoWindow").open().center();
		$scope.kendoWindow.isEditMode = true;
		$scope.staticRouteModel.prefix = null;
		$scope.staticRouteModel.prefixMask = null;
		$scope.staticRouteModel.metric = null;
		$scope.staticRouteModel.ip = null;
		$scope.staticRouteModel.routeType = "IP";
		$scope.staticRouteModel.nextHopIp2 = "";
		if($scope.interfaceData.length > 0){
			$scope.staticRouteModel.interface1 = $scope.interfaceData[0].interfaceName;
		}else{
			$scope.staticRouteModel.interface1 = "";
		}
		$scope.staticRouteModel.routePath = "";
		angular.element("#staticRouteForm  span.k-tooltip-validation").hide();
		$scope.editStatus=false;
    };
	$scope.cancelAddEditKendoWindow = function(){
		myWindow.data("kendoWindow").close();
	};
	var addStaticRouteModel = {
		ipType: "IPV4",	
		interface1: null,
		ip: null,
		routeType: "",
		metric: null,
		prefix: null,
		prefixMask: null,
		routePath: "",
		nextHopIp2:""
	};
	$scope.doneAddEditKendoWindow = function () {
		if($scope.staticRoutingValidations.validate()) {
			addStaticRouteModel.ipType = $scope.staticRouteModel.ipType;
			addStaticRouteModel.prefix = $scope.staticRouteModel.prefix;
			addStaticRouteModel.prefixMask = $scope.staticRouteModel.prefixMask;
			addStaticRouteModel.metric = $scope.staticRouteModel.metric;
			addStaticRouteModel.routeType = $scope.staticRouteModel.routeType;
			addStaticRouteModel.ip = $scope.staticRouteModel.ip;
			addStaticRouteModel.interface1 = $scope.staticRouteModel.interface1;
			if(addStaticRouteModel.routeType === "IP")
			{
				addStaticRouteModel.routePath = $scope.staticRouteModel.ip;
			}
			if(addStaticRouteModel.routeType === "INTERFACE")
			{
				addStaticRouteModel.routePath = $scope.staticRouteModel.interface1;
			}
			if(addStaticRouteModel.routeType === "DHCP")
			{
				addStaticRouteModel.routePath = "dhcp";
			}
			if($scope.staticRouteModel.nextHopIp2 != "" && $scope.staticRouteModel.nextHopIp2 != undefined)
			{
				addStaticRouteModel.nextHopIp2 = $scope.staticRouteModel.nextHopIp2;
			}
			else{
				addStaticRouteModel.nextHopIp2 = "";
			}
			addStaticRouteModel.created = true;
			$scope.staticRoutingGridData.push(addStaticRouteModel);
			$scope.disableApplyButton = false;
			myWindow.data("kendoWindow").close();
		}
	};
	$scope.onSelectStaticRouteHandler = function(data) {
		$scope.selectedRoute = angular.copy(data);
		$scope.kendoWindow.isEditMode = false;
		$scope.editStatus=true;
		$scope.staticRouteModel = angular.copy(data);
		myWindow.data("kendoWindow").open();
		$scope.onIpTypeChange();
	};
	$scope.onFormRadioChange = function(mode) {
        if(mode === "INTERFACE")
        {
            if($scope.staticRouteModel.interface1 === null || $scope.staticRouteModel.interface1 === undefined)
            {
                if($scope.interfaceData.length > 0){
					$scope.staticRouteModel.interface1 = $scope.interfaceData[0].interfaceName;
				}else{
					$scope.staticRouteModel.interface1 = "";
				}
            }
        }
    };
	$scope.updateStaticRouteChange = function() {
		if($scope.staticRoutingValidations.validate())
        {
        	var selSRIndex = $scope.staticRoutingGrid.dataSource.indexOf($scope.staticRouteModel);
			var isUpdated = false;
			angular.forEach($scope.staticRoutingGridData[selSRIndex], function(value, upKey) {
        		if($scope.staticRoutingGridData[selSRIndex][upKey] != $scope.staticRouteModel[upKey]){
        			isUpdated = true;
        		}
        	});
        	if(isUpdated){
	            $scope.staticRoutingGridData[selSRIndex].prefix = $scope.staticRouteModel.prefix;
	            $scope.staticRoutingGridData[selSRIndex].prefixMask = $scope.staticRouteModel.prefixMask;
	            $scope.staticRoutingGridData[selSRIndex].routeType = $scope.staticRouteModel.routeType;
				$scope.staticRoutingGridData[selSRIndex].metric = $scope.staticRouteModel.metric;
	            if($scope.staticRouteModel.routeType === "IP") {
					$scope.staticRoutingGridData[selSRIndex].ip = $scope.staticRouteModel.ip;
	                $scope.staticRoutingGridData[selSRIndex].interface1 = "";
	                $scope.staticRoutingGridData[selSRIndex].nextHopIp2 = "";
	                $scope.staticRoutingGridData[selSRIndex].routePath = $scope.staticRouteModel.ip;
	            }else if($scope.staticRouteModel.routeType === "INTERFACE") {
	               $scope.staticRoutingGridData[selSRIndex].routePath = $scope.staticRouteModel.interface1;
	                $scope.staticRoutingGridData[selSRIndex].interface1 = $scope.staticRouteModel.interface1;
	                $scope.staticRoutingGridData[selSRIndex].ip = "";
	                if($scope.staticRouteModel.nextHopIp2 !== ""){
	                    $scope.staticRoutingGridData[selSRIndex].nextHopIp2 = $scope.staticRouteModel.nextHopIp2;
	                }else{
	                    $scope.staticRoutingGridData[selSRIndex].nextHopIp2 = "";
	                }
	            }else if($scope.staticRouteModel.routeType === "DHCP"){
					$scope.staticRoutingGridData[selSRIndex].ip = "";
	                $scope.staticRoutingGridData[selSRIndex].routePath = "dhcp";
	                $scope.staticRoutingGridData[selSRIndex].interface1 = "";
	                $scope.staticRoutingGridData[selSRIndex].nextHopIp2 = "";
	            }
	            $scope.staticRoutingGridData[selSRIndex].dirty = true;
	            $scope.staticRoutingGrid.refresh();
				$scope.disableApplyButton = false;
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
            $scope.deleteStaticRouteWindow.open().center();
			$scope.disableApplyButton = false;
        } else {
            $scope.deleteStaticRouteWindow.close();
        }
    };
	$scope.deleteStaticRoutes = function() {
		$scope.deleteStaticArray = [];
        $scope.deleteStaticRouteWindow.close();
        for (var index = 0; index < $scope.selectedArray.length; index++) {
            $scope.staticRoutingGrid.dataSource.remove($scope.selectedArray[index]);
			$scope.deleteStaticArray.push($scope.selectedArray[index]);
        }
		$scope.disableDeleteButton = true;
		$scope.selectedArray = [];
    };
	function filterCommunity(data1, data2) {
		var a = angular.copy(data1);
        var b = angular.copy(data2);
		for (var i = 0, len = a.length; i < len; i++) {
			for (var j = 0, len2 = b.length; j < len2; j++) {
				if ((a[i].prefix == b[j].prefix) && (a[i].prefixMask == b[j].prefixMask)  && (a[i].routeType == b[j].routeType) && (a[i].nextHopIp2 == b[j].nextHopIp2) && (a[i].metric == b[j].metric) && (b[j].ip == a[i].ip)) {
					b.splice(j, 1);
					len2 = b.length;
				}
			}
		}
		return b;
	}
	var isOneTime = true;
	$scope.dhcpexcludedCommunityPristineData = {};
	$scope.applyStaticRoute = function(){
		var pristineDatastatic = angular.copy($scope.dhcpexcludedCommunityPristineData);
		var currentDataTemp = angular.copy($scope.staticRoutingGrid.dataSource._data);
		var createStaticRoute = filterCommunity(pristineDatastatic, currentDataTemp);
		var deleteStaticRoute = filterCommunity(currentDataTemp, pristineDatastatic);
		var staticRouteCli = "";
		if(angular.isDefined(deleteStaticRoute) && deleteStaticRoute.length > 0){
			for(var i=0;i<deleteStaticRoute.length;i++){
				if(deleteStaticRoute[i].ipType == "IPV4"){
					if(deleteStaticRoute[i].routeType == "INTERFACE"){
						if(deleteStaticRoute[i].metric == 1){
							staticRouteCli += "no ip route "+ deleteStaticRoute[i].prefix + " " + deleteStaticRoute[i].prefixMask + " "+ deleteStaticRoute[i].interface1 + " " + deleteStaticRoute[i].nextHopIp2 + " \n";
						}else{
							staticRouteCli += "no ip route "+ deleteStaticRoute[i].prefix + " " + deleteStaticRoute[i].prefixMask + " "+ deleteStaticRoute[i].interface1 + " " + deleteStaticRoute[i].nextHopIp2 + " " + deleteStaticRoute[i].metric + " \n";
						}
					}else if(deleteStaticRoute[i].routeType == "IP"){
						if(deleteStaticRoute[i].metric == 1){
							staticRouteCli += "no ip route "+ deleteStaticRoute[i].prefix + " " + deleteStaticRoute[i].prefixMask + " " + deleteStaticRoute[i].ip +" \n";
						}else{
							staticRouteCli += "no ip route "+ deleteStaticRoute[i].prefix + " " + deleteStaticRoute[i].prefixMask + " " + deleteStaticRoute[i].ip + " " + deleteStaticRoute[i].metric + " \n";
						}
					}else if(deleteStaticRoute[i].routeType == "DHCP"){
						if(deleteStaticRoute[i].metric == 1){
							staticRouteCli += "no ip route "+ deleteStaticRoute[i].prefix + " " + deleteStaticRoute[i].prefixMask + " DHCP \n";
						}else{
							staticRouteCli += "no ip route "+ deleteStaticRoute[i].prefix + " " + deleteStaticRoute[i].prefixMask + " DHCP " + deleteStaticRoute[i].metric + " \n";
						}
					}
				}else{
					if(deleteStaticRoute[i].routeType == "INTERFACE"){ //ipv6 route 30:40::/40 Vlan23 30:40:: 50
						staticRouteCli += "no ipv6 route "+ deleteStaticRoute[i].prefix + "/" + deleteStaticRoute[i].prefixMask + " "+ deleteStaticRoute[i].interface1 + " " + deleteStaticRoute[i].nextHopIp2 +" \n";
					}else {//ipv6 route 2001:DB8:3C4D:15::/64 2001:DB8:3C4D:15::22 3
						staticRouteCli += "no ipv6 route "+ deleteStaticRoute[i].prefix + "/" + deleteStaticRoute[i].prefixMask + " " + deleteStaticRoute[i].ip +" \n";
					}
				}	
			}
		}
		if(createStaticRoute.length > 0 ){
			if(isOneTime){
				isOneTime = false;
				staticRouteCli += "ip routing \n";
			}
			for(var crind = 0;crind<createStaticRoute.length;crind++){
				if(createStaticRoute[crind].ipType == "IPV4"){
					if(createStaticRoute[crind].routeType == "INTERFACE"){
						staticRouteCli += "ip route "+ createStaticRoute[crind].prefix + " " + createStaticRoute[crind].prefixMask + " "+ createStaticRoute[crind].interface1 + " " + createStaticRoute[crind].nextHopIp2 + " " + createStaticRoute[crind].metric + " \n";
					}else if(createStaticRoute[crind].routeType == "IP"){
						staticRouteCli += "ip route "+createStaticRoute[crind].prefix.trim()+" "+createStaticRoute[crind].prefixMask.trim()+" "+createStaticRoute[crind].ip.trim()+" "+createStaticRoute[crind].metric.trim()+"\n";
					}else if(createStaticRoute[crind].routeType == "DHCP"){
						staticRouteCli += "ip route "+ createStaticRoute[crind].prefix + " " + createStaticRoute[crind].prefixMask + " DHCP " + createStaticRoute[crind].metric + " \n";
					}
			   }else{
				   if(createStaticRoute[crind].routeType == "INTERFACE"){
						staticRouteCli += "ipv6 route "+ createStaticRoute[crind].prefix + "/" + createStaticRoute[crind].prefixMask + " "+ createStaticRoute[crind].interface1 + " " + createStaticRoute[crind].nextHopIp2 + " " + createStaticRoute[crind].metric + " \n";
					}else if(createStaticRoute[crind].routeType == "IP"){
						staticRouteCli += "ipv6 route "+createStaticRoute[crind].prefix.trim()+"/"+createStaticRoute[crind].prefixMask.trim()+" "+createStaticRoute[crind].ip.trim()+" "+createStaticRoute[crind].metric.trim()+"\n";
					}
			   }
			}
		}
		staticRouteCli += "exit \n";
		var result = requestRoutingService.getConfigCmdOutput(staticRouteCli);
		if(result==""){
			notificationService.showNotification(translate('staticroute_success_msg'),translate('com_config_success_title'),'success');
			$scope.loadStaticRoute();
		}else{
			notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			$scope.beforeUpdateStaticRoute(result,createStaticRoute,deleteStaticRoute);
		}
		staticRouteCli = "";
		$scope.disableApplyButton = true;
	}
	$scope.beforeUpdateStaticRoute = function(result,createStaticRoute,deleteStaticRoute){
		if(result){
			var staticRouteNewCli = "";
			var createNewRoute = angular.copy(deleteStaticRoute);
			var spltArr = result.errorCmd.split(" ")[2];
			var crind = createStaticRoute.map(function(e) {
				return e.prefix;
			}).indexOf(spltArr);
			if(createNewRoute.length > 0 ){
				if(createNewRoute[crind].routeType == "INTERFACE"){
					staticRouteNewCli += "ip route "+ createNewRoute[crind].prefix + " " + createNewRoute[crind].prefixMask + " "+ createNewRoute[crind].interface1 + " " + createNewRoute[crind].nextHopIp2 + " " + createNewRoute[crind].metric + " \n";
				}else if(createNewRoute[crind].routeType == "IP"){
					staticRouteNewCli += "ip route "+createNewRoute[crind].prefix.trim()+" "+createNewRoute[crind].prefixMask.trim()+" "+createNewRoute[crind].ip.trim()+" "+createNewRoute[crind].metric.trim()+"\n";
				}else if(createNewRoute[crind].routeType == "DHCP"){
					staticRouteNewCli += "ip route "+ createNewRoute[crind].prefix + " " + createNewRoute[crind].prefixMask + " DHCP " + createNewRoute[crind].metric + " \n";
				}
			}
			staticRouteNewCli += "exit \n";
			requestRoutingService.getConfigCmdOutput(staticRouteNewCli);
			$scope.loadStaticRoute();
			staticRouteNewCli = "";
		}
	}
	$scope.loadStaticRoute = function(){
		//Sending all the required CLIs
	    var staticRouteCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show running-config | s interface\n show running-config partition ip-static-routes\n show run partition common | in route\n");
		//Setting the interface(vlan) list which starts with index vlan
		var interfaceOptions=[];
		var interfaceNames="";
		var interfacesRunningConfig=staticRouteCLIOP[0].split("interface");
		for(var i = 1; i < interfacesRunningConfig.length; i++){
			intShowRun="interface "+interfacesRunningConfig[i];
			interfaceNames= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
			if( (intShowRun.indexOf("no switchport")!=-1) || (interfaceNames.indexOf("Vlan")!=-1) ){
				interfaceOptions.push({
					"interfaceName" : interfaceNames,
					"interfaceValue": interfaceNames
				});
			}
		}
		$scope.interfaceData = new kendo.data.ObservableArray(interfaceOptions);
		$scope.staticRoutingGridData = new kendo.data.ObservableArray([]);
		var strCLIOutput1 = staticRouteCLIOP[1];
		var strCLIOutputsplt = getStringLineService.getLines(strCLIOutput1,["ip route"]);
		if(strCLIOutput1.indexOf("ip routing") != -1){
			isOneTime = false;
		}
		
		//Fetching and populating IPV4 Routing
		if(strCLIOutputsplt.length > 0 && strCLIOutputsplt[0] !== ""){
			for(var indexPos=0;indexPos<strCLIOutputsplt.length;indexPos++){
				var tempstaticRouteModel = {
					ipType: "IPV4",
					interface1: null,
					ip: null,
					routeType: "",
					metric: null,
					prefix: null,
					prefixMask: null,
					routePath: "",
					nextHopIp2:""
				};
				if(strCLIOutputsplt[indexPos].indexOf("cache") <= -1){
					var routeIp = strCLIOutputsplt[indexPos].split(" ");					
					tempstaticRouteModel.prefix = routeIp[2];
					tempstaticRouteModel.prefixMask = routeIp[3];
					tempstaticRouteModel.routePath = routeIp[4];
					if(routeIp[4].indexOf("dhcp") != -1){
						if(routeIp[5] == undefined){
							tempstaticRouteModel.metric = "1";
						}else{
							tempstaticRouteModel.metric = routeIp[5];
						}
						tempstaticRouteModel.routeType = "DHCP";
					}else if(routeIp[4].indexOf(".") != -1){
						tempstaticRouteModel.ip = routeIp[4];
						if(routeIp[5] == undefined){
							tempstaticRouteModel.metric = "1";
						}else{
							tempstaticRouteModel.metric = routeIp[5];
						}
						tempstaticRouteModel.routeType = "IP";
					}else{
						tempstaticRouteModel.interface1 = routeIp[4];
						tempstaticRouteModel.nextHopIp2 = routeIp[5];
						if(routeIp[6] == undefined){
							tempstaticRouteModel.metric = "1";
						}else{
							tempstaticRouteModel.metric = routeIp[6];
						}
						tempstaticRouteModel.routeType = "INTERFACE";
					}
					$scope.staticRoutingGridData.push(tempstaticRouteModel);
				}
			}
		}
		
		//Fetching and populating IPV6 route
		if(staticRouteCLIOP[2] !== ""){
			var strLines = getStringLineService.getLines(staticRouteCLIOP[2],["ipv6 route"]);
			for(var i=0;i<strLines.length;i++){
				var tempstaticRouteModel = {
					ipType:"IPV6",
					interface1: null,
					ip: null,
					routeType: "",
					metric: null,
					prefix: null,
					prefixMask: null,
					routePath: "",
					nextHopIp2:""
				};
				var ipv6Routes=strLines[i].split(" ");
				if(ipv6Routes.length>5){
					tempstaticRouteModel.prefix=ipv6Routes[2].split("/")[0];
					tempstaticRouteModel.prefixMask = ipv6Routes[2].split("/")[1];					
					tempstaticRouteModel.metric = ipv6Routes[5];
					tempstaticRouteModel.routeType = "INTERFACE";
					tempstaticRouteModel.routePath = ipv6Routes[3];
					tempstaticRouteModel.interface1 = ipv6Routes[3];	
					var ipAddress = ipv6Routes[4];
					/*var lastChar = ipAddress.charAt(parseFloat(ipAddress.length)-1)
					if(lastChar==":"){
					   ipAddress=ipAddress.substring(0, (parseFloat(ipAddress.length))-2)
					}*/
					tempstaticRouteModel.nextHopIp2 = ipAddress;
				}else{					
					tempstaticRouteModel.prefix=ipv6Routes[2].split("/")[0];
					tempstaticRouteModel.prefixMask = ipv6Routes[2].split("/")[1];	
					
					if(ipv6Routes[3].indexOf(":")!=-1){
						tempstaticRouteModel.routeType = "IP";
						var ipAddress = ipv6Routes[3];
						tempstaticRouteModel.metric = ipv6Routes[4];
						tempstaticRouteModel.ip = ipAddress;
						tempstaticRouteModel.routePath = ipAddress;
						tempstaticRouteModel.nextHopIp2 = ipAddress;
					}else{
						tempstaticRouteModel.routeType = "INTERFACE";
						tempstaticRouteModel.routePath = ipv6Routes[3];
						tempstaticRouteModel.interface1 = ipv6Routes[3];
						var ipAddress = ipv6Routes[4];
						tempstaticRouteModel.metric = "";						
						tempstaticRouteModel.nextHopIp2 = ipAddress;
					}
				}
				$scope.staticRoutingGridData.push(tempstaticRouteModel);				
			}
		}
		
		$scope.dhcpexcludedCommunityPristineData = {};
		$scope.dhcpexcludedCommunityPristineData = angular.copy($scope.staticRoutingGridData);
		$scope.staticRoutingDataSource = new kendo.data.DataSource({
			pageSize: 10,
			data: $scope.staticRoutingGridData
		});
		angular.element(".pageLoader").hide();
		angular.element(".btnView").show();
	}
	$timeout(function(){
		$scope.loadStaticRoute();
	},10);
}]);
