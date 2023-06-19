let lvc;
const graphSelectionEle = $("#graph-selection");

const attachEventListeners = () => {
  $("#graph-selection button").click(function (event) {
    const selection = $(event.target).text();
    const numberOfNodes = $(event.target)
      .parent()
      .parent()
      .parent()
      .find("input")
      .val();
    lvc = new LVC(selection, numberOfNodes);
    const viewContainer = $(event.target).parent().parent().parent().parent();
    lvc.drawGraph(viewContainer.find(".graph-container"));

    const resetBtn = $("#resetBtn");
    resetBtn.show();
    resetBtn.click((event) => {
      window.location.reload();
    });

    const startBtn = $("#startBtn");
    startBtn.show();
    startBtn.click(function (event) {
      const slider = $(`
      <div class="slider" >
        <a href="#0" class="next control">Next</a>
        <a href="#0" class="prev control">Prev</a>
        <ul></ul>
      </div>
    `);

      const slide = $("<li><div/></li>");
      slider.find("ul").append(slide);

      $(event.target).parent().append(slider);

      slider.find(".next").on("click", (event) => {
        const currentSlide = $(event.target)
          .parent()
          .parent()
          .parent()
          .find(".slider ul li:visible");
        if (currentSlide.next().length !== 0) {
          currentSlide.hide();
          currentSlide.next().show();
          return;
        }
        if (lvc.finished) {
          return;
        }
        currentSlide.hide();

        const slider = $(event.target.parentElement);
        const slide = $("<li><div/></li>");
        slider.find("ul").append(slide);
        lvc.nextColoringStep(slide.find("div"));
      });

      slider.find(".prev").on("click", (event) => {
        const currentSlide = $(event.target)
          .parent()
          .parent()
          .parent()
          .find(".slider ul li:visible");
        if (currentSlide.prev().length !== 0) {
          currentSlide.hide();
          currentSlide.prev().show();
        }
      });

      lvc.nextColoringStep(slide.find("div"));

      event.target.remove();
      graphSelectionEle.remove();
    });
  });
};

attachEventListeners();
