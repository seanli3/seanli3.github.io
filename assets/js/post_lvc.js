const DEFAULT_NODE_COLOR = "#FFF";

const DISTINCT_COLORS = paletteGenerator.generate(50).map((c) => c.hex());

let initialNodeColorCode = {};

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

const lvc = new LVC(4);
lvc.drawGraph(
  document.getElementsByClassName("graph-container")[0],
  initialNodeColorCode
);

var nextBtn = $("#nextBtn");
nextBtn.click(function (event) {
  const slider = $(event.target.parentElement).find(".slider");
  slider.removeAttr("hidden");

  const slide = $("<li>");
  slider.find("ul").append(slide);

  lvc.nextColoringStep(slide);
});

$(function () {
  var slideCount = $(".slider ul li").length;
  var slideWidth = $(".slider ul li").width();
  var slideHeight = $(".slider ul li").height();
  var slideUlWidth = slideCount * slideWidth;

  $(".slider").css({ "max-width": slideWidth, height: slideHeight });
  $(".slider ul").css({ width: slideUlWidth, "margin-left": -slideWidth });
  $(".slider ul li:last-child").prependTo($(".slider ul"));

  function moveLeft() {
    const currentSlide = $(".slider ul li:visible");
    if (currentSlide.prev().length !== 0) {
      currentSlide.hide();
      currentSlide.prev().show();
    }
  }

  function moveRight(event) {
    const currentSlide = $(".slider ul li:visible");
    currentSlide.hide();
    if (currentSlide.next().length !== 0) {
      currentSlide.next().show();
      return;
    }

    const slider = $(event.target.parentElement);
    const slide = $("<li><div/></li>");
    slider.find("ul").append(slide);
    lvc.nextColoringStep(slide.find("div"));
  }

  $(".next").on("click", moveRight);

  $(".prev").on("click", function () {
    moveLeft();
  });
});
