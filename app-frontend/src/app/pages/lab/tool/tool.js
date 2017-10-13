/* global L */
import { FrameView } from '../../../components/map/labMap/frame.module.js';

class LabToolController {
    constructor(
        $scope, $rootScope, $state, $timeout, $element, $window, $document, $uibModal,
        mapService, projectService, authService, mapUtilsService, toolService, tokenService,
        APP_CONFIG
    ) {
        'ngInject';
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$state = $state;
        this.$timeout = $timeout;
        this.$element = $element;
        this.$window = $window;
        this.$document = $document;
        this.$uibModal = $uibModal;

        this.getMap = () => mapService.getMap('tool-preview');
        this.projectService = projectService;
        this.authService = authService;
        this.mapUtilsService = mapUtilsService;
        this.toolService = toolService;
        this.tokenService = tokenService;

        this.tileServer = `${APP_CONFIG.tileServerLocation}`;
    }

    $onInit() {
        this.showDiagram = true;
        // request tool-run
        this.tool = this.$state.params.tool;
        this.toolId = this.$state.params.toolid;
        this.toolName = '';

        if (this.toolId && !this.tool) {
            this.fetchTool();
        } else if (!this.toolId) {
            this.$state.go('lab.browse.tools');
        }

        this.$scope.$on('$destroy', () => {
            $('body').css({overflow: ''});
        });
        $('body').css({overflow: 'hidden'});

        this.singlePreviewPosition = {x: 0, offset: 10, side: 'none'};
    }

    fetchTool() {
        this.loadingTool = true;
        this.toolRequest = this.toolService.getToolRun(this.toolId);
        this.toolRequest.then(tool => {
            this.tool = tool;
            this.toolName = this.tool.name;
            this.loadingTool = false;
        }, err => {
            this.$log.error('There was an error fetching your tool', err);
        });
    }

    onGraphComplete(nodes) {
        this.nodeMap = nodes;
    }

    onToolParameterChange(nodeid, project, band, override, renderDef, position) {
        if (project && typeof band === 'number' && band >= 0) {
            this.toolService.updateToolRunSource(this.tool, nodeid, project.id, band);
        }
        if (override) {
            this.toolService.updateToolRunConstant(this.tool, override.id, override);
        }
        if (renderDef) {
            let metadata = this.toolService.getToolRunMetadata(this.tool, renderDef.id);
            this.toolService.updateToolRunMetadata(
                this.tool,
                renderDef.id,
                Object.assign({}, metadata, {
                    renderDefinition: renderDef.value
                })
            );
        }
        if (position) {
            let metadata = this.toolService.getToolRunMetadata(this.tool, nodeid);
            this.toolService.updateToolRunMetadata(
                this.tool,
                nodeid,
                Object.assign({}, metadata, {
                    positionOverride: position
                })
            );
        }
    }

    saveTool() {
        this.saveInProgress = true;
        this.clearWarning();
        const toolSavePromise = this.toolService.updateToolRun(
            Object.assign(
                {},
                this.tool,
                { id: this.$state.params.toolid, name: this.toolName }
            )
        ).then(() => {
            if (this.isShowingPreview) {
                this.createPreviewLayers();
                this.showPreview(this.previewData);
            }
        }).finally(() => {
            this.applyInProgress = false;
        });
        return toolSavePromise;
    }

    shareNode(nodeId) {
        if (nodeId && this.tool) {
            let node = this.findNodeinToolDefinition(nodeId, this.tool.executionParameters);
            if (node.type === 'projectSrc') {
                this.tokenService.getOrCreateToolMapToken({
                    organizationId: this.tool.organizationId,
                    name: this.tool.title + ' - ' + this.tool.id,
                    project: node.projId
                }).then((mapToken) => {
                    this.publishModal(
                        this.projectService.getProjectLayerURL(
                            node.projId, {mapToken: mapToken.id}
                        )
                    );
                });
            } else {
                this.tokenService.getOrCreateToolMapToken({
                    organizationId: this.tool.organizationId,
                    name: this.tool.title + ' - ' + this.tool.id,
                    toolRun: this.tool.id
                }).then((mapToken) => {
                    this.publishModal(
                        // eslint-disable-next-line max-len
                        `${this.tileServer}/tools/${this.tool.id}/{z}/{x}/{y}?mapToken=${mapToken.id}&node=${nodeId}`
                    );
                });
            }
        }
    }

