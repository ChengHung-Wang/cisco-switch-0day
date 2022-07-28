/**
 Description: Angular Wizard Directive

 Copyright (c) 2015 by Cisco Systems, Inc.
 All rights reserved.
 */

angular.module('angular-wizard', []);
angular.module('angular-wizard').directive('wizardStep', function(onlineHelpService) {
	return {
		restrict : 'EA',
		replace : true,
		transclude : true,
		scope : {
			wzTitle : '@',
			title : '@',
			finish : '@',
			nextLabel : '@',
			prevLabel : '@',
			templatePath : '@',
			stepNumber : '@',
			imageName : '@',
			menuName: '@',
			conditionalStepNumber : '@'
		},
		require : '^wizard',
		template : function() {
			return '<div ng-show=\"selected\" class="row" ng-class=\"{current: selected, done: completed}\">' + '<div class="col-sm-12 wizardContainer">' + '<section ng-show=\"selected\" ng-class=\"{current: selected, done: completed}\" class=\"step\">' + '   <ng-include src=\"templatePath\"></ng-include>' + '</section>' + '</div>' + '</div>';
		},
		link : function($scope, $element, $attrs, wizard) {
			$scope.openOnlineHelpWindow = function() {
				onlineHelpService.openOnlineHelpWindow("/dayzero");
			};
			$scope.title = $scope.title || $scope.wzTitle;
			$scope.imageName=$scope.imageName;
			wizard.addStep($scope);
		}
	};
});

