import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Users, User, CheckCircle, Music, X } from 'lucide-react';

export default function GroupDateFinder() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  type User = {
    id: number;
    name: string;
    dates: { [date: string]: boolean };
  };

  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar', 'results', or 'about'
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMusicFestivals, setShowMusicFestivals] = useState(true);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{ [userId: number]: Set<string> }>({});
  const [festivalAttendance, setFestivalAttendance] = useState<{ [userId: number]: { [date: string]: string } }>({});
  const [showFestivalPrompt, setShowFestivalPrompt] = useState(false);
  const [pendingFestivalDate, setPendingFestivalDate] = useState<string | null>(null);

  // Load data from localStorage and URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(sharedData));
        setUsers(parsedData.users || []);
        // Don't set activeUser from shared data - let user select themselves
      } catch (error) {
        console.error('Error parsing shared data:', error);
      }
    } else {
      // Load from localStorage if no shared data
      const savedUsers = localStorage.getItem('seeYouThere_users');
      if (savedUsers) {
        try {
          setUsers(JSON.parse(savedUsers));
        } catch (error) {
          console.error('Error loading saved users:', error);
        }
      }
    }

    // Check if user has a saved profile
    const savedUserName = localStorage.getItem('seeYouThere_currentUser');
    if (savedUserName) {
      setCurrentUserName(savedUserName);
      setShowUserForm(false);
    }
  }, []);

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('seeYouThere_users', JSON.stringify(users));
    }
  }, [users]);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('seeYouThere_userPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        // Convert arrays back to Sets
        const convertedPreferences: { [userId: number]: Set<string> } = {};
        Object.entries(preferences).forEach(([userId, dates]) => {
          convertedPreferences[parseInt(userId)] = new Set(dates as string[]);
        });
        setUserPreferences(convertedPreferences);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
  }, []);

  // Save user preferences to localStorage whenever they change
  useEffect(() => {
    // Convert Sets to arrays for JSON serialization
    const serializablePreferences: { [userId: number]: string[] } = {};
    Object.entries(userPreferences).forEach(([userId, dates]) => {
      serializablePreferences[parseInt(userId)] = Array.from(dates);
    });
    localStorage.setItem('seeYouThere_userPreferences', JSON.stringify(serializablePreferences));
  }, [userPreferences]);

  // Load festival attendance from localStorage
  useEffect(() => {
    const savedAttendance = localStorage.getItem('seeYouThere_festivalAttendance');
    if (savedAttendance) {
      try {
        setFestivalAttendance(JSON.parse(savedAttendance));
      } catch (error) {
        console.error('Error loading festival attendance:', error);
      }
    }
  }, []);

  // Save festival attendance to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('seeYouThere_festivalAttendance', JSON.stringify(festivalAttendance));
  }, [festivalAttendance]);

  // Update activeUser when currentUserName changes
  useEffect(() => {
    if (currentUserName && users.length > 0) {
      const user = users.find(u => u.name === currentUserName);
      if (user) {
        setActiveUser(user.id);
      }
    }
  }, [currentUserName, users]);

  // Handle user profile creation/selection
  const handleUserSubmit = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check if user already exists
    let existingUser = users.find(u => u.name === trimmedName);
    
    if (!existingUser) {
      // Create new user
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: trimmedName,
        dates: {}
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      existingUser = newUser;
    }

    setCurrentUserName(trimmedName);
    setActiveUser(existingUser.id);
    setShowUserForm(false);
    
    // Save current user to localStorage
    localStorage.setItem('seeYouThere_currentUser', trimmedName);
  };

  // Generate shareable URL
  const generateShareableURL = () => {
    const data = { users };
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?data=${encodedData}`;
  };

  // Copy URL to clipboard
  const copyShareableURL = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableURL());
      alert('Shareable URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback: show URL in prompt
      prompt('Copy this URL to share:', generateShareableURL());
    }
  };

  // Toggle preferred date for current user
  const togglePreferredDate = (dateStr: string) => {
    if (activeUser === null) return;
    
    setUserPreferences(prev => {
      const newPreferences = { ...prev };
      if (!newPreferences[activeUser]) {
        newPreferences[activeUser] = new Set();
      }
      
      const userDates = new Set(newPreferences[activeUser]);
      if (userDates.has(dateStr)) {
        userDates.delete(dateStr);
      } else {
        userDates.add(dateStr);
      }
      newPreferences[activeUser] = userDates;
      return newPreferences;
    });
  };

  // Get current user's preferred dates
  const getCurrentUserPreferences = (): Set<string> => {
    if (activeUser === null) return new Set();
    return userPreferences[activeUser] || new Set();
  };

  // Get preference count for a date across all users
  const getPreferenceCount = (dateStr: string): number => {
    return Object.values(userPreferences).reduce((count, userDates) => {
      return count + (userDates.has(dateStr) ? 1 : 0);
    }, 0);
  };

  // Get most preferred dates (sorted by preference count)
  const getMostPreferredDates = () => {
    const dateCounts: { [date: string]: number } = {};
    
    // Count preferences for each date
    Object.values(userPreferences).forEach(userDates => {
      userDates.forEach(date => {
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      });
    });
    
    // Convert to array and sort by preference count (descending)
    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Handle festival attendance decision
  const handleFestivalDecision = (attending: 'attending' | 'busy') => {
    if (!pendingFestivalDate || activeUser === null) return;
    
    // Mark the date as unavailable
    const newUsers = users.map(user => {
      if (user.id === activeUser) {
        return {
          ...user,
          dates: {
            ...user.dates,
            [pendingFestivalDate]: true
          }
        };
      }
      return user;
    });
    setUsers(newUsers);
    
    // Record festival attendance status
    setFestivalAttendance(prev => ({
      ...prev,
      [activeUser]: {
        ...prev[activeUser],
        [pendingFestivalDate]: attending
      }
    }));
    
    // Close prompt
    setShowFestivalPrompt(false);
    setPendingFestivalDate(null);
  };

  // Get festival attendees for a specific date
  const getFestivalAttendees = (dateStr: string) => {
    return users.filter(user => 
      festivalAttendance[user.id]?.[dateStr] === 'attending'
    );
  };

  // Reset all data and start fresh
  const handleStartFresh = () => {
    setUsers([]);
    setActiveUser(null);
    setCurrentUserName('');
    setShowUserForm(true);
    setShowResetConfirm(false);
    setUserPreferences({});
    setFestivalAttendance({});
    localStorage.removeItem('seeYouThere_users');
    localStorage.removeItem('seeYouThere_currentUser');
    localStorage.removeItem('seeYouThere_userPreferences');
    localStorage.removeItem('seeYouThere_festivalAttendance');
  };
  
  // US Federal Holidays for 2025
  const usHolidays = [
    { name: "New Year's Day", date: "2025-01-01" },
    { name: "Martin Luther King Jr. Day", date: "2025-01-20" },
    { name: "Presidents' Day", date: "2025-02-17" },
    { name: "Memorial Day", date: "2025-05-26" },
    { name: "Juneteenth", date: "2025-06-19" },
    { name: "Independence Day", date: "2025-07-04" },
    { name: "Labor Day", date: "2025-09-01" },
    { name: "Columbus Day", date: "2025-10-13" },
    { name: "Veterans Day", date: "2025-11-11" },
    { name: "Thanksgiving Day", date: "2025-11-27" },
    { name: "Christmas Day", date: "2025-12-25" }
  ];

  // Music festivals and multi-date events
  const festivals = [
    {
      id: 3,
      name: "Goldengrass",
      startDate: "2025-05-29",
      endDate: "2025-06-01",
      dayOfWeekStart: "Thursday",
      location: "New Terrain Brewing Co",
      description: "Four days of bluegrass music and craft beer.",
      color: "bg-yellow-200"
    },
    {
      id: 4,
      name: "Town Park Pre-TBF",
      startDate: "2025-06-14",
      endDate: "2025-06-18",
      dayOfWeekStart: "Saturday",
      location: "Telluride, CO",
      description: "Pre-festival gathering at Town Park before the main Telluride Bluegrass Festival.",
      color: "bg-sky-200"
    },
    {
      id: 5,
      name: "Telluride Bluegrass Festival",
      startDate: "2025-06-19",
      endDate: "2025-06-22",
      dayOfWeekStart: "Thursday",
      location: "Telluride, CO",
      description: "Nestled in the rugged San Juan Mountains of Southwestern Colorado, the Telluride Bluegrass Festival is not only an iconic representation of all kinds of bluegrass music, but a destination for music lovers from all walks of life.",
      color: "bg-indigo-200"
    },
    {
      id: 6,
      name: "Rail on the River",
      startDate: "2025-06-26",
      endDate: "2025-06-29",
      dayOfWeekStart: "Thursday",
      location: "Parrish Ranch",
      website: "Tickets at railarts.org",
      color: "bg-pink-200"
    },
    {
      id: 7,
      name: "High Mountain Hay Fever",
      startDate: "2025-07-10",
      endDate: "2025-07-13",
      dayOfWeekStart: "Thursday",
      location: "Westcliffe, CO",
      description: "Great Music, Great Place, Great Cause",
      color: "bg-red-200"
    },
    {
      id: 8,
      name: "BoogieOnTheHill",
      startDate: "2025-07-18",
      endDate: "2025-07-20",
      dayOfWeekStart: "Friday",
      location: "Lyons, CO",
      description: "BoogieOnTheHill is a small and intimate camping gathering held on 35 private acres outside of Lyons, CO this July 18th & 19th. We offer a lot of fun for an affordable price.",
      color: "bg-orange-200"
    },
    {
      id: 9,
      name: "Rockygrass Academy",
      startDate: "2025-07-20",
      endDate: "2025-07-24",
      dayOfWeekStart: "Sunday",
      location: "Planetbluegrass Lyons Colorado",
      description: "RockyGrass Academy is an intensive bluegrass music camp offering workshops and instruction.",
      color: "bg-violet-200"
    },
    {
      id: 10,
      name: "Rockygrass",
      startDate: "2025-07-25",
      endDate: "2025-07-27",
      dayOfWeekStart: "Friday",
      location: "Planetbluegrass Lyons Colorado",
      description: "Located in Lyons, Colorado, RockyGrass is traditional bluegrass at its finest. Red rock cliffs and Cottonwoods peer down over the property as festivarians pick in the campground and along the St. Vrain River.",
      color: "bg-purple-200"
    },
    {
      id: 11,
      name: "Rhythms on the Rio",
      startDate: "2025-07-31",
      endDate: "2025-08-03",
      dayOfWeekStart: "Thursday",
      location: "Del Norte, CO ",
      color: "bg-teal-200"
    },
    {
      id: 12,
      name: "Rapidgrass",
      startDate: "2025-08-15",
      endDate: "2025-08-16",
      dayOfWeekStart: "Friday",
      location: "Rapidgrass Bluegrass Festival",
      color: "bg-cyan-200"
    },
    {
      id: 13,
      name: "SnowyGrass",
      startDate: "2025-08-21",
      endDate: "2025-08-24",
      dayOfWeekStart: "Thursday",
      location: "Stanley Park",
      description: "10th Annual SnowyGrass. Panoramic Views, Camping and Jamming Festival. Dog-friendly",
      color: "bg-blue-100"
    },
    {
      id: 14,
      name: "McAwesome Ranch",
      startDate: "2025-08-23",
      endDate: "2025-08-23",
      dayOfWeekStart: "Saturday",
      time: "All Day",
      location: "McAwesome Ranch",
      description: "As we approach the 6th annual installment of The Colorado Bluegrass Festival, it is clear that this event is unlike any other night of music in Colorado.",
      color: "bg-lime-200"
    },
    {
      id: 15,
      name: "WanderFest",
      startDate: "2025-09-11",
      endDate: "2025-09-13",
      dayOfWeekStart: "Thursday",
      location: "New Terrain Brewing Co",
      description: "Dates have been set for WanderFest 2025! We will have 3 days of live music from Thursday, 9/11 - Saturday, 9/13. For more information visit our website.",
      color: "bg-fuchsia-200"
    },
    {
      id: 16,
      name: "Pickin' In The Rockies",
      startDate: "2025-09-14",
      endDate: "2025-09-14",
      dayOfWeekStart: "Sunday",
      time: "All Day",
      location: "Absolute Prestige Ranch",
      description: "Pickin' In The Rockies is a festival in western Colorado that is providing a whoopin', hollerin', toe tappin', hand clappin' good time for the entire family.",
      color: "bg-rose-200"
    },
    {
      id: 17,
      name: "Buffalo",
      startDate: "2025-10-03",
      startTime: "12:00 pm",
      endDate: "2025-10-05",
      endTime: "9:00 pm",
      dayOfWeekStart: "Friday",
      location: "Buffalo Grass Bluegrass Festival",
      description: "Save the date and join us for the second annual Buffalo Bluegrass & Picking Festival! Featuring live music from some great local artists, daily workshops, and a band scramble.",
      color: "bg-amber-200"
    }
  ];

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get holidays for a specific date
  const getHolidaysForDate = (dateStr: string | number | Date) => {
    if (!dateStr) return [];
    
    const targetDate = typeof dateStr === 'string' ? dateStr : formatDate(new Date(dateStr));
    return usHolidays.filter(holiday => holiday.date === targetDate);
  };

  // Get events for a specific date
  const getEventsForDate = (dateStr: string | number | Date) => {
    if (!dateStr) return [];
    
    return festivals.filter(festival => {
      const startDate = new Date(festival.startDate + 'T12:00:00');
      const endDate = new Date(festival.endDate + 'T12:00:00');
      const currentDate = new Date(dateStr);
      
      return currentDate >= startDate && currentDate <= endDate;
    });
  };
  
  // Check if a date is within a festival period
  const isDateWithinFestival = (dateStr: string) => {
    if (!dateStr) return false;
    return getEventsForDate(dateStr).length > 0;
  };

  // Check if a date is today
  const isToday = (dateStr: string) => {
    const today = new Date();
    const todayStr = formatDate(today);
    return dateStr === todayStr;
  };

  // Generate calendar days for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    let days = [];
    // Add empty slots for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateStr = formatDate(currentDate);
      const festivalsOnDay = getEventsForDate(dateStr);
      const holidaysOnDay = getHolidaysForDate(dateStr);
      
      const currentUser = users.find(u => u.id === activeUser);
      days.push({ 
        day: i, 
        date: dateStr,
        isUnavailable: currentUser?.dates[dateStr] === true,
        festivals: showMusicFestivals ? festivalsOnDay : [],
        holidays: holidaysOnDay,
        isToday: isToday(dateStr),
        isPreferred: getCurrentUserPreferences().has(dateStr)
      });
    }
    
    return days;
  };

  // Get month name
  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' });
  };

  // Handle date selection
  const toggleDate = (dateStr: string | number | null) => {
    if (!dateStr) return;
    
    if (activeUser === null) return;
    
    const currentUser = users.find(u => u.id === activeUser);
    const isCurrentlyMarked = currentUser?.dates[dateStr as string] === true;
    
    // If marking a date as unavailable and it's a festival date, prompt for clarification
    if (!isCurrentlyMarked && showMusicFestivals && isDateWithinFestival(dateStr as string)) {
      setPendingFestivalDate(dateStr as string);
      setShowFestivalPrompt(true);
      return;
    }
    
    // Regular toggle for non-festival dates or when unmarking
    const newUsers = users.map(user => {
      if (user.id === activeUser) {
        return {
          ...user,
          dates: {
            ...user.dates,
            [dateStr]: !user.dates[dateStr]
          }
        };
      }
      return user;
    });
    
    setUsers(newUsers);
    
    // Clear festival attendance if unmarking a date
    if (isCurrentlyMarked && festivalAttendance[activeUser]?.[dateStr as string]) {
      setFestivalAttendance(prev => ({
        ...prev,
        [activeUser]: {
          ...prev[activeUser],
          [dateStr as string]: undefined
        }
      }));
    }
  };

  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calculate best dates for the group (fewest unavailable people)
  const getBestDates = () => {
    // Create a map of all marked dates (unavailable dates) and count how many users are unavailable
    const dateUnavailability: { [date: string]: number } = {};
    const allMarkedDates = new Set<string>();
    
    // Collect all dates that have been marked by any user
    users.forEach(user => {
      Object.entries(user.dates).forEach(([date, isMarked]) => {
        if (isMarked) {
          allMarkedDates.add(date);
          dateUnavailability[date] = (dateUnavailability[date] || 0) + 1;
        }
      });
    });
    
    // For dates where no one has marked unavailable, add them with 0 count
    // We'll focus on marked dates for now and let users explore unmarked dates separately
    
    // Convert to an array and sort by unavailability count (ascending - fewer unavailable is better)
    const sortedDates = Object.entries(dateUnavailability)
      .map(([date, unavailableCount]) => ({ 
        date, 
        unavailableCount: unavailableCount as number,
        availableCount: users.length - (unavailableCount as number)
      }))
      .sort((a, b) => a.unavailableCount - b.unavailableCount);
    
    return sortedDates;
  };

  // Get all unmarked days through end of year
  const getUnmarkedDays = () => {
    if (users.length === 0) return [];
    
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
    const unmarkedDays = [];
    const markedDates = new Set();
    
    // Collect all marked dates from all users
    users.forEach(user => {
      Object.keys(user.dates).forEach(date => {
        markedDates.add(date);
      });
    });
    
    // Iterate through each day from today to end of year
    const currentDate = new Date(today);
    while (currentDate <= endOfYear) {
      const dateStr = formatDate(currentDate);
      if (!markedDates.has(dateStr)) {
        unmarkedDays.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return unmarkedDays;
  };

  // Get unmarked days within a specific number of days from today
  const getUnmarkedDaysWithinPeriod = (days: number) => {
    if (users.length === 0) return [];
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    
    const unmarkedDays = [];
    const markedDates = new Set();
    
    // Collect all marked dates from all users
    users.forEach(user => {
      Object.keys(user.dates).forEach(date => {
        markedDates.add(date);
      });
    });
    
    // Iterate through each day from today to end date
    const currentDate = new Date(today);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      if (!markedDates.has(dateStr)) {
        unmarkedDays.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return unmarkedDays;
  };

  // Get festival meetups where people are actually attending
  const getFestivalMeetups = () => {
    if (users.length === 0) return [];
    
    const festivalMeetups = [];
    
    festivals.forEach(festival => {
      const startDate = new Date(festival.startDate + 'T12:00:00');
      const endDate = new Date(festival.endDate + 'T12:00:00');
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        
        // Get users who are actually attending this festival
        const attendees = getFestivalAttendees(dateStr);
        
        // Only include if at least 2 people are attending
        if (attendees.length >= 2) {
          festivalMeetups.push({
            date: dateStr,
            attendees,
            festival: festival
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    // Sort by date and attendee count
    return festivalMeetups.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.attendees.length - a.attendees.length;
    });
  };

  // Get weekend days (Saturday/Sunday) with availability info
  const getAvailableWeekends = () => {
    const markedDates = getBestDates();
    const weekendDates = markedDates.filter(dateInfo => {
      const date = new Date(dateInfo.date);
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
    });
    return weekendDates;
  };

  // Format date for display
  const formatDateForDisplay = (dateStr: string | number | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Format date as M/D
  const formatDateShort = (dateStr: string | number | Date) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // User form component
  const UserForm = () => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim()) {
        handleUserSubmit(name);
      }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowUserForm(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative">
          <button
            onClick={() => setShowUserForm(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">Welcome to See Ya There</h2>
          <p className="text-gray-600 mb-4 text-center">Enter your name to get started</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </form>
          {users.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Or select existing user:</p>
              <div className="flex flex-wrap gap-2">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSubmit(user.name)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // User Management Modal
  const UserManagementModal = () => {
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowUserModal(false);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative">
          <button
            onClick={() => setShowUserModal(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-4 text-center">User Management</h2>
          
          {/* Current Users */}
          {users.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Current Users:</h3>
              <div className="flex flex-wrap gap-2">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      handleUserSubmit(user.name);
                      setShowUserModal(false);
                    }}
                    className={`
                      px-3 py-2 text-sm rounded-lg cursor-pointer hover:opacity-80 transition-opacity
                      ${user.name === currentUserName ? 'bg-[#033F63] text-white' : 'bg-[#FEDC97] text-[#033F63]'}
                    `}
                  >
                    {user.name}
                    {user.name === currentUserName && <span className="ml-1">•</span>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-500 text-center">No users yet. Create the first user to get started!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setShowUserForm(true);
                setShowUserModal(false);
              }}
              className="w-full px-4 py-3 bg-[#7C9885] text-white rounded-lg hover:bg-[#28666E] flex items-center justify-center font-medium"
            >
              <User className="mr-2 h-4 w-4" /> Create New User
            </button>
            
            <button
              onClick={() => {
                setShowResetConfirm(true);
                setShowUserModal(false);
              }}
              className="w-full px-4 py-3 bg-[#28666E] text-white rounded-lg hover:bg-[#033F63] flex items-center justify-center font-medium"
            >
              <X className="mr-2 h-4 w-4" /> Reset All Data
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Festival Attendance Prompt
  const FestivalPrompt = () => {
    if (!pendingFestivalDate) return null;
    
    const festivalEvents = getEventsForDate(pendingFestivalDate);
    const festivalName = festivalEvents[0]?.name || 'Music Festival';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-bold mb-4 text-center">Festival Date Detected! 🎵</h3>
          <p className="text-gray-600 mb-4 text-center">
            You're marking <strong>{formatDateForDisplay(pendingFestivalDate)}</strong> as unavailable, and we noticed there's a music festival happening:
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg mb-6 text-center">
            <div className="font-medium text-yellow-800">{festivalName}</div>
            {festivalEvents[0]?.location && (
              <div className="text-sm text-yellow-600">{festivalEvents[0].location}</div>
            )}
          </div>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Are you attending this festival, or are you busy with something else?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleFestivalDecision('attending')}
              className="w-full px-4 py-3 bg-[#28666E] text-white rounded-lg hover:bg-[#7C9885] flex items-center justify-center font-medium"
            >
              🎵 I'm attending this festival!
            </button>
            <button
              onClick={() => handleFestivalDecision('busy')}
              className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center font-medium"
            >
              📅 I'm busy with something else
            </button>
            <button
              onClick={() => {
                setShowFestivalPrompt(false);
                setPendingFestivalDate(null);
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Reset confirmation dialog
  const ResetConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4 text-center">Start Fresh Calendar?</h3>
        <p className="text-gray-600 mb-6 text-center">
          This will remove all users and their selected dates. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowResetConfirm(false)}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStartFresh}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );

  // About page component
  const AboutPage = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-8">
        <img 
          src="/logo.png" 
          alt="See Ya There Logo" 
          className="h-32 w-auto object-contain mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-[#033F63] mb-2">See Ya There</h1>
        <p className="text-lg text-gray-600">Group Date Planning Made Simple</p>
      </div>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-[#033F63] mb-3">What is this?</h2>
          <p className="mb-4">
            See Ya There is a collaborative calendar tool designed to help groups of friends find the best dates for meetups and events. 
            Instead of endless group text conversations trying to coordinate schedules, everyone can simply mark their unavailable dates 
            and instantly see when the group is free to get together.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#033F63] mb-3">How it works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create your user profile by entering your name</li>
            <li>Mark dates when you are <strong>NOT available</strong> on the calendar</li>
            <li>Star your preferred meetup dates for extra visibility</li>
            <li>Share your calendar link with friends so they can add their availability</li>
            <li>Check the Results page to see the best dates when everyone is free</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#033F63] mb-3">Music Festival Integration</h2>
          <p className="mb-4">
            See Ya There includes an overlay of popular music festivals throughout the year. When you mark a festival date as unavailable, 
            the app will ask if you're attending the festival or just busy. This helps the group discover opportunities to meet up at festivals 
            when multiple people are attending the same event.
          </p>
          <p className="text-sm text-gray-600">
            You can toggle festival overlays on/off using the checkbox above the calendar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#033F63] mb-3">Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Multi-user collaborative scheduling</li>
            <li>Preferred date marking and group voting</li>
            <li>Music festival integration and meetup detection</li>
            <li>Shareable calendar links</li>
            <li>Results view with availability summaries</li>
            <li>Mobile-friendly responsive design</li>
            <li>Local storage - no account required</li>
          </ul>
        </section>

        <section className="border-t pt-6 mt-8">
          <div className="text-center">
            <p className="text-lg font-medium text-[#033F63] mb-2">
              Developed With Love ❤️
            </p>
            <p className="text-gray-600 text-lg">
              by <span className="font-semibold text-[#28666E]">j:hand</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Making group planning a little easier, one calendar at a time.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => setView('calendar')}
          className="px-6 py-3 bg-[#28666E] text-white rounded-lg hover:bg-[#033F63] font-medium"
        >
          Back to Calendar
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pt-0 px-2 sm:px-4 pb-2 sm:pb-4 bg-gray-50">
      {showUserForm && <UserForm />}
      {showUserModal && <UserManagementModal />}
      {showFestivalPrompt && <FestivalPrompt />}
      {showResetConfirm && <ResetConfirmDialog />}
      
      <div className="mb-0">
        {/* Logo header */}
        <div className="flex justify-center pt-0 pb-1">
          <img 
            src="/logo.png" 
            alt="See Ya There Logo" 
            className="h-44 sm:h-56 w-auto object-contain"
          />
        </div>
        
        {/* Welcome Message - Above navigation */}
        {currentUserName && (
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#033F63] mb-1">
              Welcome, {currentUserName}!
            </h2>
            {view === 'calendar' && (
              <p className="text-sm text-gray-600">Select dates when you are NOT available</p>
            )}
          </div>
        )}

        {/* Main Navigation - Always visible */}
        <div className="bg-white p-3 rounded-lg shadow-sm border mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              className={`px-4 py-3 text-sm rounded-lg flex items-center justify-center font-medium min-h-[48px] transition-colors ${view === 'calendar' ? 'bg-[#033F63] text-white' : 'bg-[#B5B682] text-[#033F63] hover:bg-[#7C9885] hover:text-white'}`}
              onClick={() => setView('calendar')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Calendar
            </button>
            <button 
              className={`px-4 py-3 text-sm rounded-lg flex items-center justify-center font-medium min-h-[48px] transition-colors ${view === 'results' ? 'bg-[#033F63] text-white' : 'bg-[#B5B682] text-[#033F63] hover:bg-[#7C9885] hover:text-white'}`}
              onClick={() => setView('results')}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Results
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-4 py-3 text-sm rounded-lg flex items-center justify-center font-medium min-h-[48px] transition-colors bg-[#7C9885] text-white hover:bg-[#28666E]"
            >
              <Users className="mr-2 h-4 w-4" /> Users
            </button>
            <button
              onClick={copyShareableURL}
              className={`px-4 py-3 text-sm rounded-lg flex items-center justify-center font-medium min-h-[48px] transition-colors ${
                users.length > 0 
                  ? 'bg-[#28666E] text-white hover:bg-[#7C9885]' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={users.length === 0}
            >
              <Users className="mr-2 h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>


      {/* Calendar View */}
      {view === 'calendar' && (
        <>
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                            <button                 onClick={prevMonth}                className="p-2 rounded-full hover:bg-[#FEDC97]"              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {getMonthName(currentMonth)} {currentMonth.getFullYear()}
              </h2>
                            <button                 onClick={nextMonth}                className="p-2 rounded-full hover:bg-[#FEDC97]"              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Music Festival Toggle */}
            <div className="flex items-center justify-center mb-4 p-2 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMusicFestivals}
                  onChange={(e) => setShowMusicFestivals(e.target.checked)}
                  className="w-4 h-4 text-[#28666E] bg-gray-100 border-gray-300 rounded focus:ring-[#28666E] focus:ring-2"
                />
                <Music className="h-4 w-4 text-[#28666E]" />
                <span className="text-sm font-medium text-gray-700">Show Music Festivals</span>
              </label>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-medium text-gray-500 text-xs sm:text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div 
                  key={index}
                  onClick={() => toggleDate(day.date)}
                  title={[
                    `${day.isUnavailable ? 'You are NOT available' : 'Click to mark as unavailable'}`,
                    ...(day.isPreferred ? ['⭐ Preferred meetup date'] : []),
                    ...(day.holidays && day.holidays.length > 0 ? day.holidays.map(h => `🇺🇸 ${h.name}`) : []),
                    ...(day.festivals && day.festivals.length > 0 ? day.festivals.map(f => `🎵 ${f.name}${f.location ? ` - ${f.location}` : ''}`) : [])
                  ].join('\n') || undefined}
                  className={`
                    h-10 sm:h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer relative text-xs sm:text-sm
                    ${!day.day ? 'text-[#B5B682]' : 'hover:bg-[#FEDC97]'}
                    ${day.isUnavailable ? 'bg-red-200 text-red-800 font-medium' : ''}
                    ${day.isPreferred ? 'ring-2 ring-[#FEDC97] ring-offset-1' : ''}
                    ${day.festivals && day.festivals.length > 0 ? 'border-2 border-dashed border-[#28666E]' : ''}
                    ${day.holidays && day.holidays.length > 0 ? 'bg-red-100 border-2 border-red-300' : ''}
                    ${day.isToday ? 'ring-2 ring-[#FEDC97] bg-[#FEDC97] font-bold text-[#033F63]' : ''}
                  `}
                >
                  {day.day}
                  {day.isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-[#28666E] rounded-full"></div>
                  )}
                  {day.isPreferred && (
                    <div className="absolute -top-1 -left-1 text-xs">⭐</div>
                  )}
                  {day.holidays && day.holidays.length > 0 && (
                    <div className="absolute -top-1 -left-1 text-xs">🇺🇸</div>
                  )}
                  {day.festivals && day.festivals.length > 0 && (
                    <div className="absolute bottom-1 flex space-x-1">
                      {day.festivals.slice(0, 3).map((festival, fidx) => (
                        <div 
                          key={fidx} 
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${festival.color}`}
                        ></div>
                      ))}
                      {day.festivals.length > 3 && (
                        <div className="text-[8px] text-gray-600">+{day.festivals.length - 3}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </>
      )}

      {/* Music Festivals Legend - Only show in Calendar view */}
      {view === 'calendar' && (
        <div className="mb-4 p-3 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center text-sm sm:text-base">
              <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#033F63]" /> Music Festivals
            </h3>
            <button
              onClick={() => setShowMusicFestivals(!showMusicFestivals)}
              className="p-1 rounded-md hover:bg-[#FEDC97] transition-colors"
              title={showMusicFestivals ? 'Hide festivals' : 'Show festivals'}
            >
              {showMusicFestivals ? (
                <ChevronUp className="h-4 w-4 text-[#28666E]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#28666E]" />
              )}
            </button>
          </div>
          {showMusicFestivals && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {festivals.map(festival => (
                <div 
                  key={festival.id}
                  className={`px-2 sm:px-3 py-2 rounded-md ${festival.color} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => {
                    const festivalDate = new Date(festival.startDate + 'T12:00:00');
                    setCurrentMonth(new Date(festivalDate.getFullYear(), festivalDate.getMonth(), 1));
                  }}
                >
                  <div className="font-medium text-xs sm:text-sm">{festival.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {new Date(festival.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {new Date(festival.endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Results View */}
      {view === 'results' && (
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#7C9885]" /> Best Available Dates
              </h3>
              <p className="text-gray-500 text-center my-8 text-sm sm:text-base">Create users and mark unavailable dates to see meetup suggestions.</p>
            </div>
          ) : (
            <>
              {/* Group Preferred Dates Section */}
              {getMostPreferredDates().length > 0 && (
                <div className="p-4 bg-white rounded-lg shadow border-2 border-[#FEDC97]">
                  <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                    <span className="mr-2">🏆</span> Group's Favorite Dates
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-700 mb-3">
                      Dates ranked by how many people chose them as preferred
                    </div>
                    <div className="space-y-2">
                      {getMostPreferredDates().map((preference, index) => (
                        <div key={index} className="px-3 py-2 bg-white rounded border border-yellow-200">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{formatDateForDisplay(preference.date)}</div>
                              <div className="text-xs text-yellow-600">
                                {showMusicFestivals && isDateWithinFestival(preference.date) ? '🎵 Festival day' : 'Meetup day'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-yellow-700">
                                {preference.count} of {users.length} {preference.count === 1 ? 'person' : 'people'}
                              </div>
                              <div className="flex gap-1">
                                {users.map(user => {
                                  const userPrefs = userPreferences[user.id] || new Set();
                                  const hasPreferred = userPrefs.has(preference.date);
                                  return (
                                    <div 
                                      key={user.id}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                        hasPreferred ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-500'
                                      }`}
                                      title={`${user.name} ${hasPreferred ? 'prefers' : 'did not choose'} this date`}
                                    >
                                      {hasPreferred ? '⭐' : user.name.charAt(0)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Current User's Preferred Dates */}
              {getCurrentUserPreferences().size > 0 && currentUserName && (
                <div className="p-4 bg-white rounded-lg shadow border border-blue-200">
                  <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                    <span className="mr-2">⭐</span> Your Preferred Dates ({currentUserName})
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700 mb-3">
                      <strong>{getCurrentUserPreferences().size}</strong> preferred {getCurrentUserPreferences().size === 1 ? 'date' : 'dates'} selected
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Array.from(getCurrentUserPreferences())
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                        .map((dateStr, index) => (
                        <div key={index} className="px-3 py-2 bg-white rounded border border-blue-200 flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{formatDateForDisplay(dateStr)}</div>
                            <div className="text-xs text-blue-600">
                              {showMusicFestivals && isDateWithinFestival(dateStr) ? '🎵 Festival day' : 'Meetup day'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getPreferenceCount(dateStr)} {getPreferenceCount(dateStr) === 1 ? 'person likes' : 'people like'} this
                            </div>
                          </div>
                          <button
                            onClick={() => togglePreferredDate(dateStr)}
                            className="text-red-500 hover:text-red-700 text-sm ml-2"
                            title="Remove from your preferred dates"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats Summary */}
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#7C9885]" /> Availability Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 10 Days Summary */}
                  <div 
                    className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => {
                      const element = document.getElementById('section-10-days');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                        {getUnmarkedDaysWithinPeriod(10).length}
                      </div>
                      <div className="text-sm font-medium text-green-700">Next 10 Days</div>
                      <div className="text-xs text-green-600 mt-1">
                        {getUnmarkedDaysWithinPeriod(10).length === 1 ? 'day' : 'days'} available
                      </div>
                    </div>
                  </div>

                  {/* 30 Days Summary */}
                  <div 
                    className="bg-blue-50 p-4 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => {
                      const element = document.getElementById('section-30-days');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                        {getUnmarkedDaysWithinPeriod(30).length}
                      </div>
                      <div className="text-sm font-medium text-blue-700">Next 30 Days</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {getUnmarkedDaysWithinPeriod(30).length === 1 ? 'day' : 'days'} available
                      </div>
                    </div>
                  </div>

                  {/* 60 Days Summary */}
                  <div 
                    className="bg-purple-50 p-4 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                    onClick={() => {
                      const element = document.getElementById('section-60-days');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                        {getUnmarkedDaysWithinPeriod(60).length}
                      </div>
                      <div className="text-sm font-medium text-purple-700">Next 60 Days</div>
                      <div className="text-xs text-purple-600 mt-1">
                        {getUnmarkedDaysWithinPeriod(60).length === 1 ? 'day' : 'days'} available
                      </div>
                    </div>
                  </div>
                </div>

                {/* Festival Summary */}
                {showMusicFestivals && getFestivalMeetups().length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
                          {getFestivalMeetups().length}
                        </div>
                        <div className="text-sm font-medium text-yellow-700">Festival Opportunities</div>
                        <div className="text-xs text-yellow-600 mt-1">
                          music festival {getFestivalMeetups().length === 1 ? 'meetup' : 'meetups'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Next 10 days */}
              <div id="section-10-days" className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> Next 10 Days
                </h3>
                {getUnmarkedDaysWithinPeriod(10).length === 0 ? (
                  <p className="text-gray-500 text-sm">No dates in the next 10 days where everyone is available.</p>
                ) : (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700 mb-3">
                      <strong>{getUnmarkedDaysWithinPeriod(10).length}</strong> days where everyone is available
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {getUnmarkedDaysWithinPeriod(10).map((dateStr, index) => (
                        <div 
                          key={index} 
                          className={`px-3 py-2 bg-white rounded border cursor-pointer transition-all ${
                            getCurrentUserPreferences().has(dateStr) 
                              ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' 
                              : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                          onClick={() => togglePreferredDate(dateStr)}
                          title={getCurrentUserPreferences().has(dateStr) ? 'Click to remove from preferred dates' : 'Click to add to preferred dates'}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{formatDateForDisplay(dateStr)}</div>
                              <div className="text-xs text-green-600">All {users.length} available</div>
                              {showMusicFestivals && isDateWithinFestival(dateStr) && (
                                <div className="mt-1 flex items-center">
                                  <Music className="h-3 w-3 mr-1 text-[#28666E]" />
                                  <span className="text-xs text-[#033F63] truncate">
                                    {getEventsForDate(dateStr).map(f => f.name).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {getCurrentUserPreferences().has(dateStr) && (
                              <span className="text-yellow-500 text-sm">⭐</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next 30 days */}
              <div id="section-30-days" className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /> Next 30 Days
                </h3>
                {getUnmarkedDaysWithinPeriod(30).length === 0 ? (
                  <p className="text-gray-500 text-sm">No dates in the next 30 days where everyone is available.</p>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700 mb-3">
                      <strong>{getUnmarkedDaysWithinPeriod(30).length}</strong> days where everyone is available
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {getUnmarkedDaysWithinPeriod(30).map((dateStr, index) => (
                        <div 
                          key={index} 
                          className={`px-3 py-2 bg-white rounded border cursor-pointer transition-all ${
                            getCurrentUserPreferences().has(dateStr) 
                              ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' 
                              : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                          onClick={() => togglePreferredDate(dateStr)}
                          title={getCurrentUserPreferences().has(dateStr) ? 'Click to remove from preferred dates' : 'Click to add to preferred dates'}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{formatDateForDisplay(dateStr)}</div>
                              <div className="text-xs text-blue-600">All {users.length} available</div>
                              {showMusicFestivals && isDateWithinFestival(dateStr) && (
                                <div className="mt-1 flex items-center">
                                  <Music className="h-3 w-3 mr-1 text-[#28666E]" />
                                  <span className="text-xs text-[#033F63] truncate">
                                    {getEventsForDate(dateStr).map(f => f.name).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {getCurrentUserPreferences().has(dateStr) && (
                              <span className="text-yellow-500 text-sm">⭐</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next 60 days */}
              <div id="section-60-days" className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-600" /> Next 60 Days
                </h3>
                {getUnmarkedDaysWithinPeriod(60).length === 0 ? (
                  <p className="text-gray-500 text-sm">No dates in the next 60 days where everyone is available.</p>
                ) : (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-700 mb-3">
                      <strong>{getUnmarkedDaysWithinPeriod(60).length}</strong> days where everyone is available
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {getUnmarkedDaysWithinPeriod(60).slice(0, 20).map((dateStr, index) => (
                        <div 
                          key={index} 
                          className={`px-3 py-2 bg-white rounded border cursor-pointer transition-all ${
                            getCurrentUserPreferences().has(dateStr) 
                              ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200' 
                              : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                          onClick={() => togglePreferredDate(dateStr)}
                          title={getCurrentUserPreferences().has(dateStr) ? 'Click to remove from preferred dates' : 'Click to add to preferred dates'}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{formatDateForDisplay(dateStr)}</div>
                              <div className="text-xs text-purple-600">All {users.length} available</div>
                              {showMusicFestivals && isDateWithinFestival(dateStr) && (
                                <div className="mt-1 flex items-center">
                                  <Music className="h-3 w-3 mr-1 text-[#28666E]" />
                                  <span className="text-xs text-[#033F63] truncate">
                                    {getEventsForDate(dateStr).map(f => f.name).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {getCurrentUserPreferences().has(dateStr) && (
                              <span className="text-yellow-500 text-sm">⭐</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {getUnmarkedDaysWithinPeriod(60).length > 20 && (
                      <div className="mt-3">
                        <details className="cursor-pointer">
                          <summary className="text-xs text-purple-600 hover:text-purple-800">
                            View all {getUnmarkedDaysWithinPeriod(60).length} available dates
                          </summary>
                          <div className="mt-2 max-h-40 overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 text-xs">
                              {getUnmarkedDaysWithinPeriod(60).slice(20).map((dateStr, index) => (
                                <div key={index} className="px-2 py-1 bg-white rounded border text-gray-600">
                                  {formatDateForDisplay(dateStr)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Festival Meetups */}
              {showMusicFestivals && getFestivalMeetups().length > 0 && (
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                    <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#28666E]" /> Festival Meetup Opportunities
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700 mb-3">
                      🎵 Music festivals where friends are actually attending together!
                    </div>
                    <div className="space-y-3">
                      {getFestivalMeetups().map((meetup, index) => (
                        <div key={index} className="p-3 border border-green-200 rounded-lg bg-white">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{formatDateForDisplay(meetup.date)}</div>
                              <div className="text-xs text-green-600 font-medium">
                                🎵 {meetup.attendees.length} {meetup.attendees.length === 1 ? 'person' : 'people'} attending {meetup.festival.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                📍 {meetup.festival.location}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {meetup.attendees.map(user => (
                                <div 
                                  key={user.id}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-green-500 text-white"
                                  title={`${user.name} is attending this festival`}
                                >
                                  🎵
                                </div>
                              ))}
                              {users.filter(u => !meetup.attendees.find(a => a.id === u.id)).map(user => (
                                <div 
                                  key={user.id}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-200 text-gray-500"
                                  title={`${user.name} is not attending`}
                                >
                                  {user.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* About View */}
      {view === 'about' && <AboutPage />}

      {/* Footer - only show on main views */}
      {(view === 'calendar' || view === 'results') && (
        <div className="mt-8 text-center py-4 border-t border-gray-200">
          <button
            onClick={() => setView('about')}
            className="text-sm text-gray-500 hover:text-[#28666E] underline"
          >
            What is this?
          </button>
        </div>
      )}
    </div>
  );
}