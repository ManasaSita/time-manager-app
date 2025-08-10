// Enhanced Time Manager with Custom Goals - PART 1
// This is a complete part - copy this entire section

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, CheckCircle, Plus, Calendar, Target, Zap, Trophy, Star, Flame, TrendingUp, DollarSign, Code, Users, BookOpen, Award, Settings, X, Edit3, RefreshCw, Repeat, Trash2, FolderPlus, Folder } from 'lucide-react';

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
  // Available emoji icons for goals
  const availableIcons = [
    '🎯', '💪', '📚', '💰', '🎨', '🎸', '🏃', '🧘', '💻', '📝',
    '🚀', '🌟', '🔥', '💡', '🎮', '📸', '🍳', '🌱', '🎭', '🎪',
    '🏋️', '🚴', '🏊', '⚽', '🎾', '🏀', '🎵', '🎤', '🎬', '📖'
  ];

  // Available colors for goals
  const availableColors = [
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Indigo', class: 'bg-indigo-500' },
    { name: 'Teal', class: 'bg-teal-500' },
    { name: 'Yellow', class: 'bg-yellow-500' },
    { name: 'Gray', class: 'bg-gray-500' }
  ];

  // User-defined goals
  const [goals, setGoals] = useLocalStorage('userGoals', [
    {
      id: 'default',
      name: 'Career Development',
      icon: '💼',
      description: 'Professional growth and job hunting',
      targetDeadline: '',
      xpMultiplier: 1,
      color: 'bg-blue-500',
      createdAt: new Date().toISOString()
    }
  ]);

  // Currently selected goal
  const [selectedGoalId, setSelectedGoalId] = useLocalStorage('selectedGoalId', 'default');
  
  // Tasks now include goalId
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  
  // Modal states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // New goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalXpMultiplier, setNewGoalXpMultiplier] = useState(1);
  const [newGoalColor, setNewGoalColor] = useState('bg-blue-500');
  
  // Original state variables
  const [completedToday, setCompletedToday] = useLocalStorage('completedToday', 0);
  const [totalXP, setTotalXP] = useLocalStorage('totalXP', 0);
  const [streak, setStreak] = useLocalStorage('streak', 0);
  const [level, setLevel] = useState(1);
  const [lastActiveDate, setLastActiveDate] = useLocalStorage('lastActiveDate', new Date().toDateString());
  const [todayTasksCompleted, setTodayTasksCompleted] = useLocalStorage('todayTasksCompleted', false);

  // Task form state - ENHANCED with tracking
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [selectedDeadline, setSelectedDeadline] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskXP, setTaskXP] = useState(50);

  // NEW: Progress tracking state
  const [hasProgressTracking, setHasProgressTracking] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [unitType, setUnitType] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressTaskId, setProgressTaskId] = useState(null);
  const [progressUpdateValue, setProgressUpdateValue] = useState('');

  // Edit task state - ENHANCED with tracking
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editIsRecurring, setEditIsRecurring] = useState(false);
  const [editRecurrenceType, setEditRecurrenceType] = useState('daily');
  const [editNotes, setEditNotes] = useState('');
  const [editXP, setEditXP] = useState(50);
  const [editHasProgressTracking, setEditHasProgressTracking] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editUnitType, setEditUnitType] = useState('');

  // Common unit types for progress tracking
  const commonUnits = [
    'steps', 'pages', 'minutes', 'hours', 'reps', 'sets', 
    'km', 'miles', 'words', 'chapters', 'lessons', 'items',
    'glasses', 'calories', 'pushups', 'dollars', 'tasks', 'custom'
  ];
  
  // Timer state
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentFocus, setCurrentFocus] = useState('');

  const priorities = {
    'low': { label: 'Low Priority', color: 'bg-gray-100 text-gray-600', icon: '📝' },
    'medium': { label: 'Medium Priority', color: 'bg-blue-100 text-blue-600', icon: '⚡' },
    'high': { label: 'High Priority', color: 'bg-orange-100 text-orange-600', icon: '🔥' }
  };

  const recurrenceOptions = {
    'daily': { label: 'Daily', icon: '🔄', color: 'bg-blue-500', description: 'Repeats every day' },
    'weekly': { label: 'Weekly', icon: '📅', color: 'bg-green-500', description: 'Repeats every week' },
    'monthly': { label: 'Monthly', icon: '📆', color: 'bg-purple-500', description: 'Repeats every month' }
  };

  // Get current goal
  const currentGoal = goals.find(g => g.id === selectedGoalId) || goals[0];

  // Get tasks for current goal
  const currentGoalTasks = tasks.filter(task => task.goalId === selectedGoalId);
  const priorityTasks = currentGoalTasks.filter(task => !task.completed && task.priority === 'high');
  const otherTasks = currentGoalTasks.filter(task => !task.completed && task.priority !== 'high');
  const completedTasks = currentGoalTasks.filter(task => task.completed);

  // Calculate goal-specific stats
  const getGoalStats = (goalId) => {
    const goalTasks = tasks.filter(t => t.goalId === goalId);
    const completed = goalTasks.filter(t => t.completed).length;
    const total = goalTasks.length;
    const xpEarned = goalTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.xp || 0), 0);
    
    return {
      completed,
      total,
      xpEarned,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(totalXP / 500) + 1;
    setLevel(newLevel);
  }, [totalXP]);

  // Streak management
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
      }
    };

    checkAndUpdateStreak();
    const interval = setInterval(checkAndUpdateStreak, 60000);
    return () => clearInterval(interval);
  }, [lastActiveDate, todayTasksCompleted, setStreak, setCompletedToday, setTodayTasksCompleted, setLastActiveDate]);

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
      alert('🎉 Focus session complete! +25 XP earned!');
      setTimer(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer, setTotalXP]);

  // Helper functions
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

  const getLevelProgress = () => {
    const currentLevelXP = totalXP % 500;
    return (currentLevelXP / 500) * 100;
  };

  const updateDailyActivity = () => {
    const today = new Date().toDateString();
    if (lastActiveDate === today) {
      setTodayTasksCompleted(true);
    }
  };

  // Goal management functions
  const addGoal = () => {
    if (newGoalName.trim()) {
      const newGoal = {
        id: Date.now().toString(),
        name: newGoalName,
        icon: newGoalIcon,
        description: newGoalDescription,
        targetDeadline: newGoalDeadline,
        xpMultiplier: newGoalXpMultiplier,
        color: newGoalColor,
        createdAt: new Date().toISOString()
      };
      
      setGoals(prev => [...prev, newGoal]);
      setSelectedGoalId(newGoal.id);
      resetGoalForm();
      setShowGoalModal(false);
    }
  };

  const updateGoal = () => {
    if (editingGoal && newGoalName.trim()) {
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id 
          ? {
              ...goal,
              name: newGoalName,
              icon: newGoalIcon,
              description: newGoalDescription,
              targetDeadline: newGoalDeadline,
              xpMultiplier: newGoalXpMultiplier,
              color: newGoalColor
            }
          : goal
      ));
      resetGoalForm();
      setShowGoalModal(false);
      setEditingGoal(null);
    }
  };

  const deleteGoal = (goalId) => {
    if (goals.length > 1 && window.confirm('Are you sure you want to delete this goal and all its tasks?')) {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      setTasks(prev => prev.filter(t => t.goalId !== goalId));
      if (selectedGoalId === goalId) {
        setSelectedGoalId(goals.find(g => g.id !== goalId)?.id || 'default');
      }
    }
  };

  const resetGoalForm = () => {
    setNewGoalName('');
    setNewGoalIcon('🎯');
    setNewGoalDescription('');
    setNewGoalDeadline('');
    setNewGoalXpMultiplier(1);
    setNewGoalColor('bg-blue-500');
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalIcon(goal.icon);
    setNewGoalDescription(goal.description);
    setNewGoalDeadline(goal.targetDeadline);
    setNewGoalXpMultiplier(goal.xpMultiplier);
    setNewGoalColor(goal.color);
    setShowGoalModal(true);
  };

