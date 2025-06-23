/**
 * Determines subtitle text based on scale format or user input.
 * @param {string} chartSubtitle - The user-defined subtitle for the chart.
 * @param {string} scaleFormat - The scale format used in the chart (e.g., 'k', 'm', 'b').
 * @returns {string} The subtitle text.
 */
export function updateSubtitle(chartSubtitle, scaleFormat) {
    if (chartSubtitle || chartSubtitle.trim() === '') {
        let subtitleText = '';
        switch (scaleFormat) {
            case 'k':
                subtitleText = 'in k';
                break;
            case 'm':
                subtitleText = 'in m';
                break;
            case 'b':
                subtitleText = 'in b';
                break;
            default:
                subtitleText = '';
                break;
        }
        return subtitleText;
    } else {
        return chartSubtitle;
    }
}