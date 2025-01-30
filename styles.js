const API_URL = "https://api.jsonbin.io/v3/b/6791d562ad19ca34f8f30024"; // Your JSONBin URL
const API_KEY = "$2a$10$KpiDLKLCc341TzIpvhpAu.nXgYzTLRPcIoJII.z3cpl9qZsD6kU/W"; // Updated API Key

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Fetch tasks from JSONBin
async function fetchTasks() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "X-Master-Key": API_KEY
            }
        });
        const data = await response.json();
        return data.record.tasks || [];
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
}

// Update tasks in JSONBin
async function updateTasks(tasks) {
    console.log("Updating tasks:", tasks); // Debugging line
    try {
        await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({ tasks })
        });
    } catch (error) {
        console.error("Error updating tasks:", error);
    }
}

async function renderTasks() {
    const tasks = await fetchTasks();
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const safeText = task.text.replace(/'/g, "&apos;"); // Escape single quotes
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="${task.done ? 'done' : ''}">${safeText}</span>
            <div class="button-container">
                <button onclick="editTask(${index}, '${safeText}')">Edit</button>
                <button onclick="deleteTask(${index})">Done</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Add a new task
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tasks = await fetchTasks();
    tasks.push({ text: taskInput.value, done: false });
    await updateTasks(tasks);
    taskInput.value = "";
    renderTasks();
});

async function editTask(index, currentText) {
    const tasks = await fetchTasks();
    const taskId = tasks[index].id;  // Store the ID of the task
    const li = taskList.querySelectorAll("li")[index];

    li.innerHTML = `
        <input type="text" value="${currentText}" id="editInput${taskId}" class="edit-input" />
        <div class="button-container">
            <button onclick="saveEdit(${taskId})">Save</button>
            <button onclick="renderTasks()">Cancel</button>
        </div>
    `;
}

async function saveEdit(taskId) {
    const tasks = await fetchTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId); // Find correct task

    if (taskIndex === -1) return; // Prevent errors

    const editInput = document.getElementById(`editInput${taskId}`);
    tasks[taskIndex].text = editInput.value;

    await updateTasks(tasks);
    renderTasks();
}

// Delete a task
async function deleteTask(index) {
    const tasks = await fetchTasks();
    tasks.splice(index, 1);
    await updateTasks(tasks);
    renderTasks();
}

// Initial render
renderTasks();
