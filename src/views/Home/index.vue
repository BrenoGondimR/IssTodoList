<template>
  <main>
    <b-row style="width: 100%;">
      <b-colxx class="card-tasks-home" lg="6" md="10" sm="12" style="padding: 45px; margin-bottom: 50px !important;">
        <b-row>
          <b-colxx class="card-col-tasks" lg="12" style="margin-bottom: 25px">
            <span style="width: 100%; display: flex; font-size: 30px;">All</span>
            <TaskCard @edit-task="editTask" @change="updateTasks" v-for="task in tasks" :key="task.id" :task-id="task.id" :task-name="task.title" :due-date="task.date" :due-time="task.hour" :task-type="task.type" :task-state="task.state" :task-description="task.description"/>
          </b-colxx>
          <b-colxx class="card-col-tasks" lg="12" style="margin-bottom: 25px">
            <span style="width: 100%; display: flex; font-size: 30px;">Todo</span>
            <TaskCard @edit-task="editTask" @change="updateTasks" v-for="task in tasks.filter(t => t.state === 'todo')" :key="task.id" :task-id="task.id" :task-name="task.title" :due-date="task.date" :due-time="task.hour" :task-type="task.type" :task-state="task.state" :task-description="task.description"/>
          </b-colxx>
          <b-colxx class="card-col-tasks" lg="12">
            <span style="width: 100%; display: flex; font-size: 30px;">Done</span>
            <TaskCard @edit-task="editTask" @change="updateTasks" v-for="task in tasks.filter(t => t.state === 'done')" :key="task.id" :task-id="task.id" :task-name="task.title" :due-date="task.date" :due-time="task.hour" :task-type="task.type" :task-state="task.state" :task-description="task.description"/>
          </b-colxx>
          <b-colxx lg="12" class="mt-5">
            <Button label="Add Task" @click="openNewTaskModal" rounded />
          </b-colxx>
        </b-row>
      </b-colxx>
    </b-row>
    <Dialog :visible.sync="showModal" class="modal-class" style="width: 50vw" modal closable>
      <template #header>
        <h3>{{ editingTask ? 'Edit Task' : 'Add New Task' }}</h3>
      </template>
      <b-row>
        <b-colxx v-for="input in inputsModal" :key="input.key" :lg="input.col" style="margin-bottom: 7px">
          <template v-if="input.type === 'InputText'">
            <label>{{ input.label }}</label>
            <InputText style="width: 100%" v-model="input.value" :class="{ 'invalid-field': !input.isValid }" @input="input.isValid = true" />
          </template>
          <template v-else-if="input.type === 'TextArea'">
            <Button label="IA Generation" icon="pi pi-bolt" @click="generateDescription" class="animated-border-button" v-if="!inputsModal.find(input => input.key === 'description').value" style="position: absolute; width: 200px !important; margin-top: 35px; left: 32px;" />
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
import { defineComponent } from "vue";
import { mapActions, mapState } from "vuex";
import BColxx from "@/components/Common/Colxx.vue";
import TaskCard from "@/components/Common/TaskCard.vue";
import CardInfoTasks from "@/components/Common/CardInfoTasks.vue";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const apiKey = 'AIzaSyAVQ3IqvZ6DN9_sinB5e_HPvnziSbFVrnE';
const genAI = new GoogleGenerativeAI(apiKey);

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
      editingTask: false,
      currentTaskId: null as number | null,
      originalDate: '',
      originalHour: '',
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
    async fetchTaskDescription(title: string): Promise<string> {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });

        const generationConfig = {
          temperature: 1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        };

        const chatSession = model.startChat({
          generationConfig,
          history: [],
        });

        const prompt = `Aja como um assistente de produtividade especializado em to-do lists. Quando o usuário digitar o título de uma tarefa, gere uma descrição detalhada e útil da tarefa. A descrição deve ser clara, fornecer informações suficientes e ajudar o usuário a entender exatamente o que precisa ser feito.
            Exemplo:

            **Título:** Comprar mantimentos
            **Descrição:** Fazer uma lista detalhada dos itens essenciais, verificar o que está faltando na despensa e ir ao supermercado para comprar alimentos e outros suprimentos para a semana.

            **Título:** Agendar consulta médica
            **Descrição:** Ligar para o consultório do médico, verificar a disponibilidade de horários e agendar uma consulta. Anotar a data e a hora da consulta no calendário.

            **Título:** Estudar para o exame
            **Descrição:** Revisar o material do curso, fazer anotações dos pontos principais e resolver exercícios práticos. Reservar tempo suficiente para revisar antes do exame.

            Agora é sua vez:

            **Título:** ${title}
            **Descrição:**`;

        let firstChunkReceived = false;
        const result = await chatSession.sendMessageStream(prompt);
        let botResponse = '';
        for await (const chunk of result.stream) {
          if (!firstChunkReceived) {
            firstChunkReceived = true;
          }
          botResponse += chunk.text();
          this.updateDescription(botResponse);
        }
        return this.markdownToPlainText(botResponse);
      } catch (error) {
        console.error("Error fetching task description:", error);
        return '';
      }
    },
    markdownToPlainText(markdown: string) {
      // Remove headers
      let plainText = markdown.replace(/^##\s(.*)/gm, '$1');

      // Remove bold text
      plainText = plainText.replace(/\*\*(.*)\*\*/gm, '$1');

      // Remove list items
      plainText = plainText.replace(/^\*\s(.*)/gm, '$1');

      // Remove nested list items
      plainText = plainText.replace(/^\s+\*\s(.*)/gm, '$1');

      // Remove unnecessary newlines and extra spaces
      plainText = plainText.replace(/\n{2,}/g, '\n').trim();

      return plainText;
    },
    updateDescription(text: string) {
      this.inputsModal.find(field => field.key === 'description')!.value = text;
    },
    async generateDescription() {
      const titleField = this.inputsModal.find(field => field.key === 'title');
      if (titleField?.value) {
        this.inputsModal.find(field => field.key === 'description')!.value = await this.fetchTaskDescription(titleField.value);
      } else {
        console.log("Title is required to generate description");
        titleField!.isValid = false; // Set the title field as invalid
      }
    },
    formatDate(date: string): string {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return this.originalDate; // Retorna a data original se a nova data for inválida
      }
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear().toString();
      return `${day}/${month}/${year}`;
    },

    formatTime(date: string): string {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return this.originalHour; // Retorna a hora original se a nova hora for inválida
      }
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    async saveTaskAction() {
      if (this.validateInputs()) {
        const dateField = this.inputsModal.find(field => field.key === 'date');
        const hourField = this.inputsModal.find(field => field.key === 'hour');

        const dateValue = dateField && dateField.value ? dateField.value : this.originalDate;
        const hourValue = hourField && hourField.value ? hourField.value : this.originalHour;

        // Verifica se a data e a hora são válidas
        const formattedDate = this.formatDate(dateValue);
        const formattedHour = this.formatTime(hourValue);

        const task: Task = {
          id: this.currentTaskId || Date.now(),
          title: this.inputsModal.find(field => field.key === 'title')!.value,
          description: this.inputsModal.find(field => field.key === 'description')!.value,
          date: formattedDate,
          hour: formattedHour,
          type: this.inputsModal.find(field => field.key === 'select')!.value.value,
          state: this.editingTask ? this.tasks.find((t: Task) => t.id === this.currentTaskId)?.state || 'todo' : 'todo'
        };

        if (this.editingTask && this.currentTaskId !== null) {
          const tasksString = localStorage.getItem('tasks');
          let tasks: Task[] = tasksString ? JSON.parse(tasksString) : [];
          const taskIndex = tasks.findIndex((t: Task) => t.id === this.currentTaskId);

          if (taskIndex !== -1) {
            tasks[taskIndex] = task;
            localStorage.setItem('tasks', JSON.stringify(tasks));
          }
        } else {
          const tasksString = localStorage.getItem('tasks');
          let tasks: Task[] = tasksString ? JSON.parse(tasksString) : [];
          tasks.push(task);
          localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        this.showModal = false;
        this.resetTaskForm();
        this.updateTasks();
      } else {
        console.log("Validation failed");
      }
    },

    resetTaskForm() {
      this.inputsModal.forEach(field => {
        field.value = '';
        field.isValid = true;
      });
      this.editingTask = false;
      this.currentTaskId = null;
      this.originalDate = '';
      this.originalHour = '';
    },
    closeModal() {
      this.resetTaskForm();
      this.showModal = false;
    },
    updateTasks() {
      this.loadTasks();
    },
    openNewTaskModal() {
      this.resetTaskForm();
      this.showModal = true;
    },
    editTask(task: Task) {
      const titleField = this.inputsModal.find(field => field.key === 'title');
      const descriptionField = this.inputsModal.find(field => field.key === 'description');
      const dateField = this.inputsModal.find(field => field.key === 'date');
      const hourField = this.inputsModal.find(field => field.key === 'hour');
      const typeField = this.inputsModal.find(field => field.key === 'select');

      if (titleField) titleField.value = task.title;
      if (descriptionField) descriptionField.value = task.description;
      if (dateField) dateField.value = task.date;
      if (hourField) hourField.value = task.hour;
      if (typeField) typeField.value = { name: task.type, value: task.type }; // Set the correct value

      this.currentTaskId = task.id;
      this.originalDate = task.date;
      this.originalHour = task.hour;
      this.showModal = true;
      this.editingTask = true;
    }
  },
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
.animated-border-button {
  margin-bottom: 10px;
  margin-top: 10px;
  border: 2px solid transparent;
  background-image: linear-gradient(var(--button-color, #fff), var(--button-color, #fff)), radial-gradient(circle at top left, #ff7a18, #f64f59);
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.animated-border-button:hover {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.animated-border-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(60deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0), rgba(255, 255, 255, 0));
  clip-path: polygon(-20% 0, 100% 0%, 80% 100%, 0% 100%);
  transition: all 0.7s ease-out;
  transform: translateX(-100%);
  z-index: 0;
}

.animated-border-button:hover::before {
  transform: translateX(100%);
}
@media screen and (max-width: 991px) {
  .card-tasks-home{
    margin: 150px auto auto !important;
  }
}

</style>
