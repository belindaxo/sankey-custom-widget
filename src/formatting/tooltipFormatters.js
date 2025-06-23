import * as Highcharts from 'highcharts';
/**
 * 
 * @param {Function} scaleFormat - A function to scale and format the value.
 * @returns {Function} A function that formats the tooltip for the point.
 */
export function formatTooltipPoint(scaleFormat) {
    return function () {
        console.log(this);
        if (this) {
            const { scaledValue, valueSuffix } = scaleFormat(this.weight);
            const value = Highcharts.numberFormat(scaledValue, -1, '.', ',');
            const valueWithSuffix = `${value} ${valueSuffix}`;
            const fromNodeName = this.from;
            const toNodeName = this.to;
            return `
                        ${fromNodeName} \u2192 ${toNodeName}: ${valueWithSuffix}
                    `;
        } else {
            return 'Error with data';
        }
    }
}

/**
 * 
 * @param {Function} scaleFormat - A function to scale and format the value.
 * @returns {Function} A function that formats the tooltip for the node.
 */
export function formatTooltipNode(scaleFormat) {
    return function () {
        if (this) {
            const { scaledValue, valueSuffix } = scaleFormat(this.sum);
            const value = Highcharts.numberFormat(scaledValue, -1, '.', ',');
            const valueWithSuffix = `${value} ${valueSuffix}`;
            const name = this.name;
            return `
                        ${name}: ${valueWithSuffix}
                    `;
        } else {
            return 'Error with data';
        }
    }
}
