import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Mock axios for demo
const axios = {
  defaults: { baseURL: '', headers: { common: {} } },
  get: (url) => Promise.resolve({ data: mockTodos }),
  post: (url, data) => {
    const newTodo = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString(), completed: false };
    mockTodos.unshift(newTodo);
    return Promise.resolve({ data: newTodo });
  },
  put: (url, data) => {
    const id = url.split('/').pop();
    const todo = mockTodos.find(t => t._id === id);
    if (todo) Object.assign(todo, data);
    return Promise.resolve({ data: todo });
  },
  delete: (url) => {
    const id = url.split('/').pop();
    const index = mockTodos.findIndex(t => t._id === id);
    if (index > -1) mockTodos.splice(index, 1);
    return Promise.resolve();
  }
};

let mockTodos = [
  { _id: '1', title: 'Complete React project', description: 'Finish the advanced todo application with modern UI', completed: false, createdAt: '2025-06-10T10:00:00Z', category: 'work', priority: 'high' },
  { _id: '2', title: 'Learn Three.js', description: 'Study 3D graphics for web development', completed: true, createdAt: '2025-06-09T14:30:00Z', category: 'learning', priority: 'medium' },
  { _id: '3', title: 'Grocery shopping', description: 'Buy ingredients for weekend cooking', completed: false, createdAt: '2025-06-08T09:15:00Z', category: 'personal', priority: 'low' }
];

// Icon components (replacing lucide-react)
const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    search: '🔍',
    plus: '➕',
    moon: '🌙',
    sun: '☀️',
    user: '👤',
    logout: '🚪',
    calendar: '📅',
    trash: '🗑️',
    check: '✓',
    edit: '✏️',
    save: '💾',
    x: '✕'
  };
  
  return <span className={`icon ${className}`} style={{ fontSize: size }}>{icons[name] || '❓'}</span>;
};

// Create Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    // Mock auth check
    setTimeout(() => {
      setUser({ username: 'Demo User', email: 'demo@example.com' });
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark-theme' : 'light-theme';
  }, [darkMode]);

  const login = (token, userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your workspace...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Login/Register Component
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, darkMode, toggleDarkMode } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock login
    setTimeout(() => {
      login('mock-token', { username: formData.username || 'Demo User', email: formData.email });
      navigate('/');
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="theme-toggle-auth">
        <button onClick={toggleDarkMode} className="theme-btn">
          <Icon name={darkMode ? 'sun' : 'moon'} size={20} />
        </button>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <h1>TaskFlow</h1>
          </div>
          <p>Advanced task management for modern teams</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Create Account
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <div className="button-loading">
                <div className="spinner small"></div>
                Processing...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Demo Mode - No real authentication required</p>
        </div>
      </div>
    </div>
  );
};

