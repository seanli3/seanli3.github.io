const DEFAULT_NODE_COLOR = "#FFF";

const DISTINCT_COLORS = [
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#000000",
];

let initialNodeColorCode = [{}, {}];

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

const cyNodeMapStyle = [
  // the stylesheet for the graph
  {
    selector: "node",
    style: {
      width: 25,
      height: 25,
      "background-color": (ele) => {
        return ele.data("color") || DEFAULT_NODE_COLOR;
      },
      "border-width": 5,
      label: "data(id)",
    },
  },

  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#ccc",
      "target-arrow-color": "#ccc",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      "arrow-scale": 1.2,
      width: 18,
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

var numberOfNodes = 5;
var graphs = [0, 1].map(() => jsnx.fastGnpRandomGraph(numberOfNodes, 0.6));

function drawGraphs(container, graphs) {
  var nodes = graphs.map((g, i) => [
    ...g.nodes().map((id) => ({
      data: {
        id: `${id}`,
        label: `Node${id}`,
        color: initialNodeColorCode[i][id] || DEFAULT_NODE_COLOR,
      },
    })),
  ]);
  var edges = graphs.map((g, i) =>
    g.edges().map(([source, target]) => ({
      data: {
        id: `${source}-${target}`,
        source,
        target,
      },
    }))
  );
  var children = container.children;
  var cys = [];
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var cy = cytoscape({
      container: child, // container to render in
      elements: nodes[i].concat(edges[i]),
      style: cyGraphStyle,
    });
    cy.fit(cy.elements(), 60);
    cy.panningEnabled(false);

    var layout = cy.layout({
      name: "circle",
      avoidOverlap: true,
      animate: true,
      nodeDimensionsIncludeLabels: true,
    });

    layout.run();
    cy.fit();
    cys.push(cy);
  }
  return cys;
}

function walkGraph(cy, graph, cur_node) {
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
                jsnx.shortestPathLength(graph, {
                  source: cur_node,
                  target: Number(v.id()),
                }) ===
                jsnx.shortestPathLength(graph, {
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
                jsnx.shortestPathLength(graph, {
                  source: cur_node,
                  target: Number(v.id()),
                }) ===
                jsnx.shortestPathLength(graph, {
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
    colorMap[edge.data.target][1].push(cy.$id(edge.data.source).data("color"));
  });
  return colorMap;
}

function drawColorMap(container, colorMaps) {
  var children = container.children;
  var cys = [];
  for (var i = 0; i < children.length; i++) {
    const colorMap = colorMaps[i];
    const nodes = [];
    const edges = [];
    Object.entries(colorMap)
      .sort(([n1], [n2]) => n1 - n2)
      .forEach(([nodeId, colors], j) => {
        nodes.push({
          data: {
            id: nodeId,
            color: hashNodeColor(colors),
            label: `Node${nodeId}`,
          },
          renderedPosition: {
            x: 0,
            y: 100 * (j + 1),
          },
        });
        nodes.push({
          data: {
            id: "self" + nodeId,
            color: colors[0],
            parent: nodeId + "group2",
            label: "",
          },
          renderedPosition: {
            x: 50,
            y: 100 * (j + 1),
          },
        });
        colors[1].forEach((color, i) => {
          nodes.push({
            data: {
              id: nodeId + "other" + i,
              color: color,
              parent: nodeId + "group1",
              label: "",
            },
            renderedPosition: {
              x: 50 * (i + 2),
              y: 100 * (j + 1),
            },
          });
        });
        if (colors[1].length > 0) {
          nodes.push({
            data: {
              id: nodeId + "group1",
              parent: nodeId + "group2",
              label: "",
            },
          });
        }

        nodes.push({
          data: {
            id: nodeId + "group2",
            label: "",
          },
        });

        edges.push({
          data: {
            id: nodeId + `group2-1`,
            source: nodeId + "group2",
            target: nodeId,
          },
          renderedPosition: {
            y: 100 * (j + 1),
          },
        });
      });
    var child = children[i];
    var cy = cytoscape({
      container: child, // container to render in
      elements: nodes.concat(edges),
      style: cyNodeMapStyle,
    });

    var layout = cy.layout({
      name: "preset",
      avoidOverlap: true,
      rows: Object.keys(colorMap).length,
      // cols: Math.max(Object.values(colorMap).map((c) => c[1].length)) + 2,
      animate: true,
      nodeDimensionsIncludeLabels: true,
    });

    layout.run();
    cy.fit();
    cy.panningEnabled(false);
    cys.push(cy);
  }
  return cys;
}

drawGraphs(document.getElementsByClassName("main-view")[0], graphs);

var cur_step = 0;
var cur_node = 0;
var agg_step = null;

let globalColorMaps = [[], []];
let localColorMaps;

var nextBtn = $("#nextBtn");
nextBtn.click(function () {
  var mainView = $(".main-view");
  mainView.removeClass("main-view");
  mainView.parent().append(`
    <div class="main-view view">
      <div class="graph"></div>
      <div class="graph"></div>
    </div>
  `);
  setTimeout(function () {
    if (agg_step === null) {
      if (cur_step == 0) {
        var cys = drawGraphs(
          document.getElementsByClassName("main-view")[0],
          graphs
        );

        localColorMaps = cys.map((cy, index) => {
          return walkGraph(cy, graphs[index], cur_node);
        });
        cur_node += 1;
        cur_step = 1;
      } else {
        cur_step = 0;
        drawColorMap(
          document.getElementsByClassName("main-view")[0],
          localColorMaps
        );
        globalColorMaps[0].push(localColorMaps[0]);
        globalColorMaps[1].push(localColorMaps[1]);

        if (cur_node === numberOfNodes) {
          agg_step = 0;
        }
      }
    } else if (agg_step === 0) {
      const aggregatedColorMaps = globalColorMaps.map((colorEntries) => {
        return colorEntries.reduce((acc, colorMap) => {
          Object.entries(colorMap).forEach(([nodeId, colors]) => {
            if (acc[nodeId] === undefined) {
              acc[nodeId] = [colors[0], [hashNodeColor(colors)]];
            } else {
              acc[nodeId][1].push(hashNodeColor(colors));
            }
          });
          return acc;
        }, {});
      });
      drawColorMap(
        document.getElementsByClassName("main-view")[0],
        aggregatedColorMaps
      );
      const aggregatedColorCodeMaps = aggregatedColorMaps.map((colorMap) => {
        return Object.entries(colorMap).reduce((acc, [nodeId, colors]) => {
          acc[nodeId] = hashNodeColor(colors);
          return acc;
        }, {});
      });

      initialNodeColorCode = aggregatedColorCodeMaps;
      agg_step = 1;
    } else if (agg_step === 1) {
      drawGraphs(document.getElementsByClassName("main-view")[0], graphs);
      agg_step = null;
      cur_node = 0;
      cur_step = 0;
      globalColorMaps = [[], []];
    }

    $("#nextBtn")[0].scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, 200);
});
