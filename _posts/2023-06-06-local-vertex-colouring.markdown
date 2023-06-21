---
layout: post
title: "Local Vertex Colouring"
---

# Local Vertex Colouring Live Demo

<script src="{{ site.baseurl }}/assets/js/jquery-3.7.0.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/cytoscape.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/jsnetworkx.js"></script>
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/post_lvc.css">
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/tippy_themes_light.css">

<div markdown="0">
    <div id="graph-selection">
      <h3>
      Start by adding a graph, Number of nodes: <input type="number" min=1 max=10 value=5/>
      </h3>
      <div id="search-selection">
        <input type="checkbox" id="bfs" name="bfs" checked>
        <label for="bfs"> Breadth-first search</label>
        <br/>
        <input type="checkbox" id="dfs" name="dfs" value="dfs">
        <label for="dfs"> Depth-first search</label>
      </div>
      <hr/>
      <ul>
        <li>
          <button class="button">Random graph</button>
        </li>
        <li>
          <button class="button">Balanced tree</button>
        </li>
        <li>
          <button class="button">Complete graph</button>
        </li>
        <li>
          <button class="button">Cycle graph</button>
        </li>
        <li>
          <button class="button">Full Rary tree</button>
        </li>
        <li>
          <button class="button">Karate club</button>
        </li>
      </ul>
    </div>
    <div class="container global">
      <div class="graph-container"></div>
    </div>
    <div class="container local">
    </div>
    <div class="btn-container">
      <div class="card" hidden>
        <button id="resetBtn" class="button">Reset</button>
        <p>some text</p>
      </div>
      <div class="card" hidden>
        <button id="startBtn" class="button nextBtn">Start localized colouring</button>
        <p>some text</p>
      </div>
      <div class="card" hidden>
        <button id="updateBtn" class="button nextBtn">Aggregate and update colours></button>
        <p>some text</p>
      </div>
    </div>
<div>

<script src="{{ site.baseurl }}/assets/js/chroma.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/chroma.palette-gen.js"></script>
<script src="{{ site.baseurl }}/assets/js/lvc_utils.js"></script>
<script src="{{ site.baseurl }}/assets/js/popper.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/cytoscape-popper.js"></script>
<script src="{{ site.baseurl }}/assets/js/tippy.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/post_lvc.js"></script>
