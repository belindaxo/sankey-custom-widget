export function processSankeyData(data, dimensions, measures, manualLinks) {
    const measureKeyMap = {};
    measures.forEach(m => {
        measureKeyMap[m.label] = m.key;
    });

    const usedMeasureNames = new Set();
    const fromSet = new Set();
    const toSet = new Set();

    // Step 1: Identify from/to usage
    manualLinks.forEach(link => {
        const from = link.from?.trim();
        const to = link.to?.trim();
        if (from) fromSet.add(from);
        if (to) toSet.add(to);
    });

    // Step 2: Determine center nodes
    const centerNodes = new Set(
        [...fromSet].filter(name => toSet.has(name))
    );

    const linkMap = new Map();

    manualLinks.forEach(link => {
        const from = link.from?.trim();
        const to = link.to?.trim();

        if (!from || !to) {
            console.log('invalid link detected, skipping:', link);
            return;
        }

        const fromKey = measureKeyMap[from];
        const toKey = measureKeyMap[to];

        if (!fromKey || !toKey) {
            console.log('invalid measure in link, skipping:', link);
            return;
        }

        // Step 3: Determine weight based on center node logic
        let weight;
        if (centerNodes.has(from)) {
            // Center node in 'from' position -> use 'to' value
            weight = data[0]?.[toKey]?.raw;
        } else {
            // All other cases -> use 'from' value
            weight = data[0]?.[fromKey]?.raw;
        }

        if (typeof weight !== 'number') {
            console.log('invalid weight value for link:', link);
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