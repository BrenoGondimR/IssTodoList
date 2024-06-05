import { createStore } from 'vuex';

interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  hour: string;
  type: string;
  state: string;
}

interface State {
  tasks: Task[];
}

export default createStore<State>({
  state: {
    tasks: [],
  },
  getters: {
    totalTasks: (state) => state.tasks.length,
    totalTasksByType: (state) => (type: string) => state.tasks.filter(task => task.type === type).length,
    completedTasksByType: (state) => (type: string) => state.tasks.filter(task => task.type === type && task.state === 'done').length,
  },
  mutations: {
    setTasks(state, tasks: Task[]) {
      state.tasks = tasks;
    },
    addTask(state, task: Task) {
      state.tasks.push(task);
    }
  },
  actions: {
    loadTasks({ commit }) {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        commit('setTasks', JSON.parse(storedTasks));
      }
    },
    saveTask({ commit }, task: Task) {
      commit('addTask', task);
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]') as Task[];
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }
});
