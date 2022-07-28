/**
 Description: Start of Angular application
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';

// Make this variable true if running the application locally.
var runFromLocalhost = properties.useLocalData;
var httpServerBasePath = "";
var app = angular.module('webUiDevApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'angular-wizard',
    'kendo.directives',
    'ngDraggable',
    'ngCsv'
]).config(function ($routeProvider) {
    var loadedCtrlObj = {};
    function LoadController(ctrlUrl, callback){
        if(loadedCtrlObj[ctrlUrl]){
            callback();
            return;
        }
        var el = document.createElement("script"),
            loaded = false;
        var head = document.getElementsByTagName('head')[0];
        el.onload = el.onreadystatechange = function () {
            el.onload = el.onreadystatechange = null;
            loaded = true;
            loadedCtrlObj[ctrlUrl] = true;
            callback();
        };
        el.async = true;
        el.src = ctrlUrl;
        document.getElementsByTagName('head')[0].insertBefore(el, head.firstChild);
    };

    $routeProvider.when('/example2', {
        templateUrl : 'features/common/examples/views/gridView.html',
        controller : 'GridCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/common/examples/exampleControllers.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/telnet', {
        templateUrl : 'features/configureCli/views/configureCli.html',
        controller : 'configCliCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/configureCli/configCliCtrl.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/example1', {
        templateUrl : 'features/common/examples/views/tabsView.html',
        controller : 'TabsCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/common/examples/exampleControllers.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/example3', {
        templateUrl : 'features/common/examples/views/accordionView.html',
        controller : 'AccordionsCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/common/examples/exampleControllers.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/dashboard', {
        templateUrl : 'features/common/db/dashlet/index.html',
        controller : 'DashletCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/common/db/dashlet/DashletController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/userAdministration', {
        templateUrl : 'features/userAdmin/views/userAdministrationView.html',
        controller : 'UserAdministrationCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/userAdmin/userAdministrationController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/todo', {
        templateUrl : 'features/common/todo/todo.html'
    }).when('/vlan', {
        templateUrl : 'features/vlan/views/vlanView.html',
        controller : 'VlanCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/vlan/vlanController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/portsConf', {
        templateUrl : 'features/portsConfig/views/portsConfigView.html',
        controller : 'PortsConfCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/portsConfig/portsConfController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/clients', {
        templateUrl : 'features/clients/views/clientsMonitorView.html',
        controller : 'ClientsMonitoring',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/clients/clientsMonitorController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/portsMonitor', {
        templateUrl : 'features/portsMonitor/views/portsMonitorView.html',
        controller : 'PortsMonitorCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/portsMonitor/portsMonitorController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/switch', {
        templateUrl : 'features/stp/views/stpView.html',
        controller : 'StpCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/stp/stpController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/system', {
        templateUrl : 'features/system/views/systemView.html',
        controller : 'SystemCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/system/systemController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/management', {
        templateUrl : 'features/management/views/managementView.html',
        controller : 'ManagementCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/management/managementController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/documentation', {
        templateUrl : 'features/help/views/documentationView.html',
        controller : 'helpCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/help/helpController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/support', {
        templateUrl : 'features/help/views/supportView.html',
        controller : 'helpCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/help/helpController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/softwareUpdate', {
        templateUrl : 'features/common/swupdate/views/swupdate.html',
        controller : 'SWUpdateCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/common/swupdate/swupdateCtrl.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/troubleShoot', {
        templateUrl : 'features/troubleShoot/views/troubleShootView.html',
        controller : 'troubleShootCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/troubleShoot/troubleShootController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/netflow', {
        templateUrl : 'features/netFlow/views/netFlow.html',
        controller : 'netFlowCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/netFlow/netFlowCtrl.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/staticRouting', {
        templateUrl : 'features/staticRouting/views/staticRoutingView.html',
        controller : 'staticRoutingCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/staticRouting/staticRoutingController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/commands', {
        templateUrl : 'features/commands/views/commandsView.html',
        controller : 'CommandsCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/commands/commandsController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/acl', {
        templateUrl : 'features/acl/views/aclView.html',
        controller : 'aclCtrl',
        resolve: {
            load: function($q) {
                var deferred = $q.defer();
                LoadController('features/acl/aclController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/aaa', {
        templateUrl : 'features/aaa/views/aaaView.html',
        controller : 'aaaCtrl',
        resolve: {
            load: function($q, $route, $rootScope) {
                var deferred = $q.defer();
                LoadController('features/aaa/aaaController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/energy', {
        templateUrl : 'features/energySaver/views/energySaverView.html',
        controller : 'energyCtrl',
        resolve: {
            load: function($q, $route, $rootScope) {
                var deferred = $q.defer();
                LoadController('features/energySaver/energySaverController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/span', {
    		templateUrl : 'features/span/views/spanView.html',
            controller : 'spanCtrl',
            resolve: {
                load: function($q, $route, $rootScope) {
                    var deferred = $q.defer();
                    LoadController('features/span/spanController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/routingProtocol', {
    	templateUrl : 'features/routingProtocol/views/routingProtocolView.html',
    	controller : 'routingProtocolCtrl',
    	resolve: {
    		load: function($q) {
    				var deferred = $q.defer();
    				LoadController('features/routingProtocol/routingProtocolController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/qos', {
    	templateUrl : 'features/qos/views/qosView.html',
    	controller : 'qosCtrl',
    	resolve: {
    		load: function($q) {
    				var deferred = $q.defer();
    				LoadController('features/qos/qosController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/rmon', {
    	templateUrl : 'features/rmon/views/rmonView.html',
    	controller : 'rmonCtrl',
    	resolve: {
    		load: function($q) {
    				var deferred = $q.defer();
    				LoadController('features/rmon/rmonController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).when('/poe', {
    	templateUrl : 'features/poe/views/poe.html',
    	controller : 'poeCtrl',
    	resolve: {
    		load: function($q) {
    				var deferred = $q.defer();
    				LoadController('features/poe/poeController.js', function(){
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }).otherwise({
        redirectTo : '/dashboard'
    });
});

app.config(function($controllerProvider) {
    app.register = {
        controller: $controllerProvider.register
    };
});

app.run(['deviceInfoService', function(deviceInfoService ) {
    //Initialize the deviceInfo
    deviceInfoService.setDeviceInfo();
}]);

//setting time interval for auto refresh
app.constant("dashletReloadTime", 60000);
