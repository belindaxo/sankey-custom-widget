export function processSankeyData(data, dimensions, measures, manualLinks) {
    const measureKeyMap = {};
    measures.forEach(m => {
        measureKeyMap[m.label] = m.key;
    });

    const usedMeasureNames = new Set();
    const linkMap = new Map();

    manualLinks.forEach(link => {
        const from = link.from?.trim();
        const to = link.to?.trim();

        if (!from || !to) {
            console.log("Invalid link detected, skipping:", link);
            return;
        }
        const fromKey = measureKeyMap[from];
        const toKey = measureKeyMap[to];

        if (!fromKey || !toKey) {
            console.log("Invalid measure in link, skipping:", link);
            return;
        }

        let total = 0;
        data.forEach(row => {
            const value = row[fromKey]?.raw;
            if (typeof value === 'number') {
                total += value;
            }
        });

        const mapKey = `${from}-${to}`;
        linkMap.set(mapKey, { from, to, weight: total });

        usedMeasureNames.add(from);
        usedMeasureNames.add(to);
    });

    const nodes = Array.from(usedMeasureNames).map(label => ({
        id: label,
        name: label
    }));

    const links = Array.from(linkMap.values());

    return { nodes, links };
}