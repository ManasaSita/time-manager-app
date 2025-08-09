// TimeManager.jsx - PART 1 OF 3
// Copy this entire part first

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, CheckCircle, Plus, Calendar, Target, Zap, Trophy, Star, Flame, TrendingUp, DollarSign, Code, Users, BookOpen, Award, Settings, X, Edit3, RefreshCw, Repeat } from 'lucide-react';

// Custom hook for localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

const TimeManager = () => {
  // Persistent data with localStorage - Starting with empty/default values
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  
  const [completedToday, setCompletedToday] = useLocalStorage('completedToday', 0);
  const [totalXP, setTotalXP] = useLocalStorage('totalXP', 0);
  const [streak, setStreak] = useLocalStorage('streak', 0);
  const [level, setLevel] = useState(1);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage('lastActiveDate', new Date().toDateString());
  const [todayTasksCompleted, setTodayTasksCompleted] = useLocalStorage('todayTasksCompleted', false);

  // Progress data with localStorage - Starting from zero
  const [progress, setProgress] = useLocalStorage('progress', {
    problemsSolved: 0,
    applicationsSubmitted: 0,
    portfolioProjects: 0,
    networkConnections: 0,
    emergencyFund: 0,
    monthlyIncome: 0
  });

  // Targets with localStorage - Default aspirational goals
  const [targets, setTargets] = useLocalStorage('targets', {
    problemsSolved: 100,
    applicationsSubmitted: 50,
    portfolioProjects: 5,
    networkConnections: 100,
    emergencyFund: 100000,
    monthlyIncome: 50000,
    salaryTarget: 'Your Target',
    companyType: 'Your Dream Company',
    timeline: 'Your Timeline'
  });
  
  // UI state (not persisted)
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('job-hunt');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedDeadline, setSelectedDeadline] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [editRecurrenceType, setEditRecurrenceType] = useState('daily');
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentFocus, setCurrentFocus] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const priorities = {
    'low': { label: 'Low Priority', color: 'bg-gray-100 text-gray-600', icon: '📝', xpMultiplier: 1 },
    'medium': { label: 'Medium Priority', color: 'bg-blue-100 text-blue-600', icon: '⚡', xpMultiplier: 1.2 },
    'high': { label: 'High Priority', color: 'bg-orange-100 text-orange-600', icon: '🔥', xpMultiplier: 1.5 },
    'urgent': { label: 'URGENT', color: 'bg-red-100 text-red-600', icon: '🚨', xpMultiplier: 2 }
  };

  const categories = {
    'job-hunt': { label: 'Job Hunt', color: 'bg-blue-100 text-blue-800', icon: '🎯' },
    'assessment': { label: 'Coding Practice', color: 'bg-purple-100 text-purple-800', icon: '⚡' },
    'profile': { label: 'Profile Building', color: 'bg-green-100 text-green-800', icon: '🚀' },
    'freelance': { label: 'Freelance', color: 'bg-orange-100 text-orange-800', icon: '💰' },
    'personal': { label: 'Projects', color: 'bg-pink-100 text-pink-800', icon: '🛠️' },
    'financial': { label: 'Financial Goals', color: 'bg-yellow-100 text-yellow-800', icon: '💎' },
    'learning': { label: 'Skill Building', color: 'bg-indigo-100 text-indigo-800', icon: '📚' }
  };

  const recurrenceOptions = {
    'daily': { label: 'Daily', icon: '🔄', color: 'bg-blue-500', description: 'Repeats every day' },
    'weekly': { label: 'Weekly', icon: '📅', color: 'bg-green-500', description: 'Repeats every week' },
    'monthly': { label: 'Monthly', icon: '📆', color: 'bg-purple-500', description: 'Repeats every month' }
  };

  const motivationalQuotes = [
    `Your dream role at ${targets.companyType} is being earned today! 💼✨`,
    `Every line of code brings you closer to ${targets.salaryTarget}! 💰🔥`,
    "Financial independence isn't a dream, it's your plan! 📈💪",
    "Today's effort = Tomorrow's success! 🎯🌟",
    "You're not just working, you're building your empire! 👑💻",
    "Each task completed = One step closer to your goals! 🏢⚡"
  ];

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(totalXP / 500) + 1;
    setLevel(newLevel);
  }, [totalXP]);

  // Streak management and date checking
  useEffect(() => {
    const checkAndUpdateStreak = () => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastActiveDate !== today) {
        if (lastActiveDate === yesterday && todayTasksCompleted) {
          setStreak(prev => prev + 1);
        } else if (lastActiveDate !== yesterday) {
          setStreak(1);
        }
        setCompletedToday(0);
        setTodayTasksCompleted(false);
        setLastActiveDate(today);
        
        // Reset recurring tasks for the new day
        resetRecurringTasks();
      }
    };

    checkAndUpdateStreak();
    const interval = setInterval(checkAndUpdateStreak, 60000);
    return () => clearInterval(interval);
  }, [lastActiveDate, todayTasksCompleted, setStreak, setCompletedToday, setTodayTasksCompleted, setLastActiveDate]);

  // Reset recurring tasks based on their schedule
  const resetRecurringTasks = () => {
    const today = new Date();
    
    setTasks(prevTasks => prevTasks.map(task => {
      if (!task.isRecurring || !task.lastCompleted) return task;
      
      const lastCompletedDate = new Date(task.lastCompleted);
      const daysDiff = Math.floor((today - lastCompletedDate) / (1000 * 60 * 60 * 24));
      
      let shouldReset = false;
      
      if (task.recurrenceType === 'daily' && daysDiff >= 1) {
        shouldReset = true;
      } else if (task.recurrenceType === 'weekly' && daysDiff >= 7) {
        shouldReset = true;
      } else if (task.recurrenceType === 'monthly' && daysDiff >= 30) {
        shouldReset = true;
      }
      
      if (shouldReset) {
        return { ...task, completed: false, lastCompleted: null };
      }
      
      return task;
    }));
  };

  // Update activity when user completes tasks or uses focus timer
  const updateDailyActivity = () => {
    const today = new Date().toDateString();
    if (lastActiveDate === today) {
      setTodayTasksCompleted(true);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      setTotalXP(prev => prev + 25);
      setIsFullScreen(false);
      updateDailyActivity();
      alert('🎉 Focus session complete! +25 XP earned! Take a 5-minute break.');
      setTimer(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer, setTotalXP]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateNextDeadline = (recurrenceType) => {
    const today = new Date();
    let nextDeadline = new Date();
    
    if (recurrenceType === 'daily') {
      nextDeadline.setDate(today.getDate() + 1);
    } else if (recurrenceType === 'weekly') {
      nextDeadline.setDate(today.getDate() + 7);
    } else if (recurrenceType === 'monthly') {
      nextDeadline.setMonth(today.getMonth() + 1);
    }
    
    return nextDeadline.toISOString().split('T')[0];
  };

  const addTask = () => {
    if (newTask.trim()) {
      const baseXP = selectedCategory === 'assessment' ? 100 : selectedCategory === 'job-hunt' ? 75 : 50;
      const recurringBonus = isRecurring ? 1.2 : 1;
      const finalXP = Math.floor(baseXP * priorities[selectedPriority].xpMultiplier * recurringBonus);
      
      setTasks(prev => [...prev, {
        id: Date.now(),
        text: newTask,
        category: selectedCategory,
        completed: false,
        priority: selectedPriority,
        xp: finalXP,
        deadline: selectedDeadline || (isRecurring ? calculateNextDeadline(recurrenceType) : ''),
        isRecurring: isRecurring,
        recurrenceType: isRecurring ? recurrenceType : null,
        lastCompleted: null
      }]);
      setNewTask('');
      setSelectedDeadline('');
      setIsRecurring(false);
      setRecurrenceType('daily');
    }
  };

// END OF PART 1 - Continue to Part 2
// TimeManager.jsx - PART 2 OF 3
// Add this right after Part 1 (continue from where Part 1 ended)

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updated = { ...task, completed: !task.completed };
        
        if (updated.completed && !task.completed) {
          setCompletedToday(prev => prev + 1);
          setTotalXP(prev => prev + task.xp);
          updateDailyActivity();
          
          // Handle recurring task
          if (task.isRecurring) {
            updated.lastCompleted = new Date().toISOString();
            // Create a new instance of the recurring task
            setTimeout(() => {
              const newDeadline = calculateNextDeadline(task.recurrenceType);
              setTasks(prevTasks => [...prevTasks, {
                ...task,
                id: Date.now() + Math.random(),
                completed: false,
                deadline: newDeadline,
                lastCompleted: null
              }]);
            }, 100);
          }
        } else if (!updated.completed && task.completed) {
          setCompletedToday(prev => Math.max(0, prev - 1));
          setTotalXP(prev => Math.max(0, prev - task.xp));
          if (task.isRecurring) {
            updated.lastCompleted = null;
          }
        }
        return updated;
      }
      return task;
    }));
  };

  const startFocusSession = (taskText) => {
    setCurrentFocus(taskText);
    setTimer(25 * 60);
    setIsRunning(true);
    setIsFullScreen(true);
    updateDailyActivity();
  };

  const exitFullScreen = () => {
    setIsFullScreen(false);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(25 * 60);
    setCurrentFocus('');
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getLevelProgress = () => {
    const currentLevelXP = totalXP % 500;
    return (currentLevelXP / 500) * 100;
  };

  const updateTarget = (key, value) => {
    setTargets(prev => ({ ...prev, [key]: value }));
  };

  const updateProgress = (key, value) => {
    setProgress(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const startEditTask = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline || '');
    setEditIsRecurring(task.isRecurring || false);
    setEditRecurrenceType(task.recurrenceType || 'daily');
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
    setEditCategory('');
    setEditPriority('');
    setEditDeadline('');
    setEditIsRecurring(false);
    setEditRecurrenceType('daily');
  };

  const saveEdit = () => {
    if (editText.trim()) {
      const baseXP = editCategory === 'assessment' ? 100 : editCategory === 'job-hunt' ? 75 : 50;
      const recurringBonus = editIsRecurring ? 1.2 : 1;
      const finalXP = Math.floor(baseXP * priorities[editPriority].xpMultiplier * recurringBonus);
      
      setTasks(prev => prev.map(task => {
        if (task.id === editingTask) {
          return {
            ...task,
            text: editText,
            category: editCategory,
            priority: editPriority,
            deadline: editDeadline || (editIsRecurring ? calculateNextDeadline(editRecurrenceType) : ''),
            xp: finalXP,
            isRecurring: editIsRecurring,
            recurrenceType: editIsRecurring ? editRecurrenceType : null
          };
        }
        return task;
      }));
      cancelEdit();
    }
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { status: 'none', color: '', text: '' };
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', color: 'bg-red-500 text-white', text: `${Math.abs(diffDays)} days overdue` };
    } else if (diffDays === 0) {
      return { status: 'today', color: 'bg-red-400 text-white', text: 'Due today!' };
    } else if (diffDays === 1) {
      return { status: 'tomorrow', color: 'bg-orange-400 text-white', text: 'Due tomorrow' };
    } else if (diffDays <= 3) {
      return { status: 'soon', color: 'bg-yellow-400 text-black', text: `${diffDays} days left` };
    } else if (diffDays <= 7) {
      return { status: 'week', color: 'bg-blue-400 text-white', text: `${diffDays} days left` };
    } else {
      return { status: 'later', color: 'bg-gray-400 text-white', text: `${diffDays} days left` };
    }
  };

  const sortTasksByUrgency = (tasks) => {
    return tasks.sort((a, b) => {
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (a.deadline) {
        return -1;
      } else if (b.deadline) {
        return 1;
      }
      
      return 0;
    });
  };

  const exportData = () => {
    const data = {
      tasks,
      totalXP,
      streak,
      progress,
      targets,
      completedToday,
      lastActiveDate,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `time-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const priorityTasks = sortTasksByUrgency(tasks.filter(task => !task.completed && (task.priority === 'high' || task.priority === 'urgent')));
  const otherTasks = sortTasksByUrgency(tasks.filter(task => !task.completed && task.priority !== 'high' && task.priority !== 'urgent'));
  const completedTasks = tasks.filter(task => task.completed);

  const currentQuote = motivationalQuotes[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % motivationalQuotes.length];

  // Full Screen Focus Mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center text-white z-50">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center p-8 max-w-2xl mx-auto">
          <button onClick={exitFullScreen} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
            <X className="h-6 w-6" />
          </button>
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">DEEP FOCUS MODE</h1>
            <div className="text-8xl md:text-9xl font-mono font-bold mb-6 tracking-wider">
              {formatTime(timer)}
            </div>
          </div>
          {currentFocus && (
            <div className="mb-8">
              <p className="text-xl md:text-2xl text-purple-200 mb-2">Currently Working On:</p>
              <p className="text-2xl md:text-3xl font-bold text-white bg-white/10 rounded-lg p-4">
                {currentFocus}
              </p>
            </div>
          )}
          <div className="flex justify-center gap-6 mb-8">
            <button onClick={toggleTimer} className="flex items-center gap-3 px-8 py-4 bg-white text-purple-900 rounded-xl hover:bg-purple-100 transition-all transform hover:scale-105 font-bold text-lg">
              {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={resetTimer} className="px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all transform hover:scale-105 font-bold text-lg">
              Reset
            </button>
          </div>
          <div className="bg-white/10 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">🧠 Focus Mantras</h3>
            <div className="text-lg space-y-2">
              <p>"I am building my dream career with every focused minute"</p>
              <p>"This session brings me closer to {targets.salaryTarget}"</p>
              <p>"Focus now = Freedom later"</p>
            </div>
          </div>
          <div className="mt-8 text-purple-200">
            <p className="text-sm">📱 Put your phone in Do Not Disturb mode</p>
            <p className="text-sm">🚫 Close all other apps and notifications</p>
            <p className="text-sm">💪 You've got this! Stay focused!</p>
          </div>
        </div>
      </div>
    );
  }

// END OF PART 2 - Continue to Part 3
// TimeManager.jsx - PART 3 OF 3
// Add this right after Part 2 (this is the main return statement with JSX)

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-auto relative max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeSettings} className="absolute -top-3 -right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all z-20 shadow-lg">
              <X className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">💾 Data Management</h3>
                  <div className="flex gap-3">
                    <button onClick={exportData} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold">
                      📥 Export Data
                    </button>
                    <div className="text-xs text-gray-500 flex items-center">
                      Data is automatically saved to your browser
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">🎯 Career Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Company Type</label>
                      <input type="text" value={targets.companyType} onChange={(e) => updateTarget('companyType', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Salary Target</label>
                      <input type="text" value={targets.salaryTarget} onChange={(e) => updateTarget('salaryTarget', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Timeline</label>
                      <input type="text" value={targets.timeline} onChange={(e) => updateTarget('timeline', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">📊 Progress Targets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Problems to Solve</label>
                      <input type="number" value={targets.problemsSolved} onChange={(e) => updateTarget('problemsSolved', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Applications Target</label>
                      <input type="number" value={targets.applicationsSubmitted} onChange={(e) => updateTarget('applicationsSubmitted', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Portfolio Projects</label>
                      <input type="number" value={targets.portfolioProjects} onChange={(e) => updateTarget('portfolioProjects', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Network Connections</label>
                      <input type="number" value={targets.networkConnections} onChange={(e) => updateTarget('networkConnections', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">💰 Financial Targets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Fund (₹)</label>
                      <input type="number" value={targets.emergencyFund} onChange={(e) => updateTarget('emergencyFund', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Monthly Income Target (₹)</label>
                      <input type="number" value={targets.monthlyIncome} onChange={(e) => updateTarget('monthlyIncome', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">📈 Update Your Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Problems Solved So Far</label>
                      <input type="number" value={progress.problemsSolved} onChange={(e) => updateProgress('problemsSolved', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Applications Submitted</label>
                      <input type="number" value={progress.applicationsSubmitted} onChange={(e) => updateProgress('applicationsSubmitted', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Portfolio Projects Done</label>
                      <input type="number" value={progress.portfolioProjects} onChange={(e) => updateProgress('portfolioProjects', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Network Connections Made</label>
                      <input type="number" value={progress.networkConnections} onChange={(e) => updateProgress('networkConnections', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Emergency Fund Saved (₹)</label>
                      <input type="number" value={progress.emergencyFund} onChange={(e) => updateProgress('emergencyFund', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Monthly Income (₹)</label>
                      <input type="number" value={progress.monthlyIncome} onChange={(e) => updateProgress('monthlyIncome', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0 sticky bottom-0 bg-white rounded-b-xl">
              <button onClick={closeSettings} className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold">
                Save Settings ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 text-center relative">
        <button onClick={() => setShowSettings(true)} className="absolute top-0 right-0 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all">
          <Settings className="h-5 w-5" />
        </button>
        <div className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm">
          🔥 Day {streak} Streak!
        </div>
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 mt-8">
          🚀 {targets.companyType} & Financial Freedom
        </h1>
        <p className="text-sm md:text-lg text-gray-700 font-medium bg-white/60 rounded-lg px-4 py-2 inline-block">
          {currentQuote}
        </p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 md:p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs md:text-sm font-medium">Level</p>
              <p className="text-xl md:text-3xl font-bold">{level}</p>
              <div className="w-full bg-purple-300 rounded-full h-1 md:h-2 mt-2">
                <div className="bg-white h-1 md:h-2 rounded-full transition-all duration-300" style={{width: `${getLevelProgress()}%`}}></div>
              </div>
            </div>
            <Trophy className="h-6 w-6 md:h-10 md:w-10 text-yellow-300" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 md:p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs md:text-sm font-medium">XP</p>
              <p className="text-xl md:text-3xl font-bold">{totalXP}</p>
            </div>
            <Star className="h-6 w-6 md:h-10 md:w-10 text-yellow-300" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 md:p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs md:text-sm font-medium">Today</p>
              <p className="text-xl md:text-3xl font-bold">{completedToday}</p>
            </div>
            <CheckCircle className="h-6 w-6 md:h-10 md:w-10 text-green-300" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 md:p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs md:text-sm font-medium">Streak</p>
              <p className="text-xl md:text-3xl font-bold">{streak}</p>
            </div>
            <Flame className="h-6 w-6 md:h-10 md:w-10 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Progress Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 md:p-6 shadow-lg border border-white/20">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
            🎯 Career Progress
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs md:text-sm font-medium">Coding Problems</span>
                <span className="text-xs md:text-sm text-gray-600">{progress.problemsSolved}/{targets.problemsSolved}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 md:h-3 rounded-full transition-all duration-300" 
                     style={{width: `${getProgressPercentage(progress.problemsSolved, targets.problemsSolved)}%`}}></div>
              </div>
              <input 
                type="number" 
                value={progress.problemsSolved} 
                onChange={(e) => updateProgress('problemsSolved', e.target.value)}
                className="mt-2 w-16 md:w-20 px-2 py-1 border rounded text-xs md:text-sm"
                placeholder="Update"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs md:text-sm font-medium">Applications</span>
                <span className="text-xs md:text-sm text-gray-600">{progress.applicationsSubmitted}/{targets.applicationsSubmitted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 md:h-3 rounded-full transition-all duration-300" 
                     style={{width: `${getProgressPercentage(progress.applicationsSubmitted, targets.applicationsSubmitted)}%`}}></div>
              </div>
              <input 
                type="number" 
                value={progress.applicationsSubmitted} 
                onChange={(e) => updateProgress('applicationsSubmitted', e.target.value)}
                className="mt-2 w-16 md:w-20 px-2 py-1 border rounded text-xs md:text-sm"
                placeholder="Update"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs md:text-sm font-medium">Portfolio Projects</span>
                <span className="text-xs md:text-sm text-gray-600">{progress.portfolioProjects}/{targets.portfolioProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 md:h-3 rounded-full transition-all duration-300" 
                     style={{width: `${getProgressPercentage(progress.portfolioProjects, targets.portfolioProjects)}%`}}></div>
              </div>
              <input 
                type="number" 
                value={progress.portfolioProjects} 
                onChange={(e) => updateProgress('portfolioProjects', e.target.value)}
                className="mt-2 w-16 md:w-20 px-2 py-1 border rounded text-xs md:text-sm"
                placeholder="Update"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-xl p-4 md:p-6 shadow-lg border border-white/20">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
            💰 Financial Progress
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs md:text-sm font-medium">Emergency Fund</span>
                <span className="text-xs md:text-sm text-gray-600">₹{progress.emergencyFund.toLocaleString()}/₹{targets.emergencyFund.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 md:h-3 rounded-full transition-all duration-300" 
                     style={{width: `${getProgressPercentage(progress.emergencyFund, targets.emergencyFund)}%`}}></div>
              </div>
              <input 
                type="number" 
                value={progress.emergencyFund} 
                onChange={(e) => updateProgress('emergencyFund', e.target.value)}
                className="mt-2 w-24 md:w-32 px-2 py-1 border rounded text-xs md:text-sm"
                placeholder="Update ₹"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs md:text-sm font-medium">Monthly Income</span>
                <span className="text-xs md:text-sm text-gray-600">₹{progress.monthlyIncome.toLocaleString()}/₹{targets.monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-600 h-2 md:h-3 rounded-full transition-all duration-300" 
                     style={{width: `${getProgressPercentage(progress.monthlyIncome, targets.monthlyIncome)}%`}}></div>
              </div>
              <input 
                type="number" 
                value={progress.monthlyIncome} 
                onChange={(e) => updateProgress('monthlyIncome', e.target.value)}
                className="mt-2 w-24 md:w-32 px-2 py-1 border rounded text-xs md:text-sm"
                placeholder="Update ₹"
              />
            </div>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 md:p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-green-800 mb-2 text-sm md:text-base">💎 Your Goals</h4>
              <div className="text-xs md:text-sm text-green-700 space-y-1">
                <div className="flex justify-between">
                  <span>Target Salary:</span>
                  <span className="font-medium">{targets.salaryTarget}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeline:</span>
                  <span className="font-medium">{targets.timeline}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pomodoro Timer */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-6 rounded-xl mb-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">🎯 Deep Focus Zone</h2>
          <div className="text-4xl md:text-6xl font-mono font-bold mb-4">
            {formatTime(timer)}
          </div>
          {currentFocus && (
            <p className="text-indigo-100 mb-4 text-sm md:text-lg">🔥 Working on: <span className="font-semibold">{currentFocus}</span></p>
          )}
          <div className="flex justify-center gap-3 md:gap-4 mb-4">
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all transform hover:scale-105 font-semibold text-sm md:text-base"
            >
              {isRunning ? <Pause className="h-4 w-4 md:h-5 md:w-5" /> : <Play className="h-4 w-4 md:h-5 md:w-5" />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 md:px-6 py-2 md:py-3 bg-indigo-400 text-white rounded-lg hover:bg-indigo-300 transition-all transform hover:scale-105 font-semibold text-sm md:text-base"
            >
              Reset
            </button>
          </div>
          <p className="text-indigo-200 text-xs md:text-sm">🏆 Complete a session to earn +25 XP bonus!</p>
          <p className="text-indigo-200 text-xs md:text-sm mt-1">📱 Click a task's focus button for full-screen mode!</p>
        </div>
      </div>

      {/* Add New Task */}
      <div className="bg-white/80 backdrop-blur p-4 md:p-6 rounded-xl mb-6 shadow-lg border border-white/20">
        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          🎮 Add New Mission
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What epic task will you conquer today?"
            className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base"
            >
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base"
            >
              {Object.entries(priorities).map(([key, priority]) => (
                <option key={key} value={key}>{priority.icon} {priority.label}</option>
              ))}
            </select>
            
            <input
              type="date"
              value={selectedDeadline}
              onChange={(e) => setSelectedDeadline(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base"
              min={new Date().toISOString().split('T')[0]}
              disabled={isRecurring}
            />
            
            <button
              onClick={addTask}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-sm md:text-base whitespace-nowrap"
            >
              Add Task
            </button>
          </div>
          
          {/* Recurring Task Options */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-semibold text-purple-700 flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  Make this a recurring task
                </span>
              </label>
            </div>
            
            {isRecurring && (
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(recurrenceOptions).map(([key, option]) => (
                  <button
                    key={key}
                    onClick={() => setRecurrenceType(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      recurrenceType === key 
                        ? 'border-purple-500 bg-purple-100' 
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      // TimeManager.jsx - PART 3C (FINAL PART)
// Add this after Part 3B to complete the component

      {/* High Priority Tasks */}
      {priorityTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
            🚨 URGENT & HIGH PRIORITY MISSIONS
          </h3>
          <div className="space-y-3">
            {priorityTasks.map(task => {
              const deadlineInfo = getDeadlineStatus(task.deadline);
              const isEditing = editingTask === task.id;
              
              return (
                <div key={task.id} className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-md p-3 md:p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm md:text-base"
                        placeholder="Edit task..."
                        autoFocus
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs">
                          {Object.entries(categories).map(([key, cat]) => (
                            <option key={key} value={key}>{cat.icon} {cat.label}</option>
                          ))}
                        </select>
                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs">
                          {Object.entries(priorities).map(([key, priority]) => (
                            <option key={key} value={key}>{priority.icon} {priority.label}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-xs"
                          min={new Date().toISOString().split('T')[0]}
                          disabled={editIsRecurring}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsRecurring}
                            onChange={(e) => setEditIsRecurring(e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-sm font-medium text-purple-700 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Recurring
                          </span>
                        </label>
                        {editIsRecurring && (
                          <select value={editRecurrenceType} onChange={(e) => setEditRecurrenceType(e.target.value)} className="px-2 py-1 border rounded text-xs">
                            {Object.entries(recurrenceOptions).map(([key, option]) => (
                              <option key={key} value={key}>{option.icon} {option.label}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">✅ Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">❌ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 md:gap-4">
                      <button onClick={() => toggleTask(task.id)} className="text-red-500 hover:text-red-700 transition-all flex-shrink-0">
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                      <div className="flex-1">
                        <span className="font-semibold text-sm md:text-lg block">{task.text}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {task.isRecurring && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[task.recurrenceType].color}`}>
                              <RefreshCw className="h-3 w-3" />
                              {recurrenceOptions[task.recurrenceType].label}
                            </span>
                          )}
                          {task.deadline && (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${deadlineInfo.color}`}>
                              📅 {deadlineInfo.text}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${categories[task.category].color}`}>
                        {categories[task.category].icon}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorities[task.priority].color}`}>
                        {priorities[task.priority].icon}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">+{task.xp}</span>
                      <div className="flex gap-1">
                        <button onClick={() => startEditTask(task)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all" title="Edit task">
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button onClick={() => startFocusSession(task.text)} className="px-3 md:px-4 py-2 bg-blue-500 text-white text-xs md:text-sm rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3 md:h-4 md:w-4" />
                          Focus
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all" title="Delete task">🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Tasks */}
      {otherTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-4">📋 Other Tasks</h3>
          <div className="space-y-3">
            {otherTasks.map(task => {
              const deadlineInfo = getDeadlineStatus(task.deadline);
              const isEditing = editingTask === task.id;
              
              return (
                <div key={task.id} className="bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-3 md:p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm md:text-base" placeholder="Edit task..." autoFocus />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs">
                          {Object.entries(categories).map(([key, cat]) => (<option key={key} value={key}>{cat.icon} {cat.label}</option>))}
                        </select>
                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs">
                          {Object.entries(priorities).map(([key, priority]) => (<option key={key} value={key}>{priority.icon} {priority.label}</option>))}
                        </select>
                        <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="flex-1 px-2 py-1 border rounded text-xs" min={new Date().toISOString().split('T')[0]} disabled={editIsRecurring} />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editIsRecurring} onChange={(e) => setEditIsRecurring(e.target.checked)} className="w-4 h-4 text-purple-600 rounded" />
                          <span className="text-sm font-medium text-purple-700 flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Recurring
                          </span>
                        </label>
                        {editIsRecurring && (
                          <select value={editRecurrenceType} onChange={(e) => setEditRecurrenceType(e.target.value)} className="px-2 py-1 border rounded text-xs">
                            {Object.entries(recurrenceOptions).map(([key, option]) => (<option key={key} value={key}>{option.icon} {option.label}</option>))}
                          </select>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">✅ Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">❌ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 md:gap-4">
                      <button onClick={() => toggleTask(task.id)} className="text-gray-400 hover:text-green-600 transition-all flex-shrink-0">
                        <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                      </button>
                      <div className="flex-1">
                        <span className="text-sm md:text-lg block">{task.text}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {task.isRecurring && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[task.recurrenceType].color}`}>
                              <RefreshCw className="h-3 w-3" />
                              {recurrenceOptions[task.recurrenceType].label}
                            </span>
                          )}
                          {task.deadline && (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${deadlineInfo.color}`}>📅 {deadlineInfo.text}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${categories[task.category].color}`}>{categories[task.category].icon}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${priorities[task.priority].color}`}>{priorities[task.priority].icon}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">+{task.xp}</span>
                      <div className="flex gap-1">
                        <button onClick={() => startEditTask(task)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all" title="Edit task"><Edit3 className="h-3 w-3" /></button>
                        <button onClick={() => startFocusSession(task.text)} className="px-3 py-2 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-all flex items-center gap-1"><Clock className="h-3 w-3" />Focus</button>
                        <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all" title="Delete task">🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-4 text-green-600">🎉 Completed Today</h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl opacity-75">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 fill-current" />
                <div className="flex-1">
                  <span className="line-through text-gray-600 text-sm md:text-lg block">{task.text}</span>
                  {task.isRecurring && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 mt-1">
                      <RefreshCw className="h-3 w-3" />
                      {recurrenceOptions[task.recurrenceType].label} - Will reset automatically
                    </span>
                  )}
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">+{task.xp} ✨</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom motivation */}
      <div className="mt-8 text-center p-4 md:p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg">
        <h3 className="text-lg md:text-2xl font-bold mb-2">🌟 You're Building Your Dream Life!</h3>
        <p className="text-sm md:text-lg mb-4">Every Task = One Step Closer to {targets.salaryTarget}! 💪</p>
        <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">🏢 {targets.companyType}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">💰 {targets.salaryTarget}</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">⏰ {targets.timeline}</span>
        </div>
      </div>
    </div>
  );
};

export default TimeManager;