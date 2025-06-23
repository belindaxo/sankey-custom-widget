(function () {
    /**
     * Template for the Styling Panel (APS) of the Funnel3D widget.
     */
    let template = document.createElement('template');
    template.innerHTML = `
        <form id="form">
        <legend style="font-weight: bold;font-size: 18px;"> Font </legend>
        <table>
            <tr>
                <td>Chart Title</td>
            </tr>
            <tr>
                <td><input id="chartTitle" type="text"></td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Font Style</td>
                        <td>Alignment</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="titleSize">
                                <option value="10px">10</option>
                                <option value="12px">12</option>
                                <option value="14px">14</option>
                                <option value="16px">16</option>
                                <option value="18px" selected>18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <select id="titleFontStyle">
                                <option value="normal">Normal</option>
                                <option value="bold" selected>Bold</option>
                            </select>
                        </td>
                        <td>
                            <select id="titleAlignment">
                                <option value="left" selected>Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input id="titleColor" type="color" value="#004B8D">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <table>
            <tr>
                <td>Chart Subtitle</td>
            </tr>
            <tr>
                <td><input id="chartSubtitle" type="text"></td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Font Style</td>
                        <td>Alignment</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="subtitleSize">
                                <option value="10px">10</option>
                                <option value="11px" selected>11</option>
                                <option value="12px">12</option>
                                <option value="14px">14</option>
                                <option value="16px">16</option>
                                <option value="18px">18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <select id="subtitleFontStyle">
                                <option value="normal" selected>Normal</option>
                                <option value="italic">Italic</option>
                            </select>
                        </td>
                        <td>
                            <select id="subtitleAlignment">
                                <option value="left" selected>Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input id="subtitleColor" type="color" value="#000000">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <legend style="font-weight: bold;font-size: 18px;"> Number Formatting </legend>
        <table>
            <tr>
                <td>Scale Format</td>
            </tr>
            <tr>
                <td>
                    <select id="scaleFormat">
                        <option value="unformatted" selected>Unformatted</option>
                        <option value="k">Thousands (k)</option>
                        <option value="m">Millions (m)</option>
                        <option value="b">Billions (b)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Decimal Places</td>
            </tr>
            <tr>
                <td>
                    <select id="decimalPlaces">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2" selected>2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </td>
            </tr>
        </table>
        <legend style="font-weight: bold; font-size: 18px;">Sankey Chart Properties</legend>
        <table>
            <tr>
                <td>
                    <input id="isInverted" type="checkbox">
                    <label for="isInverted">Invert chart</label>
                </td>
            </tr>
            <tr>
                <td>Link Color Mode</td>
            </tr>
            <tr>
                <td>
                    <select id="linkColorMode">    
                        <option value="from" selected>From</option>
                        <option value="to">To</option>
                        <option value="gradient">Gradient</option>
                </td>
            </tr>
        </table>
        <tr>
            <button id="resetDefaults" type="button" style="margin-top: 10px; margin-bottom: 10px;">Reset to Default</button>
        </tr>
        <legend style="font-weight: bold; font-size: 18px;">Link Definitions</legend>
        <tr>
            <td>Center Node:</td>
        </tr>
        <tr>
            <td><input id="centerNode" type="text" placeholder="e.g. Revenue" /></td>
        </tr>
        <div id="linksContainer" style="margin-bottom: 10px;"></div>
        <button type="button" id="addLinkButton">+ Add Link</button>
        <input type="submit" style="display:none;">
        </form>
    `;

    /**
     * Custom Web Component for the Styling Panel (APS) of the Funnel3D widget.
     * @extends HTMLElement
     */
    class SankeyAps extends HTMLElement {
        /**
         * Initializes the shadow DOM and sets up event listeners for form inputs.
         */
        constructor() {
            super();

            const DEFAULTS = {
                chartTitle: '',
                titleSize: '16px',
                titleFontStyle: 'bold',
                titleAlignment: 'left',
                titleColor: '#004B8D',
                chartSubtitle: '',
                subtitleSize: '11px',
                subtitleFontStyle: 'normal',
                subtitleAlignment: 'left',
                subtitleColor: '#000000',
                scaleFormat: 'unformatted',
                decimalPlaces: '2',
                isInverted: false,
                linkColorMode: 'from'
            }

            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this.manualLinks = [];

            const linksContainer = this._shadowRoot.getElementById('linksContainer');
            const addLinkButton = this._shadowRoot.getElementById('addLinkButton');

            const renderLinksTable = () => {
                linksContainer.innerHTML = '';
                this.manualLinks.forEach((link, index) => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.marginBottom = '6px';

                    const fromSelect = document.createElement('select');
                    fromSelect.style.marginRight = '6px';

                    this.validMeasureNames?.forEach(measure => {
                        const option = document.createElement('option');
                        option.value = measure;
                        option.textContent = measure;
                        if (measure === link.from) {
                            option.selected = true;
                        }
                        fromSelect.appendChild(option);
                    })

                    fromSelect.addEventListener('change', () => {
                        this.manualLinks[index].from = fromSelect.value;
                        this.manualLinks = [...this.manualLinks]; // Trigger reactivity
                        this._submit(new Event('submit'));
                    });

                    const toSelect = document.createElement('select');
                    toSelect.style.marginRight = '6px';

                    this.validMeasureNames?.forEach(measure => {
                        const option = document.createElement('option');
                        option.value = measure;
                        option.textContent = measure;
                        if (measure === link.to) {
                            option.selected = true;
                        }
                        toSelect.appendChild(option);
                    });

                    toSelect.addEventListener('change', () => {
                        this.manualLinks[index].to = toSelect.value;
                        this.manualLinks = [...this.manualLinks]; // Trigger reactivity
                        this._submit(new Event('submit'));
                    });

                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.type = 'button';
                    removeButton.addEventListener('click', () => {
                        this.manualLinks.splice(index, 1);
                        this.manualLinks = [...this.manualLinks]; // Trigger reactivity
                        renderLinksTable();
                        this._submit(new Event('submit'));
                    });

                    row.appendChild(fromSelect);
                    row.appendChild(toSelect);
                    row.appendChild(removeButton);
                    linksContainer.appendChild(row);
                });
            };

            addLinkButton.addEventListener('click', () => {
                this.manualLinks.push({ from: '', to: '' });
                renderLinksTable();
                this._submit(new Event('submit'));
            });

            this._shadowRoot.getElementById('form').addEventListener('submit', this._submit.bind(this));
            this._shadowRoot.getElementById('titleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleFontStyle').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleAlignment').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleFontStyle').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleAlignment').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('scaleFormat').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('decimalPlaces').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('isInverted').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('linkColorMode').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('centerNode').addEventListener('change', this._submit.bind(this));

            // Reset button logic
            this._shadowRoot.getElementById('resetDefaults').addEventListener('click', () => {
                for (const key in DEFAULTS) {
                    if (key === 'chartTitle' || key === 'chartSubtitle') {
                        continue; // Skip these fields
                    }

                    const element = this._shadowRoot.getElementById(key);
                    if (!element) continue; // Skip if element not found

                    if (typeof DEFAULTS[key] === 'boolean') {
                        element.checked = DEFAULTS[key];
                    } else {
                        element.value = DEFAULTS[key];
                    }
                }
                this._submit(new Event('submit')); // Trigger submit event to update properties
            });

            this._renderLinksTable = renderLinksTable;
            this._renderLinksTable();
        }

        /**
         * Handles the form submissions and dispatches a 'propertiesChanged' event.
         * @param {Event} e - The form submission event.
         */
        _submit(e) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('propertiesChanged', {
                detail: {
                    properties: {
                        chartTitle: this.chartTitle,
                        titleSize: this.titleSize,
                        titleFontStyle: this.titleFontStyle,
                        titleAlignment: this.titleAlignment,
                        titleColor: this.titleColor,
                        chartSubtitle: this.chartSubtitle,
                        subtitleSize: this.subtitleSize,
                        subtitleFontStyle: this.subtitleFontStyle,
                        subtitleAlignment: this.subtitleAlignment,
                        subtitleColor: this.subtitleColor,
                        scaleFormat: this.scaleFormat,
                        decimalPlaces: this.decimalPlaces,
                        isInverted: this.isInverted,
                        linkColorMode: this.linkColorMode,
                        centerNode: this.centerNode,
                        manualLinks: this.manualLinks,
                        validMeasureNames: this.validMeasureNames
                    }
                }
            }));
        }

        // Getters and setters for each property

        // Font properties
        get chartTitle() {
            return this._shadowRoot.getElementById('chartTitle').value;
        }

        set chartTitle(value) {
            this._shadowRoot.getElementById('chartTitle').value = value;
        }

        get titleSize() {
            return this._shadowRoot.getElementById('titleSize').value;
        }

        set titleSize(value) {
            this._shadowRoot.getElementById('titleSize').value = value;
        }

        get titleFontStyle() {
            return this._shadowRoot.getElementById('titleFontStyle').value;
        }

        set titleFontStyle(value) {
            this._shadowRoot.getElementById('titleFontStyle').value = value;
        }

        get titleAlignment() {
            return this._shadowRoot.getElementById('titleAlignment').value;
        }

        set titleAlignment(value) {
            this._shadowRoot.getElementById('titleAlignment').value = value;
        }

        get titleColor() {
            return this._shadowRoot.getElementById('titleColor').value;
        }

        set titleColor(value) {
            this._shadowRoot.getElementById('titleColor').value = value;
        }

        get chartSubtitle() {
            return this._shadowRoot.getElementById('chartSubtitle').value;
        }

        set chartSubtitle(value) {
            this._shadowRoot.getElementById('chartSubtitle').value = value;
        }

        get subtitleSize() {
            return this._shadowRoot.getElementById('subtitleSize').value;
        }

        set subtitleSize(value) {
            this._shadowRoot.getElementById('subtitleSize').value = value;
        }

        get subtitleFontStyle() {
            return this._shadowRoot.getElementById('subtitleFontStyle').value;
        }

        set subtitleFontStyle(value) {
            this._shadowRoot.getElementById('subtitleFontStyle').value = value;
        }

        get subtitleAlignment() {
            return this._shadowRoot.getElementById('subtitleAlignment').value;
        }

        set subtitleAlignment(value) {
            this._shadowRoot.getElementById('subtitleAlignment').value = value;
        }

        get subtitleColor() {
            return this._shadowRoot.getElementById('subtitleColor').value;
        }

        set subtitleColor(value) {
            this._shadowRoot.getElementById('subtitleColor').value = value;
        }

        // Number formatting properties
        get scaleFormat() {
            return this._shadowRoot.getElementById('scaleFormat').value;
        }

        set scaleFormat(value) {
            this._shadowRoot.getElementById('scaleFormat').value = value;
        }

        get decimalPlaces() {
            return this._shadowRoot.getElementById('decimalPlaces').value;
        }

        set decimalPlaces(value) {
            this._shadowRoot.getElementById('decimalPlaces').value = value;
        }

        // Sankey chart properties
        get isInverted() {
            return this._shadowRoot.getElementById('isInverted').checked;
        }

        set isInverted(value) {
            this._shadowRoot.getElementById('isInverted').checked = value;
        }

        get linkColorMode() {
            return this._shadowRoot.getElementById('linkColorMode').value;
        }

        set linkColorMode(value) {
            this._shadowRoot.getElementById('linkColorMode').value = value;
        }

        get centerNode() {
            return this._shadowRoot.getElementById('centerNode').value;
        }

        set centerNode(value) {
            this._shadowRoot.getElementById('centerNode').value = value;
        }

        get manualLinks() {
            return this._manualLinks || [];
        }

        set manualLinks(value) {
            this._manualLinks = value || [];
            if (this._renderLinksTable) {
                this._renderLinksTable();
            }
        }

        get validMeasureNames() {
            return this._validMeasureNames || [];
        }

        set validMeasureNames(value) {
            console.log("validMeasureNames set to:", value);
            this._validMeasureNames = value || [];
            if (this._renderLinksTable) {
                this._renderLinksTable();
            }
        }

    }
    customElements.define('com-sap-sample-sankey-aps', SankeyAps);
})();