/**
 Description: Add Edit Directive
 Copyright (c) 2017-2018 by Cisco Systems, Inc.
 All rights reserved.
 */
app.directive('addEditWindow', [
	function() {
		return {
			restrict: 'A',
			scope: {
				kendoWindow: "=",
				windowName: "@kendoWindow",
				windowDone: "=",
				windowCancel: "=",
				kWidth: "@",
				windowHeight:"@",
				basicAdvanceMode:"=",
				wizardMode:"@",
				steps:"=",
				isGrid:"@",
				customButtons:"=?windowButtons",
				gridId:"@"
			},
			link:function($scope, elem){
				var tabObj;
				var selector1=elem.find('div.windowContainer > [kendo-tab-strip]'),
				selector2=elem.find('div.windowContainer > form > [kendo-tab-strip]');

				function bindOnChange(){
					tabObj.kendoTabStrip({
						select: onTopLevelTabSelect
					}).data("kendoTabStrip");
				}

				if (selector1.length > 0) {
					tabObj=selector1;
					bindOnChange();
				}else if (selector2.length>0) {
					tabObj=selector2;
					bindOnChange();
				}

				function onTopLevelTabSelect(e){
					$scope.$broadcast("tabChanged:"+$scope.windowName,e);
				}

			},
			controller: function($scope, $element,$compile, $window, $timeout,$filter) {
				//To set default buttons if not specified
				var translate=$filter('translate');
				var tableWidthWatch;
				var setButtons= function(){
					var buttonNames={
						"add":{
							"done":{name:translate('com_save_and_apply'),icon:"icon-save-device"},
							"cancel":{name:translate('com_cancel'),icon:"fa pl-cancel"}
						},
						"edit":{
							"done":{name:translate('com_update_and_apply'),icon:"icon-save-update-device"},
							"cancel":{name:translate('com_cancel'),icon:"fa pl-cancel"}
						}
					};
					if ($scope.customButtons===undefined || $scope.customButtons==="") {
						$scope.customButtons=buttonNames;
					}else{
						if ($scope.customButtons.add===undefined) {
							$scope.customButtons.add=buttonNames.add;
						}else{
							if ($scope.customButtons.add.done===undefined) {
								$scope.customButtons.add.done=buttonNames.add.done;
							}
							if ($scope.customButtons.add.cancel===undefined) {
								$scope.customButtons.add.cancel=buttonNames.add.cancel;
							}
						}
						if ($scope.customButtons.edit===undefined) {
							$scope.customButtons.edit=buttonNames.edit;
						}else{
							if ($scope.customButtons.edit.done===undefined) {
								$scope.customButtons.edit.done=buttonNames.edit.done;
							}
							if ($scope.customButtons.edit.cancel===undefined) {
								$scope.customButtons.edit.cancel=buttonNames.edit.cancel;
							}
						}
					}
				};

				var makeResponsive = function() {
					if ($scope.kendoWindow !== undefined && $scope.kendoWindow.isEditMode) {
						var prop = getReponsiveProperties();
						if (prop !== undefined) {
							$scope.kendoWindow.setOptions({
								height: prop.editHeight,
								width:prop.windowWidth
							});
							$scope.kendoWindow.wrapper.css({
								top: prop.top,
								left: "auto",
								right: 0,
								bottom: "auto",
								transform: "scale(1)"
							});
							calloutProp.calloutOffTop = prop.calloutTop;
							calloutProp.calloutOffRight = prop.windowWidth-1;
							showHideCallout(prop.offset);
							var $windowContainer=elem.find('.windowContainer');
							addTabsHeights($windowContainer,prop);
							$timeout(function() {
								$scope.$apply();
							}, 0);
						}
					}
				};

				var elem=angular.element($element),grid;
				if ($scope.gridId !== undefined && $scope.gridId !== '') {
					grid = angular.element("#"+$scope.gridId);
					if (grid.length===0) {
						grid=undefined;
					}else{
						tableWidthWatch=$scope.$watch(
							function() { return grid[0].offsetWidth; },
							function() {
							// Handles resize event
							makeResponsive();
						});
					}
				}else{
					var findGrid=angular.element("[kendo-grid]");
					if (findGrid.length!==0) {
						tableWidthWatch=$scope.$watch(
							function() { return findGrid[0].offsetWidth; },
							function() {
							// Handles resize event
							makeResponsive();
						});
					}
				}
				$scope.currentStep=1;

				setButtons();
				var doneButton='<button ng-hide="readonly" class="btn btn-primary k-button pull-right popupDone" type="button" ng-click="doneAddEditKendoWindow()"><i ng-class="kendoWindow.isEditMode?customButtons.edit.done.icon:customButtons.add.done.icon"></i> {{kendoWindow.isEditMode?customButtons.edit.done.name:customButtons.add.done.name}}</button>';
				var cancelButton='<button ng-hide="readonly" class="btn btn-primary k-button pull-left" type="button" ng-click="cancelAddEditKendoWindow()"><i ng-class="kendoWindow.isEditMode?customButtons.edit.cancel.icon:customButtons.add.cancel.icon"></i> {{kendoWindow.isEditMode?customButtons.edit.cancel.name:customButtons.add.cancel.name}}</button>';
				var okButton='<button ng-show="readonly" class="btn btn-primary k-button " type="button" ng-click="closeAddEditKendoWindow()"><i class="fa fa-check"></i> OK</button>';
				if ($scope.customButtons.edit.cancel===false) {
					cancelButton="";
				}
				var buttons = '<div attr="{{kendoWindow.isEditMode}}" ng-show="kendoWindow.isEditMode || !wMode" class="confirm" ng-class="kendoWindow.isEditMode?\'windowButtonAddEdit\':\'windowButtonContainer marginWindowButtons\'">' +
					doneButton +
					cancelButton +
					okButton+
					'</div>';
				var wizardButtons = '<div ng-if="wMode" ng-hide="kendoWindow.isEditMode" class="confirm" ng-class="kendoWindow.isEditMode?\'windowButtonAddEdit\':\'windowButtonContainer marginWindowButtons\'">' +
					'<button class="btn btn-primary k-button" type="button" ng-click="checkStep()"><span ng-show="currentStep==steps"><i ng-class="customButtons.add.done.icon"></i> {{customButtons.add.done.name}}</span><span ng-show="currentStep!=steps">Next <i class="fa fa-arrow-right"></i></span></button>' +
					'<button class="btn btn-primary k-button pull-left" type="button" ng-click="doneAddEditKendoWindow(false)" ng-if="currentStep!=1"><i class="fa fa-arrow-left"></i> Previous</button>' +
					'</div>';
				var topNav = angular.element('div.top-panel');
				var topNavHeight = topNav.outerHeight() - 1;
				var tabHeight=35,tabContentMargin=14;
				var basicAdvHeight=30;
				var isTab=elem.find('div.windowContainer > [kendo-tab-strip]').length > 0 ? true : elem.find('div.windowContainer > form > [kendo-tab-strip]').length > 0? true:false;
				var isSecondTab=false;
				var insideForm=elem.find('form').find('[kendo-tab-strip]').length > 0 ? true : false;
				$scope.wMode=$scope.wizardMode==="true"?true:false;
				var buttonEl;
				elem.addClass("addEditWindow");

				var isBasicAdvanceMode=$scope.basicAdvanceMode!==undefined?true:false;
				var wizButtonEl = angular.element(wizardButtons);
				$compile(wizButtonEl)($scope);
				elem.append(wizButtonEl);
				buttonEl = angular.element(buttons);
				$compile(buttonEl)($scope);
				elem.append(buttonEl);
				var callout = '<div class="dialog_callout" ng-show="kendoWindow.isEditMode && isGrid!==\'false\'" ng-style="kendoWindow.calloutPosition"></div>';
				var calloutElem = angular.element(callout);
				$compile(calloutElem)($scope);
				angular.element('body').append(calloutElem);
				var calloutProp = {
					calloutOffTop: "",
					calloutOffRight: ""
				};

				//Adding loading Spinner
				$scope.loading=false;
				var loading = "<div class='spinnerCustom' ng-if='loading'></div>";
				var loadingContent = angular.element(loading);
				$compile(loadingContent)($scope);
				elem.append(loadingContent);

				$scope.$on("loading:"+ $scope.windowName,function(evt,load){
						$scope.loading=load;
						if ($scope.loading) {
							elem.addClass("hideEditContent");
						}else{
							elem.removeClass("hideEditContent");
						}
				});

				/*Two level tabs fix*/
				$scope.$on("tabChanged:"+$scope.windowName,function(evt,el){
					if (angular.element(el.contentElement).find("[kendo-tab-strip]").length>0) {
						isSecondTab=true;
					}else{
						isSecondTab=false;
					}
					makeResponsive();
				});
				/*Two level tabs fix ends*/

				if (isBasicAdvanceMode) {
					$timeout(function(){
						$scope.selectedMode="basic";
						var basicAdvanceDiv='<div class="basicAdvanceMode">'+
								    '<input ng-model="selectedMode" class="cssRadioButton" id="basicRadio" type="radio" name="basicAdvRadio" value="basic" checked="checked" ng-change="changeBasicAdvance()">'+
								    '<label for="basicRadio"><span><span></span></span>'+translate('common_basic')+'</label>'+
								    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
								    '<input ng-model="selectedMode" class="cssRadioButton" id="advanceRadio" type="radio" name="basicAdvRadio" value="advance" checked="checked" ng-change="changeBasicAdvance()">'+
								    '<label for="advanceRadio"><span><span></span></span>'+translate('common_advanced')+'</label>'+
								    '</div>';
						var radioEl = angular.element(basicAdvanceDiv);
						$compile(radioEl)($scope);
						elem.prepend(radioEl);
					},0);
				}

				$scope.$on("$destroy",function(){
					angular.element(".dialog_callout").remove();
					if(tableWidthWatch!==undefined){
						tableWidthWatch();
					}
				});

				$scope.closeAddEditKendoWindow = function() {
					if ($scope.kendoWindow !== undefined) {
						$scope.kendoWindow.close();
					}
				};

				$scope.doneAddEditKendoWindow = function(next) {
					if ($scope.windowDone !== undefined) {
						if ($scope.wMode) {
							if (next && $scope.currentStep!=$scope.steps) {
								$scope.currentStep++;
							}else if(!next && $scope.currentStep!=1){
								$scope.currentStep--;
							}
							$scope.windowDone($scope.kendoWindow.isEditMode, $scope.windowName, $scope.currentStep);
						}else{
							$scope.windowDone($scope.kendoWindow.isEditMode, $scope.windowName);
						}
					}
				};

				$scope.cancelAddEditKendoWindow = function(){
					if ($scope.windowCancel !== undefined) {
						$scope.windowCancel($scope.kendoWindow.isEditMode);
					}
					$scope.closeAddEditKendoWindow();
				};

				$scope.checkStep = function () {
					$scope.$emit("StepChangeEvent:" + $scope.windowName, $scope.currentStep);
				};

				$scope.$on("changeStep:" + $scope.windowName, function () {
					$scope.doneAddEditKendoWindow(true);
				});

				var getViewportOffset = function($e) {
					var window = angular.element($window),
						scrollLeft = window.scrollLeft(),
						scrollTop = window.scrollTop(),
						offset = $e.offset(),
						rect1 = {
							x1: scrollLeft,
							y1: scrollTop,
							x2: scrollLeft + window.width(),
							y2: scrollTop + window.height()
						},
						rect2 = {
							x1: offset.left,
							y1: offset.top,
							x2: offset.left + $e.width(),
							y2: offset.top + $e.height()
						};
					return {
						left: offset.left - scrollLeft,
						top: offset.top - scrollTop,
						scrollTop: scrollTop,
						width: window.width(),
						height: window.height(),
						insideViewport: rect1.x1 < rect2.x2 && rect1.x2 > rect2.x1 && rect1.y1 < rect2.y2 && rect1.y2 > rect2.y1
					};
				};

				var getReponsiveProperties = function() {
					var el;
					if (grid !== undefined) {
						el = grid.find('tr.k-state-selected');
					}else{
						if($scope.isGrid === "false"){
			                            el = angular.element('.windowContainer');
						}else{
			                            el = angular.element('tr.k-state-selected');
						}
					}
					if (el.length !== 0) {
						var windowWidth;
						var gridWidth=parseInt(el.width());
						windowWidth=parseInt($scope.kWidth);
						var offset = getViewportOffset(el);
						var top = offset.scrollTop > topNavHeight ? offset.scrollTop : topNavHeight;
						var editHeight = offset.height - 121;
						var formHeight;
						var calloutTop = offset.scrollTop > 0 ? offset.top + offset.scrollTop + 3 : offset.top + 3;
						if (offset.scrollTop > 0 && offset.scrollTop <= topNavHeight) {
							editHeight = offset.height + offset.scrollTop - 121;
						} else if (offset.scrollTop > topNavHeight) {
							editHeight = offset.height - 54;
						}
						if (isBasicAdvanceMode) {
							formHeight = editHeight - basicAdvHeight - 55;
						}else{
							formHeight = editHeight - 55;
						}
						var tHeight=tabHeight;
						if (isSecondTab) {
							tHeight=tabHeight*2;
						}
						var tabContentHeight=formHeight-tabHeight-tabContentMargin;
						var tab2ContentHeight=formHeight-tHeight-tabContentMargin;
						if (insideForm) {
							tabContentHeight=tabContentHeight-15;
						}
						if (gridWidth-100<windowWidth && !$scope.isGrid){
							windowWidth=gridWidth-100;
						}
						return {
							offset: offset,
							top: top,
							editHeight: editHeight,
							calloutTop: calloutTop,
							formHeight: formHeight,
							tabContentHeight: tabContentHeight,
							tab2ContentHeight:tab2ContentHeight,
							windowWidth:windowWidth
						};
					}
				};

				var showHideCallout = function(selPos) {
					if (!selPos.insideViewport) {
						$scope.kendoWindow.calloutPosition = {
							"top": calloutProp.calloutOffTop,
							'display': "none",
							"right": calloutProp.calloutOffRight
						};
					} else {
						$scope.kendoWindow.calloutPosition = {
							"top": calloutProp.calloutOffTop,
							'display': "block",
							"right": calloutProp.calloutOffRight
						};
					}
				};

				var addTabsHeights = function($windowContainer,prop){
					if (!isTab) {
						$windowContainer.addClass("noTab");
						$windowContainer.css("height", prop.formHeight + "px");
					}
					else if (isSecondTab && isTab) {
						$windowContainer.css("height", "auto");
						$windowContainer.find('.k-tabstrip>div').css("height","auto");
						$windowContainer.find('.k-tabstrip .k-tabstrip>div').css("height",prop.tab2ContentHeight+"px");
					}else if(!isSecondTab && isTab){
						$windowContainer.css("height", "auto");
						$windowContainer.find('.k-tabstrip>div').css("height",prop.tabContentHeight+"px");
					}
				};

				var removeCloak = function(){
					if(elem.hasClass('cloakVisiblility')){
						elem.removeClass('cloakVisiblility');
						//In some cases visibility getting added to style on dialog creation
						elem.css("visibility","visible");
					}
				};

				var setBasic = function(){
					$scope.currentStep=1;
					$scope.selectedMode="basic";
					$scope.changeBasicAdvance();
				};

				var setAdvance = function(){
					$scope.currentStep=1;
					$scope.selectedMode="advance";
					$scope.changeBasicAdvance();
				};

				$scope.changeBasicAdvance = function(){
					if ($scope.wMode) {
						$scope.currentStep=1;
					}
					$scope.basicAdvanceMode($scope.selectedMode);
				};

				$scope.$on('changeMode',function(evt,data){
					if (data==="basic") {
						setBasic();
					}else{
						setAdvance();
					}
				});

				$scope.$on('openAddDialog:'+$scope.windowName, function(evt, title) {
					$scope.kendoWindow.close();
					$scope.readonly=false;
					$scope.currentStep=1;
					removeCloak();
					if (isBasicAdvanceMode) {
						setBasic();
					}
					$scope.kendoWindow.setOptions({
						modal: true,
						resizable: true,
						scrollable: false,
						draggable: true,
						animation: {
							close: {
								effects: {
									fade: {
										direction: "out"
									},
									zoom: {
										direction: "out"
									}
								},
								duration: 350
							},
							open: {
								effects: {
									fade: {
										direction: "in"
									},
									zoom: {
										direction: "in"
									}
								},
								duration: 350
							}
						},
						title: title,
						width: $scope.kWidth
					});
					var $windowContainer=elem.find('.windowContainer');
					if($scope.windowHeight !== "" && $scope.windowHeight !== undefined){
						$windowContainer.css("height",$scope.windowHeight+"px");
					}else{
						$windowContainer.css("height", "auto");
					}
					$windowContainer.find('.k-tabstrip>div').css("height","auto");
					if (!isTab) {
						elem.removeClass("editWindow");
						$windowContainer.removeClass("noTab");
					}
					//custom flag added to check if add or edit
					$scope.kendoWindow.isEditMode = false;
					$scope.kendoWindow.wrapper.css({
						transform: "scale(0.01)",
						height: "auto"
					});
					//adding timeout to open dialog at center for the first time(kendo issue)
					$timeout(function(){
						$scope.kendoWindow.center().open();
					},0);
				});

				$scope.openForEdit = function(evt, title, readonly){
					var $windowContainer=elem.find('.windowContainer');
					isSecondTab=$windowContainer.find('.k-tabstrip>div.k-state-active').find('.k-tabstrip>div').length>0;
					var prop = getReponsiveProperties();
					removeCloak();
					if (isBasicAdvanceMode) {
						setBasic();
					}
					$scope.readonly=readonly;
					calloutProp.calloutOffTop = prop.calloutTop;
					calloutProp.calloutOffRight = prop.windowWidth-1;
					$scope.kendoWindow.setOptions({
						modal: false,
						resizable: false,
						animation: false,
						scrollable: true,
						height: prop.editHeight,
						title: title,
						draggable: false,
						width: prop.windowWidth,
						close: function() {
							if ($scope.kendoWindow.isEditMode) {
								$timeout(function() {
									$scope.$apply(function() {
										$scope.kendoWindow.isEditMode = false;
									});
								}, 0);
							}
						}
					});
					if (!isTab) {
						elem.addClass("editWindow");
					}
					addTabsHeights($windowContainer,prop);
					//custom flag added to check if add or edit
					$scope.kendoWindow.isEditMode = true;
					//custom position property to point callout to row
					$scope.kendoWindow.calloutPosition = {
						"top": calloutProp.calloutOffTop,
						"display": 'block',
						'right': calloutProp.calloutOffRight
					};
					$scope.kendoWindow.wrapper.css({
						top: prop.top,
						left: "auto",
						right: 0,
						bottom: "auto",
						transform: "scale(1)"
					});
					$scope.kendoWindow.open();
					console.log($scope.kendoWindow)
				};
				
				$scope.$on('openEditDialog:'+$scope.windowName, function(evt, title) {
					$scope.openForEdit(evt, title,false);
				});

				$scope.$on('openReadOnlyDialog:'+$scope.windowName, function(evt, title) {
					$scope.openForEdit(evt, title, true);
				});

				$scope.$on("closeAddEditKendoWindow:"+$scope.windowName, function() {

					$scope.closeAddEditKendoWindow();
				});

				var w = angular.element($window);
				w.bind('resize', function() {
					makeResponsive();
				});

				w.bind('scroll', function() {
					makeResponsive();
				});
			}
		};
	}
]);
