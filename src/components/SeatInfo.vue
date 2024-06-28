<template>
  <div class="justify-center" v-if="seatInfo">
    <h6>座位信息</h6>
    <p>位置: {{ seatInfo.id }}</p>
    <p>預訂工號: {{ seatInfo.bookedUserId || '未预订' }}</p>
    <p>預訂人員: {{ seatInfo.bookedUserName || '未预订' }}</p>
    <p>狀態: {{ seatInfo.status }}</p>
    <q-btn @click="showBookingDialog" label="预订" v-if="seatInfo.status == 'available'" />
    <q-dialog v-model="bookingDialogVisible">
      <q-card>
        <q-card-section>
          <q-card-title>预订座位</q-card-title>
          <q-card-main>
            <p>您正在预订位置: {{ seatInfo.id }}</p>
            <!-- Add booking form or additional content here -->
          </q-card-main>
          <q-card-actions align="right">
            <q-btn label="取消" color="primary" @click="bookingDialogVisible = false" />
            <q-btn label="确认预订" color="primary" @click="bookSeat(seatInfo)" />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const bookingDialogVisible = ref(false);

const props = defineProps({
  seatInfo: Object
});

const showBookingDialog = () => {
  bookingDialogVisible.value = true;
};

const bookSeat = (seatInfo) => {
  // Implement booking logic here
  console.log('Booking seat:', seatInfo.id);
  bookingDialogVisible.value = false;

  alert(`功能待開發!! 假設成功预订座位 ${seatInfo.id}`);

  // Optionally, notify user or perform additional actions
/*   $q.notify({
    type: 'positive',
    message: `成功预订座位 ${seatInfo.id}`
  }); */
};

</script>

<style scoped>
/* 添加样式 */
</style>
