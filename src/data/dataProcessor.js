export function processSankeyData(data, dimensions, measures, manualLinks, centerNode) {
    const measureKeyMap = {};
    measures.forEach(m => {
        measureKeyMap[m.label] = m.key;
    });

    const usedMeasureNames = new Set();
    const linkMap = new Map();

    const centerTargets = new Set();
    
    // Find nodes directly connected to the center node
    manualLinks.forEach(link => {
        if (link.from?.trim() === centerNode) {
            centerTargets.add(link.to?.trim());
        }
    });

    manualLinks.forEach(link => {
        const from = link.from?.trim();
        const to = link.to?.trim();
        if (!from || !to) {
            console.log('Invalid link detected, skipping: ', link);
            return;
        }

        const fromKey = measureKeyMap[from];
        const toKey = measureKeyMap[to];
        if (!fromKey || !toKey) {
            console.log('Invalid measure in link, skipping: ', link);
            return;
        }

        let weight;
        if (to === centerNode) {
            weight = data[0]?.[fromKey]?.raw;
        } else if (from === centerNode || centerTargets.has(from)) {
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
    console.log("Center node targets:", [...centerTargets]);
    console.log("Final links:", links);

    return { nodes, links };
}