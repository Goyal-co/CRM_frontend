import { useEffect, useState } from "react";

export default function TasksPage({ email: propEmail }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const email = propEmail || localStorage.getItem("email");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbwzfrMTurwHJ7BllZuCpMLzrmZC8nOraJ2eEOhY4ZCuWgWn50zZ3A4nwwb-a9tTdAmr/exec";

  const fetchTasks = async () => {
    const res = await fetch(`${scriptUrl}?action=getUserTasks&email=${email}`);
    const data = await res.json();
    setTasks(data);
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await fetch(`${scriptUrl}?action=addUserTask&email=${email}&task=${encodeURIComponent(newTask)}`);
    setNewTask("");
    fetchTasks();
  };

  const handleMarkDone = async (task) => {
    await fetch(`${scriptUrl}?action=markTaskDone&email=${email}&task=${encodeURIComponent(task)}`);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🗓️ Your Upcoming Tasks</h2>

      <div className="flex gap-2 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task..."
          className="px-4 py-2 border rounded-md w-72"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Task
        </button>
      </div>

      <div className="w-full max-w-xl space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet!</p>
        ) : (
          tasks.map((t, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded shadow-sm border ${
                t.Status === "Done" ? "bg-green-50" : "bg-white"
              }`}
            >
              <div>
                <p className="font-medium text-gray-800">{t.Task}</p>
                <p className="text-sm text-gray-500">Status: {t.Status}</p>
              </div>
              {t.Status !== "Done" && (
                <button
                  onClick={() => handleMarkDone(t.Task)}
                  className="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                >
                  ✅ Mark as Done
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
