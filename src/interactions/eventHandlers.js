export function handlePointClick(event, dataBinding, measures, widget) {
    const point = event.target;
    if (!point) {
        return;
    }

    const clickedLabel = point.isNode ? point.name : point.to;
    const clickedMeasure = measures.find(m => m.label === clickedLabel);

    if (!clickedMeasure) {
        console.log(`Clicked measure "${clickedLabel}" not found in measures.`);
        return;
    }

    const measureId = clickedMeasure.id;
    const measureMemberId = clickedMeasure.memberId;

    console.log(`Clicked measure: ${clickedMeasure.label}, ID: ${measureId}, Member ID: ${measureMemberId}`);

    const selection = { [measureId]: measureMemberId };

    const linkedAnalysis = widget.databindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedPoint && widget._selectedPoint !== point) {
        linkedAnalysis.removeFilters();
        widget._selectedPoint.select(false, false)
        widget._selectedPoint = null;
    }

    if (point.selected) {
        linkedAnalysis.setFilters(selection);
        widget._selectedPoint = point;
    } else {
        linkedAnalysis.removeFilters();
        widget._selectedPoint = null;
    }

}