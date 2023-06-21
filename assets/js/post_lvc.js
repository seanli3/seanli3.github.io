let lvc;
const graphSelectionEle = $("#graph-selection");
let topContainerCy;
let bottomContanerCys = [];

const attachEventListeners = () => {
  $("#search-selection input").click(function (event) {
    const checked = event.target.checked;
    const name = event.target.name;
    if (checked) {
      $(event.target)
        .parent()
        .find(`input:not([name=${name}])`)
        .prop("checked", false);
    } else {
      $(event.target)
        .parent()
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
    const viewContainer = $(event.target).parent().parent().parent().parent();
    topContainerCy = lvc.drawGraph(viewContainer.find(".graph-container"));

    const resetBtn = $("#resetBtn");
    resetBtn.parent().show();
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

      $(event.target).parent().hide();
      graphSelectionEle.hide();
      $("#updateBtn").parent().show();
    });

    const updateBtn = $("#updateBtn");
    updateBtn.click(function (event) {
      if (lvc.finished) {
        return;
      }
      const aggregatedColorMap = lvc.aggregateLocalColorMaps();
      lvc.setInitialNodeColorCode(aggregatedColorMap);
      topContainerCy.destroy();
      const cy = lvc.drawGraph(
        $(".container.global .graph-container"),
        aggregatedColorMap
      );

      lvc.addNodeTooltip(cy, aggregatedColorMap);
      $(event.target).parent().hide();
      graphSelectionEle.hide();
      $("#updateBtn").parent().show();
      startBtn.parent().show();
      updateBtn.parent().hide();
      topContainerCy = cy;
    });
  });
};

attachEventListeners();
