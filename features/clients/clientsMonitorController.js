/**
 Description: Clients Monitoring Controller
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('ClientsMonitoring', ['$scope', '$filter', 'gridCrudService', 'requestRoutingService', '$timeout',
    function ($scope, $filter, gridCrudService, requestRoutingService, $timeout) {
        var translate = $filter("translate"), exportData = [], dateTimeStamp = "";
        $scope.headersInExport = [translate("clients_mac"), translate("clients_switchport"), translate("clients_name"),
            translate("clients_os"), translate("clients_manufacturer"),
            translate("clients_ip"), translate("clients_vlan"), translate("clients_poe")
        ];
        var showCDPDetails;
        var showLldpDetails;
        format_attributes= function(showLldpDetails) {
             for(var i=0;i<showLldpDetails.length;i++){
                 if(showLldpDetails[i].Capabilities.indexOf("T") != -1){
                    showLldpDetails[i].Capabilities="Phone";
                 } else if(showLldpDetails[i].Capabilities.indexOf("B") != -1){
                    showLldpDetails[i].Capabilities ="Trans-Bridge";
                 } else if (showLldpDetails[i].Capabilities.indexOf("R") != -1){
                    showLldpDetails[i].Capabilities = "Router";
                 } else if(showLldpDetails[i].Capabilities.indexOf("W") != -1){
                    showLldpDetails[i].Capabilities="Wireless";
                 }
                 if(showLldpDetails[i].VLAN.indexOf("not advertised") != -1){
                    showLldpDetails[i].VLAN = "NA";
                 }
             }
             return showLldpDetails;
        }
        remove_duplicates = function(showCDPDetails, showLldpDetails) {
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
            var showCDPDetailsDummy = showCDPDetails;
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
			showLldpDetails = format_attributes(showLldpDetails);
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
            } else{
                showDeviceClassifier = showDeviceClassifier[0].showDeviceClassifierAttached.wnwebdata;
            }
            for (var i in showCDPDetails) {
              if(showCDPDetails[i].hasOwnProperty("Capabilities")){
                if (!(showCDPDetails[i].VLAN)){
                    showCDPDetails[i].VLAN = "NA"
                }
                if (showCDPDetails[i].PoEDrawn){
                    showCDPDetails[i].PoEDrawn = ((parseFloat(showCDPDetails[i].PoEDrawn)).toFixed(2)) + "W";
                }else{
                    showCDPDetails[i].PoEDrawn = "0W";
                }
                if(showCDPDetails[i].Capabilities.indexOf("Trans-Bridge")!=-1 || showCDPDetails[i].Capabilities.indexOf("Switch")!=-1){
                	 showCDPDetails[i].Images = "/resources/images/distribution_switch.png";
                }else if(showCDPDetails[i].Capabilities.indexOf("Router")!=-1){
                	showCDPDetails[i].Images = "/resources/images/wireless_router.png";
                }else if(showCDPDetails[i].Capabilities.indexOf("H P M")!=-1 || showCDPDetails[i].Capabilities.indexOf("Phone")!=-1){
                	showCDPDetails[i].Images = "/resources/images/phone.png";
                }else if(showCDPDetails[i].Capabilities.indexOf("Apple")!=-1){
                	showCDPDetails[i].Images = "/resources/images/apple-device.png";
                }else if(showCDPDetails[i].Capabilities.indexOf("Wireless")!=-1){
                       showCDPDetails[i].Images = "/resources/images/wireless_router.png";
                }else{
                	 showCDPDetails[i].Images = "/resources/images/unknown_device.png";
                }
                var deviceInterface=null;
                for (var j in showDeviceClassifier) {
					if (showDeviceClassifier.hasOwnProperty(j)) {
						deviceInterface=showCDPDetails[i].SwitchPort
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
		            	showCDPDetails[appleClient].OS = "";
		            	showCDPDetails[appleClient].Manufacturer = showDeviceClassifier[i].Manufacturer;
		            	showCDPDetails[appleClient].IP = "";
		            	showCDPDetails[appleClient].VLAN = "";
		            	showCDPDetails[appleClient].PoEDrawn = "";
		            	showCDPDetails[appleClient].Images = "/resources/images/apple-device.png";
		            	appleClient++;
	            	}
            	}
            }
            showCDPDetails = appleCheck(showCDPDetails, showDeviceClassifier);
        }
        $scope.showCDP();
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
        $scope.gridDataSource1 = new kendo.data.DataSource({
            pageSize: 10,
            data: showCDPDetails
        });
        $scope.getHeader = function () {
            return $scope.headersInExport;
        };
        $scope.getArray = function () {
            $scope.dataForExport = function () {
                    showCDPDetails.forEach(function (x) {
                        exportData.push({
                            "MAC": x.MAC,
                            "SwitchPort": x.SwitchPort,
                            "ClientName": x.ClientName,
                            "OS": x.OS,
                            "Manufacturer": x.Manufacturer,
                            "IP": x.IP,
                            "VLAN": x.VLAN,
                            "PoEDrawn": x.PoEDrawn
                        })
                    });
                return exportData;
            };
            dateTimeStamp = new Date();
            $scope.clientsFileName = "Clients " + $filter('date')(dateTimeStamp, 'yyyy-MM-dd_hh-mm-ss');
            exportData = [];
            return $scope.dataForExport;
        };
        $scope.portsGridOptions = {
            dataSource: $scope.gridDataSource1,
            editable: false,
            sortable: true,
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
            columns: [{
                field: "MAC",
                title: translate("clients_mac")
            }, {
                field: "SwitchPort",
                title: translate("clients_switchport")
            }, {
                field: "ClientName",
                title: translate("clients_name")
            }, {
                field: "OS",
                title: translate("clients_os")
            }, {
                field: "Manufacturer",
                title: translate("clients_manufacturer")
            }, {
                field: "IP",
                title: translate("clients_ip")
            }, {
                field: "VLAN",
                title: translate("clients_vlan")
            }, {
                field: "PoEDrawn",
                title: translate("clients_poe")
            }, {
                field: "Images",
                title: translate("clients_images"),
                filterable :false,
                template: "<img src='#= Images #' />"
        }]
        };
        $timeout(function(){
            angular.element("#clientGrid").find('.k-pager-refresh').click(function(){
                $scope.manualGridRefresh();
            });
        },10);
        // Manual refresh the kendo ui grid table
        $scope.manualGridRefresh = function() {
            $scope.showCDP();
            var grid = angular.element("#clientGrid").data("kendoGrid");
            $scope.formGridData = new kendo.data.ObservableArray(showCDPDetails);
            $scope.gridDataSource1 = new kendo.data.DataSource({
                pageSize: 10,
                data: $scope.formGridData
            });
            grid.dataSource = $scope.gridDataSource1;
            $scope.gridDataSource1.read();
            grid.refresh();
        }
    }
]);