    publishModal(tileUrl) {
        if (this.activeModal) {
            this.activeModal.dismiss();
        }

        if (tileUrl) {
            this.activeModal = this.$uibModal.open({
                component: 'rfProjectPublishModal',
                resolve: {
                    tileUrl: () => tileUrl,
                    noDownload: () => true,
                    toolTitle: () => this.tool.name
                }
            });
        }
        return this.activeModal;
    }

    fitProjectExtent(project) {
        this.getMap().then(m => {
            m.map.invalidateSize();
            this.mapUtilsService.fitMapToProject(m, project);
        });
    }

    onPreviewClose() {
        this.isShowingPreview = false;
        this.resetPartitionStyles();
        this.$rootScope.$broadcast('lab.resize');
    }

    closePreview() {
        this.isShowingPreview = false;
    }

    setWarning(text) {
        this.warning = text;
    }

    clearWarning() {
        delete this.warning;
    }

    clearTextSelections() {
        if (this.$window.getSelection && this.$window.getSelection().empty) {
            this.$window.getSelection().empty();
        } else if (this.$window.getSelection().removeAllRanges) {
            this.$window.getSelection().removeAllRanges();
        } else if (this.$document.selection) {
            this.$document.selection.empty();
        }
    }

    flattenToolDefinition(toolDefinition) {
        let inQ = [toolDefinition];
        let outQ = [];
        while (inQ.length) {
            let node = inQ.pop();
            outQ.push(node);
            if (node.args) {
                inQ = [
                    ...inQ,
                    ...node.args.map(a => Object.assign({}, a, { parent: node }))
                ];
            }
        }
        return outQ;
    }

    findNodeinToolDefinition(node, toolDefinition) {
        let flattenedToolDefinition = this.flattenToolDefinition(toolDefinition);
        return flattenedToolDefinition.find((n) => n.id === node);
    }

    getNodeUrl(node) {
        let token = this.authService.token();
        if (this.tool) {
            // eslint-disable-next-line max-len
            let toolNode = this.findNodeinToolDefinition(node, this.tool.executionParameters);
            if (toolNode.type === 'projectSrc') {
                return this.projectService.getProjectLayerURL(toolNode.projId, {token: token});
            }
            return `${this.tileServer}/tools/${this.tool.id}/{z}/{x}/{y}
                    ?token=${token}&node=${node}&tag=${new Date().getTime()}`;
        }
        return false;
    }

    updatePreviewLayers() {
        if (!this.previewLayers) {
            this.createPreviewLayers();
        } else if (this.previewLayers.length === 2) {
            this.previewLayers.forEach((l, i) => {
                l.setUrl(this.getNodeUrl(this.previewData[i]));
            });
        } else {
            this.previewLayers[0].setUrl(this.getNodeUrl(this.previewData));
        }
    }

    createPreviewLayers() {
        const layerOptions = {maxZoom: 30};
        if (this.previewLayers) {
            this.previewLayers.forEach(l => l.remove());
        }
        if (this.previewData.constructor === Array) {
            let url0 = this.getNodeUrl(this.previewData[0]);
            let url1 = this.getNodeUrl(this.previewData[1]);
            if (url0 && url1) {
                this.previewLayers = [
                    L.tileLayer(url0, layerOptions),
                    L.tileLayer(url1, layerOptions)
                ];
            }
        } else {
            let url0 = this.getNodeUrl(this.previewData);
            if (url0) {
                this.previewLayers = [L.tileLayer(url0, layerOptions)];
            }
        }
    }

