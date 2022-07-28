/*
	Description: RMON Configuration.
	Copyright (c) 2019 by Cisco Systems, Inc.
	All rights reserved.
*/
app.register.controller('rmonCtrl', ['$scope','$timeout', '$filter', 'gridCrudService','executeCliCmdService','notificationService','dialogService','requestRoutingService',
	function($scope,$timeout, $filter, gridCrudService,executeCliCmdService,notificationService,dialogService,requestRoutingService) {
	var translate = $filter("translate");
	var trimVal=$filter('trimValue'), maxRmon;
	
	angular.element(".btnView").hide();
	angular.element(".pageLoader").show();
	//Showing configured rmon list in the grid
	var isEditModeFlag = false;
	$scope.loadRmonDetails = function(){
		$scope.rmonDeleteSection = true;
		var showRmonList=[],rmonAlarmList = [],rmonEventList = [],rmonCLIData = [];
		rmonCLIData = deviceCommunicatorCLI.getExecCmdOutput("show run | in rmon alarm \n show run | in rmon event \n");
		if(rmonCLIData[0] != ''){
			rmonAlarmList = rmonCLIData[0].split("\n");
		}
		if(rmonCLIData[1] != ''){
			rmonEventList = rmonCLIData[1].split("\n");
		}
		if(rmonAlarmList.length > 0){
			for(var i=0;i<rmonAlarmList.length;i++){
				rmonId = executeCliCmdService.getNextString(rmonAlarmList[i], ["alarm "], [" "]).trim();
				rmonType = translate("rmon_type_alarm");
				mibObject = executeCliCmdService.getNextString(rmonAlarmList[i], ["alarm "+rmonId+" "], [" "]).trim();
				interval = executeCliCmdService.getNextString(rmonAlarmList[i], [mibObject+" "], [" "]).trim();
				test = executeCliCmdService.getNextString(rmonAlarmList[i], [mibObject+" "+interval+" "], [" "]).trim();
				risingThreshold = executeCliCmdService.getNextString(rmonAlarmList[i], ["rising-threshold "], [" "]).trim();
				fallingThreshold = executeCliCmdService.getNextString(rmonAlarmList[i], ["falling-threshold "], [" "]).trim();
				owner = executeCliCmdService.getNextString(rmonAlarmList[i], ["owner "], ["\n"]).trim();
				var items = {
    					"rmonId"   : rmonId,
    					"rmonType" : rmonType,
    					"interval"  : interval,
    					"test" : test,
    					"mibObject"  : mibObject,
    					"risingThreshold" :risingThreshold,
    					"fallingThreshold" :fallingThreshold,
    					"owner"    : owner
    			};
				showRmonList.push(items);
			}
		}
		if(rmonEventList.length > 0){
			for(var i=0;i<rmonEventList.length;i++){
				rmonId = executeCliCmdService.getNextString(rmonEventList[i], ["event "], [" "]).trim();
				rmonType = translate("rmon_type_event");
				owner = executeCliCmdService.getNextString(rmonEventList[i], ["owner "], [" "]).trim();
				snmpCommunity = executeCliCmdService.getNextString(rmonEventList[i], ["trap "], [" "]).trim();
				description = executeCliCmdService.getNextString(rmonEventList[i], ["description "], [" "]).trim();
				if(rmonEventList[i].indexOf("log")!=-1){
					log = translate("com_enable");
				}else{
					log = translate("com_disable");
				}
				var items = {
    					"rmonId"   : rmonId,
    					"rmonType"   : rmonType,
    					"description" : description,
    					"snmpCommunity" : snmpCommunity,
    					"log"       : log,
    					"owner"    : owner
    			};
				showRmonList.push(items);
			}
			
		}
		
		$scope.rmonData = new kendo.data.ObservableArray(showRmonList);
		$scope.rmonDataSource = new kendo.data.DataSource({
			pageSize : 10,
			data : $scope.rmonData
		});
		$scope.rmonGridOptions = {
				dataSource: $scope.rmonDataSource,
				editable : false,
				sortable : true,
				change : showRmonEdit,
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
	                "template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isRmonDeleteChecked(checked,dataItem)\"    />",
	                sortable: false,
	                width: 10
	            },{
					field : "rmonType",
					title : translate("rmon_type"),
					width : "20%"
				}, {
					field : "rmonId",
					title : translate("rmon_id"),
					width : "20%"
				}, {
					field : "mibObject",
					title : translate("rmon_monitor"),
					width : "30%"
				}, {
					field : "owner",
					title : translate("rmon_owner"),
					width : "30%"
				}]
			};
	}
	
	// RMON Form validation
	var rmonValidations = angular.element("#rmonForm").kendoValidator({
		rules: {
			duplicate:function(input){
				var valMsg = input.data('duplicateMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				if(!$scope.rmonDirty){
					return true;
				}
				var rmonGrid = angular.element("#rmonGrid").data("kendoGrid");
				var rmonGridData = rmonGrid.dataSource.data();
				for(var i=0;i<rmonGridData.length;i++){
					rmonGridData[i];
					if(trimVal(input.val())== trimVal(rmonGridData[i].rmonId)){
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
			number: function (input) {
				var valMsg = input.data('numberMsg');
				if ((valMsg==undefined)) {
					return true;
				}
				var valMsg1 = input.val();
				if(isNaN(valMsg1)){
					return true
				}else{
					return false;
				}
				return true;
			}
		}
	}).data("kendoValidator");
	
	
	var rmon={
			rmonType: translate("rmon_type_alarm"),
			rmonId: null,
			mibObject: null,
			interval: null,
			risingThreshold: null,
			fallingThreshold: null,
			test: 'absolute',
			snmpCommunity: null,
			description: null,
			log: translate("com_enable"),
			owner: null
		};
	
	//Load RMON Type Option Values
	$scope.rmonTypeOptions = [{"text" : translate("rmon_type_alarm") ,"value" : 'Alarm'},{"text" : translate("rmon_type_event"),"value" : 'Event'}];
	$scope.testOptions = [{"text" : translate("rmon_testOptions_absolute") ,"value" : 'absolute'},{"text" : translate("rmon_testOptions_delta"),"value" : 'delta'}];
	
	$scope.rmon = angular.copy(rmon);
	$scope.rmonDirty="";
	var rmonConfigCLI="";
	var showRmonEdit = function(){
		angular.element("#rmonForm  span.k-tooltip-validation").hide();
		$scope.isEditModeFlag = true;
		var selected = this.dataItem(this.select());
		$scope.rmon.rmonType = selected.rmonType;
		$scope.rmon.rmonId = selected.rmonId;
		$scope.rmon.owner = selected.owner;
		angular.element("#rmonTypeId").data('kendoDropDownList').value($scope.rmon.rmonType);
		if(translate("rmon_type_alarm") == $scope.rmon.rmonType){
			$scope.rmon.mibObject = selected.mibObject;
			$scope.rmon.interval = selected.interval;
			$scope.rmon.test = selected.test;
			$scope.rmon.risingThreshold = selected.risingThreshold;
			$scope.rmon.fallingThreshold = selected.fallingThreshold;
			angular.element("#testId").data('kendoDropDownList').value($scope.rmon.test);
		}else{
			$scope.rmon.description = selected.description;
			$scope.rmon.snmpCommunity = selected.snmpCommunity;
			$scope.rmon.log = selected.log;
		}
		$scope.rmonDirty=selected.dirty;
		$timeout(function(){
			$scope.rmonGridWindow.open().center();
			$scope.rmonShowEditSection = true;
		});
		
	};
	
	$scope.loadRmonDetails();
	angular.element(".pageLoader").hide();
	angular.element(".btnView").show();
	$scope.saveRmonData = function(){
		if(rmonValidations.validate()){
			if(translate("rmon_type_alarm") == $scope.rmon.rmonType){
				rmonConfigCLI += "rmon "+$scope.rmon.rmonType+" "+$scope.rmon.rmonId+" "+$scope.rmon.mibObject+" "+$scope.rmon.interval+" "
                  +$scope.rmon.test+" "+"rising-threshold "+$scope.rmon.risingThreshold+" "
                  +"falling-threshold "+$scope.rmon.fallingThreshold+" ";
				if($scope.rmon.owner == undefined || $scope.rmon.owner == ""){
					rmonConfigCLI += "\n";
				}else{
					rmonConfigCLI += "owner "+$scope.rmon.owner+"\n";
				}
			}else{
				rmonConfigCLI += "rmon "+$scope.rmon.rmonType+" "+$scope.rmon.rmonId+" ";
				if($scope.rmon.description == undefined || $scope.rmon.description == ""){
					rmonConfigCLI += "";
				}else{
					rmonConfigCLI += "description "+$scope.rmon.description+" ";
				}
				if($scope.rmon.snmpCommunity == undefined || $scope.rmon.snmpCommunity == ""){
					rmonConfigCLI += "";
				}else{
					rmonConfigCLI += "trap "+$scope.rmon.snmpCommunity+" ";
				}
				if($scope.rmon.owner == undefined || $scope.rmon.owner == ""){
					rmonConfigCLI += "";
				}else{
					rmonConfigCLI += "owner "+$scope.rmon.owner+" ";
				}
				if($scope.rmon.log == translate("com_enable")){
					rmonConfigCLI += "log "+"\n";
				}else{
					rmonConfigCLI += "\n";
				}
			}	
			$scope.applyRmon();
			$scope.rmonGridWindow.close();
			$scope.rmonShowEditSection = false;
		}
	}
	
	
	//Add rmon data
	$scope.addRmonRow = function(){
		$scope.rmon = angular.copy(rmon);
		$scope.rmon.rmonType = translate("rmon_type_alarm");
		$scope.rmon.test = "absolute";
		angular.element("#rmonTypeId").data('kendoDropDownList').value($scope.rmon.rmonType);
		var test = $("#testId").data("kendoDropDownList");
		if(test != undefined && test != ""){
			angular.element("#testId").data('kendoDropDownList').value($scope.rmon.test);
		}
		$scope.rmonShowEditSection = true;
		$scope.rmonDirty=true;
		angular.element("#rmonForm  span.k-tooltip-validation").hide();
		$scope.rmonGridWindow.open().center();
		$scope.isEditModeFlag = false;
		$scope.rmonDeleteSection = true;
	};
	
	$scope.applyRmon=function(){
		var result = requestRoutingService.getConfigCmdOutput(rmonConfigCLI);
		if(result==""){
			notificationService.showNotification('RMON Data is successfully Applied',translate('com_config_success_title'),'success');
		}else{
			notificationService.showNotification(result,translate('com_config_fail_title'),'error');
		}
		rmonConfigCLI="";
		isEditModeFlag = true;
		$scope.loadRmonDetails();
	}
	
	$scope.delRmonArray = [];
    $scope.isRmonDeleteChecked = function(checked, dataItem) {
        if (checked == false) {
            var index = $scope.delRmonArray.indexOf(dataItem);
            if (index > -1) {
                $scope.delRmonArray.splice(index, 1);
            }
        } else {
            $scope.delRmonArray.push(dataItem);
        }
        if ($scope.delRmonArray.length > 0) {
            $scope.rmonDeleteSection = false;
        } else {
            $scope.rmonDeleteSection = true;
        }
    };
    
    $scope.$on("okDeleteRmon", function() {
        $scope.dlg.data("kendoWindow").close();
        $scope.deleteRmonRow();
    });
    
    $scope.$on("cancel", function() {
		isEditModeFlag = true;
        $scope.dlg.data("kendoWindow").close();
		$scope.rmonDeleteSection = true;
		angular.element('#rmonGrid').data('kendoGrid').refresh();
		$scope.delRmonArray = [];
    });
	//Confirmation Window For Delete RMON Data.
    $scope.rmonDeleteConfirm = function() {
        $scope.dlg = dialogService.dialog({
            content: translate('msg_delete_confirmation'),
            title: translate('msg_delete_confirmation_window'),
            messageType: "confirm",
            actionButtons: [{
                text: translate('com_ok'),
                callback: "okDeleteRmon"
            }, {
                text: translate('com_cancel'),
                callback: "cancel"
            }]
        });
    };
    
  //Delete Rmon Data.
    $scope.deleteRmonRow = function() {
        $scope.vlanRmonSection = true;
        var selectedItem = $scope.delRmonArray;
        $scope.delRmonArray = [];
        for (var i = 0; i < selectedItem.length; i++) {
            rmonConfigCLI += "no rmon " + selectedItem[i].rmonType + " " +selectedItem[i].rmonId+ " \n";
            $scope.rmonGrid.dataSource.remove(selectedItem[i]);
        }
        $scope.rmonDeleteSection =true;
        $scope.applyRmon();
		$scope.rmonCancel();
    }
	
	$scope.rmonCancel = function() {
		$timeout(function(){
			angular.element("#rmonForm  span.k-tooltip-validation").hide();
			$scope.rmonDeleteSection = true;
			$scope.rmonGridWindow.close();
			angular.element('#rmonGrid').data('kendoGrid').refresh();
		});
	};
	
	$timeout(function(){
        angular.element("#rmonGrid").find('.k-pager-refresh').click(function(){
            $scope.manualGridRefresh();
        });
    },10);
	 $scope.manualGridRefresh = function(){
		angular.element("#rmonGrid  span.k-tooltip-validation").hide();
		$scope.rmonShowEditSection = false;
		$scope.rmonDeleteSection = true;
	 }
	
}
]);