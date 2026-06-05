import React, { useState, useEffect } from 'react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylcnnlATRL2KKMzXMxNwNSGHATm7m7yDiTLaxQtJGzBZRuayHPzMKC-u892J_hlTnCrA/usercallable';

export default function DailyTasksApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandHistory, setExpandHistory] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getTasks`);
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Retrying...');
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentCompleted) => {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=updateTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          completed: !currentCompleted
        })
      });
      
      if (response.ok) {
        const updatedTasks = tasks.map(t => 
          t.id === taskId 
            ? { ...t, completed: !currentCompleted, completedDate: !currentCompleted ? today : '' }
            : t
        );
        setTasks(updatedTasks);
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const todaysTasks = tasks.filter(t => t.date === today && !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const historyTasks = tasks.filter(t => t.date < today && !t.completed);

  if (loading) {
    return (
      <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
        <div style={{textAlign: 'center'}}>
          <p style={{color: '#4b5563', fontSize: '16px'}}>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)', padding: '16px'}}>
      <div style={{maxWidth: '600px', margin: '0 auto'}}>
        <div style={{marginBottom: '32px'}}>
          <h1 style={{fontSize: '28px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px'}}>Today's Tasks</h1>
          <p style={{color: '#4b5563'}}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {error && (
          <div style={{marginBottom: '24px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px'}}>
            <p style={{color: '#7f1d1d', fontWeight: 'bold'}}>{error}</p>
          </div>
        )}

        <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '24px', overflow: 'hidden'}}>
          {todaysTasks.length === 0 ? (
            <div style={{padding: '24px', textAlign: 'center', color: '#64748b'}}>
              <p style={{fontSize: '18px'}}>No tasks for today. Great start! 🎉</p>
            </div>
          ) : (
            <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
              {todaysTasks.map((task, idx) => (
                <li key={task.id} style={{padding: '16px', borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none', background: 'white'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id, task.completed)}
                      style={{width: '20px', height: '20px', cursor: 'pointer'}}
                    />
                    <span style={{color: '#1e293b', fontWeight: '500'}}>{task.task}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '24px', overflow: 'hidden'}}>
            <div style={{padding: '16px', background: '#f0fdf4', borderBottom: '1px solid #e2e8f0'}}>
              <h2 style={{fontWeight: '600', color: '#166534', margin: 0}}>✓ Completed ({completedTasks.length})</h2>
            </div>
            <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
              {completedTasks.map((task, idx) => (
                <li key={task.id} style={{padding: '16px', borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleTask(task.id, task.completed)}
                      style={{width: '20px', height: '20px', cursor: 'pointer'}}
                    />
                    <div>
                      <span style={{color: '#94a3b8', textDecoration: 'line-through', display: 'block'}}>{task.task}</span>
                      {task.completedDate && (
                        <span style={{fontSize: '12px', color: '#cbd5e1'}}>Completed {task.completedDate}</span>
                      )}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {historyTasks.length > 0 && (
          <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
            <button
              onClick={() => setExpandHistory(!expandHistory)}
              style={{width: '100%', padding: '16px', background: '#fffbeb', border: 'none', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '16px', fontWeight: '600', color: '#b45309'}}
            >
              <span>Incomplete from Previous Days ({historyTasks.length})</span>
              <span>{expandHistory ? '▼' : '▶'}</span>
            </button>
            {expandHistory && (
              <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                {historyTasks.map((task, idx) => (
                  <li key={task.id} style={{padding: '16px', borderTop: idx > 0 ? '1px solid #e2e8f0' : 'none'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        style={{width: '20px', height: '20px', cursor: 'pointer'}}
                      />
                      <div>
                        <span style={{color: '#1e293b', fontWeight: '500', display: 'block'}}>{task.task}</span>
                        <span style={{fontSize: '12px', color: '#64748b'}}>From {task.date}</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