angular.module('angular-wizard').directive('wizard', function() {
	return {
		restrict : 'EA',
		replace : true,
		transclude : true,
		scope : {
			currentStep : '=',
			onFinish : '&',
			hideIndicators : '=',
			editMode : '=',
			name : '@'
		},
		template : function() {
			return '<div class=\"steps\">' + '<ul class=\"steps-indicator steps-{{steps.length}}\" style="border-bottom:1px solid #F5F4F3" ng-if=\"!hideIndicators\">' + '<li ng-style="\{ width : widthvalue };\" ng-click="goToNavigation(step)" ng-class=\"{default: !step.completed && !step.selected, current: step.selected && !step.completed, done: step.completed && !step.selected, editing: step.selected && step.completed}\" ng-repeat=\"step in steps\" ng-if=\"step.showIndicator\">' + '<div class="indicatordiv"></div>'+'<i class="{{step.imageName}} fa-2x" aria-hidden="true"></i>' +'<div class="topmenuname">{{step.menuName}}</div>'+ '</li>' + '</ul>' +'<div style=\"display: block;\">' + '<div ng-transclude style="ma"></div>' + '<div style="border-top:1px solid #F5F4F3;"><div class=\"wizard-buttons clearfix\" style="height:60px;margin:15px">' + '<div wz-previous class=\"btn btn-primary left-button prevbtn\" ng-if=\"selectedStep.prevLabel!=undefined\"><i class=\"fa fa-angle-left\"></i>{{selectedStep.prevLabel}}</div>' + '<div wz-next=\"$parent.getData($parent.wzModel,\'{{finish}}\',{{selectedStep.stepNumber}})\" class=\"btn btn-primary right-button nextbtn\">{{selectedStep.nextLabel}}<i class=\"fa fa-angle-right\"></i></div>' +
			 '</div></div>' + '</div>' + '</div>';
		},
		controller : ['$scope', '$element', '$rootScope', 'wizardPathService', 'WizardHandler', 'validationService',
		function($scope, $element, $rootScope, wizardPathService, WizardHandler, validationService) {

			//Json holder for the wz-step HTML scope elements
			var isLastStep = false;
			WizardHandler.addWizard($scope.name || WizardHandler.defaultName, this);
			$scope.$on('$destroy', function() {
				WizardHandler.removeWizard($scope.name || WizardHandler.defaultName);
			});

			$scope.steps = [];

			$scope.$watch('currentStep', function(step) {
				if (!step){
					return;
				}
				var stepTitle = $scope.selectedStep.title || $scope.selectedStep.wzTitle;
				if ($scope.selectedStep && stepTitle !== $scope.currentStep) {
					$scope.goTo(_.findWhere($scope.steps, {
						title : $scope.currentStep
					}));
				}

			});

			$scope.$watch('[editMode, steps.length]', function() {
				var editMode = $scope.editMode;
				if (_.isUndefined(editMode) || _.isNull(editMode)){
					return;
				}

				if (editMode) {
					_.each($scope.steps, function(step) {
						step.completed = true;
					});
				}
			}, true);

			this.addStep = function(step) {
				//pushing next and previous labels inside the arrays
				wizardPathService.pushLabels(step.prevLabel, step.nextLabel);
				step.showIndicator = true;
				$scope.steps.push(step);
				if ($scope.steps.length === 1) {
					$scope.goTo($scope.steps[0]);
				}
			};

			$scope.goTo = function(step) {
				unselectAll();
				$scope.selectedStep = step;
				if (!_.isUndefined($scope.currentStep)) {
					$scope.currentStep = step.title || step.wzTitle;
				}
				step.selected = true;
				$scope.$emit('wizard:stepChanged', {
					step : step,
					index : _.indexOf($scope.steps, step)
				});
			};
			$scope.goToNavigation = function(step) {
				if (step.completed) {
					//code				
				unselectAll();
				$scope.selectedStep = step;
				if (!_.isUndefined($scope.currentStep)) {
					$scope.currentStep = step.title || step.wzTitle;
				}
				step.selected = true;
				$scope.$emit('wizard:stepChanged', {
					step : step,
					index : _.indexOf($scope.steps, step)
				});
				}
			};
			$scope.goToPrevious = function() {
				//setting the progress bar from completed to default
			};
			$scope.currentStepNumber = function() {
				return _.indexOf($scope.steps, $scope.selectedStep) + 1;
			}
			function unselectAll() {
				_.each($scope.steps, function(step) {
					step.selected = false;
				});
				$scope.selectedStep = null;
			}


			this.next = function(draft) {

				var index = _.indexOf($scope.steps, $scope.selectedStep);
				var validator = validationService.getValidator(index);
				var wirelessPos = validationService.getWirelessPossible();
				var result;
				if(wirelessPos){
					result = _.isUndefined(validator) ? true : validator.validate();
				}else{
					result = true;
				}
				

				if (result && !draft) {
					$scope.selectedStep.completed = true;

					if (index === $scope.steps.length - 1) {
						isLastStep = true;
						this.finish();
					} else {
						if (wizardPathService.getConditionSatisfied(index)) {
							$scope.goTo($scope.steps[$scope.steps[index].conditionalStepNumber - 1]);
						} else {
							($scope.selectedStep.next === "last") ? this.finish() : _.isUndefined($scope.selectedStep.next) ? $scope.goTo($scope.steps[index + 1]) : $scope.goTo($scope.steps[$scope.selectedStep.next]);
						}

					}
				}
			};

			this.goTo = function(step) {
				var stepTo;
				if (_.isNumber(step)) {
					stepTo = $scope.steps[step];
				} else {
					stepTo = _.findWhere($scope.steps, {
						title : step
					});
				}
				$scope.goTo(stepTo);
			};

			this.finish = function() {

				var index = _.indexOf($scope.steps, $scope.selectedStep);
				var validator = validationService.getValidator(index);

				var result = _.isUndefined(validator) ? true : validator.validate();
				if (result) {
					if ($scope.onFinish) {
						$scope.onFinish();

					}
				}
			};

			this.cancel = this.previous = function() {
				var index = _.indexOf($scope.steps, $scope.selectedStep);
				if (index === 0) {
					throw new Error("Can't go back. It's already in step 0");
				} else {
					var previousStepNumber = $scope.steps[$scope.currentStepNumber() - 1].previousStepNumber;
					previousStepNumber = _.isUndefined(previousStepNumber) ? index - 1 : previousStepNumber;
					$scope.goToPrevious($scope.steps[previousStepNumber+1]);
					$scope.goTo($scope.steps[previousStepNumber]);

				}
			};

			this.islaststep = function() {
				var index = _.indexOf($scope.steps, $scope.selectedStep);
				if (index === $scope.steps.length - 1) {
					return true;
				} else {
					return false;
				}
			};

			//this method returns the current step
			this.getStep = function(stepNumber) {
				stepNumber = _.isUndefined(stepNumber) ? $scope.currentStepNumber() : stepNumber;
				return $scope.steps[stepNumber - 1];
			};

			//this method sets the next Label of the wizard step
			this.setNextLabel = function(stepNumber, label) {
				$scope.steps[stepNumber - 1].nextLabel = label;
			};

			//this method sets the previous Label of the wizard step
			this.setPrevLabel = function(stepNumber, label) {
				$scope.steps[stepNumber - 1].prevLabel = label;
			};
			//this method is used to solve the path divergence in the wizard
			this.setPreviousStepNumber = function(nextStepNumber, prevStepNumber) {
				var previousStepNumber = _.isUndefined(prevStepNumber) ? $scope.currentStepNumber() : prevStepNumber;

				//setting up the previous step number of the next step we are going so when previous button is clicked it
				//should go to the step from where it is arrived
				$scope.steps[nextStepNumber - 1].previousStepNumber = previousStepNumber - 1;
			};

			//sets all steps to pristine declarative config
			this.setStepDefaults = function(skipSteps) {
				if (skipSteps === undefined || _.isEmpty(skipSteps)) {
					skipSteps = -1;
				} else if (!_.isArray(skipSteps)) {
					skipSteps = [skipSteps];
				}
				$scope.widthvalue=100/$scope.steps.length+"%";
			};
		}]

	};
});

