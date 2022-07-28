/**
 Description: Controller for User Administration
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('UserAdministrationCtrl', ['$scope','$timeout', '$filter', 'gridCrudService','requestRoutingService','dataSourceService','dialogService','notificationService',
	function($scope,$timeout, $filter, gridCrudService,requestRoutingService,dataSourceService,dialogService,notificationService) {
		var translate = $filter("translate");
		$scope.userAdministration = {
				userName : "",
				privilege : "",
				password : ""
		};
		var userValidations = $("#userForm").kendoValidator({
				rules : {
					maximum : function(input) {
						var minValue = input.data('maximum');
						if (minValue){
							return input.val().length < Number(minValue);
						}
						return true;
					},
					matches : function(input) {
						var matches = input.data('matches');
						if (matches) {
							return (input.val() === $scope.userAdministration.password);
						}
						return true;
					},
					check:function(input){
						var msg = input.data('checkMsg');
						if ((msg==undefined)) {
							return true;
						}
						var regExp=/^[A-Za-z][A-Za-z0-9]*$/;
						if(regExp.test(input.val())){
							return true;
						}
						return false;
					},
					existing : function(input) {
						if (!input.data('existingMsg')){
							return true;
						}
						var val = input.val();
						if (!$scope.userData || $scope.userData.length <= 0){
							return true;
						}
						for (var i = 0; i < $scope.userData.length; i++) {
							if ($scope.userData[i]["userName"] == val) {
								return false;
							}
						}
						return true;
					},
					minimum : function(input) {
						var minValue = input.data('minimum');
						if (minValue){
							return input.val().length > Number(minValue);
						}
						return true;
					}
			}
		}).data("kendoValidator");
		angular.element(".btnView").hide();
		$scope.disableUserName = true;
		$scope.disableDelete = true;
		$scope.disableApplyButton = true;
		$scope.disableSubmit = true;
		$scope.privilegeOptions = dataSourceService.privilegeOptions();
		$scope.userAdministration = angular.copy($scope.userAdministration);
		$scope.userDirty="";
		var userConfigCLI="";
		var editUserData = function(){
			$("#userForm  span.k-tooltip-validation").hide();
			var selected = this.dataItem(this.select());
			$timeout(function(){$scope.userShowEditSection = true;});
			$scope.userAdministration.userName = selected.userName;
			$scope.userAdministration.privilege = selected.privilege;
			$scope.userDirty=selected.dirty;
			$scope.disableUserName = true;
			$scope.disableDelete = true;
			$scope.userAdminWindow.open().center();
			$scope.isEditModeFlag = true;
		};
		$scope.saveUserData = function(){
			if (userValidations.validate()) {
			var scrypt = scrypt_module_factory(33554432);
			$scope.disableApplyButton = false;
			if($scope.userDirty){  //add function
				$scope.userGrid.dataSource.add({"userName": $scope.userAdministration.userName,"privilege": $scope.userAdministration.privilege,"password": $scope.userAdministration.password});
			}else{ //for edit
				var selectedItem = $scope.userGrid.dataItem($scope.userGrid.select());
				selectedItem.userName = $scope.userAdministration.userName;
				selectedItem.privilege = $scope.userAdministration.privilege;
				selectedItem.password = $scope.userAdministration.password;
			}
			var currentUser = $scope.userAdministration.password;
			var generateRandomNumber = randomString();
            var output_printableHash = get_printable_hash(generateRandomNumber, 10);
			var keyBytes = scrypt.crypto_scrypt(scrypt.encode_utf8(currentUser),scrypt.encode_utf8(output_printableHash),16384,1,1,32);
            var output_printableHash_Scrypt = get_printable_hash(keyBytes, 32);
			currentUser = "$9$"+ output_printableHash + "$"+ output_printableHash_Scrypt;
			userConfigCLI += "username "+$scope.userAdministration.userName+" privilege "+$scope.userAdministration.privilege+" nopassword \n";
			userConfigCLI += "username "+$scope.userAdministration.userName+" privilege "+$scope.userAdministration.privilege+" secret 9 "+currentUser+"\n";
			$scope.applyUser();
			$scope.reset();
		 }
		}
		$scope.deleteData = function(popup) {
			$scope.disableDelete = true;
            var selectedItem = $scope.delUserArray;
			$scope.delUserArray = [];
            for (var i = 0; i < selectedItem.length; i++) {
                userConfigCLI += "no username "+selectedItem[i].userName+" privilege "+selectedItem[i].privilege+" password 0 \n";
                $scope.userGrid.dataSource.remove(selectedItem[i]);
            }
            $scope.applyUser();
			popup.close();
		}
		$scope.addUser = function() {
			$scope.userAdministration = angular.copy($scope.userAdministration);
			$scope.userShowEditSection = true;
			$scope.disableUserName = false;
			$scope.disableDelete = true;
			$scope.userAdministration.userName = "";
			$scope.userAdministration.privilege = "0";
			$scope.userAdministration.password = "";
			$scope.userAdministration.confirmPassword = "";
			$scope.userDirty=true;
			$("#userForm  span.k-tooltip-validation").hide();
			$scope.userAdminWindow.open().center();
			$scope.isEditModeFlag = false;
		};
		$scope.applyUser=function(){
			var result = requestRoutingService.getConfigCmdOutput(userConfigCLI);
			if(result==""){
				notificationService.showNotification(translate('user_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
			userConfigCLI="";
		}
		$scope.deleteConfirmation = function() {
			$scope.commonConfirmationUser('delete');
		};
		$scope.commonConfirmationUser = function() {
			$scope.dlgUser = dialogService.dialog({
				content : translate("msg_delete_confirmation"),
				title : translate("msg_delete_confirmation_window"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "userDeleteConfirmation"
				}, {
					text : translate("com_cancel"),
					callback : "cancel"
				}]
			});
		};
		$scope.$on("userDeleteConfirmation", function() {
			$scope.disableApplyButton = false;
			$scope.deleteData($scope.dlgUser.data("kendoWindow"));
		});
		$scope.$on("cancel", function() {
			$scope.delUserArray = [];
			$scope.disableDelete = true;
			$scope.dlgUser.data("kendoWindow").close();
			angular.element('#userGrid').data('kendoGrid').refresh();
		});
		//Showing configured username list in the grid
		var showUserList =requestRoutingService.getShowCmdOutput("show running-config aaa username","userNew");
		angular.element(".btnView").show();
		if(showUserList.ShowUsers.Users.entry){
			showUserList=showUserList.ShowUsers.Users.entry;
			if (typeof showUserList == "object" && !showUserList.length){
				showUserList = [showUserList];
			}
			$scope.showUserList = $.map(showUserList, function(value) {
				return [value];
			});
		}
		for(var i=0;i<showUserList.length;i++){
			if(showUserList[i].privilege===undefined){
				showUserList[i].privilege="1";
			}
		}
		$scope.userData = new kendo.data.ObservableArray(showUserList);
		$scope.userDataSource = new kendo.data.DataSource({
			pageSize : 10,
			data : $scope.userData
		});
		$scope.reset = function() {
			$scope.userAdministration.userName = "";
			$scope.userAdministration.privilege = "0";
			$scope.userAdministration.password = "";
			$scope.userAdministration.confirmPassword = "";
			$scope.userShowEditSection = false;
			$scope.userAdminWindow.close();
			angular.element('#userGrid').data('kendoGrid').refresh();
			$scope.delUserArray = [];
		};
		$timeout(function(){
            angular.element("#userGrid").find('.k-pager-refresh').click(function(){
                $scope.manualGridRefresh();
            });
        },10);
		 $scope.manualGridRefresh = function(){
			angular.element("#userGrid  span.k-tooltip-validation").hide();
			$scope.userShowEditSection = false;
			$scope.disableDelete = true;
			$scope.disableApplyButton = true;
		 }
		 $scope.delUserArray = [];
		 $scope.isUserAdminDeleteChecked = function(checked, dataItem) {
            if (checked == false) {
                var index = $scope.delUserArray.indexOf(dataItem);
                if (index > -1) {
                    $scope.delUserArray.splice(index, 1);
                }
            } else {
                $scope.delUserArray.push(dataItem);
            }
            if ($scope.delUserArray.length > 0) {
                $scope.disableDelete = false;
            } else {
                $scope.disableDelete = true;
            }
        };
		//Kendo Grid options
		$scope.userGridOptions = {
			editable : false,
			sortable : true,
			change : editUserData,
			pageable: {
				  messages: {
					  display: translate("com_page_display"), //{0} is the index of the first record on the page, {1} - index of the last record on the page, {2} is the total amount of records
					  empty: translate("com_page_empty"),
					  page: translate("com_page_pagetext"),
					  of:translate("com_page_of"),  //{0} is total amount of pages
					  itemsPerPage: translate("com_page_itemsPerPage"),
					  first: translate("com_page_first"),
					  previous: translate("com_page_previous"),
					  next: translate("com_page_next"),
					  last: translate("com_page_last"),
					  refresh: translate("com_page_refresh"),
					  morePages: translate("com_page_morePage")
				   },
				   pageSizes : gridCrudService.grid_page_sizes,
				   refresh : true,
				   buttonCount : 5
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
			scrollable : false,
			selectable : true,
			columns : [{
				"template": "<input type=\"checkbox\" ng-init=\"checked=false\" ng-model=\"checked\" ng-click=\"isUserAdminDeleteChecked(checked,dataItem)\" />",
				sortable: false,
				width: 10
			},{
				field : "userName",
				editable : "false",
				title : translate("user_administration_name"),
				width : 25
			}, {
				field : "privilege",
				editable : "false",
				title : translate("user_administration_priv"),
				width : 25
			}, {
				field : "password",
				hidden : "true"
			}]
		};
		//encrypting password
		function randomString(){
	        var text = [];
	        var possible = "0123456789";
	        for( var i=0; i < 10; i++ ){
	            text.push(parseInt(possible.charAt(Math.floor(Math.random() * possible.length)))+15);
			}
	        return text;
	    }
	    var printable_char_array =  "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	    function convert_6_bit_into_char(n) {
	        return printable_char_array[ n & 0x3f];
	    }
	    function get_printable_hash (input, len_total){
	        var i,j,k,n;
	        var out = [];
	        if (!input || !len_total) {
	            return(false);
	        }
	        var len = len_total;
	        var inp = [];
	        var out_str = [];
	        for ( ; len; len -= n) {
	            n = (len > 3) ? 3 : len;
	            j = 0;
	            inp = input.slice((len_total - len),len_total);
	            for (i = 0; i<n; i++) {
	                j = (j<<8) | (inp[i] & 0xff);
	            }
	            var partial_output = (n * 8 % 6);
	            if (partial_output > 0) j = j << (6 - partial_output);
	            k = parseInt((n * 8 + 5) / 6);
	            for (i = 0,out = []; i < k; i++) {
	                var bit_position = 6 * (k - i - 1);
	                var this_output = (j>>bit_position) & 0x3f;
	                out[i] = convert_6_bit_into_char(this_output);
	            }
	            out_str = out_str + out;
	            out_str = out_str.replace(/,/g, "");
	        }
	        return out_str;
	    }
	}]);
