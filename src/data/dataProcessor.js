export function processSankeyData(data, dimensions, measures, manualLinks) {
    const measureKeyMap = {};
    measures.forEach(m => {
        measureKeyMap[m.label] = m.key;
    });

    const fromSet = new Set();
    const toSet = new Set();
    const usedMeasureNames = new Set();

    // Step 1: Build from/to sets to determine center nodes
    manualLinks.forEach(link => {
        const from = link.from?.trim();
        const to = link.to?.trim();
        if (from) fromSet.add(from);
        if (to) toSet.add(to);
    });

    const centerNodes = new Set([...fromSet].filter(name => toSet.has(name)));

    const linkMap = new Map();
    const countedFromNodes = new Set();

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

        // Determine weight
        let weight;

        const isCenter = centerNodes.has(from);
        const hasBeenCounted = countedFromNodes.has(from);

        if (isCenter && hasBeenCounted) {
            // Center node has already been counted → switch to to node's value
            weight = data[0]?.[toKey]?.raw;
        } else {
            // Otherwise, use from node's value and mark it counted
            weight = data[0]?.[fromKey]?.raw;
            if (isCenter) countedFromNodes.add(from);
        }

        if (typeof weight !== 'number') {
            console.log("Invalid weight value for link:", link);
            return;
        }

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

    console.log("Center nodes:", [...centerNodes]);
    console.log("Final links:", links);

    return { nodes, links };
}
