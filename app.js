const STORAGE_KEY = "todo-vanilla-items";

const loadTodos = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load todos:", error);
    return [];
  }
};

const saveTodos = (todos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const createApp = () => {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = "Todo";

  const form = document.createElement("form");
  form.className = "todo-form";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Add a task and press Enter";
  input.autocomplete = "off";
  input.required = true;

  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "Add";

  form.append(input, addButton);

  const controls = document.createElement("div");
  controls.className = "todo-controls";

  const stats = document.createElement("span");
  stats.className = "todo-stats";

  const filterGroup = document.createElement("div");
  filterGroup.className = "todo-filters";

  const filters = ["all", "active", "completed"];
  const filterButtons = new Map();
  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = filter[0].toUpperCase() + filter.slice(1);
    button.dataset.filter = filter;
    filterGroup.appendChild(button);
    filterButtons.set(filter, button);
  });

  const clearCompleted = document.createElement("button");
  clearCompleted.type = "button";
  clearCompleted.textContent = "Clear completed";

  controls.append(stats, filterGroup, clearCompleted);

  const list = document.createElement("ul");
  list.className = "todo-list";

  app.append(title, form, controls, list);

  return {
    app,
    form,
    input,
    stats,
    list,
    filterButtons,
    clearCompleted,
  };
};

const init = () => {
  const ui = createApp();
  let todos = loadTodos();
  let activeFilter = "all";

  const updateStats = () => {
    const total = todos.length;
    const remaining = todos.filter((todo) => !todo.completed).length;
    ui.stats.textContent = `${remaining} left out of ${total}`;
  };

  const applyFilter = (items) => {
    if (activeFilter === "active") {
      return items.filter((todo) => !todo.completed);
    }
    if (activeFilter === "completed") {
      return items.filter((todo) => todo.completed);
    }
    return items;
  };

  const render = () => {
    ui.list.innerHTML = "";
    const visibleTodos = applyFilter(todos);

    if (visibleTodos.length === 0) {
      const empty = document.createElement("li");
      empty.className = "todo-empty";
      empty.textContent = "No tasks here yet.";
      ui.list.appendChild(empty);
    } else {
      visibleTodos.forEach((todo) => {
        const item = document.createElement("li");
        item.className = "todo-item";
        item.dataset.id = todo.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;

        const label = document.createElement("span");
        label.textContent = todo.text;
        if (todo.completed) {
          label.className = "todo-completed";
        }

        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Delete";
        remove.className = "todo-delete";

        item.append(checkbox, label, remove);
        ui.list.appendChild(item);
      });
    }

    updateStats();
    ui.filterButtons.forEach((button, key) => {
      button.classList.toggle("active", key === activeFilter);
    });
  };

  const addTodo = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    todos.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    });
    saveTodos(todos);
    render();
  };

  const toggleTodo = (id) => {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(todos);
    render();
  };

  const deleteTodo = (id) => {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos(todos);
    render();
  };

  const clearCompletedTodos = () => {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos(todos);
    render();
  };

  ui.form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(ui.input.value);
    ui.input.value = "";
    ui.input.focus();
  });

  ui.list.addEventListener("click", (event) => {
    const item = event.target.closest(".todo-item");
    if (!item) {
      return;
    }
    const id = item.dataset.id;
    if (event.target.matches("input[type='checkbox']")) {
      toggleTodo(id);
    }
    if (event.target.matches(".todo-delete")) {
      deleteTodo(id);
    }
  });

  ui.filterButtons.forEach((button, filter) => {
    button.addEventListener("click", () => {
      activeFilter = filter;
      render();
    });
  });

  ui.clearCompleted.addEventListener("click", clearCompletedTodos);

  render();
};

document.addEventListener("DOMContentLoaded", init);
