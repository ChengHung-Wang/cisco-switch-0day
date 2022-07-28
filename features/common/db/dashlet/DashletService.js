/**
 Description: Dashlet Service
 Copyright (c) 2015-2016 by Cisco Systems, Inc.
 All rights reserved.
 Created by: prianant

 The Dashlet Service stores the current status of the dashlets in the dashboard.
 It holds the set of dashlets currently visible and currently not visible and is
 available per session of the WebUI.

 We need a service only because we need to persist the updated dashboard per session
 */
app.service('DashletService', function($http, $rootScope, $interval) {
	var removedDashlets = [];
	var dashletList = [];
	var sessionPersisted = true;
	var bundle = {};
	bundle.clients = [];
	var refreshInterval = 60000;
	var GET_N_COUNT = 50;
	var featureDeferredCallback,
	    clientsCount = 0;
	var pollingIntervalForDashlet;
	var GET_UPTIME = '/webui/rest/showUpTime';
	var SAVE_FILE='/webui/rest/saveFile';
	var DASHBOARD_OPTIONS='/webui/rest/saveFile?fileName=dashboardOptions.json';
	var changedPoll=[];
	return {
		setDashletList : function() {
			return $http.get('features/common/db/dashlet/dashlets.json').then( function(response){
				var availableDashlets = [];
				for(var i=0;i<response.data.length;i++){
					if(response.data[i].visible === "default"){
						availableDashlets.push(response.data[i]);
					}
				}
				dashletList = availableDashlets;
				sessionPersisted = false;
			});
		},
		getDashletList : function() {
			return dashletList;
		},
		getRemovedDashletList : function() {
			return removedDashlets;
		},
		addToRemovedDashlets : function(removed) {
			removedDashlets.push(removed);
		},
		addToDashletList : function(added) {
			added.pos=(dashletList.length+1).toString();
			dashletList.push(added);
			return dashletList;
		},
		updateDashletList : function(index) {
			dashletList.splice(index, 1);
			for (var i=index;i<dashletList.length;i++){
				dashletList[i].pos=(dashletList[i].pos-1).toString();
			}
		},
		updateRemovedDashletList : function(index) {
			removedDashlets.splice(index, 1);
		},
		setPositions : function(list,sortFlag){
			if (sortFlag){
				list=_.sortBy(list, 'pos');
			}
			_.forEach(list, function(n, key) {
				n.pos=(key+1).toString();
			});
			return list;
		},
		saveOptions : function(json){
			return $http.post(SAVE_FILE,json).then( function(response){
				return response;
			});
		},
		getOptions : function(){
			return $http.get(DASHBOARD_OPTIONS).then( function(response){
				return response;
			});
		},
		applyOptions : function(customOptions){
			var newPos=customOptions.length;
			_.forEach(dashletList, function(n) {
				var options = _.find(customOptions,function(arg){
					return ((arg.dataTitle === n.dataTitle));
				});
				if (options!=undefined) {
					if (!options.disabled) {
						n.disabled=false;
						n.pollingInterval=options.pollingInterval;
						n.pos=options.pos;
					}else{
						n.disabled=true;
						n.pollingInterval=options.pollingInterval;
						removedDashlets.push(n);
					}
				}else{
					n.pos=newPos.toString();
					n.disabled=false;
					newPos++;
				}
			});
			_.forEach(removedDashlets, function(n) {
				var options = _.find(customOptions,function(arg){
					return ((arg.dataTitle === n.dataTitle));
				});
				if (options!=undefined) {
					if (!options.disabled) {
						n.disabled=false;
						n.pollingInterval=options.pollingInterval;
						n.pos=options.pos;
						dashletList.push(n);
					}
				}else{
					n.pos=newPos.toString();
					newPos++;
				}
			});
			removedDashlets=_.filter(dashletList, {'disabled': true});
			dashletList=_.filter(dashletList, {'disabled': false});
			dashletList=_.sortBy(dashletList, 'pos');
		},
		checkChangedOptions : function(newOptions,oldOptions){
			changedPoll=[];
			function compareOptions(obj1,obj2){
				if (obj1.disabled==obj2.disabled && obj1.pollingInterval == obj2.pollingInterval && obj1.pos == obj2.pos) {
					return true;
				}else{
					if (obj1.pollingInterval != obj2.pollingInterval) {
						changedPoll.push({dataTitle:obj1.dataTitle,pollingInterval:obj1.pollingInterval});
					}
					return false;
				}
			}
			var flag=false;
			if (newOptions.length!=oldOptions.length) {
				flag=true;
			}else if (newOptions.length==oldOptions.length) {
				_.forEach(newOptions, function(nValue) {
					_.forEach(oldOptions, function(oValue) {
						if (nValue.dataTitle==oValue.dataTitle) {
							var intervalPol=parseInt(nValue.pollingInterval);
							if(!_.isEqual(nValue, oValue, compareOptions) && ((intervalPol!=-1 && intervalPol>=10000) || intervalPol==-1)){
								flag=true;
							}
						}
						if (flag){
							return false;
						}
					});
					if (flag){
						return false;
					}
				});
			}
			return flag;
		},
		getChangedPoll : function(){
			return changedPoll;
		},
		isPersistedDashboard : function() {
			return sessionPersisted;
		},
		updateDashboardPosition : function(oldIndex,newIndex){
			_.forEach(dashletList, function(n, key) {
				if (oldIndex<newIndex) {
					if (key==oldIndex) {
						n.pos=(newIndex+1).toString();
					}
				if (key>oldIndex && key<=newIndex) {
					n.pos=(n.pos-1).toString();
				}
				}else if (oldIndex>newIndex) {
					if (key==oldIndex) {
						n.pos=(parseInt(newIndex+1)).toString();
					}
					if (key<oldIndex && key>=newIndex) {
						n.pos=(parseInt(n.pos)+1).toString();
					}
				}
			});
			dashletList=_.sortBy(dashletList, 'pos');
			return dashletList;
		},
		getPlaceHolder : function(element){
			var classes=element.attr("class") +" placeholderText";
			return "<div class='"+classes.replace("col-md-12","col-md-11")+"'><span class='dropHereSpan'><i class='icon-pin_fill'></i> &nbsp;Drop Here</span></div>";
		},
		getHint : function(element){
			var dashletMoved = _.find(dashletList,function(arg){
				return ((arg.dataTitle === element.attr("data-des")));
			});
			return '<div style="height:'+element.height()+'px;width:'+element.width()+'px" class="dashlet custom-padding-dashlet hintDashboard">'
			+'<div class="panel panel-default panel-custom">'
			+'<div class="panel-heading panelHeadingCustom">'
			+'<h3 class="panel-title custom-panel-title"><span class="dashletPanelHeader"><i class="fa '+dashletMoved.iconClass+'"></i> &nbsp;&nbsp;'+dashletMoved.dataTitle+'</span></h3>'
			+'<div class="updateTimeHeader">Drop the dashlet to sort</div>'
			+'</div>'
			+'<div class="panel-body customPanelBody"></div>'
			+'</div>'
			+'</div>';
		},
		broadcastBundle : function(bundle) {
			$rootScope.$broadcast("dashlet:parseClientsData", bundle);
		},
		operation_data : function(name, type, message) {
			this.name = name;
			this.type = type;
			this.message = message;
		},
		generateLastUpdatedTime : function() {
			var returnStr = "Last Updated: ";
			var curDate = new Date();
			var dateString = curDate.toDateString().split(" ").splice(1, 3).join(" ");
			var timeString = curDate.toTimeString().split(" ").splice(0, 1);

			return returnStr + dateString + ", " + timeString;
		},
		fetchClientsData : function(getCount, getN) {
			var self = this;
			var dbal  = greenFeService_new.getDbalOper();
			var b_id = greenFeService_new.batchCheckOperAndExec(dbal,"DashletCtrl",null);

			if (b_id <= 0) {
				return;
			}

			if (getCount) {
				var singletonid = new u_int32();
				singletonid.set_value(0);

				var rc_obj1 = wcm_oper_db_god_get_count_tbl_ApfVap();
				var rc_obj2 = wcm_oper_db_god_get_tbl_Apf_stats_singleton_id(singletonid);
				var rc_obj3 = wcm_oper_db_god_get_count_tbl_perRadioSpectrumIDRData();
				var rc_obj4 = wcm_oper_db_god_get_tbl_SpamApStats_singleton_id(singletonid);
				var rc_obj5 = wcm_oper_db_god_get_n_tbl_Top10clientdevice_op(25, new green_cursor());

				var gp1;
				if (rc_obj1.rc !== GREEN_RC.SUCCESS) {
					greenFeService_new.getDbalOper().batch_destroy(b_id);
					return;
				} else {
					gp1 = rc_obj1.gp;

				}
				var gp2;
				if (rc_obj2.rc !== GREEN_RC.SUCCESS) {
					greenFeService_new.getDbalOper().batch_destroy(b_id);
					return;
				} else {
					gp2 = rc_obj2.gp;

				}
				var gp3;
				if (rc_obj3.rc !== GREEN_RC.SUCCESS) {
					greenFeService_new.getDbalOper().batch_destroy(b_id);
					return;
				} else {
					gp3 = rc_obj3.gp;

				}
				var gp4;
				if (rc_obj4.rc !== GREEN_RC.SUCCESS) {
					greenFeService_new.getDbalOper().batch_destroy(b_id);
					return;
				} else {
					gp4 = rc_obj4.gp;

				}
				var gp5;
				if (rc_obj5.rc !== GREEN_RC.SUCCESS) {
					greenFeService_new.getDbalOper().batch_destroy(b_id);
					return;
				} else {
					gp5 = rc_obj5.gp;

				}
				var operationType = greenFeService_new.getOperationConstant().GET_COUNT;
				var operationType2 = greenFeService_new.getOperationConstant().GET;
				var operationType3 = greenFeService_new.getOperationConstant().GET_N;
				greenFeService_new.getDbalOper().batch_add_op(b_id, gp1, new self.operation_data("wlanCount", operationType, "get count"));
				greenFeService_new.getDbalOper().batch_add_op(b_id, gp2, new self.operation_data("clientAndRogueCount", operationType2, "get"));
				greenFeService_new.getDbalOper().batch_add_op(b_id, gp3, new self.operation_data("interfererCount", operationType, "get count"));
				greenFeService_new.getDbalOper().batch_add_op(b_id, gp4, new self.operation_data("apRadiosCount", operationType2, "get"));
				greenFeService_new.getDbalOper().batch_add_op(b_id, gp5, new self.operation_data("clientDeviceTypes", operationType3, "get_n"));
			}

			if (getN) {
				var green_op_enum = new green_params_op("get all records");
				green_op_enum.set_enum("GREEN_PARAMS_OP_GET_N");

				var rc_obj = wcm_oper_db_god_ApfMsData_gn_gc(green_op_enum, GET_N_COUNT, apClientsCursor);

				var gp;
				if (rc_obj.rc !== GREEN_RC.SUCCESS) {
					greenFeService_new.getDbalOper().batch_destroy(b_id);
					return;
				} else {
					gp = rc_obj.gp;
				}
				var operationType1 = greenFeService_new.getOperationConstant().GET_N;
				greenFeService_new.getDbalOper().batch_add_op(b_id, gp, new self.operation_data("clients", operationType1, "get the table row"));
			}

			greenFeService_new.getDbalOper().batch_execute(b_id);
			return featureDeferredCallback.promise;
		},
		getDashletData : function(getCount, getN) {
			var self = this;
			greenFeService_new.initDbalOperWebSocket().then(function(artifacts) {
				featureDeferredCallback = artifacts.featureDeferredCb;

				self.fetchClientsData(getCount, getN).then(function(responseArray) {
					_.forEach(responseArray, function(response) {
						if (response.response === true) {
							switch(response.operation_data.name) {
							case "wlanCount":
								bundle.wlanCount = response.value;
								break;
							case "interfererCount":
								bundle.interfererCount = response.value;
								break;
							case "clientAndRogueCount":
								bundle.clientCount = response.value[0].wcm_Apf_stats_op.cur_ms_entries.get_value();
								bundle.rogueCount = response.value[0].wcm_Apf_stats_op.cur_ra_entries.get_value();
								break;
							case "clients":
								if (response.value.length > 0) {
									_.each(response.value, function(client) {
										bundle.clients.push(client);
									})
								}
								clientsCount = response.value.length;
								apClientsCursor = response.cursor;
								break;
							case "apRadiosCount":
								bundle.up5g = response.value[0].wcm_SpamApStats_op.totalNumOf80211aRadiosUp.get_value();
								bundle.down5g = response.value[0].wcm_SpamApStats_op.totalNumOf80211aRadiosDown.get_value();
								bundle.up24g = response.value[0].wcm_SpamApStats_op.totalNumOf80211bgRadiosUp.get_value();
								bundle.down24g = response.value[0].wcm_SpamApStats_op.totalNumOf80211bgRadiosDown.get_value();
								break;
							case "clientDeviceTypes":
								bundle.clientDeviceTypes = [];
								if (response.value.length > 0) {
									_.each(response.value, function(deviceType) {
										bundle.clientDeviceTypes.push(deviceType);
									})
								}
								break;
							default:
							    break;
							}
						}
					})
					if (clientsCount != 0) {
						self.getDashletData(false, false);
					} else {
						self.broadcastBundle(bundle);
					}
				})
			})
		},
		pollingFunction : function(self) {
			bundle = {};
			bundle.clients = [];
			apClientsCursor = new green_cursor();
			self.getUpTime();
			self.getDashletData(true, false);
		},
		initializeDashlet : function() {
			var self = this;
			self.getDashletData(true, false);
			pollingIntervalForDashlet = $interval(function() {
				self.pollingFunction(self)
			}, refreshInterval);
		},
		cancelDashletInterval : function() {
			$interval.cancel(pollingIntervalForDashlet);
		},
		getUpTime : function() {
			return $http({
				method : 'GET',
				url : GET_UPTIME
			}).success(function(data) {
				$rootScope.$broadcast("dashlet:upTimeEmitted", data);
			}).error(function() {
			})
		}
	};
});

