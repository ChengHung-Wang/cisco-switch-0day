/**
 * Contains all the common directives. Add any common diretives here.
 * This has 'toolTip' directive.
 */

/**
 Description: Common directives to be included here.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */




/* Directive name: tooltip
 * This directive places a tool tip icon and shows the tooltip when the mouse is hovered on it.
 * Two attributes, position and helptext need to be passed from the directive markup in html
 * Default position is right. Values could be 'right, 'left', 'top', 'bottom' and 'center'.
 * helptext provides explanation about the field and tips to choose a value
 * Usage (in markup):
    <tooltip helptext="{{'help_ua_username' | translate}}" ></tooltip>
    <tooltip position='left' helptext="{{'help_ua_password' | translate}}" ></tooltip>
*/
app.directive('tooltip', function (onlineHelpService) {
            var directive = {};
            directive.restrict = 'E';
			directive.template = '<span class="helpIconDir"><i class="fa fa-question-circle-o fa-lg" aria-hidden="true"></i></span>';
            directive.link=function(scope, element, attrs){
            	//Add the kendo tooltip to this element
            	//position and helptext should be passed from the directive markup as attributes
            	var helptext = attrs.helptext;
            	var position = 'right';
            	if(attrs.position){
                	position = attrs.position;
            	}
            	var x = element.kendoTooltip({ content: helptext,
                                               position: position,
                                               width: '350px',
                                               showOn: 'mouseenter',
                                               autoHide: true
                                       });
            	//Blocking this line, as cisco.com content can not be loaded into frame/window due to security purpose
            	//will be unblocked if needed
                /*element.on('click',function(e){
                    x.data("kendoTooltip").hide();
                    onlineHelpService.openSideHelpWindow();
                });*/
            }
            return directive;
});

app.directive('tooltipinfo', function (onlineHelpService) {
            var directive = {};
            directive.restrict = 'E';
            directive.template = '<span class="helpIconDir"><i class="fa fa-info-circle" aria-hidden="true"></i></span>';
            directive.link=function(scope, element, attrs){
                var helptext = attrs.helptext;
                var position = 'right';
                var width = "350px"
                if(attrs.position){
                    position = attrs.position;
                }
                if(attrs.width){
                    width = attrs.width;
                }
                var x = element.kendoTooltip({ content: helptext,
                                               position: position,
                                               width: width,
                                               showOn: 'mouseenter',
                                               autoHide: true
                                       });
            }
            return directive;
});

app.directive('svgLoad', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var img = attrs.imgName;
            var rootpath = attrs.rootPath;
            element.load(rootpath+img);
        }
    };
});

app.directive('parseStyle', function($interpolate) {
    return function(scope, elem) {
        var exp = $interpolate(elem.html()),
            watchFunc = function () { return exp(scope); };
        
        scope.$watch(watchFunc, function (html) {
            elem.html(html);
        });
    };
});