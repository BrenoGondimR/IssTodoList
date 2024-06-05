<template>
  <div class="task-card">
    <div class="task-info">
      <h3 :style="{ color: cardColor }">{{ category }}</h3>
      <p :style="{ color: cardColor }">{{ tasksLeft }} tasks left</p>
    </div>
    <Knob v-model="completionRate" :valueColor="cardColor" :min="0" :max="100" valueTemplate="{value}%" readOnly class="knob-style"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useStore, mapGetters } from 'vuex';
import Knob from 'primevue/knob';

export default defineComponent({
  name: 'CardInfoTasks',
  components: {
    Knob
  },
  props: {
    category: {
      type: String as PropType<string>,
      required: true
    },
    cardColor: {
      type: String as PropType<string>,
      default: '#f0f0f0'
    }
  },
  computed: {
    ...mapGetters(['totalTasksByType', 'completedTasksByType']),
    tasksLeft(): number {
      return this.totalTasks - this.completedTasks;
    },
    completionRate(): number {
      return this.totalTasks === 0 ? 0 : Math.round((this.completedTasks / this.totalTasks) * 100);
    },
    totalTasks(): number {
      return this.totalTasksByType(this.category);
    },
    completedTasks(): number {
      return this.completedTasksByType(this.category);
    }
  }
});
</script>

<style scoped>
.task-card {
  display: flex;
  background-color: #f4f7ff;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-info h3 {
  margin: 0;
  font-size: 20px;
}

.task-info p {
  margin: 0;
  font-weight: 300;
}

.knob-style {
  width: 100px;
  height: 100px;
}

:deep(.p-knob svg) {
  width: 70px !important;
}
</style>