// Todo Component
const TodoApp = () => {
  const { user, logout, darkMode, toggleDarkMode } = useContext(AuthContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', category: 'personal', priority: 'medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const categories = ['personal', 'work', 'learning', 'health', 'finance'];
  const priorities = ['low', 'medium', 'high'];

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get('/api/todos');
      setTodos(res.data);
    } catch {
      setError('Failed to fetch todos');
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/todos', newTodo);
      setTodos([res.data, ...todos]);
      setNewTodo({ title: '', description: '', category: 'personal', priority: 'medium' });
      setShowAddForm(false);
    } catch {
      setError('Failed to add todo');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`/api/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => todo._id === id ? res.data : todo));
    } catch {
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch {
      setError('Failed to delete todo');
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const res = await axios.put(`/api/todos/${id}`, updates);
      setTodos(todos.map(todo => todo._id === id ? res.data : todo));
      setEditingId(null);
    } catch {
      setError('Failed to update todo');
    }
  };

  const handleDragStart = (e, todo) => {
    setDraggedItem(todo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTodo) => {
    e.preventDefault();
    if (!draggedItem || draggedItem._id === targetTodo._id) return;

    const newTodos = [...todos];
    const dragIndex = newTodos.findIndex(t => t._id === draggedItem._id);
    const dropIndex = newTodos.findIndex(t => t._id === targetTodo._id);

    newTodos.splice(dragIndex, 1);
    newTodos.splice(dropIndex, 0, draggedItem);
    
    setTodos(newTodos);
    setDraggedItem(null);
  };

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'completed' && todo.completed) ||
                           (filter === 'pending' && !todo.completed) ||
                           (filter === todo.category);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    highPriority: todos.filter(t => t.priority === 'high').length
  };

  return (
    <div className="todo-app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <h1>TaskFlow</h1>
          </div>
          <div className="header-stats" onClick={() => setShowStats(!showStats)}>
            <div className="stat-item">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button onClick={toggleDarkMode} className="icon-btn theme-btn">
            <Icon name={darkMode ? 'sun' : 'moon'} size={20} />
          </button>
          <div className="user-menu">
            <div className="user-avatar">
              <Icon name="user" size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <button onClick={logout} className="logout-btn">
                <Icon name="logout" size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {showStats && (
        <div className="stats-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <h3>{stats.highPriority}</h3>
                <p>High Priority</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="controls-bar">
        <div className="search-container">
          <Icon name="search" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tasks</option>
            <option value="pending">Active</option>
            <option value="completed">Completed</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="learning">Learning</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-btn"
        >
          <Icon name="plus" size={20} />
          Add Task
        </button>
      </div>

      {error && (
        <div className="error-message">
          <Icon name="x" size={16} />
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={addTodo} className="todo-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="title-input"
                required
              />
            </div>
            
            <div className="form-row">
              <textarea
                placeholder="Add a description..."
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                className="description-input"
                rows="3"
              />
            </div>

            <div className="form-row">
              <select
                value={newTodo.category}
                onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                className="category-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                className="priority-select"
              >
                {priorities.map(pri => (
                  <option key={pri} value={pri}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)} Priority
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <div className="spinner small"></div> : <Icon name="plus" size={16} />}
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="todos-container">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        ) : (
          <div className="todos-grid">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
                isEditing={editingId === todo._id}
                setEditing={setEditingId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Todo Item Component
const TodoItem = ({ todo, onToggle, onDelete, onUpdate, isEditing, setEditing, onDragStart, onDragOver, onDrop }) => {
  const [editData, setEditData] = useState({ title: todo.title, description: todo.description });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      personal: '👤',
      work: '💼',
      learning: '📚',
      health: '🏃',
      finance: '💰'
    };
    return icons[category] || '📝';
  };

  const handleSave = () => {
    onUpdate(todo._id, editData);
  };

  return (
    <div
      className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}
      draggable
      onDragStart={(e) => onDragStart(e, todo)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, todo)}
    >
      <div className="todo-priority-bar" style={{ backgroundColor: getPriorityColor(todo.priority) }}></div>
      
      <div className="todo-header">
        <button
          onClick={() => onToggle(todo._id, todo.completed)}
          className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
        >
          {todo.completed && <Icon name="check" size={14} />}
        </button>

        <div className="todo-meta">
          <span className="todo-category">
            {getCategoryIcon(todo.category)} {todo.category}
          </span>
          <span className="todo-priority">
            {todo.priority}
          </span>
        </div>

        <div className="todo-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="action-btn save">
                <Icon name="save" size={14} />
              </button>
              <button onClick={() => setEditing(null)} className="action-btn cancel">
                <Icon name="x" size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(todo._id)} className="action-btn edit">
                <Icon name="edit" size={14} />
              </button>
              <button onClick={() => onDelete(todo._id)} className="action-btn delete">
                <Icon name="trash" size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="todo-content">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="edit-title"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="edit-description"
              rows="2"
            />
          </>
        ) : (
          <>
            <h3 className="todo-title">{todo.title}</h3>
            {todo.description && <p className="todo-description">{todo.description}</p>}
          </>
        )}
      </div>

      <div className="todo-footer">
        <span className="todo-date">
          <Icon name="calendar" size={12} />
          {new Date(todo.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

// App Component with Routes
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><TodoApp /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;