// END OF PART 1 - Continue to Part 2

// Enhanced Time Manager with Custom Goals - PART 2
// Add this right after PART 1 (continues the component)

  // Task management functions
  const addTask = () => {
    if (newTask.trim()) {
      const finalXP = Math.floor(taskXP * (currentGoal.xpMultiplier || 1));
      
      const newTaskObj = {
        id: Date.now(),
        text: newTask,
        goalId: selectedGoalId,
        completed: false,
        priority: selectedPriority,
        xp: finalXP,
        deadline: selectedDeadline || (isRecurring ? calculateNextDeadline(recurrenceType) : ''),
        isRecurring: isRecurring,
        recurrenceType: isRecurring ? recurrenceType : null,
        notes: taskNotes,
        streak: 0,
        lastCompleted: null,
        // NEW: Progress tracking fields
        hasProgressTracking: hasProgressTracking,
        targetValue: hasProgressTracking ? parseFloat(targetValue) || 0 : null,
        currentProgress: 0,
        unitType: hasProgressTracking ? unitType : null,
        progressHistory: [] // Track progress updates over time
      };
      
      setTasks(prev => [...prev, newTaskObj]);
      
      // Reset form
      setNewTask('');
      setSelectedDeadline('');
      setIsRecurring(false);
      setRecurrenceType('daily');
      setTaskNotes('');
      setTaskXP(50);
      setHasProgressTracking(false);
      setTargetValue('');
      setCurrentProgress(0);
      setUnitType('');
    }
  };

  // NEW: Function to update task progress
  const updateTaskProgress = (taskId, newProgress, isIncrement = false) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedProgress = isIncrement 
          ? Math.min((task.currentProgress || 0) + newProgress, task.targetValue)
          : Math.min(newProgress, task.targetValue);
        
        const wasIncomplete = task.currentProgress < task.targetValue;
        const isNowComplete = updatedProgress >= task.targetValue;
        
        // Auto-complete task when target is reached
        if (wasIncomplete && isNowComplete && !task.completed) {
          setCompletedToday(prev => prev + 1);
          setTotalXP(prev => prev + task.xp);
          updateDailyActivity();
        }
        
        return {
          ...task,
          currentProgress: updatedProgress,
          completed: task.completed || (updatedProgress >= task.targetValue),
          progressHistory: [
            ...task.progressHistory,
            {
              date: new Date().toISOString(),
              value: updatedProgress
            }
          ]
        };
      }
      return task;
    }));
  };

  // NEW: Quick increment function
  const quickIncrementProgress = (taskId, incrementValue) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.hasProgressTracking) {
      updateTaskProgress(taskId, incrementValue, true);
    }
  };

  // NEW: Open progress update modal
  const openProgressModal = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setProgressTaskId(taskId);
      setProgressUpdateValue(task.currentProgress?.toString() || '0');
      setShowProgressModal(true);
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        // Don't allow manual toggle if task has progress tracking and isn't complete
        if (task.hasProgressTracking && task.currentProgress < task.targetValue && !task.completed) {
          alert(`Complete the progress first! (${task.currentProgress}/${task.targetValue} ${task.unitType})`);
          return task;
        }
        
        const updated = { ...task, completed: !task.completed };
        
        if (updated.completed && !task.completed) {
          setCompletedToday(prev => prev + 1);
          setTotalXP(prev => prev + task.xp);
          updateDailyActivity();
          
          // Handle recurring task
          if (task.isRecurring) {
            updated.streak = (task.streak || 0) + 1;
            updated.lastCompleted = new Date().toISOString();
            
            // Create next occurrence
            setTimeout(() => {
              const newDeadline = calculateNextDeadline(task.recurrenceType);
              setTasks(prevTasks => [...prevTasks, {
                ...task,
                id: Date.now() + Math.random(),
                completed: false,
                deadline: newDeadline,
                lastCompleted: null,
                currentProgress: 0, // Reset progress for recurring tasks
                progressHistory: []
              }]);
            }, 100);
          }
        } else if (!updated.completed && task.completed) {
          setCompletedToday(prev => Math.max(0, prev - 1));
          setTotalXP(prev => Math.max(0, prev - task.xp));
        }
        return updated;
      }
      return task;
    }));
  };

  const startEditTask = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline || '');
    setEditIsRecurring(task.isRecurring || false);
    setEditRecurrenceType(task.recurrenceType || 'daily');
    setEditNotes(task.notes || '');
    setEditXP(task.xp || 50);
    setEditHasProgressTracking(task.hasProgressTracking || false);
    setEditTargetValue(task.targetValue?.toString() || '');
    setEditUnitType(task.unitType || '');
  };

  const saveEdit = () => {
    if (editText.trim()) {
      const finalXP = Math.floor(editXP * (currentGoal.xpMultiplier || 1));
      
      setTasks(prev => prev.map(task => {
        if (task.id === editingTask) {
          return {
            ...task,
            text: editText,
            priority: editPriority,
            deadline: editDeadline || (editIsRecurring ? calculateNextDeadline(editRecurrenceType) : ''),
            xp: finalXP,
            isRecurring: editIsRecurring,
            recurrenceType: editIsRecurring ? editRecurrenceType : null,
            notes: editNotes,
            hasProgressTracking: editHasProgressTracking,
            targetValue: editHasProgressTracking ? parseFloat(editTargetValue) || 0 : null,
            unitType: editHasProgressTracking ? editUnitType : null,
            // Keep current progress if it exists
            currentProgress: task.currentProgress || 0
          };
        }
        return task;
      }));
      cancelEdit();
    }
  };

  // Enhanced cancelEdit to reset progress fields
  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
    setEditPriority('');
    setEditDeadline('');
    setEditIsRecurring(false);
    setEditRecurrenceType('daily');
    setEditNotes('');
    setEditXP(50);
    setEditHasProgressTracking(false);
    setEditTargetValue('');
    setEditUnitType('');
  };

  // NEW: Calculate progress percentage
  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
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

  const exportData = () => {
    const data = {
      goals,
      tasks,
      totalXP,
      streak,
      completedToday,
      lastActiveDate,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `productivity-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

// END OF PART 2 - Continue to Part 3 for JSX

// Enhanced Time Manager with Custom Goals - PART 3
// Add this right after PART 2 (the return statement begins here)

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
              <p>"I am building my dream with every focused minute"</p>
              <p>"This session brings me closer to my goals"</p>
              <p>"Focus now = Freedom later"</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App UI
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Name</label>
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Learn Guitar, Fitness Journey"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Choose Icon</label>
                <div className="grid grid-cols-10 gap-2">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewGoalIcon(icon)}
                      className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                        newGoalIcon === icon 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Brief description of your goal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color Theme</label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color.class}
                      onClick={() => setNewGoalColor(color.class)}
                      className={`h-10 rounded-lg ${color.class} ${
                        newGoalColor === color.class 
                          ? 'ring-2 ring-offset-2 ring-gray-800' 
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">XP Multiplier</label>
                <input
                  type="number"
                  value={newGoalXpMultiplier}
                  onChange={(e) => setNewGoalXpMultiplier(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.5"
                  max="3"
                  step="0.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Multiply XP rewards for this goal (1x is normal)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingGoal ? updateGoal : addGoal}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  setEditingGoal(null);
                  resetGoalForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-auto relative">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">📊 Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total XP</p>
                      <p className="text-2xl font-bold">{totalXP}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Current Level</p>
                      <p className="text-2xl font-bold">{level}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Goals</p>
                      <p className="text-2xl font-bold">{goals.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">💾 Data Management</h3>
                  <button 
                    onClick={exportData}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
                  >
                    📥 Export All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header with Goal Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Life Productivity Tracker
            </h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Goal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {goals.map(goal => {
            const stats = getGoalStats(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  selectedGoalId === goal.id
                    ? `${goal.color} text-white shadow-lg`
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-xl">{goal.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{goal.name}</div>
                  <div className="text-xs opacity-75">
                    {stats.completed}/{stats.total} tasks • {stats.xpEarned} XP
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md whitespace-nowrap"
          >
            <FolderPlus className="h-5 w-5" />
            New Goal
          </button>
        </div>
      </div>

      {/* Current Goal Dashboard */}
      {currentGoal && (
        <div className={`${currentGoal.color} text-white p-6 rounded-xl mb-6 shadow-lg`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{currentGoal.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{currentGoal.name}</h2>
                  {currentGoal.description && (
                    <p className="text-white/80 text-sm">{currentGoal.description}</p>
                  )}
                </div>
              </div>
              {currentGoal.targetDeadline && (
                <p className="text-white/80 text-sm">
                  Target: {new Date(currentGoal.targetDeadline).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditGoalModal(currentGoal)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              {goals.length > 1 && (
                <button
                  onClick={() => deleteGoal(currentGoal.id)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-sm">Tasks</p>
              <p className="text-2xl font-bold">{getGoalStats(currentGoal.id).total}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-sm">Completed</p>
              <p className="text-2xl font-bold">{getGoalStats(currentGoal.id).completed}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-sm">Progress</p>
              <p className="text-2xl font-bold">{getGoalStats(currentGoal.id).progress}%</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-white/80 text-sm">XP Earned</p>
              <p className="text-2xl font-bold">{getGoalStats(currentGoal.id).xpEarned}</p>
            </div>
          </div>
        </div>
      )}

      {/* Player Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
              <p className="text-green-100 text-xs md:text-sm font-medium">Total XP</p>
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

      {/* Pomodoro Timer */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-6 rounded-xl mb-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">🎯 Deep Focus Zone</h2>
          <div className="text-4xl md:text-6xl font-mono font-bold mb-4">
            {formatTime(timer)}
          </div>
          {currentFocus && (
            <p className="text-indigo-100 mb-4 text-sm md:text-lg">
              🔥 Working on: <span className="font-semibold">{currentFocus}</span>
            </p>
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
          <p className="text-indigo-200 text-xs md:text-sm">
            🏆 Complete a session to earn +25 XP bonus!
          </p>
        </div>
      </div>

      {/* Add New Task */}
      <div className="bg-white/80 backdrop-blur p-4 md:p-6 rounded-xl mb-6 shadow-lg border border-white/20">
        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          Add Task for {currentGoal?.icon} {currentGoal?.name}
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What do you want to accomplish?"
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base"
              onKeyPress={(e) => e.key === 'Enter' && !hasProgressTracking && addTask()}
            />
            <button
              onClick={addTask}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-sm md:text-base whitespace-nowrap"
            >
              Add Task
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
              >
                {Object.entries(priorities).map(([key, priority]) => (
                  <option key={key} value={key}>{priority.icon} {priority.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1">XP Value</label>
              <input
                type="number"
                value={taskXP}
                onChange={(e) => setTaskXP(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                min="10"
                max="500"
                step="10"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={selectedDeadline}
                onChange={(e) => setSelectedDeadline(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
                min={new Date().toISOString().split('T')[0]}
                disabled={isRecurring}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1">Notes</label>
              <input
                type="text"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>
          
          {/* Progress Tracking Options - NEW */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProgressTracking}
                  onChange={(e) => setHasProgressTracking(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  📊 Add Progress Tracking
                </span>
              </label>
            </div>
            
            {hasProgressTracking && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-indigo-700">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g., 7000"
                    className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1 text-indigo-700">Unit Type</label>
                  <input
                    type="text"
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                    placeholder="e.g., steps, pages, minutes"
                    className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    list="unit-suggestions"
                  />
                  <datalist id="unit-suggestions">
                    {commonUnits.map(unit => (
                      <option key={unit} value={unit} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1 text-indigo-700">Example</label>
                  <div className="px-3 py-2 bg-white rounded-lg text-sm text-gray-600">
                    Track: 0/{targetValue || '???'} {unitType || 'units'}
                  </div>
                </div>
              </div>
            )}
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

      {/* Progress Update Modal - NEW */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Progress</h3>
            {(() => {
              const task = tasks.find(t => t.id === progressTaskId);
              return task ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{task.text}</p>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Current Progress</span>
                        <span className="text-sm font-bold">
                          {task.currentProgress}/{task.targetValue} {task.unitType}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                          style={{width: `${getProgressPercentage(task.currentProgress, task.targetValue)}%`}}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Set New Progress</label>
                    <input
                      type="number"
                      value={progressUpdateValue}
                      onChange={(e) => setProgressUpdateValue(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      min="0"
                      max={task.targetValue}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter total progress (not increment)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => quickIncrementProgress(progressTaskId, Math.round(task.targetValue * 0.1))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => quickIncrementProgress(progressTaskId, Math.round(task.targetValue * 0.25))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      +25%
                    </button>
                    <button
                      onClick={() => quickIncrementProgress(progressTaskId, Math.round(task.targetValue * 0.5))}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      +50%
                    </button>
                    <button
                      onClick={() => updateTaskProgress(progressTaskId, task.targetValue)}
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium text-green-700"
                    >
                      Complete
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        updateTaskProgress(progressTaskId, parseFloat(progressUpdateValue) || 0);
                        setShowProgressModal(false);
                        setProgressTaskId(null);
                        setProgressUpdateValue('');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
                    >
                      Update Progress
                    </button>
                    <button
                      onClick={() => {
                        setShowProgressModal(false);
                        setProgressTaskId(null);
                        setProgressUpdateValue('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* High Priority Tasks - ENHANCED with Progress Display */}
      {priorityTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
            High Priority Tasks
          </h3>
          <div className="space-y-3">
            {priorityTasks.map(task => {
              const deadlineInfo = getDeadlineStatus(task.deadline);
              const isEditing = editingTask === task.id;
              const progressPercent = task.hasProgressTracking 
                ? getProgressPercentage(task.currentProgress || 0, task.targetValue)
                : 0;
              
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="px-2 py-1 border rounded text-xs">
                          {Object.entries(priorities).map(([key, priority]) => (
                            <option key={key} value={key}>{priority.icon} {priority.label}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={editXP}
                          onChange={(e) => setEditXP(parseInt(e.target.value) || 50)}
                          className="px-2 py-1 border rounded text-xs"
                          placeholder="XP"
                        />
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="px-2 py-1 border rounded text-xs"
                          min={new Date().toISOString().split('T')[0]}
                          disabled={editIsRecurring}
                        />
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="px-2 py-1 border rounded text-xs"
                          placeholder="Notes"
                        />
                      </div>
                      
                      {/* Progress Tracking Edit Options */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editHasProgressTracking}
                            onChange={(e) => setEditHasProgressTracking(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm font-medium text-indigo-700">📊 Progress Tracking</span>
                        </label>
                        {editHasProgressTracking && (
                          <>
                            <input
                              type="number"
                              value={editTargetValue}
                              onChange={(e) => setEditTargetValue(e.target.value)}
                              className="px-2 py-1 border rounded text-xs w-20"
                              placeholder="Target"
                            />
                            <input
                              type="text"
                              value={editUnitType}
                              onChange={(e) => setEditUnitType(e.target.value)}
                              className="px-2 py-1 border rounded text-xs w-20"
                              placeholder="Unit"
                            />
                          </>
                        )}
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
                    <div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button 
                          onClick={() => toggleTask(task.id)} 
                          className={`transition-all flex-shrink-0 ${
                            task.hasProgressTracking && task.currentProgress < task.targetValue
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:text-red-700'
                          }`}
                          disabled={task.hasProgressTracking && task.currentProgress < task.targetValue}
                        >
                          <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <div className="flex-1">
                          <span className="font-semibold text-sm md:text-lg block">{task.text}</span>
                          
                          {/* Progress Bar - NEW */}
                          {task.hasProgressTracking && (
                            <div className="mt-2 mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  Progress: {task.currentProgress || 0}/{task.targetValue} {task.unitType}
                                </span>
                                <span className="text-xs font-bold text-gray-700">
                                  {progressPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progressPercent === 100 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                  }`}
                                  style={{width: `${progressPercent}%`}}
                                />
                              </div>
                              
                              {/* Quick Progress Buttons */}
                              <div className="flex gap-1 mt-2">
                                <button
                                  onClick={() => quickIncrementProgress(task.id, 100)}
                                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium text-blue-700"
                                >
                                  +100
                                </button>
                                <button
                                  onClick={() => quickIncrementProgress(task.id, 500)}
                                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium text-blue-700"
                                >
                                  +500
                                </button>
                                <button
                                  onClick={() => quickIncrementProgress(task.id, 1000)}
                                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium text-blue-700"
                                >
                                  +1000
                                </button>
                                <button
                                  onClick={() => openProgressModal(task.id)}
                                  className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-xs font-medium text-purple-700"
                                >
                                  Custom
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-1">
                            {task.isRecurring && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[task.recurrenceType].color}`}>
                                <RefreshCw className="h-3 w-3" />
                                {recurrenceOptions[task.recurrenceType].label}
                                {task.streak > 0 && ` • ${task.streak} streak`}
                              </span>
                            )}
                            {task.deadline && (
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${deadlineInfo.color}`}>
                                📅 {deadlineInfo.text}
                              </span>
                            )}
                            {task.notes && (
                              <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                📝 {task.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorities[task.priority].color}`}>
                          {priorities[task.priority].icon}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                          +{task.xp} XP
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => startEditTask(task)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all">
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button onClick={() => startFocusSession(task.text)} className="px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-all">
                            <Clock className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Tasks - ENHANCED with Progress Display */}
      {otherTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-4">📋 Other Tasks</h3>
          <div className="space-y-3">
            {otherTasks.map(task => {
              const deadlineInfo = getDeadlineStatus(task.deadline);
              const isEditing = editingTask === task.id;
              const progressPercent = task.hasProgressTracking 
                ? getProgressPercentage(task.currentProgress || 0, task.targetValue)
                : 0;
              
              return (
                <div key={task.id} className="bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-3 md:p-4">
                  {isEditing ? (
                    // Same edit UI as high priority tasks
                    <div className="space-y-3">
                      <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm md:text-base" placeholder="Edit task..." autoFocus />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="px-2 py-1 border rounded text-xs">
                          {Object.entries(priorities).map(([key, priority]) => (<option key={key} value={key}>{priority.icon} {priority.label}</option>))}
                        </select>
                        <input type="number" value={editXP} onChange={(e) => setEditXP(parseInt(e.target.value) || 50)} className="px-2 py-1 border rounded text-xs" placeholder="XP" />
                        <input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="px-2 py-1 border rounded text-xs" min={new Date().toISOString().split('T')[0]} disabled={editIsRecurring} />
                        <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="px-2 py-1 border rounded text-xs" placeholder="Notes" />
                      </div>
                      
                      {/* Progress Tracking Edit Options */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editHasProgressTracking} onChange={(e) => setEditHasProgressTracking(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                          <span className="text-sm font-medium text-indigo-700">📊 Progress Tracking</span>
                        </label>
                        {editHasProgressTracking && (
                          <>
                            <input type="number" value={editTargetValue} onChange={(e) => setEditTargetValue(e.target.value)} className="px-2 py-1 border rounded text-xs w-20" placeholder="Target" />
                            <input type="text" value={editUnitType} onChange={(e) => setEditUnitType(e.target.value)} className="px-2 py-1 border rounded text-xs w-20" placeholder="Unit" />
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">✅ Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">❌ Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button 
                          onClick={() => toggleTask(task.id)} 
                          className={`transition-all flex-shrink-0 ${
                            task.hasProgressTracking && task.currentProgress < task.targetValue
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                          disabled={task.hasProgressTracking && task.currentProgress < task.targetValue}
                        >
                          <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <div className="flex-1">
                          <span className="text-sm md:text-lg block">{task.text}</span>
                          
                          {/* Progress Bar */}
                          {task.hasProgressTracking && (
                            <div className="mt-2 mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  Progress: {task.currentProgress || 0}/{task.targetValue} {task.unitType}
                                </span>
                                <span className="text-xs font-bold text-gray-700">
                                  {progressPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progressPercent === 100 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                  }`}
                                  style={{width: `${progressPercent}%`}}
                                />
                              </div>
                              
                              {/* Quick Progress Buttons */}
                              <div className="flex gap-1 mt-2">
                                <button onClick={() => quickIncrementProgress(task.id, 100)} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium text-blue-700">
                                  +100
                                </button>
                                <button onClick={() => quickIncrementProgress(task.id, 500)} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium text-blue-700">
                                  +500
                                </button>
                                <button onClick={() => quickIncrementProgress(task.id, 1000)} className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs font-medium text-blue-700">
                                  +1000
                                </button>
                                <button onClick={() => openProgressModal(task.id)} className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-xs font-medium text-purple-700">
                                  Custom
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-1">
                            {task.isRecurring && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[task.recurrenceType].color}`}>
                                <RefreshCw className="h-3 w-3" />
                                {recurrenceOptions[task.recurrenceType].label}
                                {task.streak > 0 && ` • ${task.streak} streak`}
                              </span>
                            )}
                            {task.deadline && (
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${deadlineInfo.color}`}>
                                📅 {deadlineInfo.text}
                              </span>
                            )}
                            {task.notes && (
                              <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                📝 {task.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${priorities[task.priority].color}`}>
                          {priorities[task.priority].icon}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{task.xp} XP
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => startEditTask(task)} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all">
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button onClick={() => startFocusSession(task.text)} className="px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-all">
                            <Clock className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all">
                            🗑️
                          </button>
                        </div>
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
          <h3 className="text-lg md:text-xl font-bold mb-4 text-green-600">✅ Completed</h3>
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
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                  +{task.xp} ✨
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Goals Overview */}
      <div className="mt-8 bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">📊 All Goals Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const stats = getGoalStats(goal.id);
            return (
              <div key={goal.id} className={`${goal.color} text-white rounded-lg p-4 shadow-md`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{goal.icon}</span>
                  <h4 className="font-semibold">{goal.name}</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Progress:</span>
                    <span className="font-bold">{stats.progress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Tasks:</span>
                    <span className="font-bold">{stats.completed}/{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">XP Earned:</span>
                    <span className="font-bold">{stats.xpEarned}</span>
                  </div>
                </div>
                <div className="mt-3 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300" 
                    style={{width: `${stats.progress}%`}}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeManager;