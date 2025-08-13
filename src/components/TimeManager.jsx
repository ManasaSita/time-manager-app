import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, CheckCircle, Plus, Calendar, Target, Zap, Trophy, Star, Flame, TrendingUp, DollarSign, Code, Users, BookOpen, Award, Settings, X, Edit3, RefreshCw, Repeat, Trash2, FolderPlus, Folder, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

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
  // const [showSettings, setShowSettings] = useState(false);
  const [showCompletedTasksManager, setShowCompletedTasksManager] = useState(false); // ADD THIS LINE
  // const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsGoalId, setAnalyticsGoalId] = useState(null);
  
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
  const [showRecurringAnalytics, setShowRecurringAnalytics] = useState(false);
  const [selectedRecurringTask, setSelectedRecurringTask] = useState(null);
  const [recurringTemplates, setRecurringTemplates] = useLocalStorage('recurringTemplates', []);

  // NEW: Progress tracking state
  const [hasProgressTracking, setHasProgressTracking] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [unitType, setUnitType] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressTaskId, setProgressTaskId] = useState(null);
  const [progressUpdateValue, setProgressUpdateValue] = useState('');
  const [trackingType, setTrackingType] = useState('units'); // 'units' or 'subtasks'
  const [subtasks, setSubtasks] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasksList, setSubtasksList] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [draggedSubtask, setDraggedSubtask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

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
  const [editTrackingType, setEditTrackingType] = useState('units');
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [editNewSubtask, setEditNewSubtask] = useState('');

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

  // Streak management with proper date tracking
  useEffect(() => {
    const checkAndUpdateStreak = () => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      // Check if we've completed any tasks today
      const todayCompletedTasks = tasks.filter(task => {
        if (!task.completed) return false;
        const completedDate = task.completedDate || task.lastCompleted;
        if (!completedDate) return false;
        return new Date(completedDate).toDateString() === today;
      });
      
      // Check if we completed tasks yesterday
      const yesterdayCompletedTasks = tasks.filter(task => {
        if (!task.completed) return false;
        const completedDate = task.completedDate || task.lastCompleted;
        if (!completedDate) return false;
        return new Date(completedDate).toDateString() === yesterday;
      });
      
      if (lastActiveDate !== today) {
        if (lastActiveDate === yesterday && yesterdayCompletedTasks.length > 0 && todayCompletedTasks.length > 0) {
          // Continue streak
          setStreak(prev => prev + 1);
        } else if (todayCompletedTasks.length > 0) {
          // Start new streak
          setStreak(1);
        } else {
          // No tasks completed today yet, maintain streak if yesterday had tasks
          if (lastActiveDate === yesterday && yesterdayCompletedTasks.length > 0) {
            // Keep current streak, will increment when user completes a task today
          } else {
            // Reset streak
            setStreak(0);
          }
        }
        setLastActiveDate(today);
        setCompletedToday(todayCompletedTasks.length);
      }
    };

    checkAndUpdateStreak();
    const interval = setInterval(checkAndUpdateStreak, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, lastActiveDate, setStreak, setCompletedToday, setLastActiveDate]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      setTotalXP(prev => prev + 150);
      setIsFullScreen(false);
      alert('🎉 Focus session complete! +150 XP earned!');
      setTimer(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer, setTotalXP]);

  // Load scheduled recurring tasks at midnight or on app load
  useEffect(() => {
    const loadScheduledTasks = () => {
      const now = new Date();
      const scheduledTasks = JSON.parse(localStorage.getItem('scheduledRecurringTasks') || '[]');
      const tasksToAdd = [];
      const remainingTasks = [];
      
      scheduledTasks.forEach(task => {
        const scheduledDate = new Date(task.scheduledFor);
        if (scheduledDate <= now) {
          // Remove scheduledFor property and add to current tasks
          const { scheduledFor, ...taskWithoutSchedule } = task;
          tasksToAdd.push(taskWithoutSchedule);
        } else {
          remainingTasks.push(task);
        }
      });
      
      if (tasksToAdd.length > 0) {
        setTasks(prev => [...prev, ...tasksToAdd]);
        localStorage.setItem('scheduledRecurringTasks', JSON.stringify(remainingTasks));
      }
    };
    
    loadScheduledTasks();
    
    // Check every minute for tasks that should be loaded
    const interval = setInterval(loadScheduledTasks, 60000);
    
    return () => clearInterval(interval);
  }, [setTasks]);

  // Create daily instances of recurring tasks
  useEffect(() => {
    const createDailyInstances = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      recurringTemplates.forEach(template => {
        if (!template.isActive) return;

        if (template.recurrenceType === 'daily') {
          createDailyInstance(template); // Always create for daily
        } else if (template.recurrenceType === 'weekly') {
          const lastInstance = tasks
            .filter(t => t.templateId === template.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          if (!lastInstance || 
              Math.floor((today - new Date(lastInstance.createdAt)) / (1000 * 60 * 60 * 24)) >= 7) {
            createDailyInstance(template);
          }
        } else if (template.recurrenceType === 'monthly') {
          const lastInstance = tasks
            .filter(t => t.templateId === template.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          if (!lastInstance || 
              today.getMonth() !== new Date(lastInstance.createdAt).getMonth() || 
              today.getFullYear() !== new Date(lastInstance.createdAt).getFullYear()) {
            createDailyInstance(template);
          }
        }
      });
    };

    // 1️⃣ Run immediately on load
    createDailyInstances();

    // 2️⃣ Then check every minute for midnight
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        createDailyInstances();
      }
    };

    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);

  }, [recurringTemplates, tasks]);


  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        createDailyInstances();
      }
    };
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [recurringTemplates, tasks]);

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

  // Task management functions
  const addTask = () => {
    if (newTask.trim()) {
      const finalXP = Math.floor(taskXP * (currentGoal.xpMultiplier || 1));
      
      if (isRecurring) {
        // Create a recurring template
        const template = {
          id: Date.now().toString(),
          text: newTask,
          goalId: selectedGoalId,
          priority: selectedPriority,
          baseXP: finalXP,
          recurrenceType: recurrenceType,
          notes: taskNotes,
          hasProgressTracking: hasProgressTracking,
          trackingType: hasProgressTracking ? trackingType : null,
          targetValue: hasProgressTracking && trackingType === 'units' ? parseFloat(targetValue) || 0 : null,
          unitType: hasProgressTracking && trackingType === 'units' ? unitType : null,
          subtasks: hasProgressTracking && trackingType === 'subtasks' ? subtasksList : null,
          totalCompletions: 0,
          currentStreak: 0,
          completionHistory: [],
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        setRecurringTemplates(prev => [...prev, template]);
        
        // Create today's instance
        createDailyInstance(template);
      } else {
        // Create regular task
        const newTaskObj = {
          id: Date.now(),
          text: newTask,
          goalId: selectedGoalId,
          completed: false,
          priority: selectedPriority,
          xp: finalXP,
          deadline: selectedDeadline,
          isRecurring: false,
          notes: taskNotes,
          createdAt: new Date().toISOString(),
          hasProgressTracking: hasProgressTracking,
          trackingType: hasProgressTracking ? trackingType : null,
          targetValue: hasProgressTracking && trackingType === 'units' ? parseFloat(targetValue) || 0 : null,
          currentProgress: 0,
          unitType: hasProgressTracking && trackingType === 'units' ? unitType : null,
          subtasks: hasProgressTracking && trackingType === 'subtasks' ? subtasksList : null,
          progressHistory: []
        };
        
        setTasks(prev => [...prev, newTaskObj]);
      }
      
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
      setTrackingType('units');
      setSubtasksList([]);
      setSubtaskInput('');
    }
  };

  const createDailyInstance = (template) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if instance for today already exists
    const existingToday = tasks.find(t => 
      t.templateId === template.id && 
      new Date(t.createdAt).toDateString() === today.toDateString()
    );
    
    if (existingToday) return;
    
    const newInstance = {
      id: Date.now() + Math.random(),
      text: template.text,
      goalId: template.goalId,
      completed: false,
      priority: template.priority,
      xp: template.baseXP,
      deadline: today.toISOString().split('T')[0],
      isRecurring: true,
      recurrenceType: template.recurrenceType,
      templateId: template.id,
      notes: template.notes,
      createdAt: today.toISOString(),
      hasProgressTracking: template.hasProgressTracking,
      trackingType: template.trackingType,
      targetValue: template.targetValue,
      currentProgress: 0,
      unitType: template.unitType,
      subtasks: template.subtasks ? template.subtasks.map(s => ({
        ...s,
        completed: false,
        id: Date.now() + Math.random()
      })) : null,
      progressHistory: []
    };
    
    setTasks(prev => [...prev, newInstance]);
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
          
          // Mark completion time
          updated.completedDate = new Date().toISOString();
          
          // Handle recurring task - update the template
          if (task.isRecurring && task.templateId) {
            setRecurringTemplates(prev => prev.map(template => {
              if (template.id === task.templateId) {
                const completionHistory = template.completionHistory || [];
                completionHistory.push({
                  date: new Date().toISOString(),
                  amountDone: task.hasProgressTracking ? (task.currentProgress || 1) : 1,
                  taskId: task.id,
                  xpEarned: task.xp
                });
                
                return {
                  ...template,
                  totalCompletions: (template.totalCompletions || 0) + 1,
                  currentStreak: calculateStreak([...completionHistory]),
                  lastCompleted: new Date().toISOString(),
                  completionHistory: completionHistory
                };
              }
              return template;
            }));
          }
        } else if (!updated.completed && task.completed) {
          setCompletedToday(prev => Math.max(0, prev - 1));
          setTotalXP(prev => Math.max(0, prev - task.xp));
          
          // Remove from completion history if uncompleting
          if (task.isRecurring && task.templateId) {
            setRecurringTemplates(prev => prev.map(template => {
              if (template.id === task.templateId) {
                const completionHistory = (template.completionHistory || [])
                  .filter(h => h.taskId !== task.id);
                
                return {
                  ...template,
                  totalCompletions: Math.max(0, (template.totalCompletions || 1) - 1),
                  currentStreak: calculateStreak(completionHistory),
                  completionHistory: completionHistory
                };
              }
              return template;
            }));
          }
        }
        return updated;
      }
      return task;
    }));
  };

  const calculateStreak = (completionHistory) => {
    if (!completionHistory || completionHistory.length === 0) return 0;
    
    // Sort by date descending
    const sorted = [...completionHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sorted.length; i++) {
      const completionDate = new Date(sorted[i].date);
      completionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (completionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && completionDate.getTime() === today.getTime() - 86400000) {
        // Yesterday - continue checking
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.subtasks) {
        const updatedSubtasks = task.subtasks.map(sub => 
          sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        
        const completedCount = updatedSubtasks.filter(sub => sub.completed).length;
        const totalCount = updatedSubtasks.length;
        const allCompleted = completedCount === totalCount;
        
        // Auto-complete main task if all subtasks are done
        if (allCompleted && !task.completed) {
          setCompletedToday(prev => prev + 1);
          setTotalXP(prev => prev + task.xp);
          updateDailyActivity();
        }
        
        return {
          ...task,
          subtasks: updatedSubtasks,
          currentProgress: completedCount,
          targetValue: totalCount,
          completed: task.completed || allCompleted
        };
      }
      return task;
    }));
  };

  const toggleExpandTask = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleTaskDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleTaskDragOver = (e, taskId) => {
    e.preventDefault();
    if (taskId !== draggedTaskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleTaskDrop = (e, dropZone) => {
    e.preventDefault();
    
    if (!draggedTaskId) return;
    
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const draggedTask = newTasks.find(t => t.id === draggedTaskId);
      
      if (!draggedTask) return prevTasks;
      
      // Update priority based on drop zone
      if (dropZone === 'high-priority') {
        draggedTask.priority = 'high';
      } else if (dropZone === 'other-tasks') {
        draggedTask.priority = draggedTask.priority === 'high' ? 'medium' : draggedTask.priority;
      }
      
      // If dropping on a specific task, reorder
      if (dragOverTaskId && dragOverTaskId !== draggedTaskId) {
        const draggedIndex = newTasks.findIndex(t => t.id === draggedTaskId);
        const targetIndex = newTasks.findIndex(t => t.id === dragOverTaskId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          newTasks.splice(draggedIndex, 1);
          newTasks.splice(targetIndex, 0, draggedTask);
        }
      }
      
      return newTasks;
    });
    
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  // For subtasks drag and drop
  const handleSubtaskDragStart = (e, taskId, subtaskIndex) => {
    e.stopPropagation();
    setDraggedSubtask({ taskId, subtaskIndex });
  };

  const handleSubtaskDrop = (e, taskId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedSubtask || draggedSubtask.taskId !== taskId) {
      setDraggedSubtask(null);
      return;
    }
    
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId && task.subtasks) {
        const newSubtasks = [...task.subtasks];
        const [draggedItem] = newSubtasks.splice(draggedSubtask.subtaskIndex, 1);
        newSubtasks.splice(targetIndex, 0, draggedItem);
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    }));
    
    setDraggedSubtask(null);
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
    setEditTrackingType(task.trackingType || 'units');
    setEditTargetValue(task.targetValue?.toString() || '');
    setEditUnitType(task.unitType || '');
    setEditSubtasks(task.subtasks ? [...task.subtasks] : []);
    setEditNewSubtask('');
  };

  const saveEdit = () => {
    if (editText.trim()) {
      const finalXP = Math.floor(editXP * (currentGoal.xpMultiplier || 1));
      
      setTasks(prev => prev.map(task => {
        if (task.id === editingTask) {
          // Calculate new progress for subtasks if they exist
          let updatedProgress = task.currentProgress;
          let updatedTargetValue = task.targetValue;
          
          if (editHasProgressTracking && editTrackingType === 'subtasks' && editSubtasks) {
            const completedSubtasks = editSubtasks.filter(s => s.completed).length;
            updatedProgress = completedSubtasks;
            updatedTargetValue = editSubtasks.length;
          } else if (editHasProgressTracking && editTrackingType === 'units') {
            updatedTargetValue = parseFloat(editTargetValue) || 0;
          }
          
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
            trackingType: editHasProgressTracking ? editTrackingType : null,
            targetValue: editHasProgressTracking ? updatedTargetValue : null,
            unitType: editHasProgressTracking && editTrackingType === 'units' ? editUnitType : null,
            subtasks: editHasProgressTracking && editTrackingType === 'subtasks' ? editSubtasks : null,
            currentProgress: updatedProgress
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
    setEditTrackingType('units');
    setEditSubtasks([]);
    setEditNewSubtask('');
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

  // Function to revoke (uncomplete) a task
  const revokeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.completed) return;
    
    // Confirm revoke action
    if (window.confirm(`Are you sure you want to mark "${task.text}" as incomplete? This will deduct ${task.xp} XP.`)) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          // Reset progress if task has tracking
          const updatedTask = {
            ...t,
            completed: false,
            // Keep progress for tracked tasks, but mark incomplete
            currentProgress: t.hasProgressTracking ? t.currentProgress : 0
          };
          
          // If it's a recurring task, adjust the streak
          if (t.isRecurring && t.streak > 0) {
            updatedTask.streak = Math.max(0, t.streak - 1);
            updatedTask.lastCompleted = null;
          }
          
          return updatedTask;
        }
        return t;
      }));
      
      // Deduct XP and update counters
      setTotalXP(prev => Math.max(0, prev - task.xp));
      setCompletedToday(prev => Math.max(0, prev - 1));
      
      // Add notification
      if (typeof addNotification === 'function') {
        addNotification(`Task revoked: "${task.text}" (-${task.xp} XP)`, 'info', '↩️');
      }
    }
  };

  // Function to permanently delete a completed task
  const deleteCompletedTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (window.confirm(`Are you sure you want to permanently delete "${task.text}"? ${task.completed ? `This will deduct ${task.xp} XP.` : ''}`)) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // If task was completed, deduct XP
      if (task.completed) {
        setTotalXP(prev => Math.max(0, prev - task.xp));
        setCompletedToday(prev => Math.max(0, prev - 1));
      }
      
      // Add notification
      if (typeof addNotification === 'function') {
        addNotification(`Task deleted: "${task.text}"`, 'info', '🗑️');
      }
    }
  };

  // Function to bulk manage completed tasks
  const bulkManageCompletedTasks = (action) => {
    const completedTasksList = tasks.filter(t => t.completed);
    
    if (completedTasksList.length === 0) {
      alert('No completed tasks to manage.');
      return;
    }
    
    if (action === 'delete-all') {
      if (window.confirm(`Delete ALL ${completedTasksList.length} completed tasks? This will deduct ${completedTasksList.reduce((sum, t) => sum + t.xp, 0)} XP.`)) {
        const totalXPToDeduct = completedTasksList.reduce((sum, t) => sum + t.xp, 0);
        setTasks(prev => prev.filter(t => !t.completed));
        setTotalXP(prev => Math.max(0, prev - totalXPToDeduct));
        setCompletedToday(0);
        
        if (typeof addNotification === 'function') {
          addNotification(`Deleted ${completedTasksList.length} completed tasks`, 'info', '🗑️');
        }
      }
    } else if (action === 'revoke-all') {
      if (window.confirm(`Mark ALL ${completedTasksList.length} completed tasks as incomplete? This will deduct ${completedTasksList.reduce((sum, t) => sum + t.xp, 0)} XP.`)) {
        const totalXPToDeduct = completedTasksList.reduce((sum, t) => sum + t.xp, 0);
        setTasks(prev => prev.map(t => {
          if (t.completed) {
            return { ...t, completed: false };
          }
          return t;
        }));
        setTotalXP(prev => Math.max(0, prev - totalXPToDeduct));
        setCompletedToday(0);
        
        if (typeof addNotification === 'function') {
          addNotification(`Revoked ${completedTasksList.length} completed tasks`, 'info', '↩️');
        }
      }
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

  const TaskItem = ({ task, isPriority = false }) => {
    const deadlineInfo = getDeadlineStatus(task.deadline);
    const isEditing = editingTask === task.id;
    const isExpanded = expandedTasks.has(task.id);
    const isDragging = draggedTaskId === task.id;
    const isDragOver = dragOverTaskId === task.id;
    
    // Calculate progress for subtasks
    const subtaskProgress = task.subtasks 
      ? task.subtasks.filter(s => s.completed).length 
      : 0;
    const subtaskTotal = task.subtasks ? task.subtasks.length : 0;
    const subtaskPercentage = subtaskTotal > 0 
      ? Math.round((subtaskProgress / subtaskTotal) * 100) 
      : 0;
    
    const progressPercent = task.hasProgressTracking 
      ? (task.trackingType === 'subtasks' 
          ? subtaskPercentage 
          : getProgressPercentage(task.currentProgress || 0, task.targetValue))
      : 0;
    
    if (isEditing) {
      return (
        <div className={`${
          isPriority 
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200' 
            : 'bg-white/60 backdrop-blur border border-gray-200'
        } rounded-xl shadow-sm p-3 md:p-4`}>
          <div className="space-y-3">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm md:text-base focus:outline-none focus:border-blue-500"
              placeholder="Edit task..."
              autoFocus
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select 
                value={editPriority} 
                onChange={(e) => setEditPriority(e.target.value)} 
                className="px-2 py-1 border rounded text-xs focus:outline-none focus:border-blue-500"
              >
                {Object.entries(priorities).map(([key, priority]) => (
                  <option key={key} value={key}>{priority.icon} {priority.label}</option>
                ))}
              </select>
              <input
                type="number"
                value={editXP}
                onChange={(e) => setEditXP(parseInt(e.target.value) || 50)}
                className="px-2 py-1 border rounded text-xs focus:outline-none focus:border-blue-500"
                placeholder="XP"
                min="10"
                max="500"
                step="10"
              />
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="px-2 py-1 border rounded text-xs focus:outline-none focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
                disabled={editIsRecurring}
              />
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="px-2 py-1 border rounded text-xs focus:outline-none focus:border-blue-500"
                placeholder="Notes"
              />
            </div>
            
            {/* Progress Tracking Edit Options - Enhanced for Subtasks */}
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editHasProgressTracking}
                    onChange={(e) => {
                      setEditHasProgressTracking(e.target.checked);
                      if (!e.target.checked) {
                        setEditSubtasks([]);
                        setEditTrackingType('units');
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-indigo-700">📊 Progress Tracking</span>
                </label>
              </div>
              
              {editHasProgressTracking && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editTrackingType"
                        value="units"
                        checked={editTrackingType !== 'subtasks'}
                        onChange={() => {
                          setEditTrackingType('units');
                          setEditSubtasks([]);
                        }}
                        className="text-indigo-600"
                      />
                      <span className="text-xs font-medium">Track Units</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editTrackingType"
                        value="subtasks"
                        checked={editTrackingType === 'subtasks'}
                        onChange={() => {
                          setEditTrackingType('subtasks');
                          setEditTargetValue('');
                          setEditUnitType('');
                        }}
                        className="text-indigo-600"
                      />
                      <span className="text-xs font-medium">Track Subtasks</span>
                    </label>
                  </div>
                  
                  {editTrackingType === 'subtasks' ? (
                    <div className="space-y-2">
                      {/* Display existing subtasks */}
                      {editSubtasks && editSubtasks.length > 0 && (
                        <div className="space-y-1">
                          {editSubtasks.map((subtask, index) => (
                            <div key={subtask.id} className="flex items-center gap-2 p-2 bg-white rounded border border-indigo-200">
                              <div className="w-4 h-4 rounded border-2 border-gray-400 flex items-center justify-center">
                                {subtask.completed && '✓'}
                              </div>
                              <input
                                type="text"
                                value={subtask.text}
                                onChange={(e) => {
                                  const newSubtasks = [...editSubtasks];
                                  newSubtasks[index].text = e.target.value;
                                  setEditSubtasks(newSubtasks);
                                }}
                                className="flex-1 text-sm bg-transparent outline-none"
                              />
                              <button
                                onClick={() => {
                                  setEditSubtasks(editSubtasks.filter((_, i) => i !== index));
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add new subtask */}
                      <div className="flex items-center gap-2 p-2 bg-white rounded border-2 border-indigo-300">
                        <Plus className="h-4 w-4 text-indigo-600" />
                        <input
                          type="text"
                          value={editNewSubtask}
                          onChange={(e) => setEditNewSubtask(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && editNewSubtask.trim()) {
                              setEditSubtasks([...(editSubtasks || []), {
                                id: Date.now() + Math.random(),
                                text: editNewSubtask.trim(),
                                completed: false
                              }]);
                              setEditNewSubtask('');
                            }
                          }}
                          placeholder="Add a subtask (press Enter)"
                          className="flex-1 text-sm outline-none"
                        />
                      </div>
                      
                      <p className="text-xs text-indigo-600">
                        {editSubtasks ? editSubtasks.length : 0} subtask{editSubtasks?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={editTargetValue}
                        onChange={(e) => setEditTargetValue(e.target.value)}
                        className="px-2 py-1 border border-indigo-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                        placeholder="Target value"
                        min="1"
                      />
                      <input
                        type="text"
                        value={editUnitType}
                        onChange={(e) => setEditUnitType(e.target.value)}
                        className="px-2 py-1 border border-indigo-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                        placeholder="Unit type"
                      />
                      <div className="px-2 py-1 bg-white rounded text-xs text-gray-600">
                        Current: {task.currentProgress || 0}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Recurring Task Edit Options */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsRecurring}
                    onChange={(e) => setEditIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-purple-700 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Recurring Task
                  </span>
                </label>
              </div>
              
              {editIsRecurring && (
                <div className="flex gap-2">
                  {Object.entries(recurrenceOptions).map(([key, option]) => (
                    <button
                      key={key}
                      onClick={() => setEditRecurrenceType(key)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        editRecurrenceType === key 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={saveEdit} 
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-1"
              >
                ✅ Save Changes
              </button>
              <button 
                onClick={cancelEdit} 
                className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-all flex items-center justify-center gap-1"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div
        draggable="true"
        onDragStart={() => handleTaskDragStart(task.id)}
        onDragOver={(e) => handleTaskDragOver(e, task.id)}
        onDrop={(e) => handleTaskDrop(e, isPriority ? 'high-priority' : 'other-tasks')}
        onDragEnd={handleTaskDragEnd}
        className={`${
          isPriority 
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200' 
            : 'bg-white/60 backdrop-blur border border-gray-200'
        } rounded-xl shadow-sm p-3 md:p-4 transition-all hover:shadow-md ${
          isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
        } ${isDragOver ? 'ring-2 ring-blue-400 scale-[1.02]' : ''}`}
      >
        <div className="flex items-start gap-2 md:gap-3">
          <GripVertical className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0 cursor-grab" />
          
          <button 
            onClick={() => toggleTask(task.id)} 
            className={`mt-0.5 transition-all flex-shrink-0 ${
              task.hasProgressTracking && task.trackingType === 'subtasks' && subtaskProgress < subtaskTotal
                ? 'text-gray-300 cursor-not-allowed'
                : isPriority ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-green-600'
            }`}
            disabled={task.hasProgressTracking && task.trackingType === 'subtasks' && subtaskProgress < subtaskTotal}
          >
            <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          
          <div className="flex-1 text-left">
            <div className="flex items-start gap-2">
              {task.subtasks && task.subtasks.length > 0 && (
                <button
                  onClick={() => toggleExpandTask(task.id)}
                  className="mt-0.5 p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0"
                >
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </button>
              )}
              <span className="font-semibold text-sm md:text-lg text-left break-words">{task.text}</span>
            </div>
            
            {/* Progress Bar for Subtasks */}
            {task.hasProgressTracking && task.trackingType === 'subtasks' && task.subtasks && (
              <div className="mt-2 ml-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    Subtasks: {subtaskProgress}/{subtaskTotal} completed
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {subtaskPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      subtaskPercentage === 100 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{width: `${subtaskPercentage}%`}}
                  />
                </div>
              </div>
            )}

            {/* Progress Bar for Units */}
            {task.hasProgressTracking && task.trackingType !== 'subtasks' && (
              <div className="mt-2 ml-6">
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
                    onClick={() => openProgressModal(task.id)}
                    className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-xs font-medium text-purple-700"
                  >
                    Custom
                  </button>
                </div>
              </div>
            )}
            
            {/* Expanded Subtasks with better alignment */}
            {isExpanded && task.subtasks && (
              <div className="mt-3 ml-6 space-y-1 pl-4 border-l-2 border-gray-300">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-start gap-2 p-1 hover:bg-gray-50 rounded"
                  >
                    <button
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                      className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        subtask.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-400 hover:border-green-500'
                      }`}
                    >
                      {subtask.completed && '✓'}
                    </button>
                    <span className={`text-sm text-left break-words ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                      {subtask.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Task metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.isRecurring && task.templateId && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[task.recurrenceType].color}`}>
                  <RefreshCw className="h-3 w-3" />
                  {recurrenceOptions[task.recurrenceType].label}
                  {(() => {
                    const template = recurringTemplates.find(t => t.id === task.templateId);
                    return template?.currentStreak > 0 ? ` • ${template.currentStreak} 🔥` : '';
                  })()}
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
              {task.hasProgressTracking && !task.subtasks && (
                <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-600">
                  📊 Tracking: {task.unitType}
                </span>
              )}
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-600">
                  📋 {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                </span>
              )}
            </div>
          </div>
          
          {/* Right side buttons - make them stack vertically on mobile */}
          <div className="flex flex-col md:flex-row items-end gap-1 md:gap-2 flex-shrink-0">
            <div className="flex flex-col md:flex-row gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${priorities[task.priority].color}`}>
                {priorities[task.priority].icon}
              </span>
              <span className={`${isPriority ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded-full text-xs font-bold`}>
                +{task.xp} XP
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEditTask(task)} className="p-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-all">
                <Edit3 className="h-3 w-3" />
              </button>
              <button onClick={() => startFocusSession(task.text)} className="p-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-all">
                <Clock className="h-3 w-3" />
              </button>
              <button onClick={() => deleteTask(task.id)} className="p-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Progress Analytics Component
  const ProgressAnalytics = ({ goalId, goalInfo }) => {
    const [timeRange, setTimeRange] = useState('today');
    
    const getTasksForTimeRange = () => {
      const now = new Date();
      const goalTasks = tasks.filter(t => t.goalId === goalId);
      
      let filteredTasks = goalTasks;
      
      if (timeRange === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        filteredTasks = goalTasks.filter(task => {
          // Include tasks created today
          const createdDate = new Date(task.createdAt);
          const isCreatedToday = createdDate >= todayStart && createdDate <= todayEnd;
          
          // Include tasks completed today
          let isCompletedToday = false;
          if (task.completed && task.completedDate) {
            const completedDate = new Date(task.completedDate);
            isCompletedToday = completedDate >= todayStart && completedDate <= todayEnd;
          }
          
          return isCreatedToday || isCompletedToday;
        });
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        weekAgo.setHours(0, 0, 0, 0);
        
        filteredTasks = goalTasks.filter(task => {
          const createdDate = new Date(task.createdAt || Date.now());
          const isRecentlyCreated = createdDate >= weekAgo;
          
          let isRecentlyCompleted = false;
          if (task.completed && task.completedDate) {
            const completedDate = new Date(task.completedDate);
            isRecentlyCompleted = completedDate >= weekAgo;
          }
          
          return isRecentlyCreated || isRecentlyCompleted;
        });
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        monthAgo.setHours(0, 0, 0, 0);
        
        filteredTasks = goalTasks.filter(task => {
          const createdDate = new Date(task.createdAt || Date.now());
          const isRecentlyCreated = createdDate >= monthAgo;
          
          let isRecentlyCompleted = false;
          if (task.completed && task.completedDate) {
            const completedDate = new Date(task.completedDate);
            isRecentlyCompleted = completedDate >= monthAgo;
          }
          
          return isRecentlyCreated || isRecentlyCompleted;
        });
      }
      
      const completed = filteredTasks.filter(t => t.completed).length;
      const pending = filteredTasks.filter(t => !t.completed).length;
      const high = filteredTasks.filter(t => !t.completed && t.priority === 'high').length;
      const medium = filteredTasks.filter(t => !t.completed && t.priority === 'medium').length;
      const low = filteredTasks.filter(t => !t.completed && t.priority === 'low').length;
      const total = filteredTasks.length;
      const xpEarned = filteredTasks.filter(t => t.completed).reduce((sum, t) => sum + (t.xp || 0), 0);
      
      return { completed, pending, total, high, medium, low, xpEarned };
    };
    
    const { completed, pending, total, high, medium, low, xpEarned } = getTasksForTimeRange();
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate the circle for the pie chart
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const completedLength = (completed / Math.max(total, 1)) * circumference;
    
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200">
        {goalInfo && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{goalInfo.icon}</span>
            <h3 className="text-xl font-bold">{goalInfo.name}</h3>
          </div>
        )}
        
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              timeRange === 'today' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              timeRange === 'week' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              timeRange === 'month' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Pie Chart */}
          <div className="relative">
            <svg width="150" height="150" className="transform -rotate-90">
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              {total > 0 && (
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="20"
                  strokeDasharray={`${completedLength} ${circumference}`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{completionRate}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{completed}</span>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{pending}</span>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Tasks</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{total}</span>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">XP Earned</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{xpEarned}</span>
            </div>
          </div>
        </div>
        
        {/* Priority Breakdown */}
        {pending > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Pending Tasks by Priority:</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                High: {high}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                Medium: {medium}
              </span>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                Low: {low}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const RecurringTaskAnalytics = ({ template }) => {
    const [timeRange, setTimeRange] = useState('week');
    
    const getAnalytics = () => {
      const history = template.completionHistory || [];
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      
      let relevantHistory = history;
      let expectedDays = 0;
      
      if (timeRange === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        relevantHistory = history.filter(h => {
          const date = new Date(h.date);
          date.setHours(0, 0, 0, 0);
          return date.getTime() === today.getTime();
        });
        expectedDays = 1;
      } else if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        weekAgo.setHours(0, 0, 0, 0);
        relevantHistory = history.filter(h => new Date(h.date) >= weekAgo);
        expectedDays = 7;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        monthAgo.setHours(0, 0, 0, 0);
        relevantHistory = history.filter(h => new Date(h.date) >= monthAgo);
        expectedDays = 30;
      }
      
      // Calculate completion rate based on recurrence type
      if (template.recurrenceType === 'weekly') {
        expectedDays = Math.ceil(expectedDays / 7);
      } else if (template.recurrenceType === 'monthly') {
        expectedDays = Math.ceil(expectedDays / 30);
      }
      
      const completions = relevantHistory.length;
      const completionRate = expectedDays > 0 ? Math.round((completions / expectedDays) * 100) : 0;
      const totalXP = relevantHistory.reduce((sum, h) => sum + (h.xpEarned || 0), 0);
      
      // Get completion dates for visualization
      const dates = relevantHistory.map(h => new Date(h.date).toLocaleDateString());
      
      return {
        completions,
        expectedDays,
        completionRate,
        totalXP,
        dates,
        currentStreak: template.currentStreak || 0
      };
    };
    
    const analytics = getAnalytics();
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{template.text}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[template.recurrenceType].color}`}>
                <RefreshCw className="h-3 w-3" />
                {recurrenceOptions[template.recurrenceType].label}
              </span>
              <span className="text-sm text-gray-500">
                Total: {template.totalCompletions || 0} completions
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowRecurringAnalytics(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 mb-4">
          {['today', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg font-medium capitalize ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Completion Rate</p>
            <p className="text-2xl font-bold text-green-700">{analytics.completionRate}%</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Completions</p>
            <p className="text-2xl font-bold text-blue-700">
              {analytics.completions}/{analytics.expectedDays}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium">Current Streak</p>
            <p className="text-2xl font-bold text-purple-700">{analytics.currentStreak} 🔥</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
            <p className="text-xs text-yellow-600 font-medium">XP Earned</p>
            <p className="text-2xl font-bold text-yellow-700">{analytics.totalXP}</p>
          </div>
        </div>
        
        {/* Completion Calendar/List */}
        {analytics.dates.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Completed on:</p>
            <div className="flex flex-wrap gap-2">
              {analytics.dates.map((date, index) => (
                <span key={index} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200">
                  {date}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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

              {/* Add Progress Analytics Chart */}
              <div className="mt-4">
                <ProgressAnalytics goalId={currentGoal.id} />
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
                onClick={() => {
                  setAnalyticsGoalId(currentGoal.id);
                  setShowAnalyticsModal(true);
                }}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all group relative"
                title="View Analytics"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  View Analytics
                </span>
              </button>
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
            🏆 Complete a session to earn +150 XP bonus!
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
          
          {/* Enhanced Progress Tracking Options with Google Keep style Subtasks */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProgressTracking}
                  onChange={(e) => {
                    setHasProgressTracking(e.target.checked);
                    if (!e.target.checked) {
                      setSubtasksList([]);
                      setTrackingType('units');
                    }
                  }}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  📊 Add Progress Tracking or Subtasks
                </span>
              </label>
            </div>
            
            {hasProgressTracking && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trackingType"
                      value="units"
                      checked={trackingType !== 'subtasks'}
                      onChange={() => {
                        setTrackingType('units');
                        setSubtasksList([]);
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm font-medium">Track Units/Progress</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="trackingType"
                      value="subtasks"
                      checked={trackingType === 'subtasks'}
                      onChange={() => {
                        setTrackingType('subtasks');
                        setTargetValue('');
                        setUnitType('');
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm font-medium">Track Subtasks</span>
                  </label>
                </div>
                
                {trackingType === 'subtasks' ? (
                  <div className="space-y-2">
                    {/* Google Keep Style Subtask Input */}
                    <div className="space-y-2">
                      {/* Display existing subtasks */}
                      {subtasksList.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {subtasksList.map((subtask, index) => (
                            <div
                              key={subtask.id}
                              draggable
                              onDragStart={() => setDraggedSubtask(index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedSubtask !== null && draggedSubtask !== index) {
                                  const newList = [...subtasksList];
                                  const draggedItem = newList[draggedSubtask];
                                  newList.splice(draggedSubtask, 1);
                                  newList.splice(index, 0, draggedItem);
                                  setSubtasksList(newList);
                                  setDraggedSubtask(null);
                                }
                              }}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 transition-all cursor-move"
                            >
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                              <input
                                type="text"
                                value={subtask.text}
                                onChange={(e) => {
                                  const newList = [...subtasksList];
                                  newList[index].text = e.target.value;
                                  setSubtasksList(newList);
                                }}
                                className="flex-1 text-sm bg-transparent outline-none"
                                placeholder="Subtask name..."
                              />
                              <button
                                onClick={() => {
                                  setSubtasksList(subtasksList.filter((_, i) => i !== index));
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add new subtask input */}
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg border-2 border-indigo-200">
                        <Plus className="h-4 w-4 text-indigo-600" />
                        <input
                          type="text"
                          value={subtaskInput}
                          onChange={(e) => setSubtaskInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && subtaskInput.trim()) {
                              setSubtasksList([...subtasksList, {
                                id: Date.now() + Math.random(),
                                text: subtaskInput.trim(),
                                completed: false
                              }]);
                              setSubtaskInput('');
                            }
                          }}
                          placeholder="Add a subtask (press Enter)"
                          className="flex-1 text-sm outline-none"
                        />
                      </div>
                      
                      <p className="text-xs text-indigo-600">
                        {subtasksList.length} subtask{subtasksList.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                  </div>
                ) : (
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

      {/* High Priority Tasks */}
      {priorityTasks.length > 0 && (
        <div 
          className="mb-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleTaskDrop(e, 'high-priority')}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
            High Priority Tasks
          </h3>
          <div className="space-y-3">
            {priorityTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isPriority={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Tasks */}
      {otherTasks.length > 0 && (
        <div 
          className="mb-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleTaskDrop(e, 'other-tasks')}
        >
          <h3 className="text-lg md:text-xl font-bold mb-4">📋 Other Tasks</h3>
          <div className="space-y-3">
            {otherTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isPriority={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recurring Tasks Templates */}
      {recurringTemplates.filter(t => t.goalId === selectedGoalId && t.isActive).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
            <Repeat className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
            Recurring Routines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recurringTemplates
              .filter(t => t.goalId === selectedGoalId && t.isActive)
              .map(template => {
                const todayInstance = tasks.find(t => 
                  t.templateId === template.id && 
                  new Date(t.createdAt).toDateString() === new Date().toDateString()
                );
                
                return (
                  <div key={template.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{template.text}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${recurrenceOptions[template.recurrenceType].color}`}>
                            {recurrenceOptions[template.recurrenceType].icon} {recurrenceOptions[template.recurrenceType].label}
                          </span>
                          <span className="text-xs text-gray-600">
                            🔥 {template.currentStreak || 0} day streak
                          </span>
                          <span className="text-xs text-gray-600">
                            ✅ {template.totalCompletions || 0} total
                          </span>
                        </div>
                        
                        {todayInstance && (
                          <div className="mt-2 text-sm">
                            {todayInstance.completed ? (
                              <span className="text-green-600 font-medium">✅ Completed today!</span>
                            ) : (
                              <span className="text-orange-600 font-medium">⏳ Pending today</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedRecurringTask(template);
                            setShowRecurringAnalytics(true);
                          }}
                          className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                          title="View Analytics"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Pause this recurring task? You can resume it later.')) {
                              setRecurringTemplates(prev => prev.map(t => 
                                t.id === template.id ? { ...t, isActive: false } : t
                              ));
                            }
                          }}
                          className="p-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Completed Tasks - ENHANCED with Delete & Revoke */}
      {completedTasks.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowCompletedTasksManager(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
          >
            Manage Completed Tasks
          </button>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-green-600 flex items-center gap-2">
              ✅ Completed Tasks ({completedTasks.length})
            </h3>
            
            {/* Bulk Actions Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-1">
                Bulk Actions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                <button
                  onClick={() => bulkManageCompletedTasks('revoke-all')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-2"
                >
                  ↩️ Revoke All
                </button>
                <button
                  onClick={() => bulkManageCompletedTasks('delete-all')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                >
                  🗑️ Delete All
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl transition-all hover:bg-green-100">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 flex-shrink-0" />
                
                <div className="flex-1">
                  <span className="line-through text-gray-600 text-sm md:text-lg block text-left">{task.text}</span>
                  
                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {task.isRecurring && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                        <RefreshCw className="h-3 w-3" />
                        {recurrenceOptions[task.recurrenceType].label}
                        {task.streak > 0 && ` • ${task.streak} streak`}
                      </span>
                    )}
                    
                    {task.hasProgressTracking && task.trackingType === 'subtasks' && task.subtasks && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                        📊 {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                      </span>
                    )}
                    
                    {task.hasProgressTracking && task.trackingType !== 'subtasks' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                        📊 {task.currentProgress}/{task.targetValue} {task.unitType}
                      </span>
                    )}
                    
                    {task.notes && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-600 bg-gray-100">
                        📝 {task.notes}
                      </span>
                    )}
                    
                    <span className="text-xs text-gray-500">
                      Completed {(() => {
                        const completedDate = task.completedDate || task.lastCompleted;
                        if (!completedDate) return 'today';
                        
                        const completed = new Date(completedDate);
                        const today = new Date();
                        const diffTime = today - completed;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 0) return 'today';
                        if (diffDays === 1) return 'yesterday';
                        if (diffDays < 7) return `${diffDays} days ago`;
                        return completed.toLocaleDateString();
                      })()}
                    </span>
                  </div>
                </div>
                
                {/* XP Badge */}
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                  +{task.xp} ✨
                </span>
                
                {/* Action Buttons - Hidden by default, shown on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => revokeTask(task.id)}
                    className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-all"
                    title="Mark as incomplete"
                  >
                    ↩️ Revoke
                  </button>
                  <button
                    onClick={() => deleteCompletedTask(task.id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-all"
                    title="Delete permanently"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700 font-medium">
                Total XP from completed tasks:
              </span>
              <span className="text-green-800 font-bold">
                {completedTasks.reduce((sum, task) => sum + task.xp, 0)} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Completed Tasks Management Modal */}
      {showCompletedTasksManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">📋 Manage Completed Tasks</h2>
              <button onClick={() => setShowCompletedTasksManager(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter Options */}
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                All ({completedTasks.length})
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Today ({completedTasks.filter(t => {
                  const date = t.lastCompleted ? new Date(t.lastCompleted) : new Date();
                  return date.toDateString() === new Date().toDateString();
                }).length})
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                This Week ({completedTasks.filter(t => {
                  const date = t.lastCompleted ? new Date(t.lastCompleted) : new Date();
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return date >= weekAgo;
                }).length})
              </button>
            </div>
            
            {/* Task List */}
            <div className="space-y-2 mb-4">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex-1">
                    <p className="font-medium">{task.text}</p>
                    <p className="text-xs text-gray-500">
                      {task.xp} XP • Completed {new Date(task.lastCompleted || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => revokeTask(task.id)}
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => deleteCompletedTask(task.id)}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bulk Actions Bar */}
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">
                Total: {completedTasks.length} completed tasks
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    bulkManageCompletedTasks('revoke-all');
                    setShowCompletedTasksManager(false);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Revoke All
                </button>
                <button 
                  onClick={() => {
                    bulkManageCompletedTasks('delete-all');
                    setShowCompletedTasksManager(false);
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete All
                </button>
              </div>
            </div>
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

      {/* Progress Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📊 Progress Analytics
                {analyticsGoalId && goals.find(g => g.id === analyticsGoalId) && (
                  <span className="text-lg text-gray-600">
                    - {goals.find(g => g.id === analyticsGoalId).icon} {goals.find(g => g.id === analyticsGoalId).name}
                  </span>
                )}
              </h2>
              <button onClick={() => setShowAnalyticsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Analytics for each goal if no specific goal selected */}
            {!analyticsGoalId ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => (
                  <ProgressAnalytics 
                    key={`${goal.id}-${tasks.filter(t => t.completed).length}`} 
                    goalId={goal.id} 
                    goalInfo={goal} 
                  />
                ))}
              </div>
            ) : (
              <ProgressAnalytics 
                key={`${analyticsGoalId}-${tasks.filter(t => t.completed).length}`}
                goalId={analyticsGoalId} 
                goalInfo={goals.find(g => g.id === analyticsGoalId)} 
              />
            )}
          </div>
        </div>
      )}

      {/* Recurring Task Analytics Modal */}
      {showRecurringAnalytics && selectedRecurringTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <RecurringTaskAnalytics template={selectedRecurringTask} />
        </div>
      )}

    </div>
  );
};

export default TimeManager;