import * as Highcharts from 'highcharts';
import 'highcharts/modules/sankey';
import { parseMetadata } from './data/metadataParser';
import { processSankeyData } from './data/dataProcessor';
import { applyHighchartsDefaults } from './config/highchartsSetup';
import { createChartStylesheet } from './config/styles';
import { updateSubtitle } from './config/chartUtils';
import { scaleValue } from './formatting/scaleFormatter';
import { formatTooltipPoint, formatTooltipNode } from './formatting/tooltipFormatters';
import { handlePointClick } from './interactions/eventHandlers';

(function () {

    /**
     * Custom Web Component for rendering a Sankey Chart in SAP Analytics Cloud.
     * @extends HTMLElement
     */
    class Sankey extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this.nodes = [];
            this.links = [];

            // Apply the stylesheet to the shadow DOM
            this.shadowRoot.adoptedStyleSheets = [createChartStylesheet()];

            // Add the container for the chart
            this.shadowRoot.innerHTML = `
                <div id="container"></div>    
            `;

            this._lastSentMeasures = [];
            this._selectedPoint = null;
        }

        /**
         * Called when the widget is resized.
         * @param {number} width - New width of the widget.
         * @param {number} height - New height of the widget.
         */
        onCustomWidgetResize(width, height) {
            this._renderChart();
        }

        /**
         * Called after widget properties are updated.
         * @param {Object} changedProperties - Object containing changed attributes.
         */
        onCustomWidgetAfterUpdate(changedProperties) {
            this._renderChart();
        }

        /**
         * Called when the widget is destroyed. Cleans up chart instance.
         */
        onCustomWidgetDestroy() {
            if (this._chart) {
                this._chart.destroy();
                this._chart = null;
            }
            this._selectedPoint = null;
        }

        /**
         * Specifies which attributes should trigger re-rendering on change.
         * @returns {string[]} An array of observed attribute names.
         */
        static get observedAttributes() {
            return [
                'chartTitle', 'titleSize', 'titleFontStyle', 'titleAlignment', 'titleColor',                // Title properties
                'chartSubtitle', 'subtitleSize', 'subtitleFontStyle', 'subtitleAlignment', 'subtitleColor', // Subtitle properties
                'scaleFormat', 'decimalPlaces',                                                             // Number formatting properties
                'isInverted', "linkColorMode", "manualLinks", "centerNode",                                 // Sankey chart properties
                'customColors'                                                                              // Custom colors
            ];
        }

        /**
        * Called when an observed attribute changes.
        * @param {string} name - The name of the changed attribute.
        * @param {string} oldValue - The old value of the attribute.
        * @param {string} newValue - The new value of the attribute.
        */
        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue) {
                this[name] = newValue;
                this._renderChart();
            }
        }

        /**
         * Renders the chart using the provided data and metadata.
         */
        _renderChart() {
            // Initialization
            const dataBinding = this.dataBinding;
            if (!dataBinding || dataBinding.state !== 'success' || !dataBinding.data || dataBinding.data.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedPoint = null;
                }
                return;
            }
            console.log('dataBinding:', dataBinding);

            
            // Data Extraction and Validation
            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);

            if (dimensions.length === 0 || measures.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedPoint = null;
                }
                return;
            }
            console.log('data:', data);
            console.log('metadata:', metadata);
            console.log('dimensions:', dimensions);
            console.log('measures:', measures);


            // Series Data Preparation
            const { nodes, links } = processSankeyData(data, dimensions, measures, this.manualLinks, this.centerNode || []);
            this.nodes = nodes;
            this.links = links;
            console.log('Processed nodes:', nodes);
            console.log('Processed links:', links);

            const validMeasureNames = measures.map(m => m.label) || [];
            if (JSON.stringify(this._lastSentMeasures) !== JSON.stringify(validMeasureNames)) {
                this._lastSentMeasures = validMeasureNames;
                this.dispatchEvent(new CustomEvent('propertiesChanged', {
                    detail: {
                        properties: {
                            validMeasureNames
                        }
                    }
                }));
            }


            // Formatters and Chart Options
            const scaleFormat = (value) => scaleValue(value, this.scaleFormat, this.decimalPlaces);
            const subtitleText = updateSubtitle(this.chartSubtitle, this.scaleFormat);
            const linkedAnalysis = this.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

            const onPointClick = (event) => handlePointClick(event, linkedAnalysis, measures, this);


            // Series Styling
            const customColors = this.customColors || [];
            const colorMap = new Map(customColors.map(c => [c.category, c.color]));
            nodes.forEach(node => {
                if (colorMap.has(node.name)) {
                    node.color = colorMap.get(node.name);
                }
            });


            // Global Configurations
            applyHighchartsDefaults();


            // Chart Options Construction
            const chartOptions = {
                chart: {
                    type: 'sankey',
                    style: {
                        fontFamily: "'72', sans-serif"
                    },
                    inverted: this.isInverted || false
                },
                title: {
                    text: this.chartTitle || "",
                    align: this.titleAlignment || "left",
                    style: {
                        fontSize: this.titleSize || "16px",
                        fontWeight: this.titleFontStyle || "bold",
                        color: this.titleColor || "#004B8D",
                    },
                },
                subtitle: {
                    text: subtitleText,
                    align: this.subtitleAlignment || "left",
                    style: {
                        fontSize: this.subtitleSize || "11px",
                        fontStyle: this.subtitleFontStyle || "normal",
                        color: this.subtitleColor || "#000000",
                    },
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    headerFormat: null,
                    pointFormatter: formatTooltipPoint(scaleFormat),
                    nodeFormatter: formatTooltipNode(scaleFormat),
                },
                plotOptions: {
                    series: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'normal'
                            }
                        },
                        point: {
                            events: {
                                select: onPointClick,
                                unselect: onPointClick
                            }
                        }
                    }
                },
                series: [{
                    keys: ['from', 'to', 'weight'],
                    nodes: nodes,
                    data: links,
                    type: 'sankey',
                    linkColorMode: this.linkColorMode || 'to',
                }]
            };
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }


        // SAC Scripting Methods
        getNodes() {
            return this.nodes;
        }

        getLinks() {
            return this.links;
        }
    }
    customElements.define('com-sap-sample-sankey', Sankey);
})();