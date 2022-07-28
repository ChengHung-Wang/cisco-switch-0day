/**
 Description: QOS controller
 June 2014
 Copyright (c) 2015-2018 by Cisco Systems, Inc.
 All rights reserved.
 */
// 'use strict';
app.register.controller('qosCtrl', ['$scope','$timeout', '$filter' , 'validationService', 'notificationService', 'requestRoutingService' , 'gridCrudService','executeCliCmdService','dialogService','getStringLineService', function($scope, $timeout, $filter,  validationService, notificationService, requestRoutingService, gridCrudService,executeCliCmdService,dialogService,getStringLineService){
    var translate = $filter("translate");
    angular.element(".btnView").hide();
	angular.element(".pageLoader").show();
	
	$scope.kendoWindow = {isEditMode:true };
	$scope.disableDeleteButton=true;
	$scope.disableApplyButton = true;
	$scope.addNewPolicyFlag = false;
	$scope.interfaceLoaded=false;
	$scope.selectedQosPolicyArray = [];
	//if wired
	$scope.showAutoQosInt =true;
    $scope.showAutoQosProf = false;
	$scope.editQosData = false;;
	//$scope.interfaceLoaded=false;
	/*if wireless
	$scope.showAutoQosInt =false;
    $scope.showAutoQosProf = true;
	*/
	$scope.wirelessSupported = false;
	$scope.auto_qos = "Disable";
    $scope.avcMatch = "Any";
    $scope.userDefinedMatch = "Any";
	
	$scope.qosAddClassMap = false ;
    $scope.qosAddClassMapFlag = false ;
	
	$scope.userDefinedEnabledBtn = "Disable" ;
    $scope.avcEnabledBtn = "Disable" ;
    $scope.userDefinedEnabledFlag =false;	
    //$scope.avcEnabledFlag = true ;
	
	$scope.avcUserDefinedDataSrc = new kendo.data.ObservableArray([]);
	$scope.avcMarkTypeOptions = new kendo.data.ObservableArray([]);	
	$scope.qosTrustValOption = new kendo.data.ObservableArray([]);
    $scope.qosClassDefaultMarkOption = new kendo.data.ObservableArray([]);
	$scope.qosPolicyGridData = new kendo.data.ObservableArray([]); 
	
	
	$scope.avcMaster = {
        mark1: "None",
        mark2: "0",
        markValue: "0",
        policeValue: "",
        dropValue: "Disabled",
        matchany: "Disabled",
        matchall: "Enabled",
        trustType: "protocol",
        trustValue: "",
        protocolFromList: [],
        protocolToList: [],
        categoryFromList: [],
        categoryToList: [],
        subcategoryFromList: [],
        subcategoryToList: [],
        applicationgroupFromList: [],
        applicationgroupToList: [],
	avcUserDefinedRow: "AVC"
    };
	
	$scope.userDefMaster = {
        mark1: "None",
        mark2: "0",
        policeValue: "",
        dropValue: "Disabled",
        matchany: "Disabled",
        matchall: "Enabled",
        trustType: "DSCP",
        trustValue: "",
        avcUserDefinedRow: "User Defined"
    };
	$scope.qosModelMaster = {
		policyType : "",
		policyName : "",
		description : "",
		direction : "Ingress",
		//Voice
		trust : "",
		mark1 : "",
		policeValue : "",

		//AVC
		avcEnabled : false,
		avc : {
			avcList : [{
				trustType : "",
				trustValue : "",
				mark1 : "",
				mark2 : "",
				policeValue : ""
				//dropValue : ""
			}]
		},
		//UserDefined
		userDefinedEnabled : false	
	};
	
	$scope.avcUserDataSrc = [
    {
        "name" : "AVC",
        "value": "AVC"
    },{
        "name" : "User Defined",
        "value": "User Defined"

    }];	
	$scope.ingressMarkOption = [{
            'name': "None",
            'value': 'None'
        },
        {
            'name': "DSCP",
            'value': 'dscp'
        }
    ];
	$scope.avcIngressMarkOption = [{
            'name': translate("ntp_none"),
            'value': 'None'
        },
        {
            'name': translate("acl_dscp"),
            'value': 'DSCP'
        }
    ];
	$scope.userDefIngressMarkOption = [{
            'name': 'None',
            'value': 'None'
        },
        {
            'name': 'DSCP',
            'value': 'DSCP'
        },
        {
            'name': 'COS',
            'value': 'COS'
        }
    ];
	$scope.userDefinedIngressTrustOption = [{
            'name': 'DSCP',
            'value': 'DSCP'
        },
        {
            'name': 'COS',
            'value': 'COS'
        },
        {
            'name': 'ACL',
            'value': 'ACL'
        }
    ];
	
	$scope.trustTypeOptionsfromServices =[{
            'name': translate("qos_access_group"),
            'value': 'access-group'
        },
        {
            'name': translate("acl_dscp"),
            'value': 'ip dscp'
        }
	];
var avcListarr = [{
		'name':"98",
		'value':"98"
	},
	{
		'name':"check",
		'value':"check"
	},
	{
		'name':"check1",
		'value':"check1"
	},
	{
		'name':"new1",
		'value':"new1"
	},
	{
		'name':"stand",
		'value':"stand"
	}];
	
	$scope.aclLists = new kendo.data.ObservableArray(avcListarr);
	$scope.qosModel =angular.copy($scope.qosModelMaster);

	$scope.selectedprotocolList = [];
    $scope.availableProtocolList = [];

    $scope.selectedcategoryList = [];
    $scope.availableCategoryList = [];

    $scope.selectedsubcategoryList = [];
    $scope.availableSubcategoryList = [];

    $scope.selectedapplicationgroupList = [];
    $scope.availableApplicationroupList = [];

    $scope.protocolTrustValueOptions = [];
	
	
    $scope.protocolTrustValueOptions = [];
    $scope.subcategoryTrustValueOptions = [];
    $scope.categoryTrustValueOptions = [];
    $scope.applicationgroupTustValueOptions = [];
    $scope.wlanQosPolicyFlag = false;
	
	$scope.protocolTrustValueOptions.push("radhu");
	$scope.protocolTrustValueOptions.push("radfg");
	$scope.availableProtocolList = angular.copy($scope.protocolTrustValueOptions);
	
	function moveItemsBetweenLists(fromList, toList, itemsToMove) {
        if (typeof itemsToMove != "undefined") {
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
	
	/* $scope.selectTrustValue = function() {
        switch ($scope.avc.trustType) {
            case 'protocol':
                moveItemsBetweenLists($scope.availableProtocolList, $scope.selectedprotocolList, $scope.avc.protocolFromList);
                break;
            case 'category':
                moveItemsBetweenLists($scope.availableCategoryList, $scope.selectedcategoryList, $scope.avc.categoryFromList);
                break;
            case 'subcategory':
                moveItemsBetweenLists($scope.availableSubcategoryList, $scope.selectedsubcategoryList, $scope.avc.subcategoryFromList);
                break;
            case 'application-group':
                moveItemsBetweenLists($scope.availableApplicationgroupList, $scope.selectedapplicationgroupList, $scope.avc.applicationgroupFromList);
                break;
        }

    }; */
	/* $scope.unselectTrustValue = function() {

        switch ($scope.avc.trustType) {
            case 'protocol':
                moveItemsBetweenLists($scope.selectedprotocolList, $scope.availableProtocolList, $scope.avc.protocolToList);
                break;
            case 'category':
                moveItemsBetweenLists($scope.selectedcategoryList, $scope.availableCategoryList, $scope.avc.categoryToList);
                break;
            case 'subcategory':
                moveItemsBetweenLists($scope.selectedsubcategoryList, $scope.availableSubcategoryList, $scope.avc.subcategoryToList);
                break;
            case 'application-group':
                moveItemsBetweenLists($scope.selectedapplicationgroupList, $scope.availableApplicationgroupList, $scope.avc.applicationgroupToList);
                break;
        }
    }; */

	$scope.isQoSChecked = function(checked, dataItem) {
        if (!checked) {
            var index = $scope.selectedQosPolicyArray.indexOf(dataItem);
            if (index > -1) {
                $scope.selectedQosPolicyArray.splice(index, 1);
            }
        } else {
            if (dataItem) {
                $scope.selectedQosPolicyArray.push(dataItem);
            }

        }
        if(!$scope.addNewPolicyFlag) {
            $scope.disableDeleteButton = ($scope.selectedQosPolicyArray.length <= 0);
        }
    };
	$scope.qosPolicyGridOptions = {
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
			buttonCount : 4
		},
		selectable : true,
		scrollable : true,
		columns : [{
			"template" : "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isQoSChecked(checked,dataItem)\"  />",
			sortable : false,
			width: 10
		}, {
			field : "policyName",
			title : "Policy Name",
			width: 40
		}, {
			field : "associatedMaps",
			title : "Associated Class-Maps",
			width: 50
		}, {
			field : "associatedInterProfiles",
			title : "Associated Interfaces/Profiles",
			width: 50
		}]
	};		
	
	$scope.avcUserDefinedGridOptions = {
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
			buttonCount : 4
		},
		selectable : true,
		scrollable : true,
		columns : [{
			field : "trustType",
			title : translate("qos_matchtype"),
			width: "50"
		}, {
			field : "trustValue",
			title : translate("qos_matchvalue"),
			width: "50"
		}, {
			field : "mark1",
			title : translate("qos_marktype"),
			width: "50"
		}, {
			field : "mark2",
			title : translate("qos_markvalue"),
			width: "50"
		}, {
			field : "policeValue",
			title : translate("qos_policekbps"),
			width: "50"
		}, {
			hidden: true,
			field : "avcUserDefinedRow",
			title : "AVC/User Defined",
			width: "50"
		}, {
			field : "actions",
			attributes: {
                    style: "text-align:center"
                },
			title : translate("common_actions"),
			template:"<img alt=\"Interface\" src=\"resources/images/delete.jpg\" width=\"15px\" ng-click=\"deleteClassMap(dataItem)\">",
			width: "50"
		}]
	};	  		
	
   
	$scope.addPolicy = function() {	
		$scope.editQosData = false;
		$scope.qosWindow.open().center();		
		$scope.qosModelAvcUserDef = "AVC";		
		$scope.avcUserDefinedHandler();
		////////////////////
		$scope.qosAddClassMap = false ;
        $scope.qosAddClassMapFlag = false ;
        $scope.disableMulClassMap = true ;
        $scope.showQuickSetup = true; //not used still
        $scope.addNewPolicyFlag = false;
        $scope.disableDeleteButton = true;
		 ////////////////////////
		$scope.avcUserDefinedGridData = new kendo.data.ObservableArray([]);
		$scope.avcUserDefinedDataSource = new kendo.data.DataSource({
			pageSize: 5,
			data: $scope.avcUserDefinedGridData,
			schema: {
				model: {
					fields: {

					}
				}
			}
		});
		 
        $scope.resetQosModelData();
		$scope.updateTrustAndMarkDataSource();	
		$scope.auto_qos = 'Disable';
		$scope.qosFlowData.interfaceToBeEnabled = [];		
        
		
    };
	$scope.isIESwitch = false;
	
	$scope.qosClassMapAdd = function() {
		$scope.avc.trustType = "access-group";
		//$scope.qosModelAvcUserDef
        $scope.qosAddClassMap = true ;
        $scope.qosAddClassMapFlag = true ;
		$scope.qosClientFormValidator.hideMessages();
		angular.element("#mark1").data('kendoDropDownList').value("None");
		angular.element("#dhcpmark2").data('kendoDropDownList').value("0");
		angular.element("#avctrustType").data('kendoDropDownList').value("access-group");
    };
	
	$scope.onCancel = function() {
        $scope.addNewPolicyFlag = false;
        $scope.disableDeleteButton = ($scope.selectedQosPolicyArray.length === 0);
    }
	$scope.cancelAddEditKendoWindow = function(){
		$scope.qosWindow.close();
		$scope.avcUserDefinedGrid.refresh();		
	};
	
	
	$scope.interfacesLists = [];
	$scope.destinterfacesLists = [];
	var interfaceList=[];
	var destinterfaceList=[];
	var getACLipv4Lists = [];
	var getACLipv6Lists = [];
	$scope.availableInterfaceListOptions = [];
	$scope.sourceSelectedServerGroupOptions = [];
	$scope.availableDestListOptions = [];
	$scope.destSelectedServerGroupOptions = [];
	$scope.availableInterface = [];
	$scope.qosFlowData = {
		"interfaceToBeEnabled" : []
		};
	
	/*start-----------------------*/
	$scope.editQos = function(data){	
		$scope.editQosData = true;
		$scope.updateTrustAndMarkDataSource();
		var Tmap;	
		if(data.associatedMaps.indexOf(',')!=-1){
		Tmap = data.associatedMaps.split(',');
		}else{
		Tmap =	[];
		Tmap[0] = data.associatedMaps;
		}
		$scope.MapDatas = [];
		$scope.qosModel.policyName= data.policyName;
		var policyV = 	"show policy-map "+data.policyName+ " \n"
		var policyQos = deviceCommunicator.getExecCmdOutput(policyV);
		var coValue =  policyQos.split("Cla") ;
		var TempClass = [];
		if(Tmap){
		for(var i=0;i<Tmap.length;i++){
			Tmap[i] = Tmap[i].trim();
			if(Tmap[i]!=""){
			var mapV = 	"show class-map "+Tmap[i]+ " \n";
			var MapQos = deviceCommunicator.getExecCmdOutput(mapV);
			var TempMap= MapQos.split("\n");
			    
				var MatchType= "";
				var MatchTypeTemp= "";
				var tempMatchTypeTempName= "";
				var MatchTypeTempName= [];
				var MatchValue= "";
				for (var j=0; j < TempMap.length; j++) {
					 var radioValue= getStringLineService.getLines(TempMap[j],["Match "]);
					 tempMatchTypeTempName = TempMap[0];
					 if(radioValue.length>0){
					  MatchTypeTempName = tempMatchTypeTempName.split(" ")
					  MatchTypeTemp = executeCliCmdService.getNextString(radioValue[0],["Match "],["\n"]).trim();
						  var MatchTypeTemp2 = MatchTypeTemp.split(" ");
						  if(MatchTypeTemp2[0]=="none"){
							  MatchType = "none";
						      MatchValue = "";
						  }else{
						  MatchType = MatchTypeTemp2[0];
						  MatchValue = MatchTypeTemp2[2];
						  }
						  TempClass.push({
							 "policyName":MatchTypeTempName[3],
							 "trustType":MatchType,
							 "trustValue":MatchValue,
							 "dropValue":"",
							 "avcUserDefinedRow":""
						 })
					//  }
					 }
				 
				}
			}
		
		}
		}
		var NameP = "";
		var TempClass2 = [];
		if(coValue){
		for (var k=0; k < coValue.length; k++) {
			 if(coValue[k].indexOf("ss ")!=-1){
				 var tempClassVal = coValue[k].trim();
				 var mark1 = "None";
				 var mark2 = "";
				 var policeValue1= "";
				 var tempClassVal1 = tempClassVal.split("\n");
				 var channelGrpLine= getStringLineService.getLines(tempClassVal,["ss"]);	
				 var ClassName = executeCliCmdService.getNextString(tempClassVal1[0],["ss "],["\n"]).trim();
				 for (var m=0; m < tempClassVal1.length; m++) {
					 if(tempClassVal1[m].indexOf("police")!=-1){
					 policeVal = (executeCliCmdService.getNextString(tempClassVal1[m],["police "],["\n"]).trim()).split(" ");
					 policeValue1 = policeVal[0];
					 }
					 if(tempClassVal1[m].indexOf("set")!=-1){
					 var markValue = (executeCliCmdService.getNextString(tempClassVal1[m],["set "],["\n"]).trim()).split(" ");
					 mark2 = markValue[1];
					 if(markValue!="" && markValue!=""){
						 mark1 = "DSCP";
					 }
					 }
				 }
				 TempClass2.push({
							 "className":ClassName,
							 "mark1":mark1,
							 "mark2":mark2,
							 "policeValue":policeValue1
						 })
			 }
		}
		}
		for (var i=0; i < TempClass.length; i++) {
			for (var j=0; j < TempClass2.length; j++) {
				if(TempClass[i].policyName == TempClass2[j].className){
					TempClass[i].mark1 = TempClass2[j].mark1;
					TempClass[i].mark2 = TempClass2[j].mark2;
					TempClass[i].policeValue = TempClass2[j].policeValue;
					TempClass[i].mark1 = TempClass2[j].mark1;
				}
				
			}
		}
		$scope.oldClassMaps = angular.copy(TempClass);
		$scope.oldClassMapsName = data.policyName;
		angular.forEach($scope.intInputValue, function (inter) {
							if(data.policyName == inter.PolicyName){
								$scope.qosFlowData.interfaceToBeEnabled =inter.interfaces
							}
		});
		angular.forEach($scope.qosFlowData.interfaceToBeEnabled, function (inter) {
		        angular.forEach($scope.availableInterfaceListOptions, function (inter1) {				
									if(inter.portName == inter1.portName){
										$scope.availableInterfaceListOptions.splice(inter1, 1);
									}
				}); 
		}); 
		$scope.avcUserDefinedGridData = new kendo.data.ObservableArray(TempClass);
				$scope.avcUserDefinedDataSource = new kendo.data.DataSource({
            pageSize: 20,
                data: $scope.avcUserDefinedGridData,
                schema: {
                    model: {
                        fields: {

                        }
                    }
                }
            });
		$scope.qosWindow.open().center();
	}
	$scope.qosValidations = {
        rules: {
            specialcharcheck: function(input) {
                return input.data('specialcharcheckMsg') ? validationService.validateSpecialCharacters(input.val()) : true;
            },
            duplicatepolicyname: function(input) {
                if (!input.data('duplicatepolicynameMsg')) return true;
                var val = input.val();
                for (var i = 0; i < $scope.qosPolicyGridData.length; i++) {
                    if ($scope.qosPolicyGridData[i]["name"] == val) {
                        return false;
                    }
                }
                return true;
            },
            numericrange: function(input) {
                return input.data('numericrangeMsg') ? validationService.validateExactRange(input.val(), input.data('numericrange')) : true;
            },
            multiplevaluevalidation: function(input) {
                if (input.filter("[data-multiplevaluevalidation]")) {
                    var val = input.val();
                    if (val && input.data("numericrangecheck")) {
                        var validRange = input.data("numericrangecheck").split("-");
                        if (_.contains(val, ",")) {
                            var individualValues = val.split(",");
                            for (var currentValue in individualValues) {
                                var value = individualValues[currentValue];
                                if (isNaN(value) || value.trim() == '') {
                                    input.attr("data-multiplevaluevalidation-msg", translate("qoscontroller_matchvalue"));
                                    return false;
                                }
                                if (isNaN(value) && isNaN(validRange[0]) && isNaN(validRange[1])) return false;
                                if ((Number(value) < Number(validRange[0]) || Number(value) > Number(validRange[1]))) {
                                    input.attr("data-multiplevaluevalidation-msg", translate("qoscontroller_valuerange",input.data("numericrangecheck")));
                                    return false;
                                }
                            }
                            if (individualValues.length > input.data('multiplevaluevalidation')) {
                                input.attr("data-multiplevaluevalidation-msg", translate("qoscontroller_maximumofvalue",input.data('multiplevaluevalidation')));
                                return false;
                            }
                        } else {
                            if (val == '') return true;
                            if (isNaN(val)) {
                                input.attr("data-multiplevaluevalidation-msg", translate("qoscontroller_matchvalue"));
                                return false;
                            }
                            if (isNaN(val) && isNaN(validRange[0]) && isNaN(validRange[1])) return false;
                            if ((Number(val) < Number(validRange[0]) || Number(val) > Number(validRange[1]))) {
                                input.attr("data-multiplevaluevalidation-msg", translate("qoscontroller_valuerange",input.data("numericrangecheck")));
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
        }
    };
    $scope.deleteQoSPolicy = function() {

        var deleteQosPolicies = [];
        if ($scope.selectedQosPolicyArray.length > 0) {
            angular.forEach($scope.selectedQosPolicyArray, function(item) {
                deleteQosPolicies.push(item.policyName);
            });
        }
        $scope.showConfirmWindowDelete();
    };
	$scope.$on("okClicked_qosWindowDelete", function(event, data) {
        if ($scope.dlgDelete) {
            $scope.deletePolicy();
            $scope.dlgDelete.data("kendoWindow").close();
        }
    });
	
    $scope.deletePolicy = function() {
        action = "delete";
        $scope.disableApplyButton = false;
        $scope.disableDeleteButton = true;
        $scope.showQuickSetup = false;
        if ($scope.selectedQosPolicyArray.length > 0) {
            angular.forEach($scope.selectedQosPolicyArray, function(item) {
                $scope.qosPolicyGrid.dataSource.remove(item);
                    $scope.deletedPolicies.push(item);
            });
        }
		$scope.doneAddEditKendoWindow();
    };
    $scope.showConfirmWindowDelete = function() {
        $scope.dlgDelete = dialogService.dialog({
            content: translate("msg_delete_confirmation"),
            title: translate("msg_delete_confirmation_window"),
            messageType: "confirm",
            actionButtons: [{
                text: translate("com_ok"),
                callback: "okClicked_qosWindowDelete"
            }, {
                text: translate("com_cancel")
            }]
        });
    };
	$scope.loadInterfaces = function(){	
	$scope.oldClassMaps = [];
	$scope.selectedQosPolicyArray = [];
	$scope.avcUserDefinedGridData = [];
	$scope.deletedPolicies = [];
         var EnabledQos = deviceCommunicator.getExecCmdOutput("show auto qos interface\n");
         var EnabledQosInterfaces = deviceCommunicator.getExecCmdOutput("show policy-map interface brief \n");
		 var intCheck = EnabledQosInterfaces.split("Service-policy");
		 var intInput = [];
		 $scope.intInputValue = [];
		 var intOutput = [];
		 $scope.intOutputValue = [];
		 for(var i=0 ;i<intCheck.length;i++){
			 if(intCheck[i].indexOf('input')!=-1){
			 var PolType = executeCliCmdService.getNextString(intCheck[i],["input: "],["\n"]).trim();
			 var getInter = intCheck[i].split('\n');
			 intInput = [];
				 for(var j=1;j<getInter.length;j++){
					 if(getInter[j] !=""){
						 intInput.push({
							 "portName":getInter[j],
							 "ingress":true
						 })
					 }
				 }
				$scope.intInputValue.push({
					"PolicyName":PolType,
					"interfaces":intInput
				}) 
			 }
			 if(intCheck[i].indexOf('output')!=-1){
			 var PolType1 = executeCliCmdService.getNextString(intCheck[i],["output: "],["\n"]).trim();
			 var getInter1 = intCheck[i].split('\n')
				 for(var k=1;j<getInter1.length;j++){
					 if(getInter1[k] !=""){
						 intOutput.push({
							 "portName":getInter1[k],
							 "egress":true
						 })
					 }
				 }
				 $scope.intOutputValue.push({
					"PolicyName":PolType1,
					"interfaces":intOutput
				}) 
		     }
		 }
		 var policyMapData = deviceCommunicator.getExecCmdOutput("show policy-map \n");
		 var showPolcyList= policyMapData.split("Policy")
		 var channelGrpLine= getStringLineService.getLines(EnabledQos[0],["Gig"]);	
		 $scope.PolicyValues = [];
		 for (var i=0; i < showPolcyList.length; i++) {
		   if(showPolcyList[i].indexOf("Map") != -1 ){
			   var tempPolicy = showPolcyList[i].split("\n")
			   var channelGrpLine= getStringLineService.getLines(showPolcyList[i],["Map "]);
			   var channelGrpLine2= getStringLineService.getLines(showPolcyList[i],["Class "]);
			   var pName = executeCliCmdService.getNextString(channelGrpLine[0],["Map "],["\n"]).trim();
			   var finalCName = ""
			    for (var j=0; j < channelGrpLine2.length; j++) {
					var CName  = executeCliCmdService.getNextString(channelGrpLine2[j],["Class "],["\n"]).trim();
					if(channelGrpLine2.length>1){
					finalCName = finalCName+CName+",";
					}else{
					finalCName = CName
					}
				}
			   $scope.PolicyValues.push({
					   "policyName":pName,
					   "associatedMaps":finalCName,
					   "associatedInterProfiles":""
				   })
		   }
		 }
			angular.forEach($scope.intInputValue, function (inter) {
					angular.forEach($scope.PolicyValues, function (inter1) {
							if(inter.PolicyName == inter1.policyName){
								var tempInt = "";
								for(var i=0;i<inter.interfaces.length;i++){
									tempInt = tempInt+inter.interfaces[i].portName+",";
								}
								inter1.associatedInterProfiles = tempInt;
							}
					});
			}); 
		 $scope.qosPolicyGridData = new kendo.data.ObservableArray($scope.PolicyValues);
		$scope.qosPolicyGridDataSource = new kendo.data.DataSource({
			pageSize: 20,
			data: $scope.qosPolicyGridData,
			schema: {
				model: {
					fields: {}
				}
			}
		});
		
		//var interfaceListOP = deviceCommunicatorCLI.getExecCmdOutput("show ip interface brief \n show monitor session all \n show access-lists | i IP");
		var interfaceListOP = deviceCommunicatorCLI.getExecCmdOutput("show ip interface brief \n");
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
				//var intNameAttr = $scope.formatInt(inter.portName);
				$scope.interfacesLists.push(inter);
		});
		angular.forEach(destinterfaceList, function (inter) {
				//var intNameAttr = $scope.formatInt(inter.portName);
				$scope.destinterfacesLists.push(inter);
		});	
			$scope.interfaceLoaded = true;
		
		
	};
	
	/*End-------------------------*/
	$scope.loadInterfaces();
	
	
	
	$scope.availableInterfaceListOptions = angular.copy($scope.interfacesLists);
	
	
	/*~~~~~~~~~~~~~~~~~~~~~*/
	

		
	$scope.aclLists = new kendo.data.ObservableArray(avcListarr);
	
	$scope.addUserDefined = function() {        
        //$scope.userDefValidator.hideMessages();
        $scope.addUserDefState = true;
        $scope.selectedUserDefState = false;
        $scope.resetUserDef();
    };
	
	$scope.showConfirmWindow = function() {
       
    };
	
	/* $scope.validateForProtocolFn = function() {
        $scope.validateForProtocol = true;
        return $scope.avc.trustType == 'protocol' && $scope.selectedprotocolList.length <= 0;
    };

    $scope.validateForCategoryFn = function() {
        $scope.validateForCategory = true;
        return $scope.avc.trustType == 'category' && $scope.selectedcategoryList.length <= 0;
    };

    $scope.validateForSubcategoryFn = function() {
        $scope.validateForSubcategory = true ;
        return $scope.avc.trustType == 'subcategory' && $scope.selectedsubcategoryList.length <= 0;
    };

    $scope.validateForApplicationgroupFn = function() {
        $scope.validateForApplicationgroup = true ;
        return $scope.avc.trustType == 'application-group' && $scope.selectedapplicationgroupList <= 0;
    }; */
	
	// AVC 
    
	$scope.addAVC = function() {
        /*if ($scope.avcGrid.dataSource.data().length >= 5) {
            $scope.popupMessage = translate("qos_max5avcclasses");
            $scope.showConfirmWindow();
            return;
        }*/
        $scope.addAvcState = true;
        $scope.selectedAvcState = false;
        $scope.resetAvc();
    };
	
	$scope.avcUserDefinedHandler = function()
    {
        if ($scope.qosModelAvcUserDef == "AVC")
        {
              $scope.avcEnabledFlag = true ;
              $scope.userDefinedEnabledFlag =false;			  
              $scope.addAVC();
			  $scope.avc.trustType = 'access-group'
			  $scope.avc.mark1 = 'None'
              $scope.qosModel.direction = 'Egress';
              $scope.qosModel.avcEnabled = true;
              $scope.avcCheckBoxHandler();
        }
    };
	
	$scope.avcCheckBoxHandler = function() {
        if ($scope.qosModel.avcEnabled) {
            $scope.disableUserDefined = true;
            $scope.qosModel.userDefinedEnabled = false;
        } else {
            $scope.disableUserDefined = false;
            $scope.qosModel.userDefinedEnabled = false;
        }

    };
	
	$scope.trustTypeOptions = new kendo.data.ObservableArray($scope.trustTypeOptionsfromServices);
	$scope.selectedArray = [];
	$scope.selectedUseDefinedArray = [];
	$scope.isAVCUserDefinedChecked = function(checked, dataItem) {
        if (dataItem.avcUserDefinedRow == "AVC")
        {
            if (!checked == true) {
                var index = $scope.selectedArray.indexOf(dataItem);
                if (index != -1) {
                    $scope.selectedArray.splice(index, 1);
                }
            } else {
                $scope.selectedAvcState = true;
                $scope.selectedUserDefState = false;
                $scope.qosModelAvcUserDef = "AVC";
                $scope.avcEnabledFlag = true ;
                $scope.userDefinedEnabledFlag = false ;
                $scope.selectedArray.push(dataItem);
            }            
        }
        else if(dataItem.avcUserDefinedRow == "User Defined")
        {
            if (!checked == true) {
            var index = $scope.selectedUseDefinedArray.indexOf(dataItem);
                if (index != -1) {
                    $scope.selectedUseDefinedArray.splice(index, 1);
                }
            } else {
                $scope.selectedAvcState = false;
                $scope.selectedUserDefState = true;
                $scope.qosModelAvcUserDef = "User Defined";
                $scope.avcEnabledFlag = false ;
                $scope.userDefinedEnabledFlag = true ;
                $scope.selectedUseDefinedArray.push(dataItem);
            }       
        }        
        if($scope.selectedArray.length == 0 && $scope.selectedUseDefinedArray.length == 0)
        {
             $scope.disableMulClassMap = true ;
        }
        else
        {
             $scope.disableMulClassMap = false ;
        }
    };
	
	
	$scope.dscpMarkValueOption = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
        "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63"
    ];
	$scope.cosMarkValueOption = ["0", "1", "2", "3", "4", "5", "6", "7"];
	
	$scope.onSelectInterfaceHandler = function(data) {
		$scope.doneButtonClicked = false;
		$scope.interfaceDetailLoaded = true;
		$scope.disableMulClassMap = true;
        $scope.qosAddClassMap = false ;
        $scope.qosAddClassMapFlag = false ;
        $scope.showQuickSetup = true;
        $scope.addNewPolicyFlag = true;
        $scope.disableDeleteButton = true;
		
		$scope.updateTrustAndMarkDataSource();
	}
	$scope.updateTrustAndMarkDataSource = function() {

        if (!$scope.addNewPolicyFlag) {

            $scope.qosModel.avcEnabled = false;

            $scope.qosModel.userDefinedEnabled = false;
            $scope.qosModel.mark1 = 'None';
            $scope.qosModel.mark2 = '';
            $scope.qosModel.policeValue = '';
            $scope.qosModel.trust = "None";
            $scope.qosModel.trustVal = "";
            $scope.qosModel.dropValue = "Disabled";
            $scope.qosModel.classDefaultMark = "None";
            $scope.qosModel.classDefaultMarkValue = "";
            $scope.qosModel.classDefaultPolice = "";
        }           
            $scope.qosClassDefaultMarkOption = new kendo.data.ObservableArray($scope.ingressMarkOption);
            $scope.avcMarkTypeOptions = new kendo.data.ObservableArray($scope.avcIngressMarkOption);
            $scope.userDefinedTrustTypeOptions = new kendo.data.ObservableArray($scope.userDefinedIngressTrustOption);
            $scope.userDefinedMarkTypeOptions = new kendo.data.ObservableArray($scope.userDefIngressMarkOption);
			$scope.avcUserDefinedDataSrc = new kendo.data.ObservableArray($scope.avcUserDataSrc);
            $scope.disableUserDefined = false;       
			
    };
	
	 $scope.matchHandlerAvc = function()
    {
      if($scope.avcMatch == 'Any')
      {
        $scope.avc.matchany = 'Enabled';
        $scope.matchAnyHandler();
      }
      else if($scope.avcMatch == 'All')
      {
        $scope.avc.matchall = 'Enabled';
        $scope.matchAllHandler();
      }
    };
     $scope.matchHandlerUserDefined = function()
    {
      if($scope.userDefinedMatch == 'Any')
      {
        $scope.userDefined.matchany = 'Enabled';
        $scope.matchAnyHandler();
      }
      else if($scope.userDefinedMatch == 'All')
      {
        $scope.userDefined.matchall = 'Enabled';
        $scope.matchAllHandler();
      }
    };

    $scope.matchAnyHandler = function() {
        if ($scope.avc.matchany == 'Enabled') {
            $scope.avc.matchall = 'Disabled';
        }
        if ($scope.userDefined.matchany == 'Enabled') {
            $scope.userDefined.matchall = 'Disabled';
        }
    };
    $scope.matchAllHandler = function() {
        if ($scope.avc.matchall == 'Enabled') {
            $scope.avc.matchany = 'Disabled';
        }
        if ($scope.userDefined.matchall == 'Enabled') {
            $scope.userDefined.matchany = 'Disabled';
        }
    };

	$scope.showValidationErrorForAvc = false;
	$scope.saveAvc = function() {
        /*if ($scope.avcGrid.dataSource.data().length >= 5) {
            $scope.popupMessage = "Maximum of five AVC Classes can be created.";
            $scope.showConfirmWindow();
            return;
        }*/
        $scope.showValidationErrorForAvc = false;
        $scope.notValidAvc = false;
        $scope.validateForProtocol = false;
        $scope.validateForSubcategory = false;
        $scope.validateForApplicationgroup = false ;
        $scope.validateForCategory = false;
        /* if ($scope.avc.mark1 == "None" && ($scope.avc.policeValue == "" || !$scope.avc.policeValue || isNaN(Number($scope.avc.policeValue)))) {
	    if($scope.avc.policeValue == "" || !$scope.avc.policeValue){	
		$scope.showValidationErrorForAvc = true;
	    } */
		/* 
            $scope.notValidAvc = true;
            return; */
        //}
		

        /* if ($scope.showValidationErrorForAvc || !$scope.avc.policeValue == "" && ($scope.avc.policeValue < 8000 || $scope.avc.policeValue > 10000000)) {
            $scope.notValidAvc = true;
            return;
        } */
        if(!$scope.qosClientFormValidator.validate()){
			return;
		}
        /* if ($scope.validateForProtocolFn() || $scope.validateForCategoryFn() || $scope.validateForSubcategoryFn() || $scope.validateForApplicationgroupFn()) {
            $scope.notValidAvc = true;
            return false;
        } */
        //$scope.avc.trustValue = $scope["selected" + $scope.avc.trustType.replace("-", "") + "List"].join(",");
        $scope.avc.avcUserDefinedRow = "AVC";
		if($scope.avc.mark1 == 'dscp' || $scope.avc.mark1 == 'DSCP'){
			if($scope.avc.mark2 == "" && !$scope.avc.mark2){
		     $scope.avc.mark2 = '0'
			}
	   }
        if ($scope.addAvcState) {            
            $scope.avcUserDefinedGridData.push(angular.copy($scope.avc));
        } else {
           $scope.avcUserDefinedGridData.push(angular.copy($scope.avc));
            /* var avcUserdefselectedRow = $scope.avcUserDefinedGridData.map(function(e) {
                return e.uid;
            }).indexOf($scope.avc.uid);

            $scope.avcUserDefinedGridData[avcUserdefselectedRow].trustType = $scope.avc.trustType;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].trustValue = $scope.avc.trustValue;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].policeValue = $scope.avc.policeValue;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].mark1 = $scope.avc.mark1;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].mark2 = $scope.avc.mark1 == "None" ? "" : $scope.avc.mark2;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].dropValue = $scope.avc.dropValue == "Enabled" ? "Enabled" : "Disabled";
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].matchany = $scope.avc.matchany;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].matchall = $scope.avc.matchall;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].avcUserDefinedRow = "AVC";

            $scope.avcUserDefinedGridData.push(); */
        }
        $scope.addAvcState = true;
        $scope.selectedAvcState = false;

        $scope.qosAddClassMap = false;
        $scope.qosAddClassMapFlag = false;
        $scope.resetAvc();
    };
	
	$scope.showValidationErrorForUD = false;
    $scope.validationForTrust = false;

    $scope.saveUserDef = function() {
        /*if ($scope.userDefinedGrid.dataSource.data().length >= 5) {
            $scope.popupMessage = translate("qos_max5userdefclasses");
            $scope.showConfirmWindow();
            return;
        }*/
        $scope.userDefined.showValidationErrorForUD = false;
        $scope.validationForTrust = false;
        $scope.notValidUserDef = false;

        /*if (!$scope.userDefValidator.validate()) {
            $scope.notValidUserDef = true;
            return;
        }*/
        if ($scope.userDefined.dropValue!= 'Enabled' && ($scope.userDefined.mark1 == "None" && ($scope.userDefined.policeValue == "" || !$scope.userDefined.policeValue)) ){
            $scope.userDefined.showValidationErrorForUD = true;
            $scope.notValidUserDef = true;
            return;
        }
        if ($scope.userDefined.trustType != "None" && $scope.userDefined.trustValue == "") {
            $scope.validationForTrust = true;
            $scope.notValidUserDef = true;
            return;
        }
        if ($scope.showValidationErrorForUD || $scope.validationForTrust || !$scope.userDefined.policeValue == "" && ($scope.userDefined.policeValue < 8 || $scope.userDefined.policeValue > 10000000)) {
            $scope.notValidUserDef = true;
            return;
        }

	if ($scope.userDefined.dropValue == 'Enabled'){
		$scope.userDefined.policeValue = "8";
	}

        if ($scope.addUserDefState) {            
	    $scope.avcUserDefinedGridData.push(angular.copy($scope.userDefined));
        } else {
            
            var avcUserdefselectedRow = $scope.avcUserDefinedGridData.map(function(e) {
                return e.uid;
            }).indexOf($scope.userDefined.uid);

            $scope.avcUserDefinedGridData[avcUserdefselectedRow].trustType = $scope.userDefined.trustType;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].trustValue = $scope.userDefined.trustValue;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].policeValue = $scope.userDefined.policeValue;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].mark1 = $scope.userDefined.mark1;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].mark2 = $scope.userDefined.mark1 == "None" ? "" : $scope.userDefined.mark2;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].dropValue = $scope.userDefined.dropValue == "Enabled" ? "Enabled" : "Disabled";
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].matchany = $scope.userDefined.matchany;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].matchall = $scope.userDefined.matchall;
            $scope.avcUserDefinedGridData[avcUserdefselectedRow].avcUserDefinedRow = "User Defined";
            $scope.avcUserDefinedGridData.push();
        }
        $scope.addUserDefState = true;
        $scope.selectedUserDefState = false;

        $scope.qosAddClassMap = false;
        $scope.qosAddClassMapFlag = false;
        $scope.resetUserDef();

    };
	var portColor = {
            NOTCONFIGURED: "#95a39c",
            UP: "#26c977",
            DOWN: "#c94926"
        };

        $scope.getPortColor = function (status) {
            return {background: portColor[status]};
        };

        $scope.onDropCompleteAvailable1 = function (data) {
            if (data !== null) {
                var index1 = $scope.availableInterfaceListOptions.indexOf(data);
                var index2 = $scope.qosFlowData.interfaceToBeEnabled.indexOf(data);
                if (index2 > -1) {
                    $scope.qosFlowData.interfaceToBeEnabled.splice(index2, 1);
                }
                if (index1 == -1) {
                    data.ingress = true;
                    data.egress = true;
                    $scope.availableInterfaceListOptions.push(data);
                }
            }
        };
        $scope.onDropCompleteAvailable = function (data) {
            if (data !== null) {
                var index1 = $scope.availableForAutoIntAutoQos.indexOf(data);
                var index2 = $scope.qosFlowData.interfaceToBeEnabled.indexOf(data);
                if (index2 > -1) {
                    $scope.qosFlowData.interfaceToBeEnabled.splice(index2, 1);
                }
                if (index1 == -1) {
                    $scope.availableForAutoIntAutoQos.push(data);
                }
            }
        };
        $scope.onDropCompleteAvailableProfile = function (data) {
            if (data !== null) {
                var index1 = $scope.availableProfileAutoQos.indexOf(data);
                var index2 = $scope.enabledProfile.indexOf(data);
                if (index2 > -1) {
                    $scope.enabledProfile.splice(index2, 1);
                }
                if (index1 == -1) {
                    $scope.availableProfileAutoQos.push(data);
                }
            }
        };
        $scope.onDropCompleteSelected1 = function (data) {
            if (data !== null) {
                var index1 = $scope.availableInterfaceListOptions.indexOf(data);
                var index2 = $scope.qosFlowData.interfaceToBeEnabled.indexOf(data);
                if (index1 > -1) {
                    $scope.availableInterfaceListOptions.splice(index1, 1);
                }
                if (index2 == -1) {
                    data.ingress = true;
                    data.egress = true;
                    $scope.qosFlowData.interfaceToBeEnabled.push(data);
                }
            }
        };
        $scope.onDropCompleteSelected = function (data) {
            if (data !== null) {
                var index1 = $scope.availableForAutoIntAutoQos.indexOf(data);
                var index2 = $scope.qosFlowData.interfaceToBeEnabled.indexOf(data);
                if (index1 > -1) {
                    $scope.availableForAutoIntAutoQos.splice(index1, 1);
                }
                if (index2 == -1) {
                    $scope.qosFlowData.interfaceToBeEnabled.push(data);
                }
            }
        };
	$scope.resetUserDef = function() {
        $scope.validationForTrust = false;
        $scope.userDefined = angular.copy($scope.userDefMaster);
        $scope.userDefined.showValidationErrorForUD = false;
    };
	$scope.checkDisable = function (obj, type) {
            if ((type == "ingress" && !obj.egress) || (type == "egress" && !obj.ingress)) {
                return true;
            }
            return false;
        };
	$scope.doneAddEditKendoWindow = function() {
		var qosCLI = "";
		if($scope.deletedPolicies.length > 0){
			for (var i = 0; i < $scope.deletedPolicies.length; i++) {
			    qosCLI += "no policy-map " + $scope.deletedPolicies[i].policyName + "\n";
			}
		}
		if($scope.qosGlobalFormValidator.validate()){
			if($scope.oldClassMaps.length > 0){
			qosCLI += "no policy-map " + $scope.oldClassMapsName + "\n";
			for (var i = 0; i < $scope.oldClassMaps.length; i++) {
			    qosCLI += "no class-map " + $scope.oldClassMaps[i].policyName + "\n";
			}
		}
		
		if($scope.avcUserDefinedGridData.length>0 && !$scope.deletedPolicies.length > 0){
		for (var index = 0; index < $scope.avcUserDefinedGridData.length; index++) {
					if($scope.qosModel.policyName){
						  if($scope.avcUserDefinedGridData[index].matchall){
						  qosCLI += "class-map match-all "+ $scope.qosModel.policyName +index+"1_AVC_UI_CLASS\n";
						  }else{
						  qosCLI += "class-map match-any "+ $scope.qosModel.policyName +index+"1_AVC_UI_CLASS\n";  
						  }
					}
					if($scope.avcUserDefinedGridData[index].trustType){
						if($scope.avcUserDefinedGridData[index].markValue == undefined || $scope.avcUserDefinedGridData[index].markValue == ""){
							$scope.avcUserDefinedGridData[index].markValue = "0"
						}
						if($scope.avcUserDefinedGridData[index].trustType == "access-group"){
						qosCLI +="match "+$scope.avcUserDefinedGridData[index].trustType+" "+$scope.avcUserDefinedGridData[index].trustValue+"\n";
						}else{
							if($scope.avcUserDefinedGridData[index].trustType == "ip"){
								$scope.avcUserDefinedGridData[index].trustType = "ip dscp";
							}
						qosCLI +="match "+$scope.avcUserDefinedGridData[index].trustType+" "+$scope.avcUserDefinedGridData[index].markValue+"\n";	
						}
					}
					if($scope.qosModel.policyName){
						  qosCLI += "policy-map " + $scope.qosModel.policyName + "\n";
						  qosCLI += "class " + $scope.qosModel.policyName +index+"1_AVC_UI_CLASS\n";
					}if($scope.avcUserDefinedGridData[index].policeValue){
						qosCLI += "police " + $scope.avcUserDefinedGridData[index].policeValue +" 9000\n";
					}if($scope.avcUserDefinedGridData[index].mark1 == "DSCP"){
						 qosCLI += "set DSCP " + $scope.avcUserDefinedGridData[index].mark2 + "\n";
					}
					qosCLI += "exit \n";
					qosCLI += "exit \n";
            }
		}else if($scope.qosModel.policyName && $scope.deletedPolicies.length == 0){
						  qosCLI += "policy-map " + $scope.qosModel.policyName + "\n";
					}
		if($scope.qosFlowData.interfaceToBeEnabled.length > 0){
			if($scope.qosModel.policyName){
						  qosCLI += "policy-map " + $scope.qosModel.policyName + "\n";
			}
			for (var i = 0; i < $scope.qosFlowData.interfaceToBeEnabled.length; i++) {
						  qosCLI += "interface " + $scope.qosFlowData.interfaceToBeEnabled[i].portName + "\n";
						  if($scope.qosFlowData.interfaceToBeEnabled[i].ingress == true){
						  qosCLI +=	  "service-policy input "+$scope.qosModel.policyName+" \n"
						  }
						 if($scope.qosFlowData.interfaceToBeEnabled[i].egress == true){
						  qosCLI +=	  "service-policy output "+$scope.qosModel.policyName+" \n"
						  }
					}
		}
		$scope.qosWindow.close().center();
		
		}
        if(qosCLI != ''){
		var result = requestRoutingService.getConfigCmdOutput(qosCLI);
			if(result==""){
				notificationService.showNotification(translate('Qos_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			qosCLI="";
		$scope.loadInterfaces();
		}		
		
		
    };
	
	$scope.resetUserDef();
	
	
	$scope.resetAvc = function() {
        $scope.showValidationErrorForAvc = false;
        $scope.validateForProtocol = false;
        $scope.validateForSubcategory = false;
        $scope.validateForApplicationgroup = false ;
        $scope.validateForCategory = false;
        $scope.avc = angular.copy($scope.avcMaster);
        $scope.availableProtocolList = angular.copy($scope.protocolTrustValueOptions);
        $scope.selectedprotocolList = [];

        $scope.availableCategoryList = angular.copy($scope.categoryTrustValueOptions);
        $scope.selectedcategoryList = [];

        $scope.availableSubcategoryList = angular.copy($scope.subcategoryTrustValueOptions);
        $scope.selectedsubcategoryList = [];

        $scope.availableApplicationgroupList = angular.copy($scope.applicationgroupTustValueOptions);
        $scope.selectedapplicationgroupList = [];
    };
	$scope.resetAvc();
	
	$scope.resetQosModelData = function() {
        $scope.qosModel.policyName = "";
        $scope.qosModel.description = "";
        $scope.qosModel.trust = "None";
        $scope.qosModel.mark1 = "None";
        $scope.qosModel.policeValue = "";
        $scope.qosModel.dropValue = "Disabled";
        $scope.qosModel.avcEnabled = false;

        $scope.qosModel.userDefinedEnabled = false;
        $scope.qosModel.classDefaultMark = "None";
        $scope.qosModel.classDefaultMarkValue = "";
        $scope.qosModel.classDefaultPolice = "";
	 $scope.avcEnabledFlag = true ;
         $scope.qosModel.classMapName = [] ;
         $scope.qosModel.interfaceName = [] ;
    };
	
	$scope.deleteMulClassMap = function() {
        angular.forEach($scope.selectedArray, function(item) {
            $scope.avcUserDefinedGrid.dataSource.remove(item);
        });
        if ($scope.selectedUseDefinedArray.length <= 1) {
            $scope.avcUserDefinedGrid.dataSource.remove($scope.selectedUseDefinedArray[0]);
        } else {
            angular.forEach($scope.selectedUseDefinedArray, function(item) {
                $scope.avcUserDefinedGrid.dataSource.remove(item)
            });
        }
        $scope.selectedUseDefinedArray = [];
        $scope.selectedArray = [];
        $scope.selectedAvcState = false;
        $scope.selectedUserDefState = false ;
		$scope.disableMulClassMap = true;
        $scope.resetAvc();
        $scope.resetUserDef();
    };
	//actions
	$scope.deleteClassMap = function(dataItem) {
         $scope.avcUserDefinedGrid.dataSource.remove(dataItem);        
        $scope.selectedArray = [];
        $scope.selectedAvcState = false;        
        $scope.resetAvc();
        $scope.resetUserDef();
    }   

	/*~~~~~~~~~~~~~~~~~~~~~~~~~*/	
		
	
	angular.element(".btnView").show();
	angular.element(".pageLoader").hide();
	
}]);
