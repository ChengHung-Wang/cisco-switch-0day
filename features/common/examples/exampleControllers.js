/**
 Description: Example Controllers
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';
app.register.controller('GridCtrl', ['$scope', 'gridCrudService', '$filter',
function($scope, gridCrudService, $filter) {
	var translate = $filter("translate");
	$scope.fetchDataUrl = (runFromLocalhost? "resources/data/ports.json" : "port");
	$scope.portsGridOptions = {
		editable : false,
		sortable : true,
		// filterable: true,
		filterable : {
			extra : false,
			operators : {
				string : {
					//  startswith: "Starts with",
					eq : "Is equal to",
					neq : "Is not equal to"
				}
			}
		},
		scrollable : false,
		selectable : true,
		pageable : {
			previousNext : true,
			info : true,
			refresh : true,
			pageSizes : gridCrudService.grid_page_sizes,
			buttonCount : 5
		},
		columns : [{
			field : "Port",
			title : translate("tbl_column_portname"),
			width : 25
		}, {
			field : "Name",
			title : "Description",
			width : 25
		}, {
			field : "Status",
			title : "Status",
			width : 25
		}, {
			field : "Vlan",
			title : "VLAN",
			width : 25
		}, {
			field : "Duplex",
			title : "Duplex",
			width : 25
		}, {
			field : "Speed",
			title : "Speed",
			width : 25
		}, {
			field : "Type",
			title : "Type",
			width : 25
		}]
	};
	var dataSourceParamsObj = {
		readUrl : ($scope.fetchDataUrl),
		batch: true,
		schemaParams : {
			"data" : function(data) {
				return data || [];
			}
		}
	};
	$scope.dataSource = gridCrudService.createDataSource(dataSourceParamsObj);
	$scope.portsDataSource = $scope.dataSource;
}]);

app.controller('TabsCtrl', ['$scope', '$filter', 'gridCrudService', 'notificationService',
function($scope, $filter, gridCrudService, notificationService) {
	var translate = $filter("translate");
	$scope.fetchDataUrl = (runFromLocalhost? "resources/data/ports.json" : "port");
	$scope.portsGridOptions = {
		editable : false,
		sortable : true,
		// filterable: true,
		filterable : {
			extra : false,
			operators : {
				string : {
					//  startswith: "Starts with",
					eq : "Is equal to",
					neq : "Is not equal to"
				}
			}
		},
		scrollable : false,
		selectable : true,
		pageable : {
			previousNext : true,
			info : true,
			refresh : true,
			pageSizes : gridCrudService.grid_page_sizes,
			buttonCount : 5
		},
		columns : [{
			field : "Port",
			title : translate("tbl_column_portname"),
			width : 25
		}, {
			field : "Name",
			title : "Description",
			width : 25
		}, {
			field : "Status",
			title : "Status",
			width : 25
		}, {
			field : "Vlan",
			title : "VLAN",
			width : 25
		}, {
			field : "Duplex",
			title : "Duplex",
			width : 25
		}, {
			field : "Speed",
			title : "Speed",
			width : 25
		}, {
			field : "Type",
			title : "Type",
			width : 25
		}]
	};
	var dataSourceParamsObj = {
		readUrl : ($scope.fetchDataUrl),
		batch: true,
		schemaParams : {
			"data" : function(data) {
				return data || [];
			}
		}
	};
	$scope.dataSource = gridCrudService.createDataSource(dataSourceParamsObj);
	$scope.portsDataSource = $scope.dataSource;
	$scope.showNotification = function(type){
		notificationService.showNotification("test", "testing", type);
	};
}]);

app.controller('AccordionsCtrl', ['$scope', '$filter', 'gridCrudService',
function($scope, $filter, gridCrudService) {
	var translate = $filter("translate");
	$scope.fetchDataUrl = (runFromLocalhost? "resources/data/ports.json" : "port");
	$scope.portsGridOptions = {
		editable : false,
		sortable : true,
		// filterable: true,
		filterable : {
			extra : false,
			operators : {
				string : {
					//  startswith: "Starts with",
					eq : "Is equal to",
					neq : "Is not equal to"
				}
			}
		},
		scrollable : false,
		selectable : true,
		pageable : {
			previousNext : true,
			info : true,
			refresh : true,
			pageSizes : gridCrudService.grid_page_sizes,
			buttonCount : 5
		},
		columns : [{
			field : "Port",
			title : translate("tbl_column_portname"),
			width : 25
		}, {
			field : "Name",
			title : "Description",
			width : 25
		}, {
			field : "Status",
			title : "Status",
			width : 25
		}, {
			field : "Vlan",
			title : "VLAN",
			width : 25
		}, {
			field : "Duplex",
			title : "Duplex",
			width : 25
		}, {
			field : "Speed",
			title : "Speed",
			width : 25
		}, {
			field : "Type",
			title : "Type",
			width : 25
		}]
	};
	var dataSourceParamsObj = {
		readUrl : ($scope.fetchDataUrl),
		batch: true,
		schemaParams : {
			"data" : function(data) {
				return data || [];
			}
		}
	};
	$scope.dataSource = gridCrudService.createDataSource(dataSourceParamsObj);
	$scope.portsDataSource = $scope.dataSource;
}]);
