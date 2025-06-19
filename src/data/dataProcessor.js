export function processSankeyData(data, dimensions, measures, manualLinks) {
    const measureKeyMap = {};
    measures.forEach(m => {
        measureKeyMap[m.label] = m.key;
    });

    const usedMeasureNames = new Set();
    const addedFromNodes = new Set(); // prevent double counting 
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

        let weight = 0;
        if (!addedFromNodes.has(from)) {
            const raw = data[0]?.[fromKey]?.raw;
            if (typeof raw === 'number') {
                weight = raw;
                addedFromNodes.add(from);
            } else {
                console.log(`Invalid or missing raw value for ${from}`);
                return;
            }
        } else {
            weight = 0; // If already added, weight is zero
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
    console.log("Final links (no duplicate weights):", links);

    return { nodes, links };
}