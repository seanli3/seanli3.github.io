const DEFAULT_NODE_COLOR = "#FFF";

const DISTINCT_COLORS = paletteGenerator.generate(80).map((c) => c.hex());

const hashNodeColor = (colors) => {
  if (colors[1].length === 0) {
    return colors[0];
  }
  const c1 = colors[0];
  const c2 = colors[1].sort().join("");
  const c = c1 + c2;
  const index =
    c
      .split("")
      .map((i) => i.charCodeAt(0))
      .reduce((a, b) => a + b, 0) % DISTINCT_COLORS.length;
  return DISTINCT_COLORS[index];
};

const cyGraphStyle = [
  // the stylesheet for the graph
  {
    selector: "node",
    style: {
      width: 25,
      height: 25,
      "background-color": (ele) => ele.data("color") || DEFAULT_NODE_COLOR,
      "border-width": 5,
      "border-color": "#666",
      // "border-width": 5,
      label: "data(id)",
    },
  },

  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#ccc",
      // "target-arrow-color": "#ccc",
      // "target-arrow-shape": "triangle",
      "curve-style": "bezier",
    },
  },
  {
    selector: ":parent",
    style: {
      "background-opacity": 0.333,
      "background-color": "#e8e8e8",
      "border-color": "#DADADA",
      "text-valign": "bottom",
    },
  },
  {
    selector: "node[label]",
    style: {
      label: "data(label)",
    },
  },
];

class LVC {
  constructor(selection, numberOfNodes, search = "bfs") {
    this.cur_step = 0;
    this.cur_node = 0;
    this.agg_step = null;
    this.finished = false;
    this.globalColorMaps = [];
    this.localColorMaps;
    this.partitiion = null;
    this.search = search;
    this.initialNodeColorCode = {};

    if (!numberOfNodes || parseInt(numberOfNodes) < 1) {
      if (!["Karate club"].includes(selection)) {
        alert("Invaldi number of nodes, please enter a number greater than 0");
        return;
      }
    }
    numberOfNodes = parseInt(numberOfNodes);

    if (selection === "Random graph") {
      this.graph = jsnx.fastGnpRandomGraph(numberOfNodes, 0.5);
    } else if (selection === "Balanced tree") {
      this.graph = jsnx.balancedTree(2, parseInt(Math.sqrt(numberOfNodes)));
    } else if (selection === "Complete graph") {
      this.graph = jsnx.completeGraph(numberOfNodes);
    } else if (selection === "Cycle graph") {
      this.graph = jsnx.cycleGraph(numberOfNodes);
    } else if (selection === "Full Rary tree") {
      this.graph = jsnx.fullRaryTree(3, numberOfNodes);
    } else if (selection === "Karate club") {
      this.graph = jsnx.karateClubGraph();
    }

    this.numberOfNodes = this.graph.nodes().length;
  }

  drawSvgCircle(color) {
    return `
      <svg height="24" width="24">
        <circle cx="12" cy="12" r="9" stroke="black" stroke-width="3" fill="${color}" />
      </svg>`;
  }

  drawGraph(container) {
    const nodes = this.graph.nodes().map((id) => ({
      data: {
        id: `${id}`,
        label: `Node${id}`,
        color: this.initialNodeColorCode[id] || DEFAULT_NODE_COLOR,
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
    cy.panningEnabled(false);
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

  walkGraphBfs(cy, cur_node) {
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
                    target: v.id(),
                    source: edge.target().id(),
                  },
                };
                if (
                  jsnx.hasPath(this.graph, {
                    source: cur_node,
                    target: Number(v.id()),
                  }) &&
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
                    target: v.id(),
                    source: edge.source().id(),
                  },
                };
                if (
                  jsnx.hasPath(this.graph, {
                    source: cur_node,
                    target: Number(v.id()),
                  }) &&
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
    let radius = 1;
    let hasNode = false;

    cy.nodes()
      .filter(
        (n) =>
          !jsnx.hasPath(this.graph, {
            source: cur_node,
            target: Number(n.id()),
          })
      )
      .forEach((n) => {
        [...treeEdges, ...backEdges]
          .filter((e) => e.data.target === n.id())
          .forEach((edge) => {
            colorMap[n.id()][1].push(
              colorMap[edge.data.source]
                ? hashNodeColor(colorMap[edge.data.source])
                : cy.$id(edge.data.source).data("color")
            );
          });
      });
    do {
      hasNode = false;
      cy.nodes()
        .filter((n) =>
          jsnx.hasPath(this.graph, {
            source: cur_node,
            target: Number(n.id()),
          })
        )
        .forEach((n) => {
          if (
            jsnx.shortestPathLength(this.graph, {
              source: cur_node,
              target: Number(n.id()),
            }) === radius
          ) {
            hasNode = true;
            [...treeEdges, ...backEdges]
              .filter((e) => e.data.target === n.id())
              .forEach((edge) => {
                colorMap[n.id()][1].push(
                  colorMap[edge.data.source]
                    ? hashNodeColor(colorMap[edge.data.source])
                    : cy.$id(edge.data.source).data("color")
                );
              });
          }
        });
      radius += 1;
    } while (hasNode);

    return colorMap;
  }

  walkGraphDfs(cy, cur_node) {
    cy.nodes().data({
      label: "",
    });

    cy.nodes(`#${cur_node}`).style({
      "border-color": "red",
      // label: "v0",
    });

    var treeEdges = [];
    var backEdges = [];
    var backEdgesToDiscard = [];
    var visitedNodes = new Set();
    var visitedEdges = new Set();

    const visitOrder = {};

    cy.elements().depthFirstSearch({
      root: "#" + cur_node,
      visit: (v, e, u, i) => {
        v.style("label", `v${i}`);
        visitOrder[v.id()] = i;

        if (i > 0) {
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
                backEdges.push(backEdge);
              } else if (visitedNodes.has(edge.source().id())) {
                let backEdge = {
                  data: {
                    id: `${v.id()}-${edge.source().id()}`,
                    source: v.id(),
                    target: edge.source().id(),
                  },
                };
                backEdges.push(backEdge);
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
      const q_u = backEdges.filter((e) =>
        this.isCoveredByBackEdge(node, e, treeEdges)
      );
      let d_u = q_u;
      let delta_d_u = [];
      do {
        delta_d_u = [];
        d_u.forEach((edge) => {
          backEdges.forEach((e) => {
            if (
              this.areBackEdgesCrossOver(edge, e, visitOrder) &&
              !d_u.includes(e) &&
              !delta_d_u.includes(e)
            ) {
              delta_d_u.push(e);
            }
          });
        });
        d_u = d_u.concat(delta_d_u);
      } while (delta_d_u.length > 0);
      const b_u = cy.nodes().filter((n) => {
        return d_u.some((e) => this.isCoveredByBackEdge(n, e, treeEdges));
      });
      const leadingTreeEdge = treeEdges.find(
        (e) => e.data.target === node.id()
      );
      const eta_u = new Set([...b_u.map((n) => n.id())]);
      if (leadingTreeEdge) {
        eta_u.add(leadingTreeEdge.data.source);
      }
      colorMap[node.id()] = [
        node.data("color"),
        [...[...eta_u].map((n) => cy.$id(n).data("color"))],
      ];
    });

    return colorMap;
  }

  isCoveredByBackEdge(node, bedge, treeEdges) {
    let pathFound = false;
    let end = bedge.data.source;
    const path = [end];
    do {
      const edge = treeEdges.find((e) => e.data.target === end);
      end = edge.data.source;
      path.unshift(end);
      if (end === bedge.data.target) {
        pathFound = true;
      }
    } while (!pathFound);
    if (path.includes(node.id())) {
      return true;
    }
    return false;
  }

  areBackEdgesCrossOver(e1, e2, visitOrder) {
    if (
      visitOrder[e2.data.target] < visitOrder[e1.data.target] &&
      visitOrder[e1.data.target] < visitOrder[e2.data.source] &&
      visitOrder[e2.data.source] < visitOrder[e1.data.source]
    ) {
      return true;
    }
    if (
      visitOrder[e1.data.target] < visitOrder[e2.data.target] &&
      visitOrder[e2.data.target] < visitOrder[e1.data.source] &&
      visitOrder[e1.data.source] < visitOrder[e2.data.source]
    ) {
      return true;
    }

    if (
      visitOrder[e1.data.target] === visitOrder[e2.data.target] &&
      visitOrder[e1.data.source] !== visitOrder[e2.data.source]
    ) {
      return true;
    }
    if (
      visitOrder[e1.data.source] === visitOrder[e2.data.source] &&
      visitOrder[e1.data.target] !== visitOrder[e2.data.target]
    ) {
      return true;
    }
    return false;
  }

  addTitleToSlide(slide, title) {
    slide.prepend($("<h3>").text(title));
  }

  nextColoringStep(slide) {
    if (this.agg_step === null) {
      if (this.cur_step == 0) {
        const title = `Graph search rooted on Node${this.cur_node}`;
        this.addTitleToSlide(slide, title);
        const cy = this.drawGraph(slide, this.initialNodeColorCode);
        if (this.search === "bfs") {
          this.localColorMaps = this.walkGraphBfs(cy, this.cur_node);
        } else {
          this.localColorMaps = this.walkGraphDfs(cy, this.cur_node);
        }
        this.cur_step = 1;
      } else {
        this.cur_step = 0;
        const title = `Node colouring rooted on Node${this.cur_node}`;
        this.addTitleToSlide(slide, title);
        this.drawColorMap(slide, this.localColorMaps);
        this.globalColorMaps.push(this.localColorMaps);
        this.cur_node += 1;

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
      const title = `Aggregating node colours`;
      this.addTitleToSlide(slide, title);
      this.drawColorMap(slide, aggregatedColorMaps);
      const aggregatedColorCodeMaps = Object.entries(
        aggregatedColorMaps
      ).reduce((acc, [nodeId, colors]) => {
        acc[nodeId] = hashNodeColor(colors);
        return acc;
      }, {});

      this.initialNodeColorCode = aggregatedColorCodeMaps;
      this.agg_step = 1;
    } else if (this.agg_step === 1) {
      const partitiion = this.getPartition();
      if (this.arePartitiionTheSame(partitiion, this.partitiion)) {
        this.finished = true;
      } else {
        this.partitiion = partitiion;
      }
      let title;
      if (this.finished) {
        title = `Node colours converged, the colour partition is ${JSON.stringify(
          this.partitiion
        )}`;
      } else {
        title = `Node colours updated, ready for the next iteration`;
      }
      this.addTitleToSlide(slide, title);
      this.drawGraph(slide);
      this.agg_step = null;
      this.cur_node = 0;
      this.cur_step = 0;
      this.globalColorMaps = [];
    }
  }

  getPartition() {
    const counts = {};
    Object.values(this.initialNodeColorCode).forEach((color) => {
      if (counts[color] === undefined) {
        counts[color] = 1;
      } else {
        counts[color] += 1;
      }
    });
    return Object.values(counts).sort();
  }

  arePartitiionTheSame(partition1, partition2) {
    if (!partition1 || !partition2) {
      return false;
    }
    if (partition1.length !== partition2.length) {
      return false;
    }
    for (let i = 0; i < partition1.length; i++) {
      if (partition1[i] !== partition2[i]) {
        return false;
      }
    }
    return true;
  }
}
