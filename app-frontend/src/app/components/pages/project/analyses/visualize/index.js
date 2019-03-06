import tpl from './index.html';

class AnalysesVisualizeController {
    constructor(
        $rootScope, $scope, $state, $log,
        mapService, projectService, analysisService
    ) {
        'ngInject';
        $rootScope.autoInject(this, arguments);
    }

    $onInit() {
        this.analysisIds = this.getAnalysisIds();
    }

    getAnalysisIds() {
        const analysis = this.$state.params.analysis;
        if (typeof this.$state.params.analysis === 'string') {
            return [analysis];
        }
        return analysis;
    }
}

const component = {
    bindings: {
        projectId: '<'
    },
    templateUrl: tpl,
    controller: AnalysesVisualizeController.name
};

export default angular
    .module('components.pages.project.analyses.visualize', [])
    .controller(AnalysesVisualizeController.name, AnalysesVisualizeController)
    .component('rfProjectAnalysesVisualizePage', component)
    .name;
