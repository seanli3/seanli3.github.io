---
layout: post
title: "Local Vertex Colouring"
---

# Local Vertex Colouring Live Demo

<script src="{{ site.baseurl }}/assets/js/jquery-3.7.0.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/cytoscape.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/jsnetworkx.js"></script>
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/post_lvc.css">

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
    <div class="container">
      <div class="graph-container"></div>
      <button id="startBtn" class="button" hidden>Start colouring</button>
    </div>
    <button id="resetBtn" class="button" hidden>Reset</button>

<div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.4.2/chroma.min.js"></script>
<script src="{{ site.baseurl }}/assets/js/chroma.palette-gen.js"></script>
<script src="{{ site.baseurl }}/assets/js/lvc_utils.js"></script>
<script src="{{ site.baseurl }}/assets/js/post_lvc.js"></script>
