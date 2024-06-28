<template>
  <q-toolbar v-if="seatArea">
    <q-toolbar-title>Seat Reserve---{{seatArea}}</q-toolbar-title>
  </q-toolbar>

  <div class="">
    <q-btn-group rounded>
      <q-btn id="reset" color="accent" icon="zoom_out_map" label=""/>
      <q-btn id="zoomIn" color="accent" icon="zoom_in" label=""/>
      <q-btn id="zoomOut" color="accent" icon="zoom_out" label=""/>
    </q-btn-group>
  </div>
  <div>
    <div class="seat-map" v-if="seatDatas.length > 0" ref="seatMap"></div>
  </div>
</template>

<script setup>
import {Quasar, useQuasar} from "quasar";
import { toRefs, ref, onMounted, computed, reactive} from 'vue';
import * as d3 from "d3";

const props = defineProps({
  seatArea:{
    type: String,
    default: ""
  },
  seatDatas: {
    type: Object,
    default: []
  },
  isBackgroundImageLoad: {
    type: Boolean,
    default: false
  },
  backgroundImageUrlStr: {
    type: String,
    default: "..\\assets\\seat-background.svg"
  },
  deskImageUrlStr: {
    type: String,
    default: "..\\assets\\desk.svg"
  },
  pillarImageUrlStr: {
    type: String,
    default: "..\\assets\\pillar.svg"
  },
  officeImageUrlStr: {
    type: String,
    default: "..\\assets\\office.svg"
  }
});

const $q = useQuasar();
const viewWidth = ref(0);
const viewHeight = ref(0);
const viewPadding = ref(120);
const seatMap = ref({});
const {seatArea, seatDatas, isBackgroundImageLoad, backgroundImageUrlStr, deskImageUrlStr,
  pillarImageUrlStr, officeImageUrlStr
} = toRefs(props);
//let seatGroups = reactive({});
const svg = ref(null);
const seatGroups = ref(null);
const emit = defineEmits(["selectedSeatEvent"]);

// import SVG image path
const backgroundImageUrl = new URL(backgroundImageUrlStr.value, import.meta.url).href;
const staffImageUrl = new URL(deskImageUrlStr.value, import.meta.url).href;
const pillarImageUrl = new URL(pillarImageUrlStr.value, import.meta.url).href;
const officeImageUrl = new URL(officeImageUrlStr.value, import.meta.url).href;

/* let mapDatas = computed(() => {
  return seatDatas.value 
}) */

onMounted(() => {
    if (seatDatas.value .length > 0) {
      drawSeatMap();
    } else {
      console.log("Waiting for seatDatas...");
    }
});

/** 繪製Seat Map */
const drawSeatMap = ()=> {
  initSvgSeatMap(); 
  drawSeat(seatDatas.value);
  drawLegend();
}

/** 初始化SVG畫布 */
const initSvgSeatMap = () => {
  const defaultScale = 1.0;
  //const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const maxX = Math.max.apply(null, props.seatDatas.map(function (o) { return o.x; }));
  const maxY = Math.max.apply(null, props.seatDatas.map(function (o) { return o.y; }));
  const seatsWithMaxX = Math.max.apply(null, props.seatDatas.filter(seat => seat.x === maxX)
                                  .map(function (o) { 
                                    if((o.width | 0) > (o.radius| 0)) return (o.width | 0); 
                                    else return (o.radius | 0);
                                    }));

  viewWidth.value = maxX + seatsWithMaxX + viewPadding.value;
  viewHeight.value = maxY + viewPadding.value;

  //設置畫布
  svg.value = d3
    .select(seatMap.value)
    .append("svg")
    .attr('viewBox', `0 0 ${viewWidth.value} ${viewHeight.value}`)
    //.attr("style", "border:1px solid black")
    .attr("width", "100%")
    .attr("height", "100%");

    //設置座位群組
    seatGroups.value = svg.value.append("g");
              //.attr('transform', `translate(${margin.left},${margin.top})`);

    const zoom = d3.zoom().scaleExtent([ 0.1, 3 ]).on("zoom", function(event) {
      seatGroups.value.attr("transform", event.transform)
      //seatGroups.value.attr('transform', `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
    });

    svg.value.call(zoom);

    //添加重置、放大、縮小按鈕
    d3.select("#reset").on("click", () =>{
       svg.value.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);         
          //.attr('transform', `scale(${defaultScale})`);	
    });

    d3.select("#zoomIn").on("click", () =>{
      svg.value.transition().call(zoom.scaleBy, 2)
    });

    d3.select("#zoomOut").on("click", () =>{
      svg.value.transition().call(zoom.scaleBy, 0.5)
    });
}

/** draw seat */
const drawSeat = (datas) => {
  d3Tooltip.createTooltip();
  // load background image and external svg file
  d3.xml(backgroundImageUrl)
    .then((data) => {
      if(isBackgroundImageLoad.value === true){
        svg.value.node().append(data.documentElement);
      }
    })
    .then((data) => {
        seatGroups.value.selectAll("g")
        .data(datas)
        .enter()
        .append("g")
        .style("cursor", (d) => (d.status !== 'available' ? "not-allowed" : "pointer"))
        .on("click", function (event, d) {
            if(d.status !== 'available'){
                updateSelectedSeat(d);
            } else {
                updateSeatColor(d.id);
                updateSelectedSeat(d);
            }
        })
        .on("mouseover", function (event, d) {
            d3Tooltip.show(event, d);
        })
        .on("mousemove", function (event) {
            d3Tooltip.move(event);
        })
        .on("mouseout", function () {
            d3Tooltip.hide();
        });

      /** seatGroup append svg element and text */
      Promise.all([
        d3.svg(officeImageUrl),
        d3.svg(pillarImageUrl),
      ]).then(([office, pillar]) => {       
        seatGroups.value.selectAll("g")
          .append((d) =>
            getOfficeSvgElement(
              d,
              office,
              pillar
            )
          )
          .each(function(d){
            appendSvgAttr(d3.select(this));
          });

        seatGroups.value.selectAll("g")
          .append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "16px")
          .attr("fill", "blue")
          .each(function (d) { wrapText(d3.select(this), d); })             
      });
    })
    .catch((error) => {
      console.error("Error loading the external SVG file:", error);
    });
};

/** 繪製Legend圖例 */
const drawLegend = () =>
{
  // 添加图例数据
  const legendData = [
    { color: "DeepSkyBlue", text: "可預定" , opacity: 0.5, width: 20, height: 20},
    { color: "grey", text: "已預定", opacity: 0.8, width: 20, height: 20},
    { color: "darkred", text: "當前選取", opacity: 0.5, width: 20, height: 20},
  ];

  // Draw legend
  const legend = svg.value.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${viewWidth.value - viewPadding.value + 20}, 0)`);

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * (d.height + 3))
    .attr("width", d => d.width)
    .attr("height", d => d.height)
    .attr("opacity", d => d.opacity)
    .style("fill", d => d.color);

  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", d => d.width + 3)
    .attr("y", (d, i) => i * (d.height + 3) + (d.height / 2))
    .attr("dy", ".35em")
    .text(d => d.text);
}

/* Tooltip object */
const d3Tooltip = {
    element: null,
    createTooltip: function() {
        this.element = d3
          .select(seatMap.value)
          .append("div")
          .style("position", "fixed")
          .style("background", "lightgrey")
          .style("padding", "5px")
          .style("border-radius", "5px")
          .style("pointer-events", "none")
          .style("display", "none");
        return this.element;
    },
    show: function(event, data) {
        this.element.style("display", "block")
        .html(`位置: ${data.id}<br>
          預訂工號: ${data.bookedUserId ? data.bookedUserId : "未預訂"}<br>
          預訂人員: ${data.bookedUserName ? data.bookedUserName : "未預訂"}<br>
          狀態: ${data.status}<br>
          類型: ${ getCategortTypeDescr(data.category) }`);
    },
    move: function(event) {
        this.element
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY + 20 + "px");
    },
    hide: function() {
        this.element.style("display", "none");
    }
};

/** svg element append attribute */
const appendSvgAttr = function (selection){
  selection.attr("display", (d) => (d.type === 'disable' ? "none" : "block"))
    .attr("opacity", d=> setSvgOpacity(d))
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("id", d => d.id)
    .attr("width", d => d.width)
    .attr("height",d => d.height)
    .attr("rx", d=> d.category === 'desk' ? 10 : 1)
    .attr("ry", d=> d.category === 'desk' ? 10 : 1)
    .attr('fill', d => d.status === 'available' ? 'DeepSkyBlue' : 'grey')
    .attr("stroke", "black")
    .attr("stroke-width", 1);
}

/** get office Svg element by switch case */
const getOfficeSvgElement = (d, office, pillar) => {
  switch (d.category) {
    case "desk":
    case "aisle":
    case "lab":
    case "storage":
    case "door":
    case "office":
      return document.createElementNS("http://www.w3.org/2000/svg", "rect");
    case "pillar":
      return pillar.documentElement.cloneNode(true);
    default:
      return document.createElementNS("http://www.w3.org/2000/svg", "rect");
  }
};

/** set svg element opacity */
const setSvgOpacity = (d) => {
  if(d.category === 'desk' && d.status === 'available')
  {
    return 0.5;
  }
 return 0.8;
};

/** draw seat element text and handle warp text */
const wrapText = function(textSelection, data) {
  const lines = data ? data.bookedUserName.split("\n"): [];
  const text = d3.select(this);
  const lineHeight = 1.1; // Adjust line height as necessary
  // Calculate the offset for centering the text block
  const totalHeight = lines.length * lineHeight;
  const offset = (totalHeight / 2) - (lineHeight / 2);

  lines.forEach((line, i) => {
      textSelection.append("tspan")
          .attr("x", data.x + data.width / 2)
          .attr("y", data.y + data.height / 2)
          .attr("dy", `${(i * lineHeight) - offset}em`) // Adjust offset for centering
          .text(line);
  })
}

/** get seat descr of category type */
const getCategortTypeDescr = function (category) {
  switch (category) {
    case "desk":
      return "座位";
    case "aisle":
      return "走道";
    case "lab":
      return "實驗室";
    case "storage":
      return "儲物櫃";
    case "door":
      return "門";
    case "office":
      return "辦公室";
    case "pillar":
      return "柱子";
    default:
      return "未知";
  }
}

/** update seat color */
const updateSeatColor = (seatId) => {
  seatGroups.value
    .selectAll("rect")
    .attr("stroke-width", 1)
    .attr("fill", (d) => (d.status !== 'available' ? "grey" : "DeepSkyBlue"));

  const seat = seatGroups.value.selectAll("rect").filter((d) => d.id === seatId);
  seat.attr('stroke-width', 1)
       .attr('fill', 'darkred');
};

/** emit selected seats data */
const updateSelectedSeat = (seat) => {
  //seatInfo.value = seat;
  emit('selectedSeatEvent', seat);
};
</script>


<style>
.seat-map {
  margin: 10px 5px 5px 5px;
}
</style>