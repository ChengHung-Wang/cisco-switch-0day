
app.register.controller('VlanCtrl', ['$scope','$rootScope','$timeout', '$filter', 'gridCrudService','executeCliCmdService','dataSourceService','notificationService','dialogService','requestRoutingService','getStringLineService','validationService',
	function($scope,$rootScope,$timeout, $filter, gridCrudService,executeCliCmdService,dataSourceService,notificationService,dialogService,requestRoutingService,getStringLineService,validationService) {
		
		var translate = $filter("translate");
		angular.element(".btnView").hide();
		angular.element(".pageLoader").show();
		var trimVal=$filter('trimValue'), maxVlan;
		if( $rootScope.deviceInfo.type == "WS-C2960L-24TQ-LL" || $rootScope.deviceInfo.type.indexOf("CDB")!=-1 ){
			maxVlan = 64;
		}else{
			maxVlan = 512;
		}
		if($rootScope.deviceInfo.type.indexOf("WS-C2960+")!=-1 || ($rootScope.deviceInfo.type.indexOf("2960C") != -1 && $rootScope.deviceInfo.type.indexOf("2960CX") == -1)){
			$scope.hideIpv6 = true;
		}else{
			$scope.hideIpv6 = false;
		}
		if($rootScope.deviceInfo.type.indexOf("WS-C2960+")!=-1 ){
			$scope.hideElement = true;
		}else{
			$scope.hideElement = false;
		}
		$scope.logicalInterface ={
			vlan :{
				listIpb6Address : [],
				dhcp : false,
				rapid : false,
				autoconfig : false
			}
		}
		$scope.iptype ={
			ipv6 : false,
			ipv4 : false
		}
		$scope.ports ={
			dhcpHostName : "",
			portConfigIp : "",
			portConfigSubnet : "",
		}
		$scope.vlanIP = "";
		$scope.vlanSubnet = "";
		$scope.ipv6SubType = null;
		$scope.oldListIpb6Address = [];
		$scope.disableDeleteButton=true;
		$scope.ipv6TypeOptions = dataSourceService.ipv6TypeOptions();
		
	/*************VLAN2 configuration controller code.***************/
		//Showing configured vlan list in the grid
		var showVlanBrList=[];
		var isEditModeFlag = false;
		var igmpVLAN=[],igmpVLANStatus=[],igmpVLANImmeStatus=[],igmpVLANQueryCount=[],igmpVLANQueryInterval=[],igmpMode=[];
		$scope.mlearningMode=null;
	    $scope.mlearningModeOption = new kendo.data.ObservableArray([
		               {"modeText": translate('cgmp'), "modeValue": "cgmp"},
		               {"modeText": translate('pim-dvmrp'), "modeValue": "pim-dvmrp"}
		  ]);
		$scope.loadVlanDetails = function(){
			$scope.vlanApplySection  = true;
			$scope.vlanDeleteSection = true;
			var strCLIOutput = deviceCommunicatorCLI.getExecCmdOutput("show vlan brief\n show ip dhcp snooping\n show ip igmp snooping\nshow run | in igmp snooping\n show run | in ip arp inspection vlan\nshow ip dhcp snooping\nshow run | in dhcp snooping\n");
			//Vlan list of snooping enabled
			var vlanList= executeCliCmdService.getNextString(strCLIOutput[1],["configured on following VLANs:"],["DHCP snooping is operational"]);
			var vlanListNew=[];
			vlanList1=vlanList.split(',');
			for(var i=0;i<vlanList1.length;i++){
				if(vlanList1[i].indexOf("-")>-1){
					var lowEnd = Number(vlanList1[i].split('-')[0]);
					var highEnd = Number(vlanList1[i].split('-')[1]);
					for (var j = lowEnd; j <= highEnd; j++) {
						vlanListNew.push(j);
					}
				}else {
					vlanListNew.push(Number(vlanList1[i]));
				}
			}
			var finalVlanListNew1=[];
			for(var p=0;p<=vlanListNew.length-1;p++){
				if(!isNaN(vlanListNew[p])){
					finalVlanListNew1.push(vlanListNew[p]);
				}
			}
			//IGMP Snooping	
			    igmpVLAN=[],igmpVLANStatus=[],igmpVLANImmeStatus=[],igmpVLANQueryCount=[],igmpVLANQueryInterval=[];
				$scope.diableIGMPApplyButton=true;
				$scope.diableIGMPCancelButton=true;
				var igmpSnoopingList=strCLIOutput[2].split("Vlan ");
				var igmpGlobalStatus=executeCliCmdService.getNextString(igmpSnoopingList[0],["IGMP snooping                :"],["\n"]).trim()
				if(igmpGlobalStatus=="Enabled"){
					$scope.igmpGlobalConfig = translate("com_enable");
				}else{
					$scope.igmpGlobalConfig = translate("com_disable");
				}			
				if(strCLIOutput[3].indexOf("ip igmp snooping querier")!=-1){		
					$scope.igmpGlobalQurier = translate("com_enable");
				}else{
					$scope.igmpGlobalQurier = translate("com_disable");
				}
				var queryCountGlobal=executeCliCmdService.getNextString(igmpSnoopingList[0],["Last member query count      :"],["\n"]).trim()
				$scope.igmpGlobalQueryCount=queryCountGlobal;
				var queryIntervalGlobal=executeCliCmdService.getNextString(igmpSnoopingList[0],["Last member query interval   :"],["\n"]).trim()
				$scope.igmpGlobalQueryInterval=queryIntervalGlobal;			
	            for(var i = 1; i < igmpSnoopingList.length; i++){                
	                var vlanIgmp="Vlan "+igmpSnoopingList[i];
	                igmpVLAN.push(executeCliCmdService.getNextString(vlanIgmp,["Vlan "],[":"]).trim()); 
	                igmpVLANStatus.push(executeCliCmdService.getNextString(vlanIgmp,["IGMP snooping                       :"],["\n"]).trim()); 
	                igmpVLANImmeStatus.push(executeCliCmdService.getNextString(vlanIgmp,["IGMPv2 immediate leave              :"],["\n"]).trim()); 
	                igmpVLANQueryCount.push(executeCliCmdService.getNextString(vlanIgmp,["Last member query count             :"],["\n"]).trim()); 
	                igmpVLANQueryInterval.push(executeCliCmdService.getNextString(vlanIgmp,["Last member query interval          :"],["\n"]).trim()); 
	                igmpMode.push(executeCliCmdService.getNextString(vlanIgmp,["Multicast router learning mode      :"],["\n"]).trim());
	            }
			    //DHCP Snooping
				var dhcpSnoopingList=strCLIOutput[6].split("\n");
				if(strCLIOutput[5] != "" && strCLIOutput[5] != undefined){
					if(strCLIOutput[5].indexOf("Switch DHCP snooping is enabled") != -1){
						$scope.dhcpGlobalConfig = translate("com_enable");
					}else{
						$scope.dhcpGlobalConfig = translate("com_disable");
					}
					
					if(strCLIOutput[5].indexOf("DHCP snooping is configured on following VLANs") != -1){
						var vlanListArray = [];
						$scope.dhcpSnoopingVLANValues = [];
						var vlanList=executeCliCmdService.getNextString(strCLIOutput[5],["DHCP snooping is configured on following VLANs:"],["\n\n"]).trim().split("\n")[0];
						if(vlanList != "" && vlanList != undefined && vlanList.trim() != "none"){
							$scope.dhcpSnoopingVLANValues.push({
								"dhcpVlanList":vlanList
							})
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
					}
				}
				if(strCLIOutput[6] != "" && strCLIOutput[6] != undefined){
					if(strCLIOutput[6].indexOf("ip dhcp snooping glean") != -1){
						$scope.dhcpGlean = translate("com_enable");
					}else{
						$scope.dhcpGlean = translate("com_disable");
					}
					
					if(strCLIOutput[6].indexOf("ip dhcp snooping information option unicast") != -1){
						$scope.dhcpUnicast = translate("com_enable");
					}else{
						$scope.dhcpUnicast = translate("com_disable");
					}
					
					if(strCLIOutput[6].indexOf("ip dhcp snooping information option allow-untrusted") != -1){
						$scope.dhcpAllowUntrusted = translate("com_enable");
					}else{
						$scope.dhcpAllowUntrusted = translate("com_disable");
					}
					
				}
				
				
				
				
	           //Setting APR Inspection details
				var arpvlanList= executeCliCmdService.getNextString(strCLIOutput[4],["ip arp inspection vlan "],["\n"]);
				var arpvlanListNew=[];
				arpvlanList1=arpvlanList.split(',');
				for(var i=0;i<arpvlanList1.length;i++){
					if(arpvlanList1[i].indexOf("-")>-1){
						var lowEnd = Number(arpvlanList1[i].split('-')[0]);
						var highEnd = Number(arpvlanList1[i].split('-')[1]);
						for (var j = lowEnd; j <= highEnd; j++) {
							arpvlanListNew.push(j);
						}
					}else {
						arpvlanListNew.push(Number(arpvlanList1[i]));
					}
				}
				var arpfinalVlanListNew1=[];
				for(var p=0;p<=arpvlanListNew.length-1;p++){
					if(!isNaN(arpvlanListNew[p])){
						arpfinalVlanListNew1.push(arpvlanListNew[p]);
					}
				}
			var portDetailsDhcpPool = deviceCommunicatorCLI.getExecCmdOutput("show running-config ip dhcp pool \n");
	        var showRunConfDhcpPool = getStringLineService.getLines(portDetailsDhcpPool[0],["ip dhcp pool"]);
                    $scope.dhcpPoolArr = [];
                    for (var i=0; i < showRunConfDhcpPool.length; i++) {
                        var scopeObj = {};
                        scopeObj["name"] = executeCliCmdService.getNextString(showRunConfDhcpPool[i],["ip dhcp pool "],["\n"]).trim();
                        $scope.dhcpPoolArr.push(scopeObj)
                    }
			$scope.loadDhcpPoolData($scope.dhcpPoolArr);		
	        //Setting vlan details for all added features    
		   	var arrVlanBr=strCLIOutput[0].split("\n");
			for (var i=2; i < arrVlanBr.length; i++) {
				vlanPorts="";
				var arrInnerWords = arrVlanBr[i].split(" ");
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
					if(arrInnerWords[k] == "") {
			 			continue;
		 			}
					if (j == 1) {
						vlanId=trimVal(arrInnerWords[k]);
						//dhcp snooping status
						var vlandhcpsnooping = "Disabled";						
						if(finalVlanListNew1.indexOf(parseFloat(vlanId)) > -1){
							vlandhcpsnooping = "Enabled";
						}else{
							vlandhcpsnooping = "Disabled";
						}
						//Check VLAN IGMP Status
						var igmpSnooping = "Enabled";						
						if(igmpVLAN.indexOf(vlanId) > -1){							
							if(igmpVLANStatus[igmpVLAN.indexOf(vlanId)] =="Enabled"){
								igmpSnooping = "Enabled";
							}else{
								igmpSnooping = "Disabled";
							}
						}else{
							igmpSnooping = "Enabled";
						}	
						//ARP status
						var arpStatus = "Disabled";						
						if(arpfinalVlanListNew1.indexOf(parseFloat(vlanId)) > -1){
							arpStatus = "Enabled";
						}else{
							arpStatus = "Disabled";
						}
						
		 			} else if (j == 2) {
		 				vlanName=arrInnerWords[k];
		 			} else if (j == 3) {
		 				vlanStatus=arrInnerWords[k];
		 				if(vlanStatus.indexOf("act/unsup")>-1){
		 					vlanStatus="unsupported";
						}
		 			} else {
		 				vlanPorts+=arrInnerWords[k]+" ";
		 			}
		 		   	j++;
				}
				var items = {
    					"vlan"   : vlanId,
    					"name"   : vlanName,
    					"status" : vlanStatus,
    					"ports"  : vlanPorts,
						"dhcpSnooping" : vlandhcpsnooping,
						"igmpSnooping" : igmpSnooping,
						"arpStatus":arpStatus
    			};	
				showVlanBrList.push(items);
				if(isEditModeFlag){
					return;
				}
			}
			var ipDhcpSnoopingStatus= executeCliCmdService.getNextString(strCLIOutput[1],["Switch DHCP snooping is"],["Switch DHCP gleaning is"]);
			// ip dhcp status
			if(trimVal(ipDhcpSnoopingStatus)=="enabled"){
				$timeout(function() {
					$scope.ipDhcpStatus="on";
				}, 0);
			}
			else{
				$timeout(function() {
					$scope.ipDhcpStatus="off";
				}, 0);
			}
			$scope.vlanData = new kendo.data.ObservableArray(showVlanBrList);
			$scope.vlanDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : $scope.vlanData
			});
	        $scope.layer2VlanGridOptions = {
				dataSource: $scope.vlanDataSource,
				editable : false,
				sortable : true,
				change : showVlanEdit,
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
				columns : [{
                    "template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isVlanDeleteChecked(checked,dataItem)\"  ng-disabled=\"(dataItem.vlan==1 ||dataItem.vlan==1002||dataItem.vlan==1003||dataItem.vlan==1004||dataItem.vlan==1005)?true:false\"  />",
                    sortable: false,
                    width: 10
                },{
					field : "vlan",
					title : translate("vlan_id"),
					width : "5%"
				}, {
					field : "name",
					title : translate("com_name"),
					width : "10%"
				}, {
					field : "status",
					title : translate("com_status"),
					width : "10%"
				}, {
					field : "dhcpSnooping",
					title : translate("vlan_ip_dhcp_snooping"),
					width : "10%"
				},{
					field : "igmpSnooping",
					title : translate("IGMP Snooping"),
					width : "10%"
				},{
					field : "arpStatus",
					title : translate("ARP Inspection"),
					width : "10%"
				},{
					field : "ports",
					title : translate("com_ports"),
					width : "45%"
				}]
			};
			if($scope.vlanData.length >= maxVlan){
				$scope.vlanAddSection = false;
			}else{
				$scope.vlanAddSection = true;
			}
        }
		
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
					field : "dhcpVlanList", 
					title : translate("vlan_list"), 
					width : "90%"
				}]
		};
		
		$scope.addDHCPSnoopingVLAN = function(){			
			angular.element("#dhcpSnoopingVLANForm  span.k-tooltip-validation").hide();
			$scope.dhcpSnoopingVLANGridWindow.open().center();
			$scope.dhcpVlanList = "";
			$scope.isEditModeFlag = false;
			$scope.disableDeleteButton = true;
		};
		
		$scope.onSelectDHCPSnoopingVLANHandler = function(data){            			
			$scope.dhcpVlanList = data.dhcpVlanList;			
			angular.element("#dhcpSnoopingVLANForm  span.k-tooltip-validation").hide();
			$scope.dhcpSnoopingVLANGridWindow.open().center();
			$scope.isEditModeFlag = true;
			$scope.disableDeleteButton = true;
		}
		
		$scope.dhcpSnoopingVlanCancel = function() {
			$timeout(function(){
				angular.element("#dhcpSnoopingVLANForm  span.k-tooltip-validation").hide();				
				$scope.dhcpSnoopingVLANGridWindow.close();				
				angular.element('#dhcpSnoopingVLANGrid').data('kendoGrid').refresh();
				$scope.disableDeleteButton = true;
			});
		};
		
		$scope.saveDhcpSnoopingVlanData = function(){			
            $scope.dhcpSnoopingVLANValidator.hideMessages();
            if (!$scope.dhcpSnoopingVLANValidator.validate()) {
                return;
            }
			var portsConfigDHCPSnoopingVlanCLI = "";
			if($scope.dhcpVlanList != "" && $scope.dhcpVlanList != undefined){
				portsConfigDHCPSnoopingVlanCLI += "ip dhcp snooping vlan "+$scope.dhcpVlanList+"\n"; 
			}
			$timeout(function(){
				portsConfigDHCPSnoopingVlanCLI += "exit\n";
				$scope.dhcpSnoopingVLANGridWindow.close().center();
				var result = requestRoutingService.getConfigCmdOutput(portsConfigDHCPSnoopingVlanCLI);
				if(result==""){
					notificationService.showNotification(translate('vlan_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
				portsConfigDHCPSnoopingVlanCLI="";
				$scope.vlanApplySection  = true;
				isEditModeFlag = true;
				$scope.loadVlanDetails();
			},100);
			
		}
		
		
		/**
         * Select dhcp Snooping VLAN
         */
		 
		$scope.delDHCPSnoopingVlanArray = [];
        $scope.isDHCPVLANChecked = function(checked, dataItem) {
            if (!checked) {
                var index = $scope.delDHCPSnoopingVlanArray.indexOf(dataItem.dhcpVlanList);
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
            for (var i = 0; i < selectedItem.length; i++) {
				if(selectedItem[i].dhcpVlanList != "" && selectedItem[i].dhcpVlanList != undefined){
					portsConfigDHCPSnoopingVlanCLI += "no ip dhcp snooping vlan "+ selectedItem[i].dhcpVlanList + "\n";
				}
			}
			portsConfigDHCPSnoopingVlanCLI += "exit\n";
			$timeout(function(){
				var result = requestRoutingService.getConfigCmdOutput(portsConfigDHCPSnoopingVlanCLI);
				if(result==""){
					notificationService.showNotification(translate('vlan_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
				$scope.disableDeleteButton = true;			
				portsConfigDHCPSnoopingVlanCLI="";
				$scope.vlanApplySection  = true;
				isEditModeFlag = true;
				$scope.loadVlanDetails();
			},100);
		}
		
		
		$scope.loadDhcpPoolData = function(dhcpData){
            $scope.dhcpPoolDataSource = [];
            if(!angular.isUndefined(dhcpData)){
                for(var i = 0; i < dhcpData.length; i++){
                    $scope.dhcpPoolDataSource.push({text:dhcpData[i].name,value:dhcpData[i].name});
                }
            }
            if($scope.dhcpPoolDataSource.length>0){
			    $scope.portconfigPool= $scope.dhcpPoolDataSource[0].value;
			}
        };
		$scope.addIpv6Address = function () {
			if (!$scope.sviValidator.validate()) {
				return;
			}
			var ipv6Type = $scope.logicalInterface.vlan.ipv6type;
			var ipv6Address = $scope.logicalInterface.vlan.vlanIPV6Address;
			var ipv6SubType = $scope.ipv6SubType;
			var name = "";
			var isValidIpv6 = true;
			if( ipv6Address=="" || ipv6Address==null || ipv6Address==undefined ){
            	return ;
            }
			if (ipv6SubType != "link-local") {
				var subType = $scope.ipv6SubType;
				var addStr = "";
				if (subType !== "None") {
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
			if($scope.logicalInterface.vlan.ipv6type == null || $scope.logicalInterface.vlan.ipv6type == "None"|| $scope.logicalInterface.vlan.ipv6type == undefined ){
				$scope.logicalInterface.vlan.ipv6type = "";
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
			}
		};
		function arrayRemove(arr, value) {
		   return arr.filter(function(ele){
			   return ele != value;
		   });

		}
		$scope.igmpImmediateleaveChange = function (data) {
			$scope.igmpImmediateleave = data;
		}
		$scope.removeIpv6Address = function (rowData) {
			var ipv6Seclect = rowData;
			var myArray = $scope.logicalInterface.vlan.listIpb6Address;
			myArray = arrayRemove(myArray, ipv6Seclect);
			$scope.logicalInterface.vlan.listIpb6Address = myArray;
		};
		var vlanEditData={
			vlan: null,
			name: null,
			status: translate("com_active"),
			dhcpSnooping: translate("com_enable")
		};
		//Edit vlan grid value
			$scope.vlanEditData = angular.copy(vlanEditData);
			$scope.vlanDirty="";
			var vlanConfigCLI="";
			var showVlanEdit = function(){
				angular.element("#vlanForm  span.k-tooltip-validation").hide();
				$scope.isEditModeFlag = true;
				var selected = this.dataItem(this.select());
				if (selected.vlan == 1 || selected.vlan == 1002 || selected.vlan == 1003 || selected.vlan == 1004 || selected.vlan == 1005) {
					$timeout(function(){
						$scope.vlanShowEditSection = false;
						$scope.vlanDeleteSection = true;
						$scope.vlanApplySection = true;
					});
				} else {
					$timeout(function(){
						$scope.vlanGridWindow.open().center();
						$scope.vlanShowEditSection = true;
						$scope.vlanIdState = true;
					});
				}
				$scope.vlanEditData.vlan = selected.vlan;
				$scope.vlanEditData.name = selected.name;
				$scope.vlanEditData.dhcpSnooping = selected.dhcpSnooping;
				$scope.vlanEditData.igmpSnooping = selected.igmpSnooping;
				if(!$scope.hideElement){
				$scope.vlanEditData.arpStatus = selected.arpStatus;
				}
				if(selected.status=="active"){
					$scope.vlanEditData.status = translate("com_active");
				}else{
					$scope.vlanEditData.status = translate("com_suspended");
				}
				if($scope.vlanEditData.dhcpSnooping == translate("com_enabled")){
					$scope.vlanEditData.dhcpSnooping = translate("com_enable");
				}else{
					$scope.vlanEditData.dhcpSnooping = translate("com_disable");
				}
				if($scope.vlanEditData.igmpSnooping == translate("com_enabled")){
					$scope.vlanEditData.igmpSnooping = translate("com_enable");
				}else{
					$scope.vlanEditData.igmpSnooping = translate("com_disable");
				}
				if(!$scope.hideElement){
					if($scope.vlanEditData.arpStatus == translate("com_enabled")){
						$scope.vlanEditData.arpStatus = translate("com_enable");
					}else{
						$scope.vlanEditData.arpStatus = translate("com_disable");
					}
				}
				var imulticastRouteCli = "show ip igmp snooping vlan "+selected.vlan;	
                var imulticastRoute = deviceCommunicatorCLI.getExecCmdOutput(imulticastRouteCli)[0].split("\n");
                for(var i = 0; i < imulticastRoute.length; i++){
					if(imulticastRoute[i].indexOf("Multicast router learning mode")!= -1){
						$scope.mlearningMode=executeCliCmdService.getNextString(imulticastRoute[i],["Multicast router learning mode      : "],["\n"]).trim();
					}
				}				 
				$timeout(function(){
					var arrIndex=igmpVLAN.indexOf(trimVal(selected.vlan));
					$scope.mlearningModeOption = new kendo.data.ObservableArray([
	              		               {"modeText": translate('cgmp'), "modeValue": "cgmp"},
	              		               {"modeText": translate('pim-dvmrp'), "modeValue": "pim-dvmrp"}
	              		  ]);
					if(arrIndex > -1){	
						if(igmpVLANStatus[arrIndex]=="Enabled"){
							//$scope.vlanEditData.igmpSnooping = translate("com_enable");
							$scope.igmpStatus=true;
						}else{
							//$scope.vlanEditData.igmpSnooping = translate("com_disable");
							$scope.igmpStatus=false;
						}
						if(igmpVLANImmeStatus[arrIndex]=="Enabled"){
							$scope.igmpImmediateleave = true;
						}else{
							$scope.igmpImmediateleave = false;
						}
						$scope.vlanEditData.igmpQueryCount=igmpVLANQueryCount[arrIndex];
						$scope.vlanEditData.igmpQueryInterval=igmpVLANQueryInterval[arrIndex];
						//$scope.mlearningMode=igmpMode[arrIndex];
					}else{
						$scope.vlanEditData.igmpSnooping = translate("com_enable");
						$scope.igmpImmediateleave = true;
						$scope.vlanEditData.igmpQueryCount="2";
						$scope.vlanEditData.igmpQueryInterval="1000";
						//$scope.mlearningMode="cgmp";
						$scope.igmpStatus=true;
					}
				},100);
				$scope.vlanDirty=selected.dirty;
			};
		$scope.loadVlanDetails();
		angular.element(".btnView").show();
		angular.element(".pageLoader").hide();
		$scope.saveVlanData = function(){
			if(vlanValidations.validate()){
				$scope.vlanApplySection = false;
				var status="";
				var edittedItem = $scope.layer2VlanGrid.dataItem($scope.layer2VlanGrid.select());
				if($scope.vlanDirty){  //add function
					if($scope.vlanEditData.status==translate("com_suspended")){
						status="suspend";
					}else{
						status="active";
					}
					vlanConfigCLI += "vlan "+$scope.vlanEditData.vlan+"\n";
					vlanConfigCLI += "name "+$scope.vlanEditData.name+"\n";
					if($scope.vlanEditData.status==translate("com_suspended")){
						vlanConfigCLI += "state suspend \n";
					}else{
						vlanConfigCLI += "state active \n";
					}
					if($scope.vlanEditData.dhcpSnooping == translate("com_enable")){
						$scope.vlanEditData.dhcpSnooping = translate("com_enabled");
						vlanConfigCLI += "ip dhcp snooping vlan "+$scope.vlanEditData.vlan+"\n";
					}else{
						vlanConfigCLI += "no ip dhcp snooping vlan "+$scope.vlanEditData.vlan+"\n";
						$scope.vlanEditData.dhcpSnooping = translate("com_disabled");
					}
					//IGMP CONFIG
					if($scope.vlanEditData.igmpSnooping == translate("com_enable")){
						$scope.vlanEditData.igmpSnooping = translate("com_enabled");
						vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+"\n";
					}else{
						vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+"\n";
						$scope.vlanEditData.igmpSnooping = translate("com_disabled");
					}
					if($scope.igmpImmediateleave == true){					
						vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" immediate-leave\n";
					}else{
						vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+" immediate-leave\n";
					}
					if($scope.vlanEditData.igmpQueryCount && $scope.vlanEditData.igmpQueryCount != "" && $scope.vlanEditData.igmpQueryCount!=undefined){					
						vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-count "+$scope.vlanEditData.igmpQueryCount+"\n";
					}else{
						vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-count \n";
					}						
					if($scope.vlanEditData.igmpQueryInterval && $scope.vlanEditData.igmpQueryInterval != "" && $scope.vlanEditData.igmpQueryInterval!=undefined){					
						vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-interval "+$scope.vlanEditData.igmpQueryInterval+"\n";
					}else{
						vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-interval \n";
					}
					if($scope.mlearningMode!="" && $scope.mlearningMode!=null){
						vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" mrouter learn "+$scope.mlearningMode+"\n";
					}
					//ARP inspection
					if(!$scope.hideElement){
						if($scope.vlanEditData.arpStatus == translate("com_enable")){
							$scope.vlanEditData.arpStatus = translate("com_enabled");
							vlanConfigCLI += "ip arp inspection vlan "+$scope.vlanEditData.vlan+"\n";
						}else{
							vlanConfigCLI += "no ip arp inspection vlan "+$scope.vlanEditData.vlan+"\n";
							$scope.vlanEditData.arpStatus = translate("com_disabled");
						}
					}
					$scope.layer2VlanGrid.dataSource.add({"vlan": $scope.vlanEditData.vlan,"name": $scope.vlanEditData.name,"status": status,"dhcpSnooping": $scope.vlanEditData.dhcpSnooping,"igmpSnooping":$scope.vlanEditData.igmpSnooping,"arpStatus":$scope.vlanEditData.arpStatus});
				}else{ //for edit
					prevVlan = edittedItem.vlan;
					prevName = edittedItem.name;
					prevDhcpSnooping = edittedItem.dhcpSnooping;
					previgmpSnooping = edittedItem.igmpSnooping;
					prevstatus = edittedItem.status;
					prevarpStatus = edittedItem.arpStatus;
					
					var selectedItem = $scope.layer2VlanGrid.dataItem($scope.layer2VlanGrid.select());
					selectedItem.vlan = $scope.vlanEditData.vlan;
					selectedItem.name = $scope.vlanEditData.name;
					
					vlanConfigCLI += "vlan "+$scope.vlanEditData.vlan+"\n";
					if(prevName != $scope.vlanEditData.name){
						vlanConfigCLI += "name "+$scope.vlanEditData.name+"\n";
					}
					
					if($scope.vlanEditData.status==translate("com_suspended")){
						status="suspend";
					}else{
						status="active";
					}
					selectedItem.status = status;
					if($scope.vlanEditData.status != prevstatus.charAt(0).toUpperCase() + prevstatus.slice(1)){
						if($scope.vlanEditData.status==translate("com_suspended")){
							vlanConfigCLI += "state suspend \n";
						}else{
							vlanConfigCLI += "state active \n";
						}
					}
					
					if($scope.vlanEditData.dhcpSnooping==translate("com_enable")){
						dhcpSnooping=translate("com_enabled");
					}else{
						dhcpSnooping=translate("com_disabled");
					}
					selectedItem.dhcpSnooping = dhcpSnooping;
					if(prevDhcpSnooping == translate("com_enable")){
						prevDhcpSnooping = translate("com_enabled");
					}else{
						prevDhcpSnooping = translate("com_disabled");
					}
					if($scope.vlanEditData.dhcpSnooping != prevDhcpSnooping){
						if($scope.vlanEditData.dhcpSnooping == translate("com_enable")){
							vlanConfigCLI += "ip dhcp snooping vlan "+$scope.vlanEditData.vlan+"\n";
						}else{
							vlanConfigCLI += "no ip dhcp snooping vlan "+$scope.vlanEditData.vlan+"\n";
						}
					}
					
					//IGMP CONFIG
					if($scope.vlanEditData.igmpSnooping==translate("com_enable")){
						igmpSnooping=translate("com_enabled");
					}else{
						igmpSnooping=translate("com_disabled");
					}
					selectedItem.igmpSnooping = igmpSnooping;
					if(previgmpSnooping == translate("com_enable")){
						previgmpSnooping = translate("com_enabled");
					}else{
						previgmpSnooping = translate("com_disabled");
					}
					if($scope.vlanEditData.igmpSnooping != previgmpSnooping){
						if($scope.vlanEditData.igmpSnooping == translate("com_enable")){
							//$scope.vlanEditData.igmpSnooping = translate("com_enabled");
							vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+"\n";
							if($scope.igmpImmediateleave == true){					
								vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" immediate-leave\n";
							}else{
								vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+" immediate-leave\n";
							}
							if($scope.vlanEditData.igmpQueryCount && $scope.vlanEditData.igmpQueryCount != "" && $scope.vlanEditData.igmpQueryCount!=undefined){					
								vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-count "+$scope.vlanEditData.igmpQueryCount+"\n";
							}else{
								vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-count \n";
							}
							if($scope.vlanEditData.igmpQueryInterval && $scope.vlanEditData.igmpQueryInterval != "" && $scope.vlanEditData.igmpQueryInterval!=undefined){					
								vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-interval "+$scope.vlanEditData.igmpQueryInterval+"\n";
							}else{
								vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+" last-member-query-interval \n";
							}
							if($scope.mlearningMode!=""){
								vlanConfigCLI += "ip igmp snooping vlan "+$scope.vlanEditData.vlan+" mrouter learn "+$scope.mlearningMode+"\n";
							}
					   }else{
							vlanConfigCLI += "no ip igmp snooping vlan "+$scope.vlanEditData.vlan+"\n";
							//$scope.vlanEditData.igmpSnooping = translate("com_disabled");						
						}
					}					
					//ARP inspection
					if(!$scope.hideElement){
						if($scope.vlanEditData.arpStatus==translate("com_enable")){
							arpStatus=translate("com_enabled");
						}else{
							arpStatus=translate("com_disabled");
						}
						selectedItem.arpStatus = arpStatus;
						if(prevarpStatus == translate("com_enable")){
							prevarpStatus = translate("com_enabled");
						}else{
							prevarpStatus = translate("com_disabled");
						}
						if($scope.vlanEditData.arpStatus != prevarpStatus){
							if($scope.vlanEditData.arpStatus == translate("com_enable")){
								vlanConfigCLI += "ip arp inspection vlan "+$scope.vlanEditData.vlan+"\n";
							}else{
								vlanConfigCLI += "no ip arp inspection vlan "+$scope.vlanEditData.vlan+"\n";
							}
						}	
					}					
				}
				$scope.applyVlan2Layer();
				$scope.vlanGridWindow.close();
				$scope.vlanEditData.vlan = null;
				$scope.vlanEditData.name = null;
				$scope.vlanEditData.status = translate("com_active");
				$scope.vlanShowEditSection = false;
				if($scope.layer2VlanGrid.dataSource._total >= maxVlan){
					$scope.vlanAddSection = false;
				}else{
					$scope.vlanAddSection = true;
				}
			}
		}
		$scope.delVlanArray = [];
        $scope.isVlanDeleteChecked = function(checked, dataItem) {
            if (checked == false) {
                var index = $scope.delVlanArray.indexOf(dataItem);
                if (index > -1) {
                    $scope.delVlanArray.splice(index, 1);
                }
            } else {
                $scope.delVlanArray.push(dataItem);
            }
            if ($scope.delVlanArray.length > 0) {
                $scope.vlanDeleteSection = false;
            } else {
                $scope.vlanDeleteSection = true;
            }
        };
		$scope.$on("okDeleteVlan", function() {
            $scope.dlg.data("kendoWindow").close();
            $scope.deleteVlanRow();
        });
		//Confirmation Window For Delete VLAN Data.
        $scope.vlanDeleteConfirm = function() {
            $scope.dlg = dialogService.dialog({
                content: translate('msg_delete_confirmation'),
                title: translate('msg_delete_confirmation_window'),
                messageType: "confirm",
                actionButtons: [{
                    text: translate('com_ok'),
                    callback: "okDeleteVlan"
                }, {
                    text: translate('com_cancel'),
                    callback: "cancel"
                }]
            });
        };
		//Delete VLAN Data.
        $scope.deleteVlanRow = function() {
            $scope.vlanDeleteSection = true;
            var selectedItem = $scope.delVlanArray;
            $scope.delVlanArray = [];
            for (var i = 0; i < selectedItem.length; i++) {
                vlanConfigCLI += "no vlan " + selectedItem[i].vlan + " \n";
                $scope.layer2VlanGrid.dataSource.remove(selectedItem[i]);
            }
            $scope.vlanDeleteSection =true;
            $scope.applyVlan2Layer();
			$scope.vlanCancel();
			if($scope.layer2VlanGrid.dataSource._total >= maxVlan){
				$scope.vlanAddSection = false;
			}else{
				$scope.vlanAddSection = true;
			}
        }
      //IGMP Global Configuration .
        $scope.applyGlobalIGMP = function() {
        	if(igmpValidations.validate()){
	        	vlanConfigCL="";
	        	if($scope.igmpGlobalConfig == translate("com_enable")){				
					vlanConfigCLI += "ip igmp snooping \n";
				}else{
					vlanConfigCLI += "no ip igmp snooping \n";
				}
	        	if($scope.igmpGlobalQurier == translate("com_enable")){				
					vlanConfigCLI += "ip igmp snooping querier\n";
				}else{
					vlanConfigCLI += "no ip igmp snooping querier\n";
				}			
				if($scope.igmpGlobalQueryCount && $scope.igmpGlobalQueryCount != "" && $scope.igmpGlobalQueryCount != undefined){					
					vlanConfigCLI += "ip igmp snooping last-member-query-count "+$scope.igmpGlobalQueryCount+"\n";
				}else{
					vlanConfigCLI += "no ip igmp snooping last-member-query-count \n";
				}
				if($scope.igmpGlobalQueryInterval && $scope.igmpGlobalQueryInterval != "" && $scope.igmpGlobalQueryInterval!=undefined){					
					vlanConfigCLI += "ip igmp snooping last-member-query-interval "+$scope.igmpGlobalQueryInterval+"\n";
				}else{
					vlanConfigCLI += "no ip igmp snooping last-member-query-interval \n";
				}
				if($scope.dhcpGlobalConfig == translate("com_enable")){				
					vlanConfigCLI += "ip dhcp snooping\n";
				}else{
					vlanConfigCLI += "no ip dhcp snooping\n";
				}
				if($scope.dhcpGlean == translate("com_enable")){				
					vlanConfigCLI += "ip dhcp snooping glean\n";
				}else{
					vlanConfigCLI += "no ip dhcp snooping glean\n";
				}
				if($scope.dhcpAllowUntrusted == translate("com_enable")){				
					vlanConfigCLI += "ip dhcp snooping information option allow-untrusted\n";
				}else{
					vlanConfigCLI += "no ip dhcp snooping information option allow-untrusted\n";
				}
				if($scope.dhcpAllowUntrusted == translate("com_enable")){				
					vlanConfigCLI += "ip dhcp snooping information option unicast\n";
				}else{
					vlanConfigCLI += "no ip dhcp snooping information option unicast\n";
				}
	            $scope.applyVlan2Layer();	
        	}
			
        };
		
		$scope.addVlanRow = function(){
			$scope.vlanEditData = angular.copy(vlanEditData);
			$scope.vlanEditData.igmpSnooping=translate("com_enable");
			$scope.vlanEditData.arpStatus=translate("com_disable");
			$scope.igmpStatus=true;
			$scope.vlanShowEditSection = true;
			$scope.vlanDirty=true;
			$scope.igmpImmediateleave = false;
			$scope.vlanIdState = false;
			$scope.vlanDeleteSection = true;
			$scope.vlanEditData.status = translate("com_active");
			angular.element("#vlanForm  span.k-tooltip-validation").hide();
			$scope.mlearningMode = 'cgmp'
			angular.element("#mlearningMode").data('kendoDropDownList').value($scope.mlearningMode);
			$scope.vlanGridWindow.open().center();
			$scope.isEditModeFlag = false;
		};
		$scope.vlanCancel = function() {
			$timeout(function(){
				angular.element("#vlanForm  span.k-tooltip-validation").hide();
				$scope.vlanShowEditSection = false;
				$scope.vlanDeleteSection = true;
				$scope.vlanApplySection = true;
				$scope.vlanGridWindow.close();
				$scope.delVlanArray = [];
				angular.element('#layer2VlanGrid').data('kendoGrid').refresh();
			});
		};
		$scope.applyVlan2Layer=function(){
			var result = requestRoutingService.getConfigCmdOutput(vlanConfigCLI);
			if(result==""){
				notificationService.showNotification(translate('vlan_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			vlanConfigCLI="";
			$scope.vlanApplySection  = true;
			isEditModeFlag = true;
			$scope.loadVlanDetails();
		}
		$timeout(function(){
            angular.element("#layer2VlanGrid").find('.k-pager-refresh').click(function(){
                $scope.manualGridRefresh();
            });
        },10);
		 $scope.manualGridRefresh = function(){
			angular.element("#layer2VlanGrid  span.k-tooltip-validation").hide();
			$scope.vlanShowEditSection = false;
			$scope.vlanDeleteSection = true;
			$scope.vlanApplySection = true;
		 }
		// Layer2 VLAN Form validation
		var vlanValidations = angular.element("#vlanForm").kendoValidator({
			rules: {
				duplicate:function(input){
					var valMsg = input.data('duplicateMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(!$scope.vlanDirty){
						return true;
					}
					var vlanGrid = angular.element("#layer2VlanGrid").data("kendoGrid");
					var vlanGridData = vlanGrid.dataSource.data();
					for(var i=0;i<vlanGridData.length;i++){
						vlanGridData[i];
						if(trimVal(input.val())== trimVal(vlanGridData[i].vlan)){
							return false;
						}
					}
					return true;
				},
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
				},
				range1: function (input) {
					var valMsg = input.data('range1Msg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(input.val()!=""){
						var min= input.prop('min');
						var max= input.prop('max');
						if(parseFloat(input.val())>=min && parseFloat(input.val())<=max){
							return true;
						}
						return false;
					}else{
						return true
					}					
				},
				checkVlanName:function(input){
					var valMsg = input.data('checkVlanNameMsg');
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
		
		//IGMP Validation
		// Layer2 VLAN Form validation
		var igmpValidations = angular.element("#igmpForm").kendoValidator({
			rules: {
				range1: function (input) {
					var valMsg = input.data('range1Msg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(input.val()!=""){
						var min= input.prop('min');
						var max= input.prop('max');
						if(parseFloat(input.val())>=min && parseFloat(input.val())<=max){
							return true;
						}
						return false;
					}else{
						return true
					}					
				}
			}
		}).data("kendoValidator");
		
		// Layer2 DHCP Snooping VLAN Form validation
		$scope.dhcpSnoopingVLANValidations={
			rules: {
				multivlan : function(input) {
					var valMsg = input.data('multivlanMsg');
					if (valMsg == undefined) {
						return true;
					}
					var value = input.val();
					var vlanRange = input.data('multivlan');
					if (value == undefined) {
						return true;
					}
					if (vlanRange == undefined) {
						return true;
					}
					if (value.trim() == "") {
						return true;
					}
					if (value.indexOf("?") >= 0) {
						return true;
					}
					if (value.indexOf(",") >= 0) {
						return $scope.validateVLANRange(value, vlanRange, ",");
					} else {
						var returnFlag = $scope.checkValidVLAN(value, vlanRange);
						return returnFlag;
					}
				},
				invalidTags : function(input) {
						return input.data('invalidtags-msg') ? validationService.validateInvalidTags(input.val()) : true;
				},
				special : function(input) {
					var valSplMsg = input.data('specialMsg');
					if (valSplMsg == undefined) {
						return true;
					}					
					var value = input.val();
					if (value.indexOf("?") >= 0 || value.indexOf(" ") >= 0) {
						return false;
					}
					return true;
				}
			}
		};
		
		$scope.validateVLANRange = function(vlanIDList, vlanRange, vlanSeparator) {
			//variable vlanSeparator holds either : or ,
			var vlanIds = vlanIDList.split(vlanSeparator);
			var returnFlag = true;
			for ( index = 0; index < vlanIds.length; index++) {
				if (vlanIds[index] !== "" && returnFlag) {
					returnFlag = $scope.checkValidVLAN(vlanIds[index], vlanRange);
				} else {
					return false;
				}
			}
			return returnFlag;
		};
		
		$scope.checkValidVLAN = function(vlanID, range) {
			//input this function can be a single vlan ID or vlan Range
			//1.check for the presence of - to confirm its a vlanRange
			if (vlanID.indexOf("-") >= 0) {
				var tmpVLAN = vlanID.split("-");
				if (!Number(tmpVLAN[0]) || !Number(tmpVLAN[1])) {
					return false;
				}
				if (tmpVLAN.length > 2 || (Number(tmpVLAN[0]) > Number(tmpVLAN[1]))) {
					return false;
				}
				if (validationService.validateExactRange(tmpVLAN[0], range) && validationService.validateExactRange(tmpVLAN[1], range)) {
					return true;
				} else {
					return false;
				}
			} else {
				return validationService.validateExactRange(vlanID, range)
			}
		};
		
		$scope.deleteConfirmation = function() {
			$scope.commonConfirmationVlan('delete');
		};

		$scope.commonConfirmationVlan = function() {
			$scope.dlgVlan = dialogService.dialog({
				content : translate("msg_delete_confirmation"),
				title : translate("msg_delete_confirmation_window"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "vlanDeleteConfirmation"
				}, {
					text : translate("com_cancel")
				}]
			});
		};

		$scope.$on("vlanDeleteConfirmation", function() {
			$scope.deleteData($scope.dlgVlan.data("kendoWindow"));
		});

		//form validate
		var vlanListValidations = angular.element("#vlanListForm").kendoValidator({
			rules: {
				range: function (input) {
					var count=0;
					var min= input.prop('min');
					var max= input.prop('max');
					var vlanListNew=[];
					var vlanList1=input.val().split(',');
					for(var i=0;i<vlanList1.length;i++){
						if(vlanList1[i].indexOf("-")>-1){
							var lowEnd = Number(vlanList1[i].split('-')[0]);
							var highEnd = Number(vlanList1[i].split('-')[1]);
							for (var j = lowEnd; j <= highEnd; j++) {
								vlanListNew.push(j);
							}
						}else {
							vlanListNew.push(Number(vlanList1[i]));
						}
					}
					var finalVlanListNew1=[];
					for(var i1=0;i1<=vlanListNew.length-1;i1++){
						if(!isNaN(vlanListNew[i1])){
							finalVlanListNew1.push(vlanListNew[i1]);
						}
					}
					for(var i2=0;i2<finalVlanListNew1.length;i2++){
						if(parseFloat(finalVlanListNew1[i2])>=Number(min) && parseFloat(finalVlanListNew1[i2])<=Number(max)) {
						  count++;
					  }
					}
					if(finalVlanListNew1.length==count){
					return true;
					}
					return false;
				},
				duplicateRecord:function(input){
					if(!$scope.vlanListDirty){
						return true;
					}
					var ipDhGrid = angular.element("#ipDhcpSnnopingGrid").data("kendoGrid");
					var ipDhData = ipDhGrid.dataSource.data();
					var newipDhData=[];
					for(var i=0;i<ipDhData.length;i++){
						newipDhData[i]=ipDhData[i].VlanList;
					}
					var arr= input.val().split(',');
					for (var i1 = 0; i1 < arr.length; i1++) {
						for (var j = 0; j < newipDhData.length; j++) {
							if (arr[i1] == newipDhData[j]) {
								return false;
							}
						}
					}
					return true;
				},
				checkVlanList:function(input){
					var valMsg = input.data('checkVlanListMsg');
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
				}
			}
		}).data("kendoValidator");
		//form validate
		var vlanGroupFormValidate = angular.element("#vlanGroupForm").kendoValidator({
			rules: {
				duplicate:function(input){
					var valMsg = input.data('duplicateMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(!$scope.vlanGrpDirty){
						return true;
					}
					var vlanGroupGrid = angular.element("#vlanGroupGrid").data("kendoGrid");
					var vlanGroupGridData = vlanGroupGrid.dataSource.data();
					for(i=0;i<vlanGroupGridData.length;i++){
						if(input.val()== vlanGroupGridData[i].VlanGroup){
							return false;
						}
					}
						return true;
				},
				checkvlangroup:function(input){
					var valMsg = input.data('checkvlangroupMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var regExp=/^[0-9-]+$/;
					if(regExp.test(input.val())){
						return false;
					}
					return true;
				},
				range: function (input) {
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
				},
				checkVlanList:function(input){
					var valMsg = input.data('checkVlanListMsg');
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
				domainspace: function(input){
				  var valMsg = input.data('domainspaceMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					if(/\s/g.test(input.val())){
					  return false;
					}
					return true;
				}
			}
		}).data("kendoValidator");
		//controller code for vlan group page
		$scope.showVlanGroups = true;
		$scope.vlanGrpData = [];
		if( ($rootScope.deviceInfo.type.indexOf("2960X")!=-1 && $rootScope.deviceInfo.type.indexOf("-LL")!=-1) ||
			    ($rootScope.deviceInfo.type.indexOf("2960+")!=-1 && $rootScope.deviceInfo.type.indexOf("-S")!=-1) ||
				($rootScope.deviceInfo.type.indexOf("2960C")!=-1 && $rootScope.deviceInfo.type.indexOf("-S")!=-1)){
            $scope.showVlanGroups = false;
		}else{
			var showVlanGrp = requestRoutingService.getShowCmdOutput("show vlan group","showVlanGroup");
			if(showVlanGrp.ShowVlanGroup.entry){
				showVlanGrp = showVlanGrp.ShowVlanGroup.entry;
				if (typeof showVlanGrp == "object" && !showVlanGrp.length){
					showVlanGrp = [showVlanGrp];
				}
			}else {
				showVlanGrp=[];
			}
			$scope.vlanGrpData = new kendo.data.ObservableArray(showVlanGrp)
		}
		var vlanGrpEditData={
			VlanGroup: null,
			VlanList: null
		};
		$scope.vlanGrpEditData = angular.copy(vlanGrpEditData);
		$scope.vlanGrpDirty="";
		$scope.vlanGrpDelBtn=true;
		$scope.disVlanGrpApplyBtn=true;
		var vlanGroupConfigCLI="";
		// Edit vlan Group
		var showVlanGrpEdit = function(){
			$scope.kendoWindow.isEditMode = false;
			var selected = this.dataItem(this.select());
			$timeout(function(){$scope.vlanGrpShowEditSection = true});
			$scope.vlanGrpEditData.VlanGroup = selected.VlanGroup;
			$scope.vlanGrpEditData.VlanList = selected.VlanList;
			$scope.vlanGrpDirty=selected.dirty;
			$scope.vlanGroupDiv.open().center();
			$scope.vlanGrpDelBtn=true;
		};
		//Save vlan group
		$scope.saveVlanGrpData = function() {
			if (vlanGroupFormValidate.validate()) {
				if ($scope.vlanGrpDirty) {
						$scope.vlanGroupGrid.dataSource.add({
							"VlanGroup": $scope.vlanGrpEditData.VlanGroup,
							"VlanList": $scope.vlanGrpEditData.VlanList
						});

				} else {
					var selectedItem = $scope.vlanGroupGrid.dataItem($scope.vlanGroupGrid.select());
					vlanGroupConfigCLI += "no vlan group" + " " + selectedItem.VlanGroup + " " + "vlan-list" + " " + selectedItem.VlanList + "\n";
					selectedItem.VlanGroup = $scope.vlanGrpEditData.VlanGroup;
					selectedItem.VlanList = $scope.vlanGrpEditData.VlanList;
				}
				$scope.vlanGrpShowEditSection = false;
				$scope.disVlanGrpApplyBtn = false;
				vlanGroupConfigCLI += "vlan group" + " " + $scope.vlanGrpEditData.VlanGroup + " " + "vlan-list" + " " + $scope.vlanGrpEditData.VlanList + "\n";
				$scope.vlanGroupApplyBtn();
				$scope.vlanGroupDiv.close();
			}
		}
		// Cancel Vlan Group
		$scope.cancelVlanGrpData=function(){
			$scope.vlanGroupDiv.close();
			$scope.vlanGrpShowEditSection = false;
		};
		$scope.delVlanGroupArray = [];
		$scope.isVlanGroupChecked = function(checked, dataItem) {
		if (checked == false) {
                    var index = $scope.delVlanGroupArray.indexOf(dataItem);
                    if (index > -1) {
                        $scope.delVlanGroupArray.splice(index, 1);
                    }
                } else {
                    $scope.delVlanGroupArray.push(dataItem);
                }
                if ($scope.delVlanGroupArray.length > 0) {
                    $scope.vlanGrpDelBtn= false;
                }else {
                    $scope.vlanGrpDelBtn= true;
                }
		}
		//Confirmation Window For Delete Vlan Group Data.
		$scope.delConfirmationWindow = function(){
			$scope.dlg = dialogService.dialog({
				content : translate('msg_delete_confirmation'),
				title : translate('msg_delete_confirmation_window'),
				messageType : "confirm",
				actionButtons : [{
					text : translate('com_ok'),
					callback : "okDelete"
				}, {
					text : translate('com_cancel'),
					callback : "cancel"
				}]
			});
		};
		 $scope.$on("okDelete", function() {
                $scope.dlg.data("kendoWindow").close();
                $scope.delVlanGrpRow();
            });
		$scope.$on("cancel", function() {
                $scope.dlg.data("kendoWindow").close();
				$scope.vlanGrpDelBtn = true;
				angular.element("#vlanGroupGrid").data('kendoGrid').refresh();
            });
		// Delete vlan group
		$scope.delVlanGrpRow=function(){
			$scope.vlanGrpDelBtn=true;
			var selectedItem = $scope.delVlanGroupArray;
			$scope.delVlanGroupArray = [];
			 for (var i = 0; i < selectedItem.length; i++) {
                vlanGroupConfigCLI+="no vlan group"+" "+selectedItem[i].VlanGroup+" "+"vlan-list"+" "+selectedItem[i].VlanList+"\n";
                $scope.vlanGroupGrid.dataSource.remove(selectedItem[i]);
			}
			$scope.vlanGrpShowEditSection = false;
            $scope.vlanGroupApplyBtn();
		};
		// Add vlan group row
		$scope.addVlanGrpRow = function(){
			$scope.kendoWindow.isEditMode = true;
			$scope.vlanGroupDiv.open().center();
			$scope.vlanGrpEditData = angular.copy(vlanGrpEditData);
			$scope.vlanGrpShowEditSection = true;
			$scope.vlanGrpDirty=true;
			angular.element("#vlanGroupForm  span.k-tooltip-validation").hide();
		};
		// Apply valn group configurations
		$scope.vlanGroupApplyBtn=function(){
			var result = requestRoutingService.getConfigCmdOutput(vlanGroupConfigCLI);
			if(result==""){
				notificationService.showNotification(translate('vlan_group_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			$scope.disVlanGrpApplyBtn=true;
		}
		// Vlan group Grid starts here
		$scope.gridDataSource2 = new kendo.data.DataSource({
			pageSize : 10,
			data : $scope.vlanGrpData
		});
		$scope.vlanGroupGridOptions = {
			dataSource: $scope.gridDataSource2,
			editable : false,
			sortable : true,
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
			change	:showVlanGrpEdit,
			scrollable : false,
			selectable : true,
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
			columns : [{
                        "template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isVlanGroupChecked(checked,dataItem)\"  />",
                        sortable : false,
                        width : 10
                    },{
						field : "VlanGroup",
						title : translate("vlan_group_name")
					}, {
						field : "VlanList",
						title : translate("vlan_list")
					}]
		};
		// Controller for Valn List page
		$scope.ipDhcpStatus="on";
		$scope.vlanListDelBtn=true;
		$scope.disVlanListApplyBtn=true;

		// Fetching vlan list grid data
		var showIPDhcpSnooping = deviceCommunicator.getExecCmdOutput("show ip dhcp snooping");
		var START_INPUT= ["configured on following VLANs:"];
		var END_INPUT= ["DHCP snooping is operational"];
		var vlanList= executeCliCmdService.getNextString(showIPDhcpSnooping,START_INPUT,END_INPUT);
		// Fetching ip dhcp status
		var ipDhcpStart= ["Switch DHCP snooping is"];
		var ipDhcpEnd= ["Switch DHCP gleaning is"];
		var newIpDhcpStatus= executeCliCmdService.getNextString(showIPDhcpSnooping,ipDhcpStart,ipDhcpEnd);
		// ip dhcp status
		if(trimVal(newIpDhcpStatus)=="enabled"){
			$timeout(function() {
				$scope.ipDhcpStatus="on";
			}, 0);
		}
		else{
			$timeout(function() {
				$scope.ipDhcpStatus="off";
			}, 0);
		}
		// Vlan List edit grid data
		var vlanListEditData={
			VlanList: null
		};
		$scope.vlanListEditData = angular.copy(vlanListEditData);
		$scope.vlanListDirty="";
		var vlanListConfigCLI="";
		// ip dhcp status toggle button
		$scope.ipDhcpToggleBtn=function(){
			$scope.disVlanListApplyBtn=false;
			if($scope.ipDhcpStatus==translate("com_enable")){
				vlanListConfigCLI+="ip dhcp snooping"+"\n";
			}else{
				vlanListConfigCLI+="no ip dhcp snooping"+"\n";
			}
		};
		$scope.ipIGMPToggleBtn=function(){
			$scope.disVlanListApplyBtn=false;
			if($scope.vlanEditData.igmpSnooping==translate("com_enable")){
				$scope.igmpStatus=true;
			}else{
				$scope.igmpStatus=false;
			}
		};
		$scope.portconfigIPTypeOptionsLoad = function () {
            $scope.portconfigIPTypeOptions = dataSourceService.iPTypeDataSource();
            $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[0].value;
        }
		var vlanListNew=[];
		vlanList1=vlanList.split(',');
		for(var i=0;i<vlanList1.length;i++){
			if(vlanList1[i].indexOf("-")>-1){
				var lowEnd = Number(vlanList1[i].split('-')[0]);
				var highEnd = Number(vlanList1[i].split('-')[1]);
				for (var j = lowEnd; j <= highEnd; j++) {
					vlanListNew.push(j);
				}
			}else {
				vlanListNew.push(Number(vlanList1[i]));
			}
		}
		var finalVlanListNew1=[];
		for(var i4=0;i4<=vlanListNew.length-1;i4++){
			if(!isNaN(vlanListNew[i4])){
				finalVlanListNew1.push({VlanList:vlanListNew[i4]});
			}
		}
		$scope.vlanListData = new kendo.data.ObservableArray(finalVlanListNew1);
		// vlan list edit record
		var showVlanListEdit = function(){
			var selected = this.dataItem(this.select());
			$timeout(function(){$scope.vlanListShowEditSection = true});
			$scope.vlanListEditData.VlanList = selected.VlanList;
			$scope.vlanListDirty=selected.dirty;
			$scope.vlanListDelBtn=false;
		};
		// vlan list save records
		$scope.saveVlanListData = function(){
			if(vlanListValidations.validate()){
				if($scope.vlanListDirty){
					var vlanList=$scope.vlanListEditData.VlanList.split(',');
					var vlanListNew=[];
					for(var i=0;i<vlanList.length;i++){
						if(vlanList[i].indexOf("-")>-1){
							var lowEnd = Number(vlanList[i].split('-')[0]);
							var highEnd = Number(vlanList[i].split('-')[1]);
							for (var j = lowEnd; j <= highEnd; j++) {
								vlanListNew.push(j);
							}
						}else {
							vlanListNew.push(Number(vlanList[i]));
						}
					}
					for(var i1=0;i1<=vlanListNew.length-1;i1++){
						$scope.ipDhcpSnnopingGrid.dataSource.add({"VlanList": vlanListNew[i1]});
					}
				}else{
					var selectedItem = $scope.ipDhcpSnnopingGrid.dataItem($scope.ipDhcpSnnopingGrid.select());
					vlanListConfigCLI+="no ip dhcp snooping vlan"+" "+ trimVal(selectedItem.VlanList)+"\n";
					selectedItem.VlanList = $scope.vlanListEditData.VlanList;
				}
				var newVlanList=$scope.vlanListEditData.VlanList.split(', ').join(',');
				vlanListConfigCLI+="ip dhcp snooping vlan"+" "+newVlanList+"\n";
				$scope.vlanListShowEditSection = false;
				$scope.disVlanListApplyBtn=false;
			}
		}
		// Cancel Vlan Group
		$scope.cancelVlanListData=function(){
			$scope.vlanListShowEditSection = false;
		};
		// vlan list delete record
		$scope.delVlanListRow=function(){
			var selectedItem = $scope.ipDhcpSnnopingGrid.dataItem($scope.ipDhcpSnnopingGrid.select());
			vlanListConfigCLI+="no ip dhcp snooping vlan"+" "+selectedItem.VlanList+"\n";
			$scope.ipDhcpSnnopingGrid.dataSource.remove(selectedItem);
			$scope.vlanListShowEditSection = false;
			$scope.vlanListDelBtn=true;
			$scope.disVlanListApplyBtn=false;
		};
		// vlan list add record
		$scope.addVlanListRow = function(){
			$scope.vlanListEditData = angular.copy(vlanListEditData);
			$scope.vlanListShowEditSection = true;
			$scope.vlanListDirty=true;
			angular.element("#vlanListForm  span.k-tooltip-validation").hide();
		};
		// vlan list apply configurations
		$scope.vlanListApplyBtn=function(){
			var result = requestRoutingService.getConfigCmdOutput(vlanListConfigCLI);
			if(result==""){
				notificationService.showNotification(translate('vlan_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			$scope.disVlanListApplyBtn=true;
		}
		// Vlan list grid starts here
		$scope.gridDataSource = new kendo.data.DataSource({
			pageSize : 10,
			data : $scope.vlanListData
		});
		$scope.ipDhcpSnnopingGridOptions = {
			dataSource: $scope.gridDataSource,
			editable : false,
			sortable : true,
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
			change	:showVlanListEdit,
			scrollable : false,
			selectable : true,
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
			columns : [{
				field : "VlanList",
				title : translate("vlan_list")
			}]
		};
		$scope.tabChange = function(tab){
			$scope[tab] = false;
		}
	// sviconfig start here
		$scope.sviDelBtn = true;
        // Edit SVI
        var sviCli = "";
        var editVlan = "";
		var mtuHName="",sviHDescription=null,vlanHDhcp=null,vlanHIP=null,dhcpHRelay="Disable",adminHStatus="Up";
        $scope.kendoWindow = {
            isEditMode: true
        };
        //MTU field will be enabled if need in future
		if($rootScope.deviceInfo.type.indexOf("2960X")!=-1 || $rootScope.deviceInfo.type.indexOf("2960C")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("3560CX")!=-1 ){
			$scope.vlanNumRangeUpto = "4094";
		}else{
			$scope.vlanNumRangeUpto = "4095";
		}
		$scope.mtuSize = true;
        $scope.showEditTabsOnClick = function(data) {
			$scope.iptype.ipv4 = false;
            $scope.iptype.ipv6 = false;
			$scope.logicalInterface.vlan.dhcp = false;
			$scope.logicalInterface.vlan.autoconfig = false;
			$scope.logicalInterface.vlan.listIpb6Address = [];
			$scope.oldListIpb6Address = [];
			angular.element("#sviQuicksetupForm  span.k-tooltip-validation").hide();
            $scope.vlanInterfaceName = true;
            $scope.kendoWindow.isEditMode = false;
            $scope.sviGridWindow.open().center();
            editVlan = data.interface;
            sviCli = "show running-config interface " + editVlan + "\n";
            var showEditData = deviceCommunicatorCLI.getExecCmdOutput(sviCli);
            var showSviData = showEditData[0].split("\n");
            $scope.sviDescription = "";
            $scope.dhcpRelay = translate("com_disable");
            $scope.ports.portConfigIp = "";
            $scope.ports.portConfigSubnet = "";
            $scope.vlanDhcp = "";
			$scope.vlanNumber = editVlan.substring(4);
            $scope.adminStatus = data.status.indexOf("down")!=-1 ? translate("toggle_down") : translate("toggle_up");
            for (var i = 0; i < showSviData.length; i++) {
                if (showSviData[i].indexOf("description") > 0) {
                    $scope.sviDescription = showSviData[i].substring(12);
					sviHDescription = $scope.sviDescription;
                }
                if (showSviData[i].indexOf("ip dhcp relay information trusted") > 0) {
                    $scope.dhcpRelay = translate("com_enable");
					dhcpHRelay = $scope.dhcpRelay;
                }
                if (showSviData[i].indexOf("ip address") > 0 && showSviData[i].indexOf("no ip address") < 0) {
					$scope.iptype.ipv4 = true;
                    $scope.ports.dhcpHostName = "";	
					$scope.ports.portConfigIp = "";
					$scope.ports.portConfigSubnet = "";
                                var spltIp = (showSviData[i].trim()).split(" ");
                                if(showSviData[i].indexOf("ip address pool")!= -1){
                                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[3].value;
                                    $scope.portconfigPool = spltIp[4];
                                }else if(showSviData[i].indexOf("dhcp hostname")!=-1){
                                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[2].value;
                                    $scope.ports.dhcpHostName = spltIp[4];
                                }else if(showSviData[i].indexOf("dhcp hostname")== -1 && showSviData[i].indexOf("ip address")!= -1 && showSviData[i].indexOf("ip address pool")== -1) {
                                    $scope.portconfigIPType = $scope.portconfigIPTypeOptions.options.data[1].value;
									$scope.ports.portConfigIp = spltIp[2];
                                    $scope.ports.portConfigSubnet = spltIp[3];
                                }
                }
                if (showSviData[i].indexOf("shutdown") > 0) {
                    $scope.adminStatus = translate("toggle_down");
					adminHStatus = $scope.adminStatus;
                }
                if (showSviData[i].indexOf("ip mtu") > 0) {
                    $scope.mtu = showSviData[i].substring(8);
					mtuHName = $scope.mtu;
                }
                if (showSviData[i].indexOf("ip helper-address") > 0) {
                    $scope.vlanDhcp = showSviData[i].substring(18).trim();
					vlanHDhcp = $scope.vlanDhcp;
                }
				if (showSviData[i].indexOf("ipv6 address ") != -1) {
                    if (showSviData[i].indexOf("dhcp") ==-1 && showSviData[i].indexOf("autoconfig") ==-1) {
						var  tempString=executeCliCmdService.getNextString(showSviData[i],["ipv6 address"],["\n"]).trim();
						$scope.logicalInterface.vlan.listIpb6Address.push({"name":tempString});
					}
                }
				if (showSviData[i].indexOf("dhcp") != -1) {
                    if (showSviData[i].indexOf("rapid-commit")!= -1) {
						$scope.logicalInterface.vlan.rapid = true;
						$scope.logicalInterface.vlan.dhcp = true;
					}else{
						$scope.logicalInterface.vlan.rapid = false;
						$scope.logicalInterface.vlan.dhcp = true;
					}
					$scope.iptype.ipv6 = true;
                }
				if (showSviData[i].indexOf("autoconfig") != -1) {
					$scope.logicalInterface.vlan.autoconfig = true;
					$scope.iptype.ipv6 = true;
                }
            }
			$timeout(function(){
				if($scope.logicalInterface.vlan.listIpb6Address.length > 0){
					$scope.iptype.ipv6 = true;
				}
			},500); 
			$scope.oldListIpb6Address = angular.copy($scope.logicalInterface.vlan.listIpb6Address)
        }
        $scope.addSviRow = function() {
			angular.element("#sviQuicksetupForm  span.k-tooltip-validation").hide();
            $scope.vlanInterfaceName = false;
			$scope.logicalInterface.vlan.listIpb6Address = [];
            $scope.kendoWindow.isEditMode = true;
            $scope.sviGridWindow.open().center();
            $scope.vlanNumber = "";
            $scope.mtu = "";
            $scope.sviDescription = "";
            $scope.iptype.ipv4 = false;
            $scope.iptype.ipv6 = false;
			$scope.logicalInterface.vlan.dhcp = false;
			$scope.logicalInterface.vlan.autoconfig = false;
            $scope.dhcpRelay = translate("com_disable");
            $scope.vlanIP = "";
            $scope.vlanSubnet = "";
            $scope.vlanDhcp = "";
            $scope.adminStatus= translate("toggle_up");
			$scope.portconfigIPTypeOptionsLoad();
        }
        $scope.cancelSviData = function() {
            $scope.sviGridWindow.close();
        }
        //Save SVI Data
        var sviConfigCLI = "";
        $scope.saveSviData = function(data) {
			if(data=='edit'){
					$scope.vlanNumber = editVlan.substring(4);
				}
			if($scope.sviValidator.validate()){
				var mtuName = $scope.mtu;
				var sviDesc = $scope.sviDescription;
				var vlanIpAddress = $scope.ports.portConfigIp;
				var vlanSubnetMask = $scope.ports.portConfigSubnet;
				var vlanDhcpServer = $scope.vlanDhcp;
				var vlanAdminStatus = $scope.adminStatus;
				        sviConfigCLI = "interface vlan " + $scope.vlanNumber + " \n";
				if(mtuName!=mtuHName && mtuName != undefined){
					if (mtuName != "") {
						sviConfigCLI += "ip mtu " + mtuName + " \n";
					} else {
						sviConfigCLI += "no ip mtu \n";
					}
					mtuHName = "";
				}
				      if(!$scope.hideIpv6){
				      sviConfigCLI += "no ipv6 address \n";
				      sviConfigCLI += "no ipv6 address dhcp rapid-commit \n";
					  }
				if($scope.logicalInterface.vlan.listIpb6Address.length > 0){
					for(var i=0;i<$scope.logicalInterface.vlan.listIpb6Address.length;i++){
					  sviConfigCLI += "ipv6 address " + $scope.logicalInterface.vlan.listIpb6Address[i].name + " \n";
					}
				}
				if($scope.logicalInterface.vlan.dhcp){
					if($scope.logicalInterface.vlan.rapid){
					  sviConfigCLI += "ipv6 address dhcp rapid-commit \n";
					}else{
					  sviConfigCLI += "ipv6 address dhcp  \n";
					}
				}
				if($scope.logicalInterface.vlan.autoconfig){
					  sviConfigCLI += "ipv6 address autoconfig \n";
				}
				if(sviDesc != sviHDescription && sviDesc!=""){
				if (sviDesc) {
					sviConfigCLI += "description " + sviDesc + " \n";
				} else {
					sviConfigCLI += "no description \n";
				}
				sviHDescription = null;
				}
				if($scope.dhcpRelay!=dhcpHRelay){
				if ($scope.dhcpRelay == translate("com_enable")){
					sviConfigCLI += "ip dhcp relay information trusted \n"
				}
				else{
					sviConfigCLI += "no ip dhcp relay information trusted \n"
				}
				dhcpHRelay = "Disable";
				}
				sviConfigCLI += "no ip address \n";
				if($scope.portconfigIPType == "static"){
					if(vlanIpAddress != ""){
						sviConfigCLI += "ip address " + vlanIpAddress + " " + vlanSubnetMask + "  \n";
					}
				}else if($scope.portconfigIPType == "dhcp"){
					sviConfigCLI += "ip address dhcp hostname " + $scope.ports.dhcpHostName + "\n";
				}else if($scope.portconfigIPType == "pool"){
					sviConfigCLI += "ip address pool " + $scope.portconfigPool + "\n";
				}
				/* if(vlanIpAddress != vlanHIP){
				if (vlanIpAddress) {
					sviConfigCLI += "ip address " + vlanIpAddress + " " + vlanSubnetMask + "  \n";
				}else{
					sviConfigCLI += "no ip address \n";
				}
				vlanHIP = null;
				} */
				
				if(vlanDhcpServer != vlanHDhcp && vlanDhcpServer!=""){
				if(vlanDhcpServer){
				   sviConfigCLI += "no ip helper-address \n";				
				   sviConfigCLI += "ip helper-address " + vlanDhcpServer + "\n";
				}				
				else{
					sviConfigCLI += "no ip helper-address \n";
				}
				vlanHDhcp = null;
				}
				if(vlanAdminStatus!=adminHStatus){
				if (vlanAdminStatus === "Up") {
					sviConfigCLI += "no shutdown \n";
				} else {
					sviConfigCLI += "shutdown \n";
				}
				adminHStatus="Up";
				}
				cliPush(sviConfigCLI);
				if(data=='add'){
					$scope.sviGrid.dataSource.add({
						"interface": "Vlan" + vlanName,
						"status": vlanAdminStatus.toLowerCase(),
						"operstatus": "down",
						"ipaddress": vlanIpAddress,
						"description": sviDesc
					});
				}
				else{
					var selectedItem = $scope.sviGrid.dataItem($scope.sviGrid.select());
					selectedItem.description = sviDesc;
					selectedItem.ipaddress = vlanIpAddress;
					selectedItem.status = vlanAdminStatus.toLowerCase();
				}
				$scope.sviGridWindow.close();
			}
        }
		$scope.manualSVIGridRefresh = function(){
			$scope.sviDelBtn = true;
			$scope.delSviArray = [];
			if (!$scope.$$phase){
				$scope.$apply();
			}
		}
        // Delete functionality
        $scope.delSviArray = [];
        $scope.isDeleteChecked = function(checked, dataItem) {
            if (checked == false) {
                var index = $scope.delSviArray.indexOf(dataItem);
                if (index > -1) {
                    $scope.delSviArray.splice(index, 1);
                }
            } else {
                $scope.delSviArray.push(dataItem);
            }
            if ($scope.delSviArray.length > 0) {
                $scope.sviDelBtn = false;
            } else {
                $scope.sviDelBtn = true;
            }
        };
        $scope.$on("okDelete", function() {
            $scope.dlg.data("kendoWindow").close();
            $scope.deleteSviRow();
        });
        //Delete SVI Data.
        $scope.deleteSviRow = function() {
            $scope.sviDelBtn = true;
            var selectedItem = $scope.delSviArray;
            $scope.delSviArray = [];
            var sviDeleteCLI = ""
            for (var i = 0; i < selectedItem.length; i++) {
                sviDeleteCLI += "no interface " + selectedItem[i].interface + " \n";
                $scope.sviGrid.dataSource.remove(selectedItem[i]);
            }
            cliPush(sviDeleteCLI);
        }
        //Device cli push and Toaster messages
        function cliPush(cli) {
			if(cli != ""){
				var result = requestRoutingService.getConfigCmdOutput(cli);
				if (result == "") {
					notificationService.showNotification(translate('svi_config_success_msg'), translate('com_config_success_title'), 'success');
				} else {
					notificationService.showNotification(result, translate('com_config_fail_title'), 'error');
				}
				$scope.vlanInterface();
			}
        }
        $scope.$on("cancel", function() {
			isEditModeFlag = true;
            $scope.dlg.data("kendoWindow").close();
			$scope.vlanDeleteSection = true;
			angular.element('#layer2VlanGrid').data('kendoGrid').refresh();
			$scope.sviDelBtn = true;
			$scope.delVlanArray = [];
			angular.element('#sviGrid').data('kendoGrid').refresh();
        });
        //Confirmation Window For Delete SVI Data.
        $scope.sviDeleteConfirm = function() {
            $scope.dlg = dialogService.dialog({
                content: translate('svi_delete_confirmation'),
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
        };
        $scope.sviGridOptions = {
            editable: false,
            sortable: true,
            filterable: {
                extra: false,
                operators: {
                    string: {
                        eq: translate("com_is_equal"),
                        neq: translate("com_isnot_equal")
                    }
                },
                messages: {
                    info: translate("com_page_dropDowntext"),
                    filter: translate("com_btn_filter"),
                    clear: translate("com_btn_clear")
                }
            },
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
                    "template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isDeleteChecked(checked,dataItem)\"  ng-disabled=\"dataItem.interface=='Vlan1'?true:false\"  />",
                    sortable: false,
                    width: 10
                },
                {
                    field: "interface",
                    title: translate("com_name")
                },
                {
                    field: "status",
                    title: translate("svi_admin_status"),
                    attributes: {
                        style: "text-align:center"
                    },
                    template: '<i class=\"fa fa-arrow-circle-#=status# fa-lg\" style=color:#=status==="up"?"green":"red"#></i>'
                }, {
                    field: "operstatus",
                    title: translate("svi_opl_status"),
                    attributes: {
                        style: "text-align:center"
                    },
                    template: '<i class=\"fa fa-arrow-circle-#=operstatus# fa-lg\" style=color:#=operstatus==="up"?"green":"red"#></i>'
                }, {
                    field: "ipaddress",
                    title: translate("portconfig_port_ipv4_ip")
                }, {
                    field: "description",
                    title: translate("portconfig_general_description")
                }
            ]
        };
		// svi validation
        $scope.sviValidations = {
            rules : {
				validateip : function(input) {
					if(input.val()){
						if (angular.isUndefined(input.data('validateIp'))) {
							return true;
						}
						if (validationService.validateIPAddress(input)) {
							return true;
						}
						else {
							return false;
						}
					}
					return true;
                },
				customreq:function(input){
					if (input.filter("[data-customreq]" ) && (input.attr("name") == 'vlanIP' || input.attr("name") == 'vlanSubnet')) {
						if($scope.iptype.ipv4){
							if(input.val()==""){
								return false;
							}else{
								return true;
							}
						}
					}
					return true;
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
					if(input.val() === "0.0.0.0" || input.val() === "255.255.255.255"){
						return true;
					}
					else{
						if($scope.ports.portConfigIp && $scope.ports.portConfigIp !=""){
						 return input.data('validatesubnetMsg') ? $scope.validateSubnetMask(input.val())  : true;
						}else{
							return true;
						}
					}
				},
				customreq:function(input){
					if (input.filter("[data-customreq]" ) && (input.attr("name") == 'vlanIP' || input.attr("name") == 'vlanSubnet')) {
						if($scope.iptype.ipv4){
							if(input.val()==""){
								return false;
							}else{
								return true;
							}
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
		$scope.vlanInterface = function() {
            $scope.vlanInterfaceData = [];
            var portMonCLI = "show ip interface brief \n";
			var vlanMonCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show running-config | s interface\n");
            var portMonCLIOP = deviceCommunicatorCLI.getExecCmdOutput(portMonCLI);
            var arrVlan = portMonCLIOP[0].split("\n"),findStatus = "",findPStatus = "";
            var arrVlanSvi = vlanMonCLIOP[0].split("interface");
            var shwRunVlanCLIOp = [];
            var vlanCLI = "";
            for (var i = 1; i < arrVlan.length; i++) {
                var portsObj = {};
                if (arrVlan[i].substring(0, 22).trim().indexOf("Vlan") != -1) {
                    portsObj["interface"] = arrVlan[i].substring(0, 22).trim();
                    vlanCLI += "show running-config interface " + portsObj["interface"] + "\n";
					if(arrVlan[i].substring(22, 39).trim().indexOf("unassigned") != -1){
						portsObj["ipaddress"] = translate("config_vlan_svi_unassigned");
					}else{
						portsObj["ipaddress"] = arrVlan[i].substring(22, 39).trim();
					}					
                    findStatus = arrVlan[i].substring(50, 72).trim();
                    findPStatus = arrVlan[i].substring(72, 95).trim();

                    if (findStatus.indexOf("up")!=-1) {
                        portsObj["status"] = "up";
                    } else {
                        portsObj["status"] = "down";
                    }
                    if (findPStatus.indexOf("up")!=-1) {
                        portsObj["operstatus"] = "up";
                    } else {
                        portsObj["operstatus"] = "down";
                    }
                    $scope.vlanInterfaceData.push(portsObj)
                }
            }
			var ipv6Check = [];
			for(var i = 1; i < arrVlanSvi.length; i++){
					var ipAddress="";
					var intShowRun="interface "+arrVlanSvi[i];
					var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
					if(interfaceName.indexOf("Vlan") != -1){
						if(intShowRun.indexOf("ipv6 address")!=-1){
							ipv6Check.push(interfaceName)
						}
					}
						    	
			 }
            var vlanShowRunOP = deviceCommunicatorCLI.getExecCmdOutput(vlanCLI);
            for (var i = 0; i < vlanShowRunOP.length; i++) {
                var vlanName = executeCliCmdService.getNextString(vlanShowRunOP[i], ["interface"], ["\n"]).trim();
                var vlanIndex = $scope.vlanInterfaceData.map(function(e) {
					for (var i = 0; i < ipv6Check.length; i++) {
						if (ipv6Check[i] === e.interface) {
							if(e.ipaddress == translate("config_vlan_svi_unassigned")){
								e.ipaddress = "IPV6"
							}
						}
					}
                    return e.interface;
                }).indexOf(vlanName);
                $scope.vlanInterfaceData[vlanIndex].description = executeCliCmdService.getNextString(vlanShowRunOP[i], ["description"], ["\n"]).trim();
            }
			$scope.vlanDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: $scope.vlanInterfaceData
			});
			$scope.manualSVIGridRefresh();
        }
        $scope.vlanInterface();
	// sviconfig end here
}]);
