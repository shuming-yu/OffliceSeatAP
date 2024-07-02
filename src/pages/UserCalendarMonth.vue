<template>
  <div class="page-content-tray">
      <div class="q-py-lg container">

        <!-- 選單 -->
        <div class="q-pt-xl sidebar">
          <q-list separator>
            <q-item v-for="item in actionLists" :key="item.id" clickable v-ripple @click="selectAction(item)">
              <q-item-section avatar>
                <q-icon :name="item.name" :color="item.color" size="2.5em" />
              </q-item-section>

              <q-item-section>{{ item.title }}</q-item-section>
            </q-item>
          </q-list>

          <div v-show="showBtn">
            <q-btn outline rounded class="q-mt-md animated-button" style="width: 140px; color: goldenrod;" label="確認送出" />
          </div>
        </div>

        <!-- Calendar -->
        <div class="q-pa-md main">
          <div class="q-pb-md navigationbar">
            <NavigationBar
              @prev="onPrev"
              @today="onToday"
              @next="onNext"
            />

            <div class="month-title">
              {{ selectedMonth }}
            </div>

            <q-btn @click="showDisplay" rounded push color="primary" label="排班" style="width: 150px" />
          </div>

          <QCalendarMonth
            ref="calendar"
            v-model="selectedDate"
            :selected-dates="selectedDates"
            :disabled-days="disabledDays"
            :disabled-weekdays="[0,6]"
            :day-height="dayHeight"
            :day-min-height="60"
            locale="zh-hant"
            no-active-date
            no-outside-days
            animated
            bordered
            @change="onChange"
            @moved="onMoved"
            @click-day="onToggleDay"
            @click-workweek="onClickWorkweek"
            @click-head-workweek="onClickHeadWorkweek"
            @click-head-day="onClickHeadDay"
            >
            <template #day="{ scope: { timestamp } }">
              <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
                <div
                  :class="badgeClasses(event, 'day')"
                  :style="badgeStyles(event, 'day')"
                  class="my-event"
                >
                  <div class="title q-calendar__ellipsis">
                    {{ event.title }}
                  </div>
                </div>
              </template>
            </template>
          </QCalendarMonth>
        </div>

      </div>
  </div>
</template>