    addFrames() {
        if (!this.frameControl) {
            this.frameControl = L.control.frames({});
        }

        if (!this.frameControlAdded) {
            this.frameControlAdded = true;
            this.getMap().then((m) => {
                this.frameControl.addTo(m.map);
                let frame = this.frameControl.getFrame();
                let mapSize = m.map.getSize();
                frame.dimensions = Object.assign(
                    frame.dimensions,
                    {width: mapSize.x, height: mapSize.y}
                );
                this.leftFrame = new FrameView();
                this.leftFrame.dimensions = {
                    x: 0, y: 0,
                    width: mapSize.x / 2,
                    height: mapSize.y
                };
                this.leftFrame.children = [this.previewLayers[0]];
                this.rightFrame = new FrameView();
                this.rightFrame.dimensions = {
                    x: mapSize.x / 2, y: 0,
                    width: mapSize.x / 2,
                    height: mapSize.y
                };
                this.rightFrame.children = [this.previewLayers[1]];
                frame.children = [this.leftFrame, this.rightFrame];
                this.dividerPosition = 0.5;
                frame.onUpdate = (dividers) => {
                    let currentPosition = this.dividerPosition;
                    this.dividerPosition = dividers.length ? dividers[0].position : 0;
                    if (this.dividerPosition !== currentPosition) {
                        this.$scope.$evalAsync();
                    }
                };
            });
        } else {
            this.leftFrame.children = [this.previewLayers[0]];
            this.rightFrame.children = [this.previewLayers[1]];
        }
    }

    showPreview(data) {
        let defaultSplit = 40;
        if (!this.tool) {
            return;
        }

        if (!this.isShowingPreview) {
            this.isShowingPreview = true;
            this.splitPercentX = this.splitPercentX || defaultSplit;
            this.setPartitionStyles(this.splitPercentX);
        }

        if (data) {
            this.previewData = data;
            this.createPreviewLayers();
            if (this.previewLayers) {
                this.generatedPreview = true;
                this.getMap().then(m => {
                    this.previewLayers.forEach(l => l.addTo(m.map));
                    if (data instanceof Array) {
                        this.addFrames();
                    } else if (this.frameControl) {
                        this.frameControl.remove();
                        this.frameControlAdded = false;
                    }
                    if (!this.alreadyPreviewed) {
                        this.alreadyPreviewed = true;
                        this.$timeout(() => {
                            let s = this.toolService.generateSourcesFromTool(this.tool);
                            let firstSourceId = Object.keys(s)[0];
                            this.projectService.fetchProject(s[firstSourceId].projId).then(p => {
                                this.fitProjectExtent(p);
                            });
                        });
                    }
                });
            }
        }
    }

    setPartitionStyles(percentRatio) {
        this.showMap = percentRatio > 10;
        this.showDiagram = percentRatio < 90;
        if (percentRatio >= 0 && percentRatio <= 100) {
            this.labLeftStyle = {width: `${percentRatio}%`};
            this.labRightStyle = {width: `${100 - percentRatio}%`};
            this.resizeHandleStyle = {left: `${percentRatio}%`};
        }
        this.getMap().then((mapWrapper) => {
            this.$timeout(() => {
                mapWrapper.map.invalidateSize();
            }, 100);
        });
        this.$rootScope.$broadcast('lab.resize');
    }

    resetPartitionStyles() {
        this.labLeftStyle = {};
        this.labRightStyle = {};
        this.resizeHandleStyle = {};

        this.getMap().then((mapWrapper) => {
            this.$timeout(() => {
                mapWrapper.map.invalidateSize();
            }, 100);
        });
    }