function wizardButtonDirective(action) {
	angular.module('angular-wizard').directive(action, function() {
		return {
			restrict : 'A',
			replace : false,
			require : '^wizard',
			link : function($scope, $element, $attrs, wizard) {

				$element.on("click", function(e) {
					e.preventDefault();
					$scope.$apply(function() {
						$scope.$eval($attrs[action]);
						if (action === "wzNext" && wizard.islaststep()) {
							wizard.finish();
						} else {
							wizard[action.replace("wz", "").toLowerCase()]();
						}
					});
				});
			}
		};
	});
}

wizardButtonDirective('wzNext');
wizardButtonDirective('wzPrevious');
wizardButtonDirective('wzFinish');
wizardButtonDirective('wzCancel');

angular.module('angular-wizard').factory('WizardHandler', function() {
	var service = {};

	var wizards = {};

	service.defaultName = "defaultWizard";

	service.addWizard = function(name, wizard) {
		wizards[name] = wizard;
	};

	service.removeWizard = function(name) {
		delete wizards[name];
	};

	service.wizard = function(name) {
		var nameToUse = name;
		if (!name) {
			nameToUse = service.defaultName;
		}

		return wizards[nameToUse];
	};

	return service;
});

angular.module('angular-wizard').factory("wizardPathService", function() {
	var stepNumber = 0;
	var wizardStepsPreviousLabels = [];
	var wizardStepsNextLabels = [];
	var conditionSatisfied = [];
	return {

		getConditionSatisfied : function(index) {
			return (_.isUndefined(conditionSatisfied[index])) ? undefined : conditionSatisfied[index];
		},
		getDefaultNextLabel : function(stepNumber) {
			return wizardStepsNextLabels[stepNumber - 1];
		},
		getDefaultPrevLabel : function(stepNumber) {
			return wizardStepsPreviousLabels[stepNumber - 1];
		},
		pushLabels : function(prevLabel, nextLabel) {
			wizardStepsNextLabels[stepNumber] = nextLabel;
			wizardStepsPreviousLabels[stepNumber++] = prevLabel;
		}
	}
});
