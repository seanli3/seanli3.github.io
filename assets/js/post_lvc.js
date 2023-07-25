let lvc;
let topContainerCy;
let bottomContanerCys = [];
let colorPartition;
let nodeColors;

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
    const searchType = $("#search-selection input:checked").prop("name");
    if (lvc) {
      lvc.search = searchType;
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

    const downBtn = $("#downBtn");
    downBtn.show();
    downBtn.click(function (event) {
      if (lvc.finished) {
        return;
      }
      downBtn.hide();
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
      // $(event.target).parent().hide();
      $("#upBtn").show();
      $("#description").html(
        `<div class='notice--info' style='font-size:large !important; margin-top:0 !important; margin-bottom:5px !important;'>
        <b>Local Vertex Colouring.</b><br/>
         At this step, we run a graph search (BFS or DFS) rooted at each node (node with red border),
          each yields a search tree as shown below. There are in total N search trees. 
         We compute a colour for each node in each search tree. So for each node there are N colours.
         <br/>
         </div>`
      );
      $("#description").show();
      $("#hint").show();
    });

    const upBtn = $("#upBtn");
    upBtn.click(function (event) {
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
      upBtn.hide();
      downBtn.show();
      topContainerCy = cy;
      $("#description").html(
        `<div class='notice--info' style='font-size:large !important; margin-top:0 !important; margin-bottom:5px !important;'>
        <b>Update Global Vertex Colours.</b><br/>
         At this step, we aggregate localized node colours obtained from each graph search, 
         computed a new colour and update each node.
         </div>`
      );
      const [newParition, newColors] = lvc.getPartition(aggregatedColorMap);
      if (lvc.arePartitiionsSame(colorPartition, newParition)) {
        downBtn.hide();
        $("#description").append(
          `
          <div class="notice--danger" style='font-size:large !important; margin-top:0 !important; margin-bottom:5px !important;'>
            The current colour partition of
            ${newParition
              .map(
                (c, i) => `${c}  <svg height="16" width="16">
                <circle cx="8" cy="8" r="7" stroke="black" stroke-width="1" fill="${newColors[i]}" />
              </svg>`
              )
              .join(", ")} is the same as the previous 
             ${colorPartition
               .map(
                 (c, i) => `${c}  <svg height="16" width="16">
                <circle cx="8" cy="8" r="7" stroke="black" stroke-width="1" fill="${nodeColors[i]}" />
              </svg>`
               )
               .join(", ")} 
              . <b>The algorithm has finished</b>.
          </div>
        `
        );
      }
      colorPartition = newParition;
      nodeColors = newColors;
    });
  });
};

attachEventListeners();
