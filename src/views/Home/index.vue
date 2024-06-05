<template>
  <main>
    <b-row style="width: 100%;">
      <b-colxx class="card-tasks-home" lg="6" md="10" sm="12" style="padding: 45px; margin-bottom: 50px !important;">
        <b-row>
          <b-colxx class="card-col-tasks" lg="12" style="margin-bottom: 25px">
            <span style="width: 100%; display: flex; font-size: 30px;">All</span>
            <TaskCard @change="updateTasks" v-for="task in tasks" :key="task.id" :task-id="task.id" :task-name="task.title" :due-date="task.date" :due-time="task.hour" :task-type="task.type" :task-state="task.state" />
          </b-colxx>
          <b-colxx class="card-col-tasks" lg="12" style="margin-bottom: 25px">
            <span style="width: 100%; display: flex; font-size: 30px;">Todo</span>
            <TaskCard @change="updateTasks" v-for="task in tasks.filter(t => t.state === 'todo')" :key="task.id" :task-id="task.id" :task-name="task.title" :due-date="task.date" :due-time="task.hour" :task-type="task.type" :task-state="task.state" />
          </b-colxx>
          <b-colxx class="card-col-tasks" lg="12">
            <span style="width: 100%; display: flex; font-size: 30px;">Done</span>
            <TaskCard @change="updateTasks" v-for="task in tasks.filter(t => t.state === 'done')" :key="task.id" :task-id="task.id" :task-name="task.title" :due-date="task.date" :due-time="task.hour" :task-type="task.type" :task-state="task.state" />
          </b-colxx>
          <b-colxx lg="12" class="mt-5">
            <Button label="Add Task" @click="showModal = true" rounded />
          </b-colxx>
        </b-row>
      </b-colxx>
    </b-row>
    <Dialog :visible.sync="showModal" style="width: 50vw" modal closable>
      <template #header>
        <h3>Add New Task</h3>
      </template>
      <b-row>
        <b-colxx v-for="input in inputsModal" :key="input.key" :lg="input.col" style="margin-bottom: 7px">
          <template v-if="input.type === 'InputText'">
            <label>{{ input.label }}</label>
            <InputText style="width: 100%" v-model="input.value" :class="{ 'invalid-field': !input.isValid }" @input="input.isValid = true" />
          </template>
          <template v-else-if="input.type === 'TextArea'">
            <label>{{ input.label }}</label>
            <Textarea style="width: 100%" v-model="input.value" :class="{ 'invalid-field': !input.isValid }" @input="input.isValid = true" rows="5" />
          </template>
          <template v-else-if="input.type === 'Calendar'">
            <label>{{ input.label }}</label>
            <Calendar style="width: 100%" v-model="input.value" :class="{ 'invalid-field': !input.isValid }" @date-select="() => input.isValid = true" dateFormat="dd/mm/yy" :timeOnly="input.key === 'hour'" />
          </template>
          <template v-else-if="input.type === 'Select'">
            <label>{{ input.label }}</label>
            <Dropdown style="width: 100%" v-model="input.value" :class="{ 'invalid-field': !input.isValid }" @change="input.isValid = true" :options="input.options" optionLabel="name" placeholder="Select a type" />
          </template>
        </b-colxx>
      </b-row>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="closeModal" class="p-button-text" />
        <Button label="Save" icon="pi pi-check" @click="saveTaskAction" class="p-button-text" />
      </template>
    </Dialog>
  </main>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore, mapActions, mapState } from 'vuex';
import BColxx from "@/components/Common/Colxx.vue";
import TaskCard from "@/components/Common/TaskCard.vue";
import CardInfoTasks from "@/components/Common/CardInfoTasks.vue";

interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  hour: string;
  type: string;
  state: string;
}

interface InputField {
  label: string;
  key: string;
  value: any;
  type: string;
  col: string;
  isValid: boolean;
  options?: Array<{ name: string; value: string }>;
}

export default defineComponent({
  name: "home",
  components: {
    TaskCard,
    BColxx,
    CardInfoTasks
  },
  data() {
    return {
      showModal: false,
      inputsModal: [
        { label: 'Title', key: 'title', value: '', type: 'InputText', col: '12', isValid: true },
        { label: 'Description', key: 'description', value: '', type: 'TextArea', col: '12', isValid: true },
        { label: 'Date', key: 'date', value: '', type: 'Calendar', col: '6', isValid: true },
        { label: 'Hour', key: 'hour', value: '', type: 'Calendar', col: '6', isValid: true },
        { label: 'Type', key: 'select', value: '', options: [{ name: 'Business', value: 'Business' }, { name: 'Personal', value: 'Personal' }], type: 'Select', col: '12', isValid: true },
      ] as InputField[],
    };
  },
  computed: {
    ...mapState(['tasks'])
  },
  created() {
    this.loadTasks();
  },
  methods: {
    ...mapActions(['loadTasks', 'saveTask']),
    formatDate(date: string): string {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear().toString();
      return `${day}/${month}/${year}`;
    },
    formatTime(date: string): string {
      const d = new Date(date);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    validateInputs(): boolean {
      let isFormValid = true;
      this.inputsModal.forEach(field => {
        if (!field.value) {
          field.isValid = false;
          isFormValid = false;
        } else {
          field.isValid = true;
        }
      });
      return isFormValid;
    },
    saveTaskAction() {
      if (this.validateInputs()) {
        const newTask: Task = {
          id: Date.now(),
          title: this.inputsModal.find(field => field.key === 'title')!.value,
          description: this.inputsModal.find(field => field.key === 'description')!.value,
          date: this.formatDate(this.inputsModal.find(field => field.key === 'date')!.value),
          hour: this.formatTime(this.inputsModal.find(field => field.key === 'hour')!.value),
          type: this.inputsModal.find(field => field.key === 'select')!.value.value,
          state: 'todo'
        };

        this.saveTask(newTask);
        this.showModal = false;
        this.resetTaskForm();
      } else {
        console.log("Validation failed");
      }
    },
    resetTaskForm() {
      this.inputsModal.forEach(field => {
        field.value = '';
        field.isValid = true;
      });
    },
    closeModal() {
      this.resetTaskForm();
      this.showModal = false;
    },
    updateTasks() {
      this.loadTasks();
    }
  },
  mounted() { }
});
</script>

<style scoped>
:deep(.p-dropdown-panel .p-dropdown-items){
  padding: 3px !important;
}
:deep(.p-inputtext:focus) {
  outline: 1px solid #3498db;
}
.p-button-text{
  color: white;
}
:deep(.p-dropdown:not(.p-disabled).p-focus) {
  outline: 1px solid #1AA3E5 !important;
}
.invalid-field {
  border: 1px solid red !important;
  border-radius: 8px !important;
}
.card-col-tasks{
  padding: 10px 10px 10px;
  background-color: whitesmoke;
  border: 1px dashed #cdcdcd;
  border-radius: 12px;
}
@media screen and (max-width: 991px) {
  .card-tasks-home{
    margin: 100px auto auto !important;
  }
}
</style>
