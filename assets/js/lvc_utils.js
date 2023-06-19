class LVC {
  constructor(numberOfNodes) {
    this.cur_step = 0;
    this.cur_node = 0;
    this.agg_step = null;
    this.globalColorMaps = [];
    this.localColorMaps;
    this.numberOfNodes = numberOfNodes;
    this.graph = jsnx.fastGnpRandomGraph(numberOfNodes, 0.8);
  }

  drawSvgCircle(color) {
    return `
      <svg height="24" width="24">
        <circle cx="12" cy="12" r="9" stroke="black" stroke-width="3" fill="${color}" />
      </svg>`;
  }

  drawGraph(container, colorMap) {
    const nodes = this.graph.nodes().map((id) => ({
      data: {
        id: `${id}`,
        label: `Node${id}`,
        color: colorMap[id] || DEFAULT_NODE_COLOR,
      },
    }));
    const edges = this.graph.edges().map(([source, target]) => ({
      data: {
        id: `${source}-${target}`,
        source,
        target,
      },
    }));
    const cy = cytoscape({
      container, // container to render in
      elements: nodes.concat(edges),
      style: cyGraphStyle,
    });

    const layout = cy.layout({
      name: "circle",
      padding: 30,
      avoidOverlap: true,
      animate: true,
      nodeDimensionsIncludeLabels: true,
    });

    layout.run();
    //   cy.fit(cy.elements(), 200);
    //   cy.panningEnabled(false);
    return cy;
  }

  drawColorMap(container, colorMap) {
    const table = $("<table>");
    container.append(table);

    Object.entries(colorMap).forEach(([nodeId, colors], j) => {
      table.append(
        $("<tr>")
          .append(`<td>Node${nodeId}:</td>`)
          .append(
            $(
              "<td><span class='text'>{ </span>" +
                `<span class="node">${this.drawSvgCircle(colors[0])}</span>` +
                ' <span class="text"> { </span>' +
                colors[1]
                  .map(
                    (color) =>
                      `<span style="color:${color}" class="node">${this.drawSvgCircle(
                        color
                      )}</span> `
                  )
                  .join(" ") +
                " <span class='text'> } } </span>" +
                "</td>"
            )
          )
          .append($(`<td><span class="arrow">&#8594;</span></td>`))
          .append(
            $(
              `<td><span class="node">${this.drawSvgCircle(
                hashNodeColor(colors)
              )}</span></td>`
            )
          )
      );
    });
  }

  walkGraph(cy, cur_node) {
    cy.nodes().data({
      label: "",
    });

    cy.nodes(`#${cur_node}`).style({
      "border-color": "red",
      label: "v0",
    });

    var treeEdges = [];
    var backEdges = [];
    var backEdgesToDiscard = [];
    var visitedNodes = new Set();
    var visitedEdges = new Set();

    cy.elements().breadthFirstSearch({
      root: "#" + cur_node,
      visit: (v, e, u, i) => {
        if (i > 0) {
          v.style("label", `v${i}`);

          var edges = v.connectedEdges().map((e) => e.id());
          edges
            .filter((eid) => eid !== e.id())
            .filter((eid) => !visitedEdges.has(eid))
            .forEach((eid) => {
              var edge = cy.edges(`#${eid}`);
              if (visitedNodes.has(edge.target().id())) {
                let backEdge = {
                  data: {
                    id: `${v.id()}-${edge.target().id()}`,
                    source: v.id(),
                    target: edge.target().id(),
                  },
                };
                if (
                  jsnx.shortestPathLength(this.graph, {
                    source: cur_node,
                    target: Number(v.id()),
                  }) ===
                  jsnx.shortestPathLength(this.graph, {
                    source: cur_node,
                    target: Number(edge.target().id()),
                  })
                ) {
                  backEdgesToDiscard.push(backEdge);
                } else {
                  backEdges.push(backEdge);
                }
              } else if (visitedNodes.has(edge.source().id())) {
                let backEdge = {
                  data: {
                    id: `${v.id()}-${edge.source().id()}`,
                    source: v.id(),
                    target: edge.source().id(),
                  },
                };
                if (
                  jsnx.shortestPathLength(this.graph, {
                    source: cur_node,
                    target: Number(v.id()),
                  }) ===
                  jsnx.shortestPathLength(this.graph, {
                    source: cur_node,
                    target: Number(edge.source().id()),
                  })
                ) {
                  backEdgesToDiscard.push(backEdge);
                } else {
                  backEdges.push(backEdge);
                }
              }
            });
          treeEdges.push({
            data: {
              id: `${u.id()}-${v.id()}`,
              source: u.id(),
              target: v.id(),
            },
          });
        }
        visitedNodes.add(v.id());
        if (e) {
          visitedEdges.add(`${u.id()}-${v.id()}`);
          visitedEdges.add(`${v.id()}-${u.id()}`);
        }
      },
    });
    cy.remove(cy.edges());
    cy.add(treeEdges);
    cy.add(backEdges);
    cy.add(backEdgesToDiscard);
    cy.edges(treeEdges.map((d) => `#${d.data.id}`).join(",")).style({
      "line-color": "black",
      "target-arrow-color": "black",
      "target-arrow-shape": "triangle",
      "arrow-scale": 1.5,
    });
    if (backEdges.length > 0) {
      cy.edges(backEdges.map((d) => `#${d.data.id}`).join(",")).style({
        "line-color": "black",
        "line-style": "dashed",
        "target-arrow-color": "grey",
        "target-arrow-shape": "triangle",
        "arrow-scale": 2,
      });
    }
    if (backEdgesToDiscard.length > 0) {
      cy.edges(backEdgesToDiscard.map((d) => `#${d.data.id}`).join(",")).style({
        "line-color": "grey",
        "line-style": "dotted",
        opacity: 0.5,
        "target-arrow-color": "grey",
        "target-arrow-shape": "triangle",
        "arrow-scale": 2,
      });
    }

    const colorMap = {};
    cy.nodes().forEach((node) => {
      colorMap[node.id()] = [node.data("color"), []];
    });
    [...treeEdges, ...backEdges].forEach((edge) => {
      colorMap[edge.data.target][1].push(
        cy.$id(edge.data.source).data("color")
      );
    });
    return colorMap;
  }

  nextColoringStep(slide) {
    if (this.agg_step === null) {
      if (this.cur_step == 0) {
        const cy = this.drawGraph(slide, initialNodeColorCode);
        this.localColorMaps = this.walkGraph(cy, this.cur_node);
        this.cur_node += 1;
        this.cur_step = 1;
      } else {
        this.cur_step = 0;
        this.drawColorMap(slide, this.localColorMaps);
        this.globalColorMaps.push(this.localColorMaps);

        if (this.cur_node === this.numberOfNodes) {
          this.agg_step = 0;
        }
      }
    } else if (this.agg_step === 0) {
      const aggregatedColorMaps = this.globalColorMaps.reduce(
        (acc, colorMap) => {
          Object.entries(colorMap).forEach(([nodeId, colors]) => {
            if (acc[nodeId] === undefined) {
              acc[nodeId] = [colors[0], [hashNodeColor(colors)]];
            } else {
              acc[nodeId][1].push(hashNodeColor(colors));
            }
          });
          return acc;
        },
        {}
      );
      this.drawColorMap(slide, aggregatedColorMaps);
      const aggregatedColorCodeMaps = Object.entries(
        aggregatedColorMaps
      ).reduce((acc, [nodeId, colors]) => {
        acc[nodeId] = hashNodeColor(colors);
        return acc;
      }, {});

      initialNodeColorCode = aggregatedColorCodeMaps;
      this.agg_step = 1;
    } else if (this.agg_step === 1) {
      this.drawGraph(slide, initialNodeColorCode);
      this.agg_step = null;
      this.cur_node = 0;
      this.cur_step = 0;
      this.globalColorMaps = [];
    }
  }
}
