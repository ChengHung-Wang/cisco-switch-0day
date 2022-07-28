/**
Description: Controller for span and rspan
Copyright (c) 2018 by Cisco Systems, Inc.
All rights reserved.
*/
app.register.controller('spanCtrl', ['$scope','$rootScope','$timeout', '$filter' , 'validationService', 'notificationService', 'requestRoutingService' , 'gridCrudService','executeCliCmdService','getStringLineService', function ($scope, $rootScope, $timeout, $filter,  validationService, notificationService, requestRoutingService, gridCrudService,executeCliCmdService,getStringLineService) {
	var translate = $filter("translate");
	angular.element(".btnView").hide();
	angular.element(".pageLoader").show();
	$scope.disableDeleteButton=true;
	$scope.disableAddButton=false;
	$scope.disableApplyButton = true;
	$scope.disableFilter = false;
	$scope.disableSaveButton = false;
	$scope.kendoWindow = {isEditMode:true };
	$scope.checkc1000 = false;
	if($rootScope.deviceInfo.type.indexOf("C1000") != -1 ){
        		 $scope.checkc1000 = true;
        	} 
	angular.extend($scope, {
			 span:{
				 sessionid : '',
				 type: '',
				 source: '',
				 sourcedir : '',
				 destination: '',
				 filtertype: '',
				 filtercond: '',
				 sourceDropVal : '',
				 trafDropVal : null,
				 destDropVal : null,
				 filterDropVal : null,
				 filterAddDropVal : null,
				 filteripDropVal : null,
				 filterValue : false,
				 vlanId : '',
				 rvlanId : '',
				 filtervlanID : ''
			 }
		});
	$scope.spanGridOptions = {
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
                field: "sessionid", title: translate("span_rspan_sessionid")
            },
            {
                field: "type", title: translate("management_snmp_host_type")
            },
            {
                field: "source", title: translate("span_rspan_source")
            },
			{
                field: "sourcedir", 
				template: "#if(sourcedir == 'rx') { # <i class=\"fa fa-long-arrow-left clockTextHiglight font-size-15\"></i> # }else if(sourcedir == 'tx'){# <i class=\"fa fa-long-arrow-right clockTextHiglight font-size-15\"></i>#} else if(sourcedir == 'Both'){# <i class=\"fa fa-exchange clockTextHiglight font-size-15\"></i> #}#",
				title: translate("span_rspan_src_dir")
            },
            {
                field: "destination", title: translate("span_rspan_dest")
            },
			{
                field: "filtertype", title: translate("span_rspan_filter_type"),hidden:$scope.checkc1000
            },
			{
                field: "filtercond", title: translate("span_rspan_filter_cond"),hidden:$scope.checkc1000
            }
        ]
    };
    if($rootScope.deviceInfo.type.indexOf("C1000")!=-1 ){
		$scope.isEz1kDevice = true;
	}else{
		$scope.isEz1kDevice = false;
	}
	$scope.filterView = true;
	if($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1){
		$scope.filterView = false;
	}
	if($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1){
		$scope.sourceDataObj = new kendo.data.ObservableArray([{
				sourceName  : translate('system_time_local'),
				sourceValue : 'Local'
			}
			]);
	}else{
			$scope.sourceDataObj = new kendo.data.ObservableArray([{
				sourceName  : translate('system_time_local'),
				sourceValue : 'Local'
			},{
				sourceName  : translate('span_rspan_remote'),
				sourceValue : 'Remote'
			}
			]);			
	}
	$scope.sourceDropData = new kendo.data.DataSource({		
			data: $scope.sourceDataObj
	});
	
	if($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1){
		$scope.destDataObj = new kendo.data.ObservableArray([{
			destName  : translate('system_time_local'),
			destValue : 'Local'
		}
		]);
	}else{
		$scope.destDataObj = new kendo.data.ObservableArray([{
			destName  : translate('system_time_local'),
			destValue : 'Local'
		},{
			destName  : translate('span_rspan_remote'),
			destValue : 'Remote'
		}
		]);
	}
	$scope.destDropData = new kendo.data.DataSource({
		pageSize: 10,
		data: $scope.destDataObj
	});
	
	
	$scope.trafDataObj = new kendo.data.ObservableArray([{
		trafName  : translate('span_rspan_ingress'),
		trafValue : 'rx'
	},{
		trafName  : translate('span_rspan_egress'),
		trafValue : 'tx'
	},{
		trafName  : translate('span_rspan_both'),
		trafValue : 'Both'
	}
	]);
	$scope.trafDropData = new kendo.data.DataSource({
		pageSize: 10,
		data: $scope.trafDataObj
	});	
		
	if($rootScope.deviceInfo.type.indexOf("2960C")!=-1){
		$scope.filterDataObj = new kendo.data.ObservableArray([{
			filterName  : translate('menu_vlan'),
			filterValue : 'vlan'
		}]);
	}else{
		$scope.filterDataObj = new kendo.data.ObservableArray([{
			filterName  : translate('sys_dhcp_ipv4'),
			filterValue : 'ipv4'
		},{
			filterName  : translate('portconfig_adv_ipv6label'),
			filterValue : 'ipv6'
		},{
			filterName  : translate('menu_vlan'),
			filterValue : 'vlan'
		}]);
	}
	
	$scope.filterData = new kendo.data.DataSource({
		pageSize: 10,
		data: $scope.filterDataObj
	});	
	
	// popup function
	var myWindow = angular.element("#window");
	myWindow.kendoWindow({
		modal: true,
		width: "900px",
		title: $scope.isEz1kDevice  ? translate("span_span_create") : translate("span_rspan_create"),
		visible: false,
		actions: [
			"Close"
		]
	}).data("kendoWindow").center();	
	var getSessionId = '';
	$scope.addspanRspan = function() {
		$scope.availableSourceListOptions = angular.copy($scope.interfacesLists);
		$scope.availableDestListOptions = angular.copy($scope.destinterfacesLists);
		$scope.span.vlanID = '';
		$scope.span.rvlanId = '';
		$scope.span.filtervlanID = '';
		$scope.sourceSelectedServerGroupOptions = [];
		$scope.destSelectedServerGroupOptions = [];
		myWindow.data("kendoWindow").open().center();
		$scope.kendoWindow.isEditMode = true;	
		$scope.span.sourceDropVal=translate('system_time_local');
		$scope.span.destDropVal=translate('system_time_local');
		$scope.span.trafDropVal="rx";
		$scope.span.filterValue=false;
		$scope.disableFilter = false;
		$scope.span.created = true;
		$scope.displayMsg = false;
		$scope.disableSaveButton = false;
		angular.element("#spanForm span.k-tooltip-validation").hide();
		$scope.removeDestPort();
    };
	var confDestList = [];
	var confSourceList = [];
	$scope.removeDestPort = function(){
		for(var i = 0; i < $scope.oldSpanGridData.length; i++){
			if($scope.oldSpanGridData[i].destination.indexOf("-")){				
				var arrList = ($scope.interRange($scope.oldSpanGridData[i].destination));
				var arrSList = ($scope.interRange($scope.oldSpanGridData[i].source));
				for(var i1 = 0; i1 < arrList.length; i1++){
					confDestList.push(arrList[i1]);
				}
				for(var i2 = 0; i2 < arrSList.length; i2++){
					confSourceList.push(arrSList[i2]);
				}
			}else{
				confDestList.push($scope.oldSpanGridData[i].destination);
				confSourceList.push($scope.oldSpanGridData[i].source);
			}
		}
		
		$scope.availableDestListOptions = $scope.availableDestListOptions.filter(function(val) {
			return confDestList.indexOf(val) == -1;
		});

		$scope.availableSourceListOptions = $scope.availableSourceListOptions.filter(function(val) {
			return confDestList.indexOf(val) == -1;
		});

        $scope.availableDestListOptions = $scope.availableDestListOptions.filter(function(val) {
			return confSourceList.indexOf(val) == -1;
		});

	}

	$scope.cancelAddEditKendoWindow = function() {
		myWindow.data("kendoWindow").close();
	};
	
	$scope.formatInt = function (intName) {
		if (intName.indexOf("TenGigabitEthernet") != -1) {
			intName = intName.replace("TenGigabitEthernet", "Te");
		} else if (intName.indexOf("FastEthernet") != -1) {
			intName = intName.replace("FastEthernet", "Fa");
		} else if (intName.indexOf("GigabitEthernet") != -1) {
			intName = intName.replace("GigabitEthernet", "Gi");
		} else if (intName.indexOf("Port-channel") != -1) {
			intName = intName.replace("Port-channel", "Po");
		}else if (intName.indexOf("Bluetooth") != -1) {
			intName = intName.replace("Bluetooth", "Bl");
		} else if (intName.indexOf("Loopback") != -1) {
			intName = intName.replace("Loopback", "Lo");
		}
		return intName;		
	}		
	
	$scope.moveToSourceServerGroup = function() {
		$scope.displayMsg = false;
		$scope.moveItemsBetweenLists($scope.availableSourceListOptions, $scope.sourceSelectedServerGroupOptions, $scope.span.sourceintMethod);
		$scope.addsubAvailableDestInterface($scope.sourceSelectedServerGroupOptions);
	};
	$scope.moveFromSourceServerGroup = function() {
		var srcLists = angular.copy($scope.span.sourceselList);
		$scope.moveItemsBetweenLists($scope.sourceSelectedServerGroupOptions, $scope.availableSourceListOptions, $scope.span.sourceselList);
		$scope.moveItemsBetweenLists($scope.destSelectedServerGroupOptions, $scope.availableDestListOptions, srcLists);
	};	
	
	$scope.moveToDestServerGroup = function() {
		 $scope.displayMsg = false;
		 if($scope.destSelectedServerGroupOptions.length < 1 && ($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1 )|| $rootScope.deviceInfo.type.indexOf("C2960+")!=-1 ){
				$scope.moveItemsBetweenLists($scope.availableDestListOptions, $scope.destSelectedServerGroupOptions, $scope.span.destintList);
				$scope.addsubAvailableSourceInterface($scope.destSelectedServerGroupOptions);
		 }
		 if($rootScope.deviceInfo.type.indexOf("2960X")!=-1 || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) || $rootScope.deviceInfo.type.indexOf("2960C")!=-1 || $rootScope.deviceInfo.type.indexOf("3560CX")!=-1){
				$scope.moveItemsBetweenLists($scope.availableDestListOptions, $scope.destSelectedServerGroupOptions, $scope.span.destintList);
				$scope.addsubAvailableSourceInterface($scope.destSelectedServerGroupOptions);
		}
	};
	$scope.moveFromDestServerGroup = function() {
		 var destLists = angular.copy($scope.span.destselList);
		 $scope.moveItemsBetweenLists($scope.destSelectedServerGroupOptions, $scope.availableDestListOptions, $scope.span.destselList);
		 $scope.moveItemsBetweenLists($scope.sourceSelectedServerGroupOptions, $scope.availableSourceListOptions, destLists);
	};	

	
	$scope.addsubAvailableDestInterface = function(getSelInt){
		if(getSelInt){
			$scope.availableDestListOptions = $scope.availableDestListOptions.filter(function(val) {
				return getSelInt.indexOf(val) == -1;
			});
		}
	}

	$scope.addsubAvailableSourceInterface = function(getSelInt){
		if(getSelInt){
			$scope.availableSourceListOptions = $scope.availableSourceListOptions.filter(function(val) {
				return getSelInt.indexOf(val) == -1;
			});
		}
	}
	
	$scope.checkSpanStatus = function(){
		if($scope.span.sourceDropVal == "Remote" && $scope.span.destDropVal == "Remote"){
			$scope.disableSaveButton = true;
		}else{
			$scope.disableSaveButton = false;
		}
	}
	
	$scope.moveItemsBetweenLists = function(fromList, toList, itemsToMove) {
		if ( typeof itemsToMove != "undefined") {
			while (itemsToMove.length > 0) {
				var item = itemsToMove.pop();
				toList.push(item);
				var index = fromList.indexOf(item);
				if (index != -1) {
					fromList.splice(index, 1);
				}
			}
		}
	}
	
	$scope.spanValidations = {
			rules : {
				range:function(input){
					return validationService.validateRange(input);
				}
			}
		};
	
	// Refresh button trigger
	angular.element("#spanGrid").delegate(".k-pager-refresh", "click", function(){
		$scope.disableDeleteButton = true;
        $scope.selectedArray = [];
        if (!$scope.$$phase){
			$scope.$apply();
        }
	});

	$scope.manualGridRefresh = function(){
		$scope.disableDeleteButton = true;
        $scope.selectedArray = [];
        if (!$scope.$$phase){
			$scope.$apply();
        }
	}

	var addSpanData = {
		 sessionid : '',
		 type: '',
		 source: '',
		 sourcedir : '',
		 destination: '',
		 filtertype: '',
		 filtercond: '',
		 sourceDropVal : '',
		 trafDropVal : null,
		 destDropVal : null,
		 filterDropVal : null,
		 filterAddDropVal : null,
		 filteripDropVal : null,
		 filterValue : false,
		 vlanId : '',
		 rvlanId : '',
		 filtervlanID : ''	
	};
	$scope.doneAddEditKendoWindow = function(){
		$scope.displayMsg = false;
		if($scope.spanValidations.validate() && $scope.checkatleastoneInterface()){
			if($scope.span.created){
				addSpanData.type = $scope.span.sourceDropVal;
				addSpanData.source = $scope.sourceSelectedServerGroupOptions.join();
				addSpanData.sourcedir = $scope.span.trafDropVal;
				addSpanData.destination = $scope.destSelectedServerGroupOptions.join();
				addSpanData.filtertype = $scope.span.filterValue;
				addSpanData.filtercond = $scope.span.filterDropVal;
				addSpanData.sessionid = $scope.genSessionId();
				getSessionId = $scope.genSessionId();
				$scope.spanGridData.push(addSpanData);	
			}else{
				$scope.updateSpanChange();
			}
			myWindow.data("kendoWindow").close();
			$scope.applySpan();
		}		
	}
	$scope.displayMsg = false;
	$scope.checkatleastoneInterface = function(){
		if($scope.span.destDropVal == "Local" &&  $scope.span.sourceDropVal == "Local"){
			if($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1){
				if($scope.sourceSelectedServerGroupOptions.length < 1 && $scope.destSelectedServerGroupOptions.length < 1)
				{
					$scope.displayMsg = true;
					return false;
				}
			}else{
				if($scope.sourceSelectedServerGroupOptions.length < 1 && $scope.destSelectedServerGroupOptions.length < 1 && $scope.span.filterValue == false)
				{
					$scope.displayMsg = true;
					return false;
				}
			}
			return true;
		}else{
			return true;
		}
	}

	$scope.filterOnChange = function(){
		$scope.displayMsg = false;
		$timeout(function(){
			$scope.span.filterDropVal = $scope.filterData.options.data[0].filterValue;	
		},500);		
	}

	var totalSessionID = [];
	if($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1){
		 totalSessionID.push("1");
	}else{
		for(var h=1;h<=68;h++){
			totalSessionID.push(""+h+"");
		}	
	}
	$scope.genSessionId = function(){
		var gridSessionIds = [];
		for(var k=0;k<$scope.oldSpanGridData.length;k++){
			gridSessionIds.push($scope.oldSpanGridData[k].sessionid);
		}
		var resId = totalSessionID.filter( function(n) { return !this.has(n) }, new Set(gridSessionIds));
		return resId[0];
	}
	
	$scope.onSelectSpanHandler = function(data) {	
			$scope.disableSaveButton = false;
			$scope.displayMsg = false;
			$scope.span = angular.copy(data);
			if(data.type == "Local Session"){
				$scope.span.sourceDropVal= "Local";
				$scope.span.destDropVal= "Local";
			}
			if(data.type == "Remote Source Session"){
				$scope.span.sourceDropVal= "Local";
				$scope.span.destDropVal= "Remote";				
			}
			if(data.type == "Remote Destination Session"){
				$scope.span.sourceDropVal= "Remote";
				$scope.span.destDropVal= "Local";
			}			 
			
			$timeout(function(){
				$scope.span.trafDropVal = (data.sourcedir == "") ? "both" : data.sourcedir;
				if(angular.element("#traf_dropdown").data('kendoDropDownList')) {
					angular.element("#traf_dropdown").data('kendoDropDownList').value($scope.span.trafDropVal);
				}
				if(data.filterValue){
					$scope.span.filterDropVal  = data.filtertype;
					$scope.span.filterAddDropVal  = data.filterAddDropVal;
					$scope.span.filteripDropVal  = data.filteripDropVal;
					if(angular.element("#filter_drop").data('kendoDropDownList')) {
						angular.element("#filter_drop").data('kendoDropDownList').value($scope.span.filterAddDropVal);
					}
					if(angular.element("#filter_dropip").data('kendoDropDownList')) {
						angular.element("#filter_dropip").data('kendoDropDownList').value($scope.span.filteripDropVal);
					}
				}
			},500);

			$scope.span.sessionid = data.sessionid;
			$scope.sourceSelectedServerGroupOptions = [];
			if(data.source != "" && $scope.span.sourceDropVal == "Local"){
				var inOBOPs = $scope.interRange(data.source);
				$scope.sourceSelectedServerGroupOptions = inOBOPs;
			}else{
				$scope.span.vlanId = data.source;
			}
			$scope.availableSourceListOptions = angular.copy($scope.interfacesLists);
			$scope.availableSourceListOptions = $scope.availableSourceListOptions.filter(function(val) {
				return $scope.sourceSelectedServerGroupOptions.indexOf(val) == -1;
			});
			
			$scope.destSelectedServerGroupOptions = [];
			if(data.destination != "" && $scope.span.destDropVal == "Local"){
				var inOBOPs = $scope.interRange(data.destination);
				$scope.destSelectedServerGroupOptions = inOBOPs;
			}else{
				$scope.span.rvlanId = data.destination;
			}
			$scope.availableDestListOptions = angular.copy($scope.destinterfacesLists);
			$scope.availableDestListOptions = $scope.availableDestListOptions.filter(function(val) {
				return $scope.destSelectedServerGroupOptions.indexOf(val) == -1;
			});			
			
			$scope.removeDestPort();

			angular.element("#spanForm span.k-tooltip-validation").hide();
			$scope.disableFilter = false;
			if(data.filterValue == true){
				$scope.disableFilter = true;
			}
			$scope.kendoWindow.isEditMode = false;
			myWindow.data("kendoWindow").open();
			$scope.span.created = false;
	};

	$scope.updateSpanChange = function(){
		var selSRIndex = $scope.spanGrid.dataSource.indexOf($scope.span);		
		$scope.spanGridData[selSRIndex].type = $scope.span.sourceDropVal;
		$scope.spanGridData[selSRIndex].source = $scope.sourceSelectedServerGroupOptions.join();
		$scope.spanGridData[selSRIndex].sourcedir = $scope.span.trafDropVal;
		$scope.spanGridData[selSRIndex].destination = $scope.destSelectedServerGroupOptions.join();
		$scope.spanGridData[selSRIndex].filtertype = $scope.span.filterValue;
		$scope.spanGridData[selSRIndex].filtercond = $scope.span.filterDropVal;
		getSessionId = $scope.spanGridData[selSRIndex].sessionid;
	}

	$scope.interRange = function(getInt){
			var arrIntList = [];
			var splv = getInt.split(",");
			for(var s=0;s<splv.length;s++){	
				var finalString= "";				
				if(splv[s].indexOf("-") != -1){
					var spltS = splv[s].split("-");
					var st = spltS[0];
					var end = spltS[1];
					var n = st.lastIndexOf("/");
					var newStr = st.substring(0, n+1);
					var start = st.substring(n+1);
					for(var k1=start;k1<=end;k1++){
						arrIntList.push(newStr+k1)
					}					
				}else{
					arrIntList.push(splv[s])
				}		
			}
			return arrIntList;
	}
	
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
            $scope.deletespanWindow.open().center();
			$scope.disableApplyButton = false;
        } else {
            $scope.deletespanWindow.close();
        }
    };
	$scope.deleteSpanArray = [];
	$scope.deleteSpan = function() {
		$scope.deleteSpanArray = [];
        $scope.deletespanWindow.close();
        for (var index = 0; index < $scope.selectedArray.length; index++) {
            $scope.spanGrid.dataSource.remove($scope.selectedArray[index]);
			$scope.deleteSpanArray.push($scope.selectedArray[index]);
        }
		$scope.disableDeleteButton = true;
		$scope.selectedArray = [];
		$scope.applySpan();
    };
	
	$scope.applySpan = function(){
			var spanConfigCli = "";
			
			if($scope.deleteSpanArray.length > 0){
				for(var d=0;d<$scope.deleteSpanArray.length;d++)
				spanConfigCli += "no monitor session "+$scope.deleteSpanArray[d].sessionid +"\n";;
			}
			else{
				if(!$scope.span.created){
					spanConfigCli += "no monitor session "+getSessionId+"\n";
				}
				if($scope.span.sourceDropVal == "Local" && $scope.span.destDropVal == "Local"){
					if($scope.sourceSelectedServerGroupOptions.length > 0){
						spanConfigCli += "monitor session "+getSessionId+" source interface ";
						spanConfigCli += $scope.sourceSelectedServerGroupOptions.join();
						if($scope.span.trafDropVal != translate('ntp_none')){
							spanConfigCli += " "+$scope.span.trafDropVal;
						}
						spanConfigCli += "\n";
					}
					if($scope.destSelectedServerGroupOptions.length > 0){
						spanConfigCli += "monitor session "+getSessionId+" destination interface ";
						spanConfigCli += $scope.destSelectedServerGroupOptions.join() +"\n";
					}
				}
				else if($scope.span.sourceDropVal == "Local" && $scope.span.destDropVal == "Remote"){
					spanConfigCli += "vlan "+$scope.span.rvlanID + "\n";
						spanConfigCli += "remote-span \n";
						spanConfigCli += "exit \n";
					if($scope.sourceSelectedServerGroupOptions.length > 0){						
						spanConfigCli += "monitor session "+getSessionId+" source interface ";
						spanConfigCli += $scope.sourceSelectedServerGroupOptions.join();
						if($scope.span.trafDropVal != translate('ntp_none')){
							spanConfigCli += " "+$scope.span.trafDropVal;
						}
						spanConfigCli += "\n";
					}
					spanConfigCli += "monitor session "+getSessionId+" destination remote vlan "+$scope.span.rvlanID + "\n";
				}
				else if($scope.span.sourceDropVal == "Remote" && $scope.span.destDropVal == "Local"){
						spanConfigCli += "vlan "+$scope.span.vlanID + "\n";
						spanConfigCli += "remote-span \n";
						spanConfigCli += "exit \n";
					if($scope.destSelectedServerGroupOptions.length > 0){
						spanConfigCli += "monitor session "+getSessionId+" destination interface ";
						spanConfigCli += $scope.destSelectedServerGroupOptions.join() +"\n";
					}
						spanConfigCli += "monitor session "+getSessionId+" source remote vlan "+$scope.span.vlanID + "\n";
				}
				
				if($scope.span.filterValue == true){
					if($scope.span.filterDropVal == "ipv4"){
						spanConfigCli += "monitor session "+getSessionId+ " filter ip access-group "+$scope.span.filterAddDropVal+ "\n";
					}
					if($scope.span.filterDropVal == "ipv6"){
						spanConfigCli += "monitor session "+getSessionId+ " filter ipv6 access-group "+$scope.span.filteripDropVal+ "\n";
					}
					if($scope.span.filterDropVal == "vlan"){
						spanConfigCli += "monitor session "+getSessionId+ " filter vlan "+$scope.span.filtervlanID+ "\n";
					}
				}
			}
			
			spanConfigCli += " exit\n";
			$scope.deleteSpanArray = [];
			if(spanConfigCli != ""){
				var result = requestRoutingService.getConfigCmdOutput(spanConfigCli);
				if(result==""){
					notificationService.showNotification(translate('span_rspan_success_msg'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
			}
			$scope.loadSpanGridData();		
	}
	
	$scope.interfacesLists = [];
	$scope.destinterfacesLists = [];
	var interfaceList=[];
	var destinterfaceList=[];
	var getACLipv4Lists = [];
	var getACLipv6Lists = [];
	$scope.availableSourceListOptions = [];
	$scope.sourceSelectedServerGroupOptions = [];
	$scope.availableDestListOptions = [];
	$scope.destSelectedServerGroupOptions = [];
	$scope.oldSpanGridData = new kendo.data.ObservableArray([]);
	$scope.loadSpanGridData = function(){		
		interfaceList=[];
		destinterfaceList=[];
		getACLipv4Lists = [];
		getACLipv6Lists = [];
		var interfaceListOP = deviceCommunicatorCLI.getExecCmdOutput("show ip interface brief \n show monitor session all \n show access-lists | i IP");
		var showSRBrList=interfaceListOP[0].split("\n");
		if(showSRBrList){
			for (var i=1; i < showSRBrList.length; i++) {
				var portsObj = {};
				var interfaceName= showSRBrList[i].substring(0,22).trim();
				if(interfaceName.indexOf("Fa") != -1 || interfaceName.indexOf("Gi") != -1 || interfaceName.indexOf("Po") != -1)
				{
					portsObj["portName"] = interfaceName;				
					interfaceList.push(portsObj);
				}
				if(interfaceName.indexOf("Fa") != -1 || interfaceName.indexOf("Gi") != -1)
				{
					portsObj["portName"] = interfaceName;				
					destinterfaceList.push(portsObj);
				}
			}
		}

		angular.forEach(interfaceList, function (inter) {
				var intNameAttr = $scope.formatInt(inter.portName);
				$scope.interfacesLists.push(intNameAttr);
		});
		angular.forEach(destinterfaceList, function (inter) {
				var intNameAttr = $scope.formatInt(inter.portName);
				$scope.destinterfacesLists.push(intNameAttr);
		});
		
		var getAclList = interfaceListOP[2].split("\n");		
		for(var l=0;l<getAclList.length;l++){
			//IPv4 access list 
			if(getAclList[l].indexOf("Standard IP access list") != -1){
				var getListipv4 = executeCliCmdService.getNextString(getAclList[l],["Standard IP access list "],["\n"]).trim();
				if(getListipv4)
				getACLipv4Lists.push({
					filterAddName : getListipv4,
					filterAddValue : getListipv4
				});				
			}
			if(getAclList[l].indexOf("Extended IP access list ") != -1){
				var getListipv4 = executeCliCmdService.getNextString(getAclList[l],["Extended IP access list "],["\n"]).trim();
				if(getListipv4)
					getListipv4 = getListipv4.replace(" (","(");
				getACLipv4Lists.push({
					filterAddName : getListipv4,
					filterAddValue : getListipv4
				});				
			}			
			//IPv6 access list 
			if(getAclList[l].indexOf("IPv6 access list ") != -1){
				var getListipv6 = executeCliCmdService.getNextString(getAclList[l],["IPv6 access list "],["\n"]).trim();
				var getListipv61 = getListipv6.replace(/\s/g, '');
				if(getListipv61)	
				getACLipv6Lists.push({
					filteripName : getListipv61,
					filteripValue : getListipv61
				});
			}
		}
		
		$scope.filteraddData = new kendo.data.DataSource({
			pageSize: 10,
			data: getACLipv4Lists
		});
		$scope.filteripData = new kendo.data.DataSource({
			pageSize: 10,
			data: getACLipv6Lists
		});
		
		$scope.spanGridData = new kendo.data.ObservableArray([]);
		var tempSpanData = {
			 sessionid : '',
			 type: '',
			 source: '',
			 sourcedir :'',
			 destination: '',
			 filtertype: '',
			 filtercond: '',
			 sourceDropVal : '',
			 trafDropVal : null,
			 destDropVal : null,
			 filterDropVal : null,
			 filterAddDropVal : null,
			 filteripDropVal : null,
			 filterValue : false,
			 vlanId : '',
			 rvlanId : '',
			 filtervlanID : ''	
		};

		var sessionID = [];
		var remData = [];
		var showallSession = interfaceListOP[1];
		var sessionRunningConfig = showallSession.split("---------");
		for(var irc = 0; irc < sessionRunningConfig.length-1; irc++){	
		  if(irc == 0){
			  var sid =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Session "],["\n"]).trim();
			  sessionID.push(sid);
		  }else{
			  var sessionDetails = sessionRunningConfig[irc].trim().split("\n");	
			  var sid =executeCliCmdService.getNextString(sessionDetails[sessionDetails.length-1],["Session "],["\n"]).trim();
			  sessionID.push(sid);
		  }
		} 			
		for(var irc = 1; irc < sessionRunningConfig.length; irc++){	
			   spanMonitorObj = {};
			   spanMonitorObj = angular.copy(tempSpanData);
			   var curType =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Type                     :"],["\n"]).trim();
				if(curType == "-"){
					curType = "Local Session";
				}
			   spanMonitorObj.type = curType;	
			   
			   if(sessionRunningConfig[irc].indexOf("RX Only") != -1){
				   spanMonitorObj.sourcedir = "rx";
				   spanMonitorObj.trafDropVal = "rx";
				   var sourceData =executeCliCmdService.getNextString(sessionRunningConfig[irc],["RX Only              :"],["\n"]).trim();
				   
				   var sourceDataFinal="";
				   if(sourceData.indexOf(",")!=-1 || sourceData.indexOf("-")!=-1){
						var arrSourceData=sourceData.split(",");
						for(var i = 0; i < arrSourceData.length; i++){
							if(arrSourceData[i].indexOf("-")!=-1){								
								var intName  =arrSourceData[i].split("/")[0]+"/"+arrSourceData[i].split("/")[1];
								var intNUmber=arrSourceData[i].split("/")[2];								
								var intStart=parseFloat(intNUmber.split("-")[0]);
								var intEnd  =parseFloat(intNUmber.split("-")[1]);
								for(var intCount = intStart; intCount <= intEnd; intCount++){
									sourceDataFinal += intName+"/"+intCount+",";
								}
							}else{
								sourceDataFinal += arrSourceData[i]+",";
							}							
						}	
						sourceDataFinal=sourceDataFinal.substring(0,sourceDataFinal.length-1);
						spanMonitorObj.source = sourceDataFinal;	
					}else{						
						spanMonitorObj.source = sourceData;	
					}				
			   }
			   if(sessionRunningConfig[irc].indexOf("TX Only") != -1){
				   spanMonitorObj.sourcedir = "tx";
				   spanMonitorObj.trafDropVal = "tx";
				   var sourceData =executeCliCmdService.getNextString(sessionRunningConfig[irc],["TX Only              :"],["\n"]).trim();
					
				   var sourceDataFinal="";
				   if(sourceData.indexOf(",")!=-1 || sourceData.indexOf("-")!=-1){
							var arrSourceData=sourceData.split(",");
							for(var i = 0; i < arrSourceData.length; i++){
								if(arrSourceData[i].indexOf("-")!=-1){								
									var intName  =arrSourceData[i].split("/")[0]+"/"+arrSourceData[i].split("/")[1];
									var intNUmber=arrSourceData[i].split("/")[2];								
									var intStart=parseFloat(intNUmber.split("-")[0]);
									var intEnd  =parseFloat(intNUmber.split("-")[1]);
									for(var intCount = intStart; intCount <= intEnd; intCount++){
										sourceDataFinal += intName+"/"+intCount+",";
									}
								}else{
									sourceDataFinal += arrSourceData[i]+",";
								}							
							}	
							sourceDataFinal=sourceDataFinal.substring(0,sourceDataFinal.length-1);
							spanMonitorObj.source = sourceDataFinal;	
					}else{						
							spanMonitorObj.source = sourceData;	
					}
			   }
			   if(sessionRunningConfig[irc].indexOf("Both") != -1){
				   spanMonitorObj.sourcedir = "Both";
				   spanMonitorObj.trafDropVal = "Both";				   
				   var sourceData =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Both                 :"],["\n"]).trim();
				   
				   var sourceDataFinal="";
				   if(sourceData.indexOf(",")!=-1 || sourceData.indexOf("-")!=-1){
						var arrSourceData=sourceData.split(",");
						for(var i = 0; i < arrSourceData.length; i++){
							if(arrSourceData[i].indexOf("-")!=-1){								
								var intName  =arrSourceData[i].split("/")[0]+"/"+arrSourceData[i].split("/")[1];
								var intNUmber=arrSourceData[i].split("/")[2];								
								var intStart=parseFloat(intNUmber.split("-")[0]);
								var intEnd  =parseFloat(intNUmber.split("-")[1]);
								for(var intCount = intStart; intCount <= intEnd; intCount++){
									sourceDataFinal += intName+"/"+intCount+",";
								}
							}else{
								sourceDataFinal += arrSourceData[i]+",";
							}							
						}	
						sourceDataFinal=sourceDataFinal.substring(0,sourceDataFinal.length-1);
						spanMonitorObj.source = sourceDataFinal;	
					}else{						
						spanMonitorObj.source = sourceData;	
					}
					
			   }
			   
			   if(sessionRunningConfig[irc].indexOf("RX Only") != -1 && sessionRunningConfig[irc].indexOf("Both") != -1){
				   spanMonitorObj.sourcedir = "Both";
				   spanMonitorObj.trafDropVal = "Both";
				   var dirR =executeCliCmdService.getNextString(sessionRunningConfig[irc],["RX Only              :"],["\n"]).trim();
				   var dirB =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Both                 :"],["\n"]).trim();
				   spanMonitorObj.source = dirR+","+dirB;	
			   }
			   
			    if(sessionRunningConfig[irc].indexOf("TX Only") != -1 && sessionRunningConfig[irc].indexOf("Both") != -1){
				   spanMonitorObj.sourcedir = "Both";
				   spanMonitorObj.trafDropVal = "Both";
				   var dirR =executeCliCmdService.getNextString(sessionRunningConfig[irc],["TX Only              :"],["\n"]).trim();
				   var dirB =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Both                 :"],["\n"]).trim();
				   spanMonitorObj.source = dirR+","+dirB;	
			   }
			   
		
			   if(sessionRunningConfig[irc].indexOf("Destination Ports") != -1){
					var destData =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Destination Ports      :"],["\n"]).trim();
					spanMonitorObj.destination = destData;	
			   }
			   
			   if(sessionRunningConfig[irc].indexOf("Dest RSPAN VLAN") != -1){
					var destData2 =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Dest RSPAN VLAN        :"],["\n"]).trim();
					spanMonitorObj.destination = destData2;	
					spanMonitorObj.rvlanID = destData2;
			   }
			   
			   if(sessionRunningConfig[irc].indexOf("Source RSPAN VLAN") != -1){
					var destData1 =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Source RSPAN VLAN      :"],["\n"]).trim();
					spanMonitorObj.source = destData1;	
					spanMonitorObj.vlanID = destData1;
					 if(sessionRunningConfig[irc].indexOf("Destination Ports") != -1){
						var destData =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Destination Ports      :"],["\n"]).trim();
						spanMonitorObj.destination = destData;
					}
			   }			   
			   
			   if(sessionRunningConfig[irc].indexOf("IP Access-group") != -1){
				   spanMonitorObj.filterValue = true;
				   spanMonitorObj.filtertype = 'ipv4';
				   spanMonitorObj.filterDropVal == 'ipv4';
					var getACLlist =executeCliCmdService.getNextString(sessionRunningConfig[irc],["IP Access-group        :"],["\n"]).trim();
					spanMonitorObj.filterAddDropVal = getACLlist;	
					spanMonitorObj.filtercond = getACLlist;
			   }
			    if(sessionRunningConfig[irc].indexOf("IPv6 Access-group") != -1){
				   spanMonitorObj.filterValue = true;
				   spanMonitorObj.filtertype = 'ipv6';
				   spanMonitorObj.filterDropVal == 'ipv6';
					var getACLlist =executeCliCmdService.getNextString(sessionRunningConfig[irc],["IPv6 Access-group      :"],["\n"]).trim();
					spanMonitorObj.filteripDropVal = getACLlist;	
					spanMonitorObj.filtercond = getACLlist;
			   }	
				if(sessionRunningConfig[irc].indexOf("Filter VLANs") != -1){
				   spanMonitorObj.filterValue = true;
				   spanMonitorObj.filtertype = 'vlan';
				   spanMonitorObj.filterDropVal == 'vlan';
					var getACLlist =executeCliCmdService.getNextString(sessionRunningConfig[irc],["Filter VLANs           :"],["\n"]).trim();
					spanMonitorObj.filtervlanID = getACLlist;	
					spanMonitorObj.filtercond = getACLlist;
			   }
			remData.push(spanMonitorObj);
		}		
		for(var n=0;n<remData.length;n++){
			remData[n].sessionid = sessionID[n];
		}		
		for(var k=0;k<remData.length;k++){
			$scope.spanGridData.push(remData[k]);
		}		
		
		$scope.oldSpanGridData = angular.copy($scope.spanGridData);
		
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1 || $rootScope.deviceInfo.type.indexOf("2960L")!=-1  || $rootScope.deviceInfo.type.indexOf("S6650L")!=-1 || $rootScope.deviceInfo.type.indexOf("S5960L")!=-1){
			$scope.disableAddButton=false;
			if($scope.oldSpanGridData.length > 0){
				$scope.disableAddButton=true;
			}
		}else{
			if($scope.oldSpanGridData.length >=4){
				$scope.disableAddButton=true;
			}else{
				$scope.disableAddButton=false;
			}
		}

		$scope.spanDataSource = new kendo.data.DataSource({
			pageSize: 10,
			data: $scope.spanGridData
		});
		$scope.manualGridRefresh();
	}
	
	$scope.loadSpanGridData();				
	angular.element(".btnView").show();
	angular.element(".pageLoader").hide();
}]);
