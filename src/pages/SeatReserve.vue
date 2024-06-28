<template>
  <q-page padding>
    <q-toolbar>
      <q-toolbar-title>座位预订系统---D3BF</q-toolbar-title>
    </q-toolbar>
    <div class="row" v-if= "seats.length > 0">
      <div class="col-md-10 col-sm-12 col-xs-12" >
        <SeatMap :seatDatas="seats" @selectedSeatEvent="updateSeatInfo"/>
      </div>
      <div class="col-md-2 col-sm-12 col-xs-12">
        <SeatInfo :seatInfo="seatInfo" />
      </div>
    </div>
  </q-page>
</template>

<script setup>

import {Quasar,useQuasar} from "quasar";
import { ref, onMounted, reactive } from "vue";
import SeatMap from "../components/SeatMap.vue";
import SeatInfo from "../components/SeatInfo.vue";
import axios from "axios";
import * as d3 from "d3";
import seatDatas from "../../mock-data/seat-data.json";

const $q = useQuasar();
let seats = reactive([]);
const seatInfo = ref({});

onMounted(() => {
  // 初始值 updateDimensions();
  // 添加事件監聽器
  //window.addEventListener('resize', updateDimensions);
  querySeats();
});

const querySeats = async () => {
  try {
    /*     const response = await axios.post('/querySeats', { date: selectedDate.value });*/
    await new Promise(resolve => setTimeout(() => {
      seats.push(...seatDatas);
      resolve();
    }, 1000));
  } catch (error) {
    $q.notify({
      position: 'top',
      type: "negative",
      message: "查询座位数据失败",
    });
    console.error("Error querying seats:", error);
  }
};

const updateSeatInfo = (seat) => {
  console.log("Selected seat:", seat);
  seatInfo.value = seat;
};
</script>

<style scoped>

</style>
