/**
 * Event handler for point click events.
 * @param {Object} event - The event object containing the click event.
 * @param {Object} dataBinding - The data binding object containing the data.
 * @param {Array} measures - Array of measure objects.
 * @param {Object} widget - Reference to the widget ('this', in context).
 */
export function handlePointClick(event, dataBinding, measures, widget) {
    const point = event.target;
    if (!point) {
        return;
    }

    const clickedLabel = point.to;
    const clickedMeasure = measures.find(m => m.label === clickedLabel);

    if (!clickedMeasure) {
        console.log(`Clicked measure "${clickedLabel}" not found in measures.`);
        return;
    }

    const measureId = clickedMeasure.id;
    const measureMemberId = clickedMeasure.key;

    console.log(`Clicked measure: ${clickedMeasure.label}, ID: ${measureId}, Member ID: ${measureMemberId}`);

    const selection = { [measureId]: measureMemberId };

    const linkedAnalysis = widget.databindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedPoint && widget._selectedPoint !== point) {
        linkedAnalysis.removeFilters();
        widget._selectedPoint.select(false, false)
        widget._selectedPoint = null;
    }

    if (event.type === 'select') {
        linkedAnalysis.setFilters(selection);
        widget._selectedPoint = point;
    } else if (event.type === 'unselect') {
        linkedAnalysis.removeFilters();
        widget._selectedPoint = null;
    }

}