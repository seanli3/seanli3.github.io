let lvc;
let topContainerCy;
let bottomContanerCys = [];
let colorPartition;

const attachEventListeners = () => {
  $("#search-selection input").click(function (event) {
    const checked = event.target.checked;
    const name = event.target.name;
    if (checked) {
      $("#search-selection")
        .find(`input:not([name=${name}])`)
        .prop("checked", false);
    } else {
      $("#search-selection")
        .find(`input:not([name=${name}])`)
        .prop("checked", true);
    }
  });
  $("#graph-selection button").click(function (event) {
    const selection = $(event.target).text();
    const numberOfNodes = $(event.target)
      .parent()
      .parent()
      .parent()
      .find("input")
      .val();
    const searchType = $("#search-selection input:checked").prop("name");
    lvc = new LVC(selection, numberOfNodes, searchType);
    const viewContainer = $(".container.global");
    viewContainer.show();
    topContainerCy = lvc.drawGraph(viewContainer.find(".graph-container"));
    setTimeout(() => {
      viewContainer[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 200);

    const resetBtn = $("#resetBtn");
    resetBtn.show();
    resetBtn.click((event) => {
      window.location.reload();
    });

    const startBtn = $("#startBtn");
    startBtn.parent().show();
    startBtn.click(function (event) {
      if (lvc.finished) {
        return;
      }
      const container = $(".container.local");
      container.show();
      setTimeout(() => {
        container[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 200);
      bottomContanerCys.forEach((c) => c.destroy());
      bottomContanerCys = [];
      container.children().remove();

      for (let i = 0; i < lvc.numberOfNodes; i++) {
        const localGraphContaienr = $('<div class="graph-container"></div>');
        container.append(localGraphContaienr);
        setTimeout(() => {
          const cy = lvc.drawLocallyColouredGraph(localGraphContaienr, i);
          lvc.addNodeTooltip(cy, lvc.localColorMaps[i]);
          bottomContanerCys.push(cy);
        }, 20);
      }

      $("#search-selection button").prop("disabled", true);
      $("#graph-selection ul button").prop("disabled", true);
      $("#graph-selection input").prop("disabled", true);
      $(event.target).parent().hide();
      $("#updateBtn").parent().show();
      $("#description").html(
        "<div class='notice--info'><b>Local Vertex Colouring.</b> At this step, we run a graph search (BFS or DFS) rooted at each node (node with red border), each yields a search tree as shown below. There are in total N search trees. We compute a colour for each node in each search tree. So for each node there are N colours. (Try select a node below to see how the colour is computed.</div>"
      );
      $("#description").show();
    });

    const updateBtn = $("#updateBtn");
    updateBtn.click(function (event) {
      if (lvc.finished) {
        return;
      }
      const aggregatedColorMap = lvc.aggregateLocalColorMaps();
      lvc.setInitialNodeColorCode(aggregatedColorMap);
      topContainerCy.destroy();
      const container = $(".container.global .graph-container");
      const cy = lvc.drawGraph(container, aggregatedColorMap);
      setTimeout(() => {
        container[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 200);

      lvc.addNodeTooltip(cy, aggregatedColorMap);
      $(event.target).parent().hide();
      $("#updateBtn").parent().show();
      startBtn.parent().show();
      updateBtn.parent().hide();
      topContainerCy = cy;
      $("#description").html(
        "<div class='notice--info'><b>Update Global Vertex Colours.</b> At this step, we aggregate localized node colours obtained from each graph search, computed a new colour and update each node. (Try select a node from above to see how the colour is computed.</div>"
      );
      const newParition = lvc.getPartition(aggregatedColorMap);
      if (lvc.arePartitiionsSame(colorPartition, newParition)) {
        $("#description").append(
          `
          <div class="notice--danger">
            The current colour partition of ${JSON.stringify(
              newParition
            )} (each number represents a colour count) is the same as the previous one. The algorithm has finished.
          </div>
        `
        );
      }
      colorPartition = newParition;
    });
  });
};

attachEventListeners();
