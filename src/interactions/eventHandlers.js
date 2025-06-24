/**
 * Event handler for point click events.
 * @param {Object} event - The event object containing the click event.
 * @param {Object} linkedAnalysis - The linked analysis object.
 * @param {Array} measures - Array of measure objects.
 * @param {Object} widget - Reference to the widget ('this', in context).
 */
export function handlePointClick(event, linkedAnalysis, measures, widget) {
    const point = event.target;
    if (!point) {
        console.log('Point is undefined');
        return;
    }

    const clickedLabel = point.to;
    const selectedItem = measures.find(m => m.label === clickedLabel);
    console.log('Clicked label:', clickedLabel);
    console.log('Selected item:', selectedItem);
    const measureKey = selectedItem.key;
    const measureId = selectedItem.id;

    if (widget._selectedPoint && widget._selectedPoint !== point) {
        linkedAnalysis.removeFilters();
        widget._selectedPoint.select(false, false);
        widget._selectedPoint = null;
    }

    if (event.type === 'select') {
        if (selectedItem) {
            const selection = {};
            selection[selectedItem.key] = selectedItem.id;
            linkedAnalysis.setFilters(selection);
            widget._selectedPoint = point;
        }
    } else if (event.type === 'unselect') {
        linkedAnalysis.removeFilters();
        widget._selectedPoint = null;
    }

}