    startLabSplitDrag(event) {
        if (this.labResizing) {
            this.resizeStopListener();
        }
        this.labResizing = true;
        this.resizeMoveListener = (resizeEvent) => {
            this.clearTextSelections();

            this.splitPercentX = resizeEvent.pageX / this.$element.width() * 100;
            if (this.splitPercentX > 80) {
                if (this.splitPercentX > 90) {
                    this.labResizingStyle = {
                        left: '95%',
                        width: '10%'
                    };
                } else {
                    this.splitPercentX = 80;
                    this.labResizingStyle = {
                        left: `${this.splitPercentX}%`,
                        // eslint-disable-next-line no-undefined
                        width: undefined
                    };
                }
            } else if (this.splitPercentX < 20) {
                if (this.splitPercentX < 10) {
                    this.labResizingStyle = {
                        left: '5%',
                        width: '10%'
                    };
                } else {
                    this.splitPercentX = 20;
                    this.labResizingStyle = {
                        left: `${this.splitPercentX}%`,
                        // eslint-disable-next-line no-undefined
                        width: undefined
                    };
                }
            } else {
                this.labResizingStyle = {
                    left: `${this.splitPercentX}%`,
                    // eslint-disable-next-line no-undefined
                    width: undefined
                };
            }
            this.$scope.$evalAsync();
        };
        this.resizeStopListener = (resizeStopEvent) => {
            this.$element.off('mousemove', this.resizeMoveListener);
            this.$element.off('mouseup', this.resizeStopListener);
            this.labResizing = false;
            this.$scope.$evalAsync();

            if (resizeStopEvent.pageX) {
                this.splitPercentX = resizeStopEvent.pageX / this.$element.width() * 100;
                if (this.splitPercentX > 80) {
                    if (this.splitPercentX > 90) {
                        this.splitPercentX = 100;
                        this.setPartitionStyles(100);
                    } else {
                        this.splitPercentX = 80;
                        this.setPartitionStyles(this.splitPercentX);
                    }
                } else if (this.splitPercentX < 20) {
                    if (this.splitPercentX < 10) {
                        this.splitPercentX = 0;
                        this.setPartitionStyles(0);
                    } else {
                        this.splitPercentX = 20;
                        this.setPartitionStyles(this.splitPercentX);
                    }
                } else {
                    this.setPartitionStyles(this.splitPercentX);
                }
            }
            this.$element.css({
                // eslint-disable-next-line no-undefined
                'user-select': undefined,
                cursor: 'auto'
            });
            this.labResizingStyle = {
                // eslint-disable-next-line no-undefined
                width: undefined
            };
        };
        this.$element.css({
            'user-select': 'none',
            'cursor': 'col-resize'
        });
        this.resizeMoveListener(event);
        this.$element.on('mousemove', this.resizeMoveListener);
        this.$element.on('mouseup', this.resizeStopListener);
    }

    get leftPreviewSelection() {
        return Array.isArray(this.previewData) && this.previewData[0];
    }

    get leftPreviewPosition() {
        if (!this._leftPreviewPosition || this._leftPreviewPosition.x !== this.dividerPosition) {
            this._leftPreviewPosition = {x: this.dividerPosition, offset: 10, side: 'left'};
        }
        return this._leftPreviewPosition;
    }

    get rightPreviewSelection() {
        return Array.isArray(this.previewData) && this.previewData[1];
    }

    get rightPreviewPosition() {
        if (!this._rightPreviewPosition || this._rightPreviewPosition.x !== this.dividerPosition) {
            this._rightPreviewPosition = {x: this.dividerPosition, offset: 10, side: 'right'};
        }
        return this._rightPreviewPosition;
    }

    get singlePreviewSelection() {
        return this.previewData;
    }

    onNodeClose(side) {
        this.previewData = this.previewData[side === 'left' ? 1 : 0];
        this.showPreview(this.previewData);
    }

    onGraphComplete(nodes) {
        this.nodeMap = nodes;
    }

    onLeftSelect(id) {
        this.previewData[0] = id;
        this.showPreview(this.previewData);
    }

    onRightSelect(id) {
        this.previewData[1] = id;
        this.showPreview(this.previewData);
    }

    onSingleSelect(id) {
        this.previewData = id;
        this.showPreview(this.previewData);
    }

    onLeftClose() {
        this.previewData = this.previewData[1];
        this.showPreview(this.previewData);
    }

    onRightClose() {
        this.previewData = this.previewData[0];
        this.showPreview(this.previewData);
    }

    onSingleClose() {
        this.onPreviewClose();
    }
}


export default angular.module('pages.lab.tool', [])
    .controller('LabToolController', LabToolController);