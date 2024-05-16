// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task ID
function generateTaskId() {
    return nextId++;
}

  
// Create a task card
function createTaskCard(task) {
    // Determine the deadline class based on the task deadline.
    // White if done, red if overdue, yellow if within 3 days.
    let deadlineClass = '';
    const now = dayjs();
    if (task.status === 'done') {
        deadlineClass = 'bg-white';
    } else if (dayjs(task.deadline).isBefore(now)) {
        deadlineClass = 'bg-danger text-black';
    } else if (dayjs(task.deadline).isBefore(now.add(3, 'day'))) {
        deadlineClass = 'bg-warning';
    }

    // Return the HTML for the task card
    return `<div id="task-${task.id}" class="task-card card mb-3 ${deadlineClass}">
            <div class="card-header bg-white">${task.title}</div>
        <div class="card-body">
            <p class="card-text">${task.description}</p>
            <p class="card-text">Deadline: ${task.deadline}</p>
            <button class="btn btn-danger delete-task" data-id="${task.id}">Delete</button>
        </div>
    </div>`;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    if (task.status === 'to-do') {
      $('#todo-cards').append(taskCard);
    } else if (task.status === 'in-progress') {
      $('#in-progress-cards').append(taskCard);
    } else if (task.status === 'done') {
      $('#done-cards').append(taskCard);
    }
  });

  $('.task-card').draggable({
    revert: 'invalid',
    stack: '.task-card',
    helper: 'clone',
    start: function(event, ui) {
      $(ui.helper).addClass('ui-helper');
    }
  });

  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  $('.delete-task').on('click', handleDeleteTask);
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $('#task-title').val();
  const description = $('#task-description').val();
  const deadline = $('#task-deadline').val();

  const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    deadline: deadline,
    status: 'to-do'
  };

  taskList.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', JSON.stringify(nextId));
  $('#addTaskForm')[0].reset();
  $('#formModal').modal('hide');
  renderTaskList();
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = parseInt(ui.draggable.attr('id').split('-')[1]);
  const newStatus = $(this).attr('id');

  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.status = newStatus;
      if (newStatus === 'done') {
        task.deadlineClass = 'bg-white';
      }
    }
    return task;
  });

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Initialize the application
$(document).ready(function () {
  renderTaskList();

  $('#task-deadline').datepicker({
    dateFormat: 'yy-mm-dd'
  });

  $('#addTaskForm').on('submit', handleAddTask);
});

