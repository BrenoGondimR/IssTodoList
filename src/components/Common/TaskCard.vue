<template>
  <div class="task-item" :style="borderStyle">
    <div class="div-checkbox" @click="toggleCheck">
      <RadioButton v-model="checked" :value="true" class="status-radio-button" :disabled="true" />
    </div>
    <div class="task-details">
      <h3>{{ taskName }}</h3>
      <div style="text-align: left; color: #b3b5c4; display: flex; gap: 15px;">
        <div style="display: flex; gap: 5px;">
          <i class="pi pi-calendar" style="margin: auto;"></i>
          <p>{{ dueDate }}</p>
        </div>
        <div style="display: flex; gap: 5px;">
          <i class="pi pi-clock" style="margin: auto;"></i>
          <p>{{ dueTime }}</p>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <i class="pi pi-pencil" @click="editTask" style="margin: auto 5px; cursor: pointer;"></i>
      <i class="pi pi-trash" @click="deleteTask" style="margin: auto 5px; cursor: pointer;"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import RadioButton from 'primevue/radiobutton';
import 'primeicons/primeicons.css';

export default defineComponent({
  name: 'TaskCard',
  components: {
    RadioButton
  },
  props: {
    taskId: {
      type: Number as PropType<number>,
      required: true
    },
    taskName: {
      type: String as PropType<string>,
      required: true
    },
    dueDate: {
      type: String as PropType<string>,
      required: true
    },
    dueTime: {
      type: String as PropType<string>,
      required: true
    },
    taskType: {
      type: String as PropType<string>,
      required: true
    },
    taskState: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {
      checked: this.taskState === 'done'
    };
  },
  watch: {
    taskState(newValue) {
      this.checked = newValue === 'done';
    }
  },
  computed: {
    borderStyle(): Record<string, string> {
      const colorMap: Record<string, string> = {
        Business: '#ffa8f6',
        Personal: '#ffc397'
      };
      return { borderColor: colorMap[this.taskType] || '#ccc' };
    }
  },
  methods: {
    toggleCheck(): void {
      this.checked = !this.checked;
      this.updateTaskState();
    },
    updateTaskState() {
      const tasksString = localStorage.getItem('tasks');
      const tasks = tasksString ? JSON.parse(tasksString) : [];
      const taskIndex = tasks.findIndex((task: any) => task.id === this.taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].state = this.checked ? 'done' : 'todo';
        localStorage.setItem('tasks', JSON.stringify(tasks));
        this.$emit('task-updated', tasks[taskIndex]);
        this.$emit('change');
        console.log(`Task ${this.taskId} state updated to ${tasks[taskIndex].state}`);
      }
    },
    editTask() {
      console.log(`Editing task ${this.taskId}`);
    },
    deleteTask() {
      const tasksString = localStorage.getItem('tasks');
      const tasks = tasksString ? JSON.parse(tasksString) : [];
      const updatedTasks = tasks.filter((task: any) => task.id !== this.taskId);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      this.$emit('task-deleted', this.taskId);
      this.$emit('change');
      console.log(`Deleted task ${this.taskId}`);
    }
  }
});
</script>

<style scoped>
.task-item {
  display: flex;
  margin-bottom: 25px;
  align-items: center;
  border-left: 8px solid;
  padding: 10px;
  width: 100%;
  gap: 20px;
  background-color: #f4f7ff;
  box-shadow: 1px 0px 9px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.div-checkbox {
  justify-content: center;
  display: flex;
  border-radius: 50%;
  height: 50px;
  width: 50px;
  padding: 15px;
  background-color: white;
  cursor: pointer;
}

.task-details h3, .task-details p {
  margin: 0;
  display: flex;
  align-items: center;
}

.task-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.pi-pencil, .pi-trash {
  font-size: 20px;
}

.pi-pencil:hover, .pi-trash:hover {
  color: #007bff;
}
</style>
