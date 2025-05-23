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
  const [view, setView] = useState('calendar'); // 'calendar' or 'results'
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMusicFestivals, setShowMusicFestivals] = useState(true);

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

  // Reset all data and start fresh
  const handleStartFresh = () => {
    setUsers([]);
    setActiveUser(null);
    setCurrentUserName('');
    setShowUserForm(true);
    setShowResetConfirm(false);
    localStorage.removeItem('seeYouThere_users');
    localStorage.removeItem('seeYouThere_currentUser');
  };
  
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

  // Get events for a specific date
  const getEventsForDate = (dateStr: string | number | Date) => {
    if (!dateStr) return [];
    
    return festivals.filter(festival => {
      const startDate = new Date(festival.startDate);
      const endDate = new Date(festival.endDate);
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
      
      const currentUser = users.find(u => u.id === activeUser);
      days.push({ 
        day: i, 
        date: dateStr,
        isAvailable: currentUser?.dates[dateStr] === true,
        festivals: festivalsOnDay,
        isToday: isToday(dateStr)
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
  };

  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Calculate best dates for the group
  const getBestDates = () => {
    // Create a map of all dates and count how many users are available
    const dateAvailability: { [date: string]: number } = {};
    
    users.forEach(user => {
      Object.entries(user.dates).forEach(([date, isAvailable]) => {
        if (isAvailable) {
          dateAvailability[date] = (dateAvailability[date] || 0) + 1;
        }
      });
    });
    
    // Convert to an array and sort by availability count (descending)
    const sortedDates = Object.entries(dateAvailability)
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number));
    
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

  // Get weekend days (Saturday/Sunday) where people are available
  const getAvailableWeekends = () => {
    const availableDates = getBestDates();
    const weekendDates = availableDates.filter(dateInfo => {
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

  return (
    <div className="flex flex-col min-h-screen pt-0 px-2 sm:px-4 pb-2 sm:pb-4 bg-gray-50">
      {showUserForm && <UserForm />}
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
        {currentUserName && (
          <div className="text-center mb-4">
            <p className="text-xs sm:text-sm text-[#033F63]">Welcome, {currentUserName}!</p>
          </div>
        )}
        
        {/* Mobile-first action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
          <div className="flex flex-1 gap-2">
            <button 
              className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md flex items-center justify-center ${view === 'calendar' ? 'bg-[#033F63] text-white' : 'bg-[#B5B682] text-[#033F63] hover:bg-[#7C9885]'}`}
              onClick={() => setView('calendar')}
            >
              <Calendar className="mr-1 h-4 w-4" /> Calendar
            </button>
            <button 
              className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-md flex items-center justify-center ${view === 'results' ? 'bg-[#033F63] text-white' : 'bg-[#B5B682] text-[#033F63] hover:bg-[#7C9885]'}`}
              onClick={() => setView('results')}
            >
              <CheckCircle className="mr-1 h-4 w-4" /> Results
            </button>
          </div>
          
          {users.length > 0 && (
            <button
              onClick={copyShareableURL}
              className="px-3 py-2 text-sm bg-[#28666E] text-white rounded-md hover:bg-[#7C9885] flex items-center justify-center"
            >
              <Users className="mr-1 h-4 w-4" /> Share
            </button>
          )}
        </div>
        
        {/* Users display - mobile friendly */}
        {users.length > 0 && (
          <div className="bg-white p-3 rounded-lg shadow-sm border mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium flex items-center text-gray-600">
                <Users className="mr-1 h-3 w-3" /> Users ({users.length})
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowUserForm(true)}
                  className="px-2 py-1 text-xs bg-[#B5B682] text-white rounded-md hover:bg-[#7C9885] flex items-center"
                >
                  <User className="mr-1 h-3 w-3" /> Switch
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-2 py-1 text-xs bg-[#28666E] text-white rounded-md hover:bg-[#033F63] flex items-center"
                >
                  <X className="mr-1 h-3 w-3" /> Reset
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {users.map(user => (
                <span
                  key={user.id}
                  className={`
                    px-2 py-1 text-xs rounded-md flex items-center
                    ${user.name === currentUserName ? 'bg-[#033F63] text-white' : 'bg-[#FEDC97] text-[#033F63]'}
                  `}
                >
                  {user.name}
                  {user.name === currentUserName && <span className="ml-1">•</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {view === 'calendar' ? (
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
                  title={day.festivals && day.festivals.length > 0 ? 
                    day.festivals.map(f => `${f.name}${f.location ? ` - ${f.location}` : ''}`).join('\n') : 
                    undefined
                  }
                  className={`
                    h-10 sm:h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer relative text-xs sm:text-sm
                                        ${!day.day ? 'text-[#B5B682]' : 'hover:bg-[#FEDC97]'}                    ${day.isAvailable ? 'bg-[#7C9885] text-[#033F63] font-medium' : ''}
                                          ${day.festivals && day.festivals.length > 0 ? 'border-2 border-dashed border-[#28666E]' : ''}                      ${day.isToday ? 'ring-2 ring-[#FEDC97] bg-[#FEDC97] font-bold text-[#033F63]' : ''}
                  `}
                >
                  {day.day}
                  {day.isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-[#28666E] rounded-full"></div>
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
          
          {/* Legend for festivals - mobile optimized */}
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
                                      <ChevronUp className="h-4 w-4 text-[#28666E]" />                  ) : (                    <ChevronDown className="h-4 w-4 text-[#28666E]" />
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
                      const festivalDate = new Date(festival.startDate);
                      setCurrentMonth(new Date(festivalDate.getFullYear(), festivalDate.getMonth(), 1));
                    }}
                  >
                    <div className="font-medium text-xs sm:text-sm">{festival.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(festival.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                      {new Date(festival.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
            <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#7C9885]" /> Best Date Options
          </h3>
          
          {getBestDates().length === 0 ? (
            <p className="text-gray-500 text-center my-8 text-sm sm:text-base">No dates have been selected yet. Go to Calendar View to select available dates.</p>
          ) : (
            <div className="space-y-4">
              {/* Festival meetups section */}
              {(() => {
                const festivalMeetups = getBestDates().filter(dateInfo => 
                  isDateWithinFestival(dateInfo.date) && dateInfo.count > 1
                );
                
                if (festivalMeetups.length > 0) {
                  return (
                    <div className="mb-6">
                                              <h4 className="font-medium text-[#28666E] mb-3 flex items-center text-sm sm:text-base">
                        <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Festival Meetups
                      </h4>
                      <div className="space-y-3">
                        {festivalMeetups.map((dateInfo, index) => (
                                                      <div key={index} className="p-3 border border-[#28666E] rounded-lg bg-[#FEDC97]">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                              <div className="flex-1">
                                <div className="font-medium text-sm sm:text-base">{formatDateForDisplay(dateInfo.date)}</div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                  {dateInfo.count} {dateInfo.count === 1 ? 'person' : 'people'} available
                                </div>
                                <div className="mt-1 flex items-center">
                                                                    <Music className="h-3 w-3 mr-1 text-[#28666E]" />                                  <span className="text-xs text-[#033F63] font-medium">
                                    {getEventsForDate(dateInfo.date).map(f => f.name).join(', ')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {users.map(user => {
                                  const isAvailable = user.dates[dateInfo.date];
                                  return (
                                    <div 
                                      key={user.id}
                                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs ${
                                        isAvailable ? 'bg-[#7C9885] text-white' : 'bg-[#28666E] text-white'
                                      }`}
                                      title={`${user.name} is ${isAvailable ? 'available' : 'not available'}`}
                                    >
                                      {user.name.charAt(0)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* All available dates section */}
              <div>
                <h4 className="font-medium text-[#033F63] mb-3 flex items-center text-sm sm:text-base">
                  <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> All Available Dates
                </h4>
                <div className="space-y-3">
                  {getBestDates().map((dateInfo, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">{formatDateForDisplay(dateInfo.date)}</div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {dateInfo.count} {dateInfo.count === 1 ? 'person' : 'people'} available
                          </div>
                          {isDateWithinFestival(dateInfo.date) && (
                            <div className="mt-1 flex items-center">
                                                            <Music className="h-3 w-3 mr-1 text-[#28666E]" />                              <span className="text-xs text-[#033F63]">
                                {getEventsForDate(dateInfo.date).map(f => f.name).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {users.map(user => {
                            const isAvailable = user.dates[dateInfo.date];
                            return (
                              <div 
                                key={user.id}
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs ${
                                  isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                                title={`${user.name} is ${isAvailable ? 'available' : 'not available'}`}
                              >
                                {user.name.charAt(0)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Unmarked days section */}
              {users.length > 0 && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  {/* Available weekends */}
                  {getAvailableWeekends().length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-3 flex items-center text-sm sm:text-base">
                        <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Weekend Availability
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-700 mb-3">
                          <strong>{getAvailableWeekends().length}</strong> weekend days (Saturday/Sunday) where people are available
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {getAvailableWeekends().map((dateInfo, index) => (
                            <div key={index} className="bg-white p-2 rounded border border-green-200">
                              <div className="font-medium text-sm">{formatDateForDisplay(dateInfo.date)}</div>
                              <div className="text-xs text-gray-600">
                                {dateInfo.count} {dateInfo.count === 1 ? 'person' : 'people'} available
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* General potential meetup days */}
                  <div>
                    <h4 className="font-medium text-gray-600 mb-3 flex items-center text-sm sm:text-base">
                      <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Potential Meetup Days
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>{getUnmarkedDays().length}</strong> days through end of {new Date().getFullYear()} have no availability marked yet.
                      </div>
                      <div className="text-xs text-gray-500">
                        These could be opportunities for meetups if people mark them as available.
                      </div>
                      {getUnmarkedDays().length > 0 && (
                        <div className="mt-3">
                          <details className="cursor-pointer">
                            <summary className="text-xs text-blue-600 hover:text-blue-800">
                              View unmarked dates ({getUnmarkedDays().length} total)
                            </summary>
                            <div className="mt-2 max-h-40 overflow-y-auto">
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 text-xs">
                                {getUnmarkedDays().slice(0, 50).map((dateStr, index) => (
                                  <div key={index} className="px-2 py-1 bg-white rounded border text-gray-600">
                                    {formatDateForDisplay(dateStr)}
                                  </div>
                                ))}
                                {getUnmarkedDays().length > 50 && (
                                  <div className="px-2 py-1 text-gray-400 italic">
                                    +{getUnmarkedDays().length - 50} more...
                                  </div>
                                )}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}