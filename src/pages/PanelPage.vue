<template>
  <q-page>
    <div class="row q-gutter-sm q-pa-sm justify-center">
      <q-btn label="Draw" color="negative" no-caps @click="draw"></q-btn>
      <q-btn label="Add Cell" color="negative" no-caps @click="addCell"></q-btn>
    </div>

    <div id="warpper"></div>
  </q-page>
</template>

<script setup>
import * as d3 from "d3";
import cell_svg_url from "../assets/cell.svg?url";

defineOptions({
  name: "PanelPage",
});

function getPanel() {
  let svg = d3.select("#canvas");

  if (svg.empty()) {
    svg = d3
      .select("#warpper")
      .append("svg")
      .attr("width", 1600)
      .attr("height", 900)
      .attr("id", "canvas");
  }

  return svg;
}

function draw() {
  let svg = getPanel();
  let width = 60;
  let height = 40;

  for (let ri = 0; ri < 5; ri++) {
    for (let ci = 0; ci < 5; ci++) {
      svg
        .append("rect")
        .attr("x", 10 + ci * width)
        .attr("y", 10 + ri * height)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#eee")
        .attr("stroke", "#000");
    }
  }
}

function addCell() {
  let svg = getPanel();

  d3.svg(cell_svg_url).then((d) => {
    svg.node().appendChild(d.documentElement);
  });
}
</script>
