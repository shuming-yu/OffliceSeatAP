<template>
  <div class="row justify-center">
    <div class="q-gutter-xs row">
      <q-btn
        no-caps
        class="button"
        @click="$emit('prev')"
      >
        &lt;
      </q-btn>

      <q-btn
      no-caps
      class="button"
      @click="$emit('next')"
      >
        &gt;
    </q-btn>

    <q-btn
      no-caps
      class="button"
      @click="$emit('today')"
    >
      Today
    </q-btn>
    </div>
  </div>
</template>
