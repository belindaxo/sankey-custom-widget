export function processSankeyData(data, dimensions, measures, manualLinks, centerNode) {
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
            console.log(`Invalid link from "${from}" to "${to}"`);
            return;
        }

        const fromKey = measureKeyMap[from];
        const toKey = measureKeyMap[to];
        if (!fromKey || !toKey) {
            console.log(`Invalid measure key from "${from}" to "${to}"`);
            return;
        }

        let weight;
        if (to === centerNode) {
            weight = data[0]?.[fromKey]?.raw;
        } else if (from === centerNode) {
            weight = data[0]?.[toKey]?.raw;
        } else if (!centerNode) {
            weight = data[0]?.[fromKey]?.raw;
        } else {
            weight = data[0]?.[fromKey]?.raw;
        }

        if (typeof weight !== 'number') return;

        const mapKey = `${from}-${to}`;
        linkMap.set(mapKey, { from, to, weight });
        usedMeasureNames.add(from);
        usedMeasureNames.add(to);
    });

    const nodes = Array.from(usedMeasureNames).map(label => ({
        id: label,
        name: label
    }));

    const links = Array.from(linkMap.values());

    console.log("Center node:", centerNode);
    console.log("Final links:", links);

    return { nodes, links };
}