<script setup>
import {
  QCalendarMonth,
  today,
  addToDate,
  parseTimestamp
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'

import { ref, reactive, computed, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import NavigationBar from '../components/NavigationBar.vue'

const $q = useQuasar();
const selectedDate = ref(today());
const actionLists = reactive([
  {
    id: 1,
    name: 'work',
    color: 'blue',
    title: '進公司'
  },
  {
    id: 2,
    name: 'home',
    color: 'orange',
    title: '居家工作'
  },
  {
    id: 3,
    name: 'favorite',
    color: 'pink-5',
    title: '請假'
  },
  {
    id: 4,
    name: 'flight',
    color: 'teal',
    title: '出差'
  }
]);

const selectedDates = ref([]);
const events = reactive([]);
const calendar = ref(null); //ref="calendar"
const showBtn = ref(false);

// computed
const dayHeight = computed(() => {
  const width = window.innerWidth;

  if (width > 1280) {
    return 120;
  }
  else {
    return 60;
  }
})

const selectedMonth = computed(() => {
  const timeStamp = selectedDate.value;
  return date.formatDate(timeStamp, 'YYYY/MM');
})

const disabledDays = computed(() => {
  return ['2024-06-10','2024-09-16','2024-09-17','2024-10-10','2024-10-11'];
})

const eventsMap = computed(() => {
  const map = {};
  if (events.length > 0) {
    events.forEach(event => {
      (map[event.date] = (map[event.date] || [])).push(event);

      if (event.days !== undefined) {
        let timestamp = parseTimestamp(event.date);
        let days = event.days;
        do {
          timestamp = addToDate(timestamp, { day: 1 });
          if (!map[timestamp.date]) {
            map[timestamp.date] = [];
          }
          map[timestamp.date].push(event);
        } while (--days > 1)
      }
    })
  }

  console.log("map:", map);
  return map;
})


// methods
function onToggleDay ({ scope }) {
  console.log('day clicked (scope)', scope)
  if (scope !== undefined) {
    toggleDate(scope);
  }
}

function toggleDate (scope) {
  const date = scope.timestamp.date;
  // 不允許點選 放假日/調整放假日
  if (scope.disabled || scope.timestamp.disabled) {
    return;
  }
  if (selectedDates.value.includes(date)) {
    // remove the date
    for (let i = 0; i < selectedDates.value.length; ++i) {
      if (date === selectedDates.value[ i ]) {
        selectedDates.value.splice(i, 1);
        break;
      }
    }
  }
  else {
    // add the date if not outside
    if (scope.outside !== true) {
      selectedDates.value.push(date);
    }
  }
}

function badgeClasses (event, type) {
  return {
    [ `text-white bg-${ event.bgcolor }` ]: true,
    'rounded-border': true
  }
}

function badgeStyles (day, event) {
  const s = {};
  // s.left = day.weekday === 0 ? 0 : (day.weekday * this.parsedCellWidth) + '%'
  // s.top = 0
  // s.bottom = 0
  // s.width = (event.days * this.parsedCellWidth) + '%'
  return s;
}

function selectAction(action) {
  var dates = selectedDates.value;
  if(dates.length == 0) {
    $q.notify({
      message: '請先選擇日期!!',
      color: 'negative',
      actions: [
        { icon: 'close', color: 'white', round: true, handler: () => { /* ... */ } }
      ]
    })
    return;
  }

  dates.forEach(date => {
    let eventExists = false;

    // 檢查是否已存在事件，並替換舊事件
    events.forEach((event, index) => {
      if (event.date === date) {
        events[index] = {
          id: action.id,
          title: action.title,
          date: date,
          bgcolor: action.color
        }

        eventExists = true;
      }
    });

    // 如果沒有找到匹配事件，則添加新事件
    if (!eventExists) {
      events.push({
        id: action.id,
        title: action.title,
        date: date,
        bgcolor: action.color
      });
    }
  })

  // 清空
  selectedDates.value = [];
}


function onToday () {
  calendar.value.moveToToday();
}

function onPrev () {
  calendar.value.prev()
}
function onNext () {
  calendar.value.next()
}
function onMoved (data) {
  console.log('onMoved', data)
}
function onChange (data) {
  console.log('onChange', data)
}
function onClickDate (data) {
  console.log('onClickDate', data)
}
function onClickDay (data) {
  console.log('onClickDay', data)
}
function onClickWorkweek (data) {
  console.log('onClickWorkweek', data)
}
function onClickHeadDay (data) {
  console.log('onClickHeadDay', data)
}
function onClickHeadWorkweek (data) {
  console.log('onClickHeadWorkweek', data)
}

function showDisplay() {
  showBtn.value = true;
}
</script>

<style scoped>
.page-content-tray {
  background-color: #f5f6f8;
  border: 0;
  font-family: inherit;
  font-size: 100%;
  font-stretch: inherit;
  font-weight: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
  vertical-align: baseline;
  height: 100vh;
  /* overflow: hidden; */
}

.container {
  max-width: 1400px;
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.sidebar {
  flex-grow: 0;
  flex-shrink: 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 1em;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .1);
  flex-grow: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* max-width: 900px; */
  width: 100%;
}

.navigationbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.month-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  flex-grow: 1;
}

.my-event {
  position: relative;
  font-size: 12px;
  width: 100%;
  margin: 1px 0 0 0;
  justify-content: center;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.title {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: medium;
}

.text-white {
  color: white;
}

.bg-blue {
  background: blue;
}

.bg-green {
  background: green;
}

.bg-orange {
  background: orange;
}

.bg-red {
  background: red;
}

.bg-teal {
  background: teal;
}

.bg-grey {
  background: grey;
}

.bg-purple {
  background: purple;
}

.rounded-border {
  border-radius: 2px;
}

@media (max-width: 1280px) {
  .main {
    max-width: 900px;
  }
}

.animated-button {
  animation: bounceIn 2s infinite;
}

@keyframes bounceIn {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-15px);
  }
}
</style>
