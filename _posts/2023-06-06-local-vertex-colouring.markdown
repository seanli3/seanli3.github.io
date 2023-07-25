---
layout: splash
title: "Local Vertex Colouring"
categories: demo
permalink: /:categories/:title/
---

# Local Vertex Colouring Live Demo

<script src="{{ site.baseurl }}/assets/js/jquery-3.7.0.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/cytoscape.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/jsnetworkx.js"></script>
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/post_lvc.css">
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/tippy_themes_light.css">

<div markdown="0" class="view">
    <div id="graph-selection">
        <div class="notice--success top-notice-container" style="font-size:large !important">
          <span>
            Start by adding a graph, Number of nodes: <input type="number" min=1 max=10 value=5/>
          </span>
          <button id="resetBtn" style="display:none" class="btn btn--danger btn--large">Reset</button>
        </div>
      <div id="search-selection">
        <div>
          <input type="checkbox" id="bfs" name="bfs" checked>
          <label for="bfs"> Breadth-first search</label>
        </div>
        <div>
          <input type="checkbox" id="dfs" name="dfs" value="dfs">
          <label for="dfs"> Depth-first search</label>
        </div>
      </div>
      <hr/>
      <ul>
        <li>
          <button class="btn btn--info btn--small">Random graph</button>
        </li>
        <li>
          <button class="btn btn--info btn--small">Complete graph</button>
        </li>
        <li>
          <button class="btn btn--info btn--small">Balanced tree</button>
        </li>
        <li>
          <button class="btn btn--info btn--small">Cycle graph</button>
        </li>
        <li>
          <button class="btn btn--info btn--small">Full Rary tree</button>
        </li>
        <li>
          <button class="btn btn--info btn--small">Karate club</button>
        </li>
      </ul>
    </div>
    <div class="container global" hidden style="display:none">
      <div class="graph-container"></div>
      <div class="control-container" style="display:flex;justify-content:space-evenly;">
        <div id="description" ></div>
        <div id="hint" class='notice--success' style='font-size:large !important; margin-top:0 !important; margin-bottom:5px !important;display:none'>
          <i>Try select a node from above to see how the colour is computed</i>
        </div>
        <span id="downBtn" class="arrow circle down" style="display:none">Click me</span>
        <span id="upBtn" class="arrow circle up" style="display:none">Click me</span>
      </div>
    </div>
    <div class="container local" hidden style="display:none"></div>
<div>

<script src="{{ site.baseurl }}/assets/js/chroma.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/chroma.palette-gen.js"></script>
<script src="{{ site.baseurl }}/assets/js/lvc_utils.js"></script>
<script src="{{ site.baseurl }}/assets/js/popper.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/cytoscape-popper.js"></script>
<script src="{{ site.baseurl }}/assets/js/tippy.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/post_lvc.js"></script>
