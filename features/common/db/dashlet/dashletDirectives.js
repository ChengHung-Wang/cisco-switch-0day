/**Description: Library wiring of WebUI application
 Dec  2015
 Copyright (c) 2015 by Cisco Systems, Inc.
 All rights reserved.*/
app
    .directive("dashlet", function () {
        function ctrl($scope) {
        };
        return{
            controller: ctrl,
            scope: {
                currentOptions: "@",
                gearOption: "@",
                empty: "@",
                size: "@",
                title: "@",
                description: "@",
                notif: "@",
                content: "@",
                iconClass: "@",
				poll:"@"
            },
            restrict: 'E',
            templateUrl: "features/common/db/dashlet/views/dashlet.html"
        }
    })
///18.10.14 .dashletOptions  directive which  uses for ear-icon
    .directive("dashletOptions",['$timeout', function ($timeout) {
        function ctrl($scope) {
        }
        return{
            controller: ctrl,
            scope: {
                optionUrl: "@"
            },
            transclude: true,
            restrict: 'AE',
            //template: '<div ng-transclude ng-click="closeDashlet($parent)"></div>' +
            //    '<div k-options="opt" k-modal="true" kendo-window="options">' +
            //    '<div ng-form="optionsForm">' +
            //    '<div class="modal-header">' +
            //    '<h3 class="modal-title">Configure Wigets </h3>' +
            //    '</div>' +
            //    '<div class="modal-body">' +
            //    '   <div ng-include="optionUrl"></div>' +
            //    '</div>' +
            //    '<div class="modal-footer">' +
            //    '    <button class="btn pull-left" ng-click="remove()" ng-show="$parent.currentOptions.length > 0">Remove Visualization</button>' +
            //    '     <button class="btn" ng-click="cancel(optionsForm)">Cancel</button>' +
            //    '      <button class="btn" ng-click="save(optionsForm)">Save</button>' +
            //    '   </div>' +
            //    '</div>' +
            //    '</div>' +
            //    '</div>',
            template:'<div class="transcludeElement" ng-transclude></div>'+
            '<span class="optionsSpan"><i class="fa fa-times cursor_hand" ng-click="closeDashlet($parent)"></i></span>',

            link: function (scope) {
                scope.opt = {
                    pinned: true,
                    resizable: false,
                    draggable: false,
                    visible: false,
                    position: {
                        top: 300,
                        left: 800
                    },
                    center: true,
                    title: false,
                    animation: {
                        open: {
                            effects: "fade:in"
                        },
                        close: {
                            effects: "fade:out"
                        }
                    }
                };
                scope.closeDashlet = function(parentScp){
                    scope.$emit("dashletRemoved", parentScp);
                    // Uncomment these lines if you want a blank dashlet with Add Widget in them
                };
                scope.openOptions = function (parentScp) {
                    scope.options.open();
                    for (i in parentScp.$parent.currentOptions) {
                        parentScp.$$childHead[i] = parentScp.$parent.currentOptions[i];
                    }
                    parentScp.$$childHead.remove = function () {
                        parentScp.$parent.currentOptions = {};
                        parentScp.$parent.description = null;
                        parentScp.$parent.notif = null;
                        parentScp.$parent.title = null;
                        parentScp.$parent.content = null;
                        parentScp.$parent.empty = true;
                    };
                    parentScp.$$childHead.save = function (newOptions) {
                        parentScp.$parent.currentOptions = {};
                        for (var i in newOptions) {
                            parentScp.$parent.currentOptions[i] = newOptions[i].$modelValue;
                        }
                        parentScp.$parent.empty = false;
                        scope.options.close();
                    };
                    parentScp.$$childHead.cancel = function (optionsForm) {
                        scope.options.close();
                        for (var i in optionsForm) {
                            parentScp.$$childHead.$$childTail[i] = parentScp.$$childHead[i];
                        }
                    };
                };
            }
        }
    }])
    .directive('resizeDashlet', function($window,$timeout) {
        return function(scope, element) {
          var w = angular.element($window);
          scope.getWindowDimensions = function () {
            return {
              //'h': $window.innerHeight,
              'w': element[0].clientWidth
            };
          };
          scope.$watch(scope.getWindowDimensions,
            function () {
                var charts=element.find('.kendoUIChart');
                angular.forEach(charts, function(value) {
                    var chart=angular.element(value).data("kendoChart");
                   if(chart){
                        chart.redraw();
                   }
                });
           }, true);
          w.bind('resize', function () {
            scope.$apply();
          });
          scope.$on("resizedContainer", function () {
                var charts=element.find('.kendoUIChart');
                angular.forEach(charts, function(value) {
                    var el=angular.element(value);
                    var chart=el.data("kendoChart");
                    if(chart){
                        el.addClass('notVisible');
                        $timeout(function(){
                            chart.redraw();
                            el.removeClass('notVisible');
                        },400);
                    }
                });
           });
         }
       })
    .directive('sortableResize', function($timeout) {
            return function(scope) {
                scope.$on("removeHint", function (event, args) {
                    var selectHint = angular.element('.hintDashboard');
                    selectHint.remove();
                    var charts=args.find('.kendoUIChart');
                    angular.forEach(charts, function(value) {
                        var el=angular.element(value);
                        el.addClass('notVisible');
                        var chart=el.data("kendoChart");
                        if(chart){
                            $timeout(function(){
                                chart.redraw();
                                el.removeClass('notVisible');
                            },200);
                        }
                    })
                });
            }
        })