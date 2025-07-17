export function processSankeyData(data, dimensions, measures, manualLinks, centerNode) {
    const measureKeyMap = {};
    measures.forEach(m => {
        measureKeyMap[m.label] = m.key;
    });

    const usedMeasureNames = new Set();
    const linkMap = new Map();

    function getDownstreamNodes(start, links) {
        const visited = new Set();
        const queue = [start];

        while (queue.length > 0) {
            const current = queue.shift();
            visited.add(current);

            links.forEach(link => {
                if (link.from?.trim() === current && !visited.has(link.to?.trim())) {
                    queue.push(link.to.trim());
                }
            });
        }

        visited.delete(start); 
        return visited;
    }

    const centerDownstreamNodes = getDownstreamNodes(centerNode, manualLinks);

    manualLinks.forEach(link => {
        const from = link.from?.trim();
        const to = link.to?.trim();
        if (!from || !to) {
            console.log('Invalid link detected, skipping: ', link);
            return;
        }

        const fromKey = measureKeyMap[from];
        const toKey = measureKeyMap[to];
        // if (!fromKey || !toKey) {
        //     console.log('Invalid measure in link, skipping: ', link);
        //     return;
        // }

        let weight;
        if (to === centerNode) {
            weight = data[0]?.[fromKey]?.raw;
        } else if (from === centerNode) {
            weight = data[0]?.[toKey]?.raw;
        } else if (centerDownstreamNodes.has(from)) {
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
    console.log("Downstream of center:", [...centerDownstreamNodes]);
    console.log("Final links:", links);

    return { nodes, links };
}

