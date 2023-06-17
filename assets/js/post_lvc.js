const cystyle = [
  // the stylesheet for the graph
  {
    selector: "node",
    style: {
      width: 25,
      height: 25,
      "background-color": "#666",
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

var graphs = [0, 1].map(() => jsnx.fastGnpRandomGraph(4, 0.4));

function drawGraphs(container, graphs) {
  var nodes = graphs.map((g, i) => [
    ...g.nodes().map((id) => ({
      data: {
        id: `${id}`,
        label: `Node${id}`,
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
      style: cystyle,
    });
    cy.fit(cy.elements(), 60);
    cy.panningEnabled(false);

    var layout = cy.layout({
      name: "circle",
      avoidOverlap: true,
      padding: 30,
      animate: true,
      nodeDimensionsIncludeLabels: true,
    });

    layout.run();
    cy.fit();
    cys.push(cy);
  }
  return cys;
}

function walkGraph(cy, graph, cur_step, cur_node) {
  cy.nodes().data({
    label: "",
  });

  cy.nodes(`#${cur_node}`).style({
    "background-color": "#de1bd4",
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
    "line-color": "#de1bd4",
    "target-arrow-color": "#de1bd4",
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
}

drawGraphs(document.getElementsByClassName("main-view")[0], graphs);

var cur_step = 0;
var cur_node = 0;

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
    var cys = drawGraphs(
      document.getElementsByClassName("main-view")[0],
      graphs
    );
    $("#nextBtn")[0].scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
    cys.forEach((cy, index) => {
      walkGraph(cy, graphs[index], cur_step, cur_node);
    });
    cur_node += 1;
  }, 200);
});
