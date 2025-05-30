import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Users, User, CheckCircle, Music, X, DollarSign, Edit3, Palette, Download } from 'lucide-react';

export default function GroupDateFinder() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  type User = {
    id: number;
    name: string;
    dates: { [date: string]: boolean };
  };

  // Group configuration type
  type GroupConfig = {
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
  };

  // Custom calendar types
  type CustomEvent = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    dayOfWeekStart?: string;
    location?: string;
    description?: string;
    color: string;
    website?: string;
    time?: string;
    startTime?: string;
    endTime?: string;
  };

  type CustomCalendar = {
    name: string;
    description: string;
    enabled: boolean;
    color: string;
    icon?: string;
    events: CustomEvent[];
  };

  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [view, setView] = useState<'calendar' | 'results' | 'split' | 'about'>('calendar');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{ [userId: number]: Set<string> }>({});
  const [festivalAttendance, setFestivalAttendance] = useState<{ 
    [userId: number]: { 
      [date: string]: string | { [eventId: number]: string } 
    } 
  }>({});
  const [showFestivalPrompt, setShowFestivalPrompt] = useState(false);
  const [pendingFestivalDate, setPendingFestivalDate] = useState<string | null>(null);

  // Custom calendar state
  const [customCalendars, setCustomCalendars] = useState<CustomCalendar[]>([]);
  const [enabledCalendars, setEnabledCalendars] = useState<Set<string>>(new Set());
  const [loadingCalendars, setLoadingCalendars] = useState(true);
  
  // New state for sharing status and friend tracking
  const [isSharedSession, setIsSharedSession] = useState(false);
  const [friendsWithData, setFriendsWithData] = useState<string[]>([]);
  const [showSharingStatus, setShowSharingStatus] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [sharingModalType, setSharingModalType] = useState<'new' | 'shared-with-data' | 'shared-no-data' | 'personal'>('new');
  const [hasSeenSharingModal, setHasSeenSharingModal] = useState(false);

  // New state for group labeling and customization
  const [groupConfig, setGroupConfig] = useState<GroupConfig>({
    name: 'My Friends',
    color: '#28666E',
    bgColor: 'bg-[#28666E]',
    borderColor: 'border-[#28666E]',
    textColor: 'text-[#28666E]'
  });
  const [showGroupConfigModal, setShowGroupConfigModal] = useState(false);
  const [tempGroupConfig, setTempGroupConfig] = useState<GroupConfig>(groupConfig);

  // Predefined color themes for groups
  const colorThemes = [
    { name: 'Ocean Blue', color: '#28666E', bgColor: 'bg-[#28666E]', borderColor: 'border-[#28666E]', textColor: 'text-[#28666E]' },
    { name: 'Forest Green', color: '#22C55E', bgColor: 'bg-green-500', borderColor: 'border-green-500', textColor: 'text-green-500' },
    { name: 'Sunset Orange', color: '#F97316', bgColor: 'bg-orange-500', borderColor: 'border-orange-500', textColor: 'text-orange-500' },
    { name: 'Royal Purple', color: '#8B5CF6', bgColor: 'bg-violet-500', borderColor: 'border-violet-500', textColor: 'text-violet-500' },
    { name: 'Rose Pink', color: '#EC4899', bgColor: 'bg-pink-500', borderColor: 'border-pink-500', textColor: 'text-pink-500' },
    { name: 'Sky Blue', color: '#0EA5E9', bgColor: 'bg-sky-500', borderColor: 'border-sky-500', textColor: 'text-sky-500' },
    { name: 'Emerald', color: '#10B981', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-500', textColor: 'text-emerald-500' },
    { name: 'Amber', color: '#F59E0B', bgColor: 'bg-amber-500', borderColor: 'border-amber-500', textColor: 'text-amber-500' },
    { name: 'Indigo', color: '#6366F1', bgColor: 'bg-indigo-500', borderColor: 'border-indigo-500', textColor: 'text-indigo-500' },
    { name: 'Teal', color: '#14B8A6', bgColor: 'bg-teal-500', borderColor: 'border-teal-500', textColor: 'text-teal-500' }
  ];

  // Load data from localStorage and URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(sharedData));
        const loadedUsers = parsedData.users || [];
        setUsers(loadedUsers);
        setIsSharedSession(true);
        
        // Load group configuration from shared data if available
        if (parsedData.groupConfig) {
          setGroupConfig(parsedData.groupConfig);
          setTempGroupConfig(parsedData.groupConfig);
        }
        
        // Identify friends who have data (users with unavailable dates or preferences)
        const friendsWithAvailabilityData = loadedUsers
          .filter((user: User) => Object.keys(user.dates).length > 0)
          .map((user: User) => user.name);
        setFriendsWithData(friendsWithAvailabilityData);
        
        // Determine modal type and show it
        if (friendsWithAvailabilityData.length > 0) {
          setSharingModalType('shared-with-data');
        } else {
          setSharingModalType('shared-no-data');
        }
        
        // Show modal after a brief delay to let the calendar render first
        setTimeout(() => {
          if (!hasSeenSharingModal) {
            setShowSharingModal(true);
          }
        }, 1000);
        
        // Don't set activeUser from shared data - let user select themselves
      } catch (error) {
        console.error('Error parsing shared data:', error);
      }
    } else {
      // Load from localStorage if no shared data
      const savedUsers = localStorage.getItem('seeYouThere_users');
      if (savedUsers) {
        try {
          const loadedUsers = JSON.parse(savedUsers);
          setUsers(loadedUsers);
          setIsSharedSession(false);
          
          // For local sessions, still track friends with data
          const friendsWithAvailabilityData = loadedUsers
            .filter((user: User) => Object.keys(user.dates).length > 0)
            .map((user: User) => user.name);
          setFriendsWithData(friendsWithAvailabilityData);
          
          // Show personal calendar modal if they have data
          if (loadedUsers.length > 0) {
            setSharingModalType('personal');
            setTimeout(() => {
              if (!hasSeenSharingModal) {
                setShowSharingModal(true);
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Error loading saved users:', error);
        }
      } else {
        setIsSharedSession(false);
        // Show new calendar modal for first-time users
        setSharingModalType('new');
        setTimeout(() => {
          if (!hasSeenSharingModal) {
            setShowSharingModal(true);
          }
        }, 1500);
      }
    }

    // Check if user has a saved profile
    const savedUserName = localStorage.getItem('seeYouThere_currentUser');
    if (savedUserName) {
      setCurrentUserName(savedUserName);
      setShowUserForm(false);
    }
  }, []);

  // Load group configuration from localStorage
  useEffect(() => {
    const savedGroupConfig = localStorage.getItem('seeYouThere_groupConfig');
    if (savedGroupConfig) {
      try {
        const config = JSON.parse(savedGroupConfig);
        setGroupConfig(config);
        setTempGroupConfig(config);
      } catch (error) {
        console.error('Error loading group configuration:', error);
      }
    }
  }, []);

  // Save group configuration to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('seeYouThere_groupConfig', JSON.stringify(groupConfig));
  }, [groupConfig]);

  // Update friends with data when users change
  useEffect(() => {
    const friendsWithAvailabilityData = users
      .filter(user => Object.keys(user.dates).length > 0)
      .map(user => user.name);
    setFriendsWithData(friendsWithAvailabilityData);
  }, [users]);

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

  // Load "don't show again" preference for sharing modal
  useEffect(() => {
    const dontShowAgain = localStorage.getItem('seeYouThere_dontShowSharingModal');
    if (dontShowAgain === 'true') {
      setHasSeenSharingModal(true);
    }
  }, []);

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
    const data = { 
      users,
      groupConfig 
    };
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?data=${encodedData}`;
  };

  // Copy URL to clipboard
  const copyShareableURL = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableURL());
      
      // Show success message with sharing tips
      const message = friendsWithData.length > 0 
        ? `✅ ${groupConfig.name} calendar copied! This includes data from: ${friendsWithData.join(', ')}`
        : `✅ ${groupConfig.name} calendar copied! Share this with friends so they can add their availability.`;
      
      alert(message);
      
      // Briefly show sharing status
      setShowSharingStatus(true);
      setTimeout(() => setShowSharingStatus(false), 3000);
      
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback: show URL in prompt
      const url = generateShareableURL();
      const message = friendsWithData.length > 0 
        ? `Copy this URL to share ${groupConfig.name} calendar (includes data from ${friendsWithData.join(', ')}): `
        : `Copy this URL to share ${groupConfig.name} calendar with friends: `;
      prompt(message, url);
    }
  };

  // Generate Google Calendar invite link
  const generateGoogleCalendarLink = (dateStr: string, isMultiDay: boolean = false, endDateStr?: string, timeOfDay?: 'morning' | 'afternoon' | 'evening', specificTime?: string) => {
    let startHour = 12; // Default to noon
    let startMinute = 0;
    
    // Set time based on time of day selection
    if (timeOfDay && specificTime) {
      const [hours, minutes] = specificTime.split(':').map(Number);
      startHour = hours;
      startMinute = minutes;
    } else if (timeOfDay) {
      // Default times for each period
      switch (timeOfDay) {
        case 'morning':
          startHour = 10;
          break;
        case 'afternoon':
          startHour = 14; // 2 PM
          break;
        case 'evening':
          startHour = 18; // 6 PM
          break;
      }
    }
    
    const startDate = new Date(dateStr + 'T12:00:00');
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = endDateStr ? new Date(endDateStr + 'T12:00:00') : new Date(startDate);
    
    // If single day event, make it 2 hours long
    if (!isMultiDay) {
      endDate.setTime(startDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
    } else {
      // For multi-day events, set end time to end of day
      endDate.setHours(23, 59, 59);
    }
    
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startTime = formatDateForGoogle(startDate);
    const endTime = formatDateForGoogle(endDate);
    
    const title = encodeURIComponent(`${groupConfig.name} Meetup`);
    const timeInfo = timeOfDay ? ` (${timeOfDay}${specificTime ? ` at ${specificTime}` : ''})` : '';
    const details = encodeURIComponent(
      `Group meetup planned via See Ya There!${timeInfo}\n\n` +
      `Attendees: ${users.map(u => u.name).join(', ')}\n\n` +
      `This date works for everyone in the group. Looking forward to seeing you there!`
    );
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
    
    return googleCalendarUrl;
  };

  // Download calendar invite for best dates
  const downloadCalendarInvites = () => {
    const bestDates = getUnmarkedDaysWithinPeriod(30).slice(0, 5); // Get top 5 best dates in next 30 days
    
    if (bestDates.length === 0) {
      alert(`No available dates found in the next 30 days where everyone in ${groupConfig.name} is free.`);
      return;
    }
    
    // Create a summary of all the best dates
    const datesList = bestDates.map(date => formatDateForDisplay(date)).join(', ');
    const message = `Found ${bestDates.length} great dates for ${groupConfig.name}:\n\n${datesList}\n\nClick OK to open Google Calendar for the first available date, or check the Results page for all options.`;
    
    if (confirm(message)) {
      // Open Google Calendar for the first best date
      const calendarLink = generateGoogleCalendarLink(bestDates[0]);
      window.open(calendarLink, '_blank');
    }
  };

  // Toggle preferred date for current user
  const togglePreferredDate = (dateStr: string) => {
    if (activeUser === null) return;
    
    // Check if user is unavailable on this date
    const currentUser = users.find(u => u.id === activeUser);
    const isUnavailable = currentUser?.dates[dateStr] === true;
    
    // Don't allow adding unavailable dates as preferred
    if (isUnavailable) return;
    
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

  // Check if current user has made any preferred choices
  const hasCurrentUserMadePreferences = (): boolean => {
    return getCurrentUserPreferences().size > 0;
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

  // Handle multi-event decision for specific events
  const handleMultiEventDecision = (eventId: number, decision: 'attending' | 'not-attending') => {
    if (!pendingFestivalDate || activeUser === null) return;
    
    // Mark the date as unavailable if not already done
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
    
    // Record specific event attendance
    setFestivalAttendance(prev => {
      const userAttendance = prev[activeUser] || {};
      const dateAttendance = userAttendance[pendingFestivalDate];
      
      // If this is the first event decision for this date, initialize with event-specific tracking
      let newDateAttendance;
      if (typeof dateAttendance === 'string') {
        // Convert from simple string to event-specific object
        newDateAttendance = { [eventId]: decision };
      } else if (typeof dateAttendance === 'object' && dateAttendance !== null) {
        // Update existing event-specific tracking
        newDateAttendance = { ...dateAttendance as Record<number, string>, [eventId]: decision };
      } else {
        // Initialize new event-specific tracking
        newDateAttendance = { [eventId]: decision };
      }
      
      return {
        ...prev,
        [activeUser]: {
          ...userAttendance,
          [pendingFestivalDate]: newDateAttendance
        }
      };
    });
    
    // Note: Removed automatic modal closing - user now uses "Done" button to finish
  };

  // Get festival attendees for a specific date
  const getFestivalAttendees = (dateStr: string) => {
    return users.filter(user => {
      const attendance = festivalAttendance[user.id]?.[dateStr];
      if (typeof attendance === 'string') {
        return attendance === 'attending';
      } else if (typeof attendance === 'object' && attendance !== null) {
        // Check if user is attending any event on this date
        return Object.values(attendance).some(status => status === 'attending');
      }
      return false;
    });
  };

  // Get attendees for a specific event
  const getEventAttendees = (dateStr: string, eventId: number) => {
    return users.filter(user => {
      const attendance = festivalAttendance[user.id]?.[dateStr];
      if (typeof attendance === 'object' && attendance !== null) {
        return attendance[eventId] === 'attending';
      }
      return false;
    });
  };

  // Check if current user is attending a specific event
  const isUserAttendingEvent = (dateStr: string, eventId: number) => {
    if (!activeUser) return false;
    const attendance = festivalAttendance[activeUser]?.[dateStr];
    if (typeof attendance === 'object' && attendance !== null) {
      return attendance[eventId] === 'attending';
    }
    return false;
  };

  // Get festivals the current user is attending
  const getCurrentUserFestivals = () => {
    if (!activeUser || enabledCalendars.size === 0) return [];
    
    const userAttendance = festivalAttendance[activeUser] || {};
    const attendingFestivals: Array<{
      festival: CustomEvent;
      attendingDates: string[];
      otherAttendees: string[];
    }> = [];
    
    // Go through each festival and check if user is attending any dates
    getAllEnabledEvents().forEach(festival => {
      const startDate = new Date(festival.startDate + 'T12:00:00');
      const endDate = new Date(festival.endDate + 'T12:00:00');
      const currentDate = new Date(startDate);
      
      let isAttending = false;
      const attendingDates: string[] = [];
      const otherAttendees = new Set<string>();
      
      // Check each day of the festival
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        
        if (userAttendance[dateStr] === 'attending') {
          isAttending = true;
          attendingDates.push(dateStr);
          
          // Find other users attending on this date
          users.forEach(user => {
            if (user.id !== activeUser && festivalAttendance[user.id]?.[dateStr] === 'attending') {
              otherAttendees.add(user.name);
            }
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (isAttending) {
        attendingFestivals.push({
          festival,
          attendingDates,
          otherAttendees: Array.from(otherAttendees)
        });
      }
    });
    
    return attendingFestivals;
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
      startDate: "2025-06-18",
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
      startDate: "2025-07-24",
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
    
    // Convert the input to a standardized date string (YYYY-MM-DD)
    const targetDateStr = typeof dateStr === 'string' ? dateStr : formatDate(new Date(dateStr));
    
    const events = getAllEnabledEvents();
    return events.filter(event => {
      // For single-day events, check if the target date matches the event date
      if (event.startDate === event.endDate) {
        return targetDateStr === event.startDate;
      }
      
      // For multi-day events, check if the target date is within the range
      return targetDateStr >= event.startDate && targetDateStr <= event.endDate;
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
      const eventsOnDay = enabledCalendars.size > 0 ? getEventsForDate(dateStr) : [];
      
      const currentUser = users.find(u => u.id === activeUser);
      days.push({ 
        day: i, 
        date: dateStr,
        isUnavailable: currentUser?.dates[dateStr] === true,
        festivals: enabledCalendars.size > 0 ? eventsOnDay : [],
        holidays: getHolidaysForDate(dateStr),
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
    
    // If marking a date as unavailable and it's an event date, prompt for clarification
    if (!isCurrentlyMarked && enabledCalendars.size > 0 && isDateWithinFestival(dateStr as string)) {
      setPendingFestivalDate(dateStr as string);
      setShowFestivalPrompt(true);
      return;
    }
    
    // Regular toggle for non-event dates or when unmarking
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
      setFestivalAttendance(prev => {
        const newAttendance = { ...prev };
        if (newAttendance[activeUser]) {
          const userAttendance = { ...newAttendance[activeUser] };
          delete userAttendance[dateStr as string];
          newAttendance[activeUser] = userAttendance;
        }
        return newAttendance;
      });
    }
    
    // Remove from preferred dates if marking as unavailable
    if (!isCurrentlyMarked && activeUser) {
      setUserPreferences(prev => {
        const newPreferences = { ...prev };
        if (newPreferences[activeUser]?.has(dateStr as string)) {
          const userDates = new Set(newPreferences[activeUser]);
          userDates.delete(dateStr as string);
          newPreferences[activeUser] = userDates;
        }
        return newPreferences;
      });
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

  // Get all available days through end of year (where everyone is available)
  const getUnmarkedDays = () => {
    if (users.length === 0) return [];
    
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
    const availableDays = [];
    
    // Iterate through each day from today to end of year
    const currentDate = new Date(today);
    while (currentDate <= endOfYear) {
      const dateStr = formatDate(currentDate);
      
      // Check if ANY user is unavailable on this date
      const isAnyoneUnavailable = users.some(user => user.dates[dateStr] === true);
      
      // Only include if no one is unavailable
      if (!isAnyoneUnavailable) {
        availableDays.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availableDays;
  };

  // Get available days within a specific number of days from today (where everyone is available)
  const getUnmarkedDaysWithinPeriod = (days: number) => {
    if (users.length === 0) return [];
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    
    const availableDays = [];
    
    // Iterate through each day from today to end date
    const currentDate = new Date(today);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      
      // Check if ANY user is unavailable on this date
      const isAnyoneUnavailable = users.some(user => user.dates[dateStr] === true);
      
      // Only include if no one is unavailable (everyone is available)
      if (!isAnyoneUnavailable) {
        availableDays.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return availableDays;
  };

  // Get unavailable days within a specific number of days from today
  const getUnavailableDaysWithinPeriod = (days: number) => {
    if (users.length === 0) return [];
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);
    
    const unavailableDays = [];
    
    // Iterate through each day from today to end date
    const currentDate = new Date(today);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      
      // Check if ANY user is unavailable on this date
      const isAnyoneUnavailable = users.some(user => user.dates[dateStr] === true);
      
      // Include if someone is unavailable
      if (isAnyoneUnavailable) {
        unavailableDays.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return unavailableDays;
  };

  // Get all unavailable days from all users (for total count)
  const getAllUnavailableDays = () => {
    if (users.length === 0) return [];
    
    const unavailableDates = new Set();
    
    // Collect all unavailable dates from all users
    users.forEach(user => {
      Object.entries(user.dates).forEach(([date, isUnavailable]) => {
        if (isUnavailable === true) {
          unavailableDates.add(date);
        }
      });
    });
    
    return Array.from(unavailableDates);
  };

  // Get festival meetups where people are actually attending
  const getFestivalMeetups = () => {
    if (users.length === 0 || enabledCalendars.size === 0) return [];
    
    const festivalMeetups: Array<{
      date: string;
      attendees: User[];
      festival: CustomEvent;
    }> = [];
    
    getAllEnabledEvents().forEach(event => {
      const startDate = new Date(event.startDate + 'T12:00:00');
      const endDate = new Date(event.endDate + 'T12:00:00');
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        
        // Get users who are actually attending this event
        const attendees = getFestivalAttendees(dateStr);
        
        // Only include if at least 2 people are attending
        if (attendees.length >= 2) {
          festivalMeetups.push({
            date: dateStr,
            attendees,
            festival: event
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
    let date;
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // For YYYY-MM-DD strings, add time to avoid timezone issues
      date = new Date(dateStr + 'T12:00:00');
    } else {
      date = new Date(dateStr);
    }
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
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowUserModal(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-center">Group Management</h2>
          
          {/* Group Configuration Section */}
          <div className="mb-6 p-4 rounded-lg border-2" style={{ borderColor: groupConfig.color + '40', backgroundColor: groupConfig.color + '10' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-700">Group Settings</h3>
              <Palette className="h-5 w-5" style={{ color: groupConfig.color }} />
            </div>
            
            {/* Group Name Display and Customize Button */}
            <button
              onClick={() => setShowGroupConfigModal(true)}
              className="w-full p-3 rounded-lg border border-gray-200 hover:bg-white/50 transition-colors text-left mb-4"
            >
              <div 
                className="px-4 py-2 rounded-lg text-white font-medium text-center mb-2"
                style={{ backgroundColor: groupConfig.color }}
              >
                {groupConfig.name}
              </div>
              <p className="text-xs text-gray-600 text-center">
                Click to customize your group name and colors
              </p>
            </button>
            
            {/* Group Members */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Group Members ({users.length}):</h4>
              {users.length > 0 ? (
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
                        ${user.name === currentUserName ? 'text-white' : 'text-white'}
                      `}
                      style={{ 
                        backgroundColor: user.name === currentUserName ? groupConfig.color : '#B5B682'
                      }}
                    >
                      {user.name}
                      {user.name === currentUserName && <span className="ml-1">•</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center text-sm">No group members yet. Create the first user to get started!</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setShowUserForm(true);
                setShowUserModal(false);
              }}
              className="w-full px-4 py-3 text-white rounded-lg hover:opacity-80 flex items-center justify-center font-medium"
              style={{ backgroundColor: '#7C9885' }}
            >
              <User className="mr-2 h-4 w-4" /> Add Group Member
            </button>
            
            <button
              onClick={() => {
                setShowResetConfirm(true);
                setShowUserModal(false);
              }}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center font-medium"
            >
              <X className="mr-2 h-4 w-4" /> Reset All Data
            </button>
            
            <button
              onClick={() => setShowUserModal(false)}
              className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center font-medium"
            >
              OK
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
    
    // If only one event, use the existing simple flow
    if (festivalEvents.length === 1) {
      const festivalName = festivalEvents[0]?.name || 'Music Festival';
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">Event Date Detected! 🎵</h3>
            <p className="text-gray-600 mb-4 text-center">
              You're marking <strong>{formatDateForDisplay(pendingFestivalDate)}</strong> as unavailable, and we noticed there's an event happening:
            </p>
            <div className="bg-yellow-50 p-3 rounded-lg mb-6 text-center">
              <div className="font-medium text-yellow-800">{festivalName}</div>
              {festivalEvents[0]?.location && (
                <div className="text-sm text-yellow-600">{festivalEvents[0].location}</div>
              )}
            </div>
            <p className="text-gray-600 mb-6 text-center text-sm">
              Are you attending this event, or are you busy with something else?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleFestivalDecision('attending')}
                className="w-full px-4 py-3 bg-[#28666E] text-white rounded-lg hover:bg-[#7C9885] flex items-center justify-center font-medium"
              >
                🎵 I'm attending this event!
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
    }
    
    // Multiple events - show selection interface
    // Get current user's decisions for this date
    const currentAttendance = activeUser ? festivalAttendance[activeUser]?.[pendingFestivalDate] : null;
    const userDecisions = typeof currentAttendance === 'object' && currentAttendance !== null ? currentAttendance : {};
    const hasAnyDecisions = Object.keys(userDecisions).length > 0;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 text-center">Multiple Events Detected! 🎵</h3>
          <p className="text-gray-600 mb-4 text-center">
            You're marking <strong>{formatDateForDisplay(pendingFestivalDate)}</strong> as unavailable, and we noticed there are <strong>{festivalEvents.length} events</strong> happening:
          </p>
          
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
            {festivalEvents.map((event, index) => {
              const userDecision = userDecisions[event.id];
              const hasDecision = userDecision !== undefined;
              const isAttending = userDecision === 'attending';
              const isNotAttending = userDecision === 'not-attending';
              
              return (
                <div key={event.id} className={`p-3 rounded-lg border ${
                  hasDecision 
                    ? isAttending 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        {event.name}
                        {hasDecision && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isAttending 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isAttending ? '✓ Attending' : '✗ Not Going'}
                          </span>
                        )}
                      </div>
                      {event.location && (
                        <div className="text-sm text-gray-600">{event.location}</div>
                      )}
                      {event.time && (
                        <div className="text-sm text-gray-600">{event.time}</div>
                      )}
                      {event.description && (
                        <div className="text-xs text-gray-600 mt-1">{event.description}</div>
                      )}
                    </div>
                    <div className="ml-3 flex flex-col gap-2">
                      <button
                        onClick={() => handleMultiEventDecision(event.id, 'attending')}
                        className={`px-3 py-1 text-sm rounded whitespace-nowrap transition-colors ${
                          isAttending
                            ? 'bg-green-600 text-white'
                            : 'bg-[#28666E] text-white hover:bg-[#7C9885]'
                        }`}
                      >
                        🎵 Attending
                      </button>
                      <button
                        onClick={() => handleMultiEventDecision(event.id, 'not-attending')}
                        className={`px-3 py-1 text-sm rounded whitespace-nowrap transition-colors ${
                          isNotAttending
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-400 text-white hover:bg-gray-500'
                        }`}
                      >
                        ❌ Not Going
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="border-t pt-4">
            <p className="text-gray-600 mb-4 text-center text-sm">
              Select which events you're attending, or mark yourself as busy with something else entirely.
            </p>
            <div className="flex flex-col gap-3">
              {hasAnyDecisions && (
                <button
                  onClick={() => {
                    setShowFestivalPrompt(false);
                    setPendingFestivalDate(null);
                  }}
                  className="w-full px-4 py-3 bg-[#28666E] text-white rounded-lg hover:bg-[#7C9885] flex items-center justify-center font-medium"
                >
                  ✓ Done with my selections
                </button>
              )}
              <button
                onClick={() => handleFestivalDecision('busy')}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center font-medium"
              >
                📅 I'm busy with something else (not attending any events)
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

  // Group Configuration Modal
  const GroupConfigModal = () => {
    const [localGroupName, setLocalGroupName] = useState(tempGroupConfig.name);
    const [localColorConfig, setLocalColorConfig] = useState({
      color: tempGroupConfig.color,
      bgColor: tempGroupConfig.bgColor,
      borderColor: tempGroupConfig.borderColor,
      textColor: tempGroupConfig.textColor
    });

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowGroupConfigModal(false);
        setTempGroupConfig(groupConfig); // Reset temp config
      }
    };

    const handleSave = () => {
      const newConfig = {
        name: localGroupName,
        ...localColorConfig
      };
      setGroupConfig(newConfig);
      setTempGroupConfig(newConfig);
      setShowGroupConfigModal(false);
    };

    const handleCancel = () => {
      setTempGroupConfig(groupConfig); // Reset to current config
      setShowGroupConfigModal(false);
    };

    const selectColorTheme = (theme: typeof colorThemes[0]) => {
      setLocalColorConfig({
        color: theme.color,
        bgColor: theme.bgColor,
        borderColor: theme.borderColor,
        textColor: theme.textColor
      });
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <Palette className="h-6 w-6" />
            Customize Your Group
          </h2>
          
          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={localGroupName}
              onChange={(e) => setLocalGroupName(e.target.value)}
              placeholder="Enter group name (e.g., VictorOps Friends, Bluegrass Fam)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear in calendar invites and sharing messages
            </p>
          </div>

          {/* Color Theme Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Color Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {colorThemes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => selectColorTheme(theme)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    localColorConfig.color === theme.color 
                      ? 'border-gray-800 ring-2 ring-gray-300' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: theme.color + '20' }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    ></div>
                    <div className="text-left">
                      <div className="font-medium text-sm text-gray-800">{theme.name}</div>
                      <div className="text-xs text-gray-600">{theme.color}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="space-y-2">
              <div 
                className="px-4 py-2 rounded-lg text-white font-medium text-center"
                style={{ backgroundColor: localColorConfig.color }}
              >
                {localGroupName || 'Group Name'} Calendar
              </div>
              <div className="text-xs text-gray-600 text-center">
                This is how your group will appear in the app
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 font-medium"
              style={{ backgroundColor: localColorConfig.color }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Time Selection Modal
  const TimeSelectionModal = () => {
    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowTimeModal(false);
        setSelectedTimeOfDay(null);
        setSelectedSpecificTime('');
      }
    };

    const handleTimeOfDaySelect = (timeOfDay: 'morning' | 'afternoon' | 'evening') => {
      setSelectedTimeOfDay(timeOfDay);
      // Set default times
      switch (timeOfDay) {
        case 'morning':
          setSelectedSpecificTime('10:00');
          break;
        case 'afternoon':
          setSelectedSpecificTime('14:00');
          break;
        case 'evening':
          setSelectedSpecificTime('18:00');
          break;
      }
    };

    const handleCreateInvite = () => {
      if (selectedDateForTime && selectedTimeOfDay) {
        const calendarLink = generateGoogleCalendarLink(
          selectedDateForTime, 
          false, 
          undefined, 
          selectedTimeOfDay, 
          selectedSpecificTime
        );
        window.open(calendarLink, '_blank');
        setShowTimeModal(false);
        setSelectedTimeOfDay(null);
        setSelectedSpecificTime('');
        setSelectedDateForTime(null);
      }
    };

    const formatTimeDisplay = (time: string) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative">
          <button
            onClick={() => {
              setShowTimeModal(false);
              setSelectedTimeOfDay(null);
              setSelectedSpecificTime('');
            }}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold mb-6 text-center">
            Choose Meeting Time
          </h2>
          
          {selectedDateForTime && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg text-center">
              <div className="font-medium text-gray-800">
                {formatDateForDisplay(selectedDateForTime)}
              </div>
              <div className="text-sm text-gray-600">
                {groupConfig.name} Meetup
              </div>
            </div>
          )}

          {/* Time of Day Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose time of day:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleTimeOfDaySelect('morning')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTimeOfDay === 'morning'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">🌅</div>
                <div className="font-medium text-sm">Morning</div>
                <div className="text-xs text-gray-500">8 AM-12 PM</div>
              </button>
              
              <button
                onClick={() => handleTimeOfDaySelect('afternoon')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTimeOfDay === 'afternoon'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">☀️</div>
                <div className="font-medium text-sm">Afternoon</div>
                <div className="text-xs text-gray-500">12 PM - 6 PM</div>
              </button>
              
              <button
                onClick={() => handleTimeOfDaySelect('evening')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTimeOfDay === 'evening'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">🌙</div>
                <div className="font-medium text-sm">Evening</div>
                <div className="text-xs text-gray-500">6 PM - 11 PM</div>
              </button>
            </div>
          </div>

          {/* Specific Time Selection */}
          {selectedTimeOfDay && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose specific time:
              </label>
              <input
                type="time"
                value={selectedSpecificTime}
                onChange={(e) => setSelectedSpecificTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedSpecificTime && (
                <div className="mt-2 text-sm text-gray-600 text-center">
                  Meeting time: {formatTimeDisplay(selectedSpecificTime)}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowTimeModal(false);
                setSelectedTimeOfDay(null);
                setSelectedSpecificTime('');
              }}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateInvite}
              disabled={!selectedTimeOfDay}
              className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: selectedTimeOfDay ? groupConfig.color : undefined 
              }}
            >
              <Download className="mr-2 h-4 w-4 inline" />
              Create Invite
            </button>
          </div>
        </div>
      </div>
    );
  };

  // About page component
  const AboutPage = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-center mb-8">
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

  // Sharing Status Modal Component
  const SharingStatusModal = () => {
    if (!showSharingModal) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShowSharingModal(false);
      }
    };

    const handleDontShowAgain = () => {
      localStorage.setItem('seeYouThere_dontShowSharingModal', 'true');
      setHasSeenSharingModal(true);
      setShowSharingModal(false);
    };

    const handleGotIt = () => {
      setShowSharingModal(false);
    };

    const getModalContent = () => {
      switch (sharingModalType) {
        case 'new':
          return {
            icon: <Calendar className="h-8 w-8 text-blue-600" />,
            title: "Welcome to See Ya There! 🎉",
            message: "You're starting a fresh calendar. Mark dates when you are NOT available, then share it with friends to start group planning!",
            tip: "💡 Tip: Click on dates to mark them as unavailable, then use the Share button to invite friends",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-900",
            tipColor: "text-blue-600",
            showDontShowAgain: true
          };
        case 'shared-with-data':
          return {
            icon: <Users className="h-8 w-8 text-green-600" />,
            title: "Shared Calendar with Friends! 👥",
            message: `This calendar includes availability data from ${friendsWithData.length} ${friendsWithData.length === 1 ? 'friend' : 'friends'}:`,
            friendsList: friendsWithData,
            tip: "✅ Add your own availability to help the group find the best meetup dates!",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-900",
            tipColor: "text-green-600",
            showDontShowAgain: true
          };
        case 'shared-no-data':
          return {
            icon: <Users className="h-8 w-8 text-yellow-600" />,
            title: "Shared Calendar - No Data Yet 📅",
            message: `You opened a shared calendar link, but none of the ${users.length} ${users.length === 1 ? 'person' : 'people'} have added their availability yet.`,
            tip: "🚀 Be the first to add your unavailable dates and start the planning process!",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            textColor: "text-yellow-900",
            tipColor: "text-yellow-600",
            showDontShowAgain: true
          };
        case 'personal':
          return {
            icon: <Calendar className="h-8 w-8 text-purple-600" />,
            title: "Your Personal Calendar 📋",
            message: `You have ${users.length} ${users.length === 1 ? 'user' : 'users'} in your local calendar. Share it with friends to start group planning!`,
            tip: "📤 Use the Share button to send your calendar to friends",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            textColor: "text-purple-900",
            tipColor: "text-purple-600",
            showDontShowAgain: true
          };
        default:
          return null;
      }
    };

    const content = getModalContent();
    if (!content) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className={`${content.bgColor} p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border-2 ${content.borderColor} relative`}>
          <button
            onClick={() => setShowSharingModal(false)}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {content.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${content.textColor} mb-3 text-lg`}>{content.title}</h3>
              <p className={`${content.textColor} mb-3 text-sm leading-relaxed`}>
                {content.message}
              </p>
              
              {/* Friends list for shared-with-data */}
              {content.friendsList && content.friendsList.length > 0 && (
                <div className="mb-3">
                  <div className="mb-2">
                    <span className={`text-sm font-semibold ${content.textColor}`}>
                      {content.friendsList.length} {content.friendsList.length === 1 ? 'Friend' : 'Friends'} with Data:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {content.friendsList.map((friendName, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 text-sm ${content.textColor} bg-white rounded-full border ${content.borderColor} font-medium shadow-sm`}
                      >
                        👤 {friendName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`${content.tipColor} text-sm font-medium`}>
                {content.tip}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleGotIt}
              className="px-6 py-2 bg-[#28666E] text-white rounded-lg hover:bg-[#033F63] font-medium"
            >
              Got it!
            </button>
            
            {content.showDontShowAgain && (
              <button
                onClick={handleDontShowAgain}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Don't show this again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // New state for time selection
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDateForTime, setSelectedDateForTime] = useState<string | null>(null);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [selectedSpecificTime, setSelectedSpecificTime] = useState<string>('');

  // New state for inline time selection in favorite dates
  const [showInlineTimeSelection, setShowInlineTimeSelection] = useState(false);
  const [inlineSelectedTimeOfDay, setInlineSelectedTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | null>(null);
  const [inlineSelectedSpecificTime, setInlineSelectedSpecificTime] = useState<string>('');

  // Load custom calendars from JSON files
  const loadCustomCalendars = async () => {
    try {
      setLoadingCalendars(true);
      
      // Load the manifest file to get list of available calendars
      let calendarFiles: string[] = [];
      
      try {
        const manifestResponse = await fetch('/custom-calendars/manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          calendarFiles = manifest.calendars || [];
        }
      } catch (error) {
        console.warn('Could not load calendar manifest, falling back to default list');
        // Fallback to known calendar files if manifest doesn't exist
        calendarFiles = [
          'music-festivals-2025.json',
          'red-rocks-2025.json', 
          'dillon-amphitheater-2025.json',
        ];
      }
      
      const calendars: CustomCalendar[] = [];
      const enabledSet = new Set<string>();
      
      for (const file of calendarFiles) {
        try {
          const response = await fetch(`/custom-calendars/${file}`);
          if (response.ok) {
            const calendar: CustomCalendar = await response.json();
            calendars.push(calendar);
            
            // Add to enabled set if calendar is enabled by default
            if (calendar.enabled) {
              enabledSet.add(calendar.name);
            }
          }
        } catch (error) {
          // Silently skip files that don't exist or can't be loaded
          console.debug(`Calendar file ${file} not found or invalid`);
        }
      }
      
      setCustomCalendars(calendars);
      setEnabledCalendars(enabledSet);
      
      // Load saved calendar preferences from localStorage
      const savedPreferences = localStorage.getItem('seeYouThere_enabledCalendars');
      if (savedPreferences) {
        try {
          const saved = JSON.parse(savedPreferences);
          setEnabledCalendars(new Set(saved));
        } catch (error) {
          console.warn('Failed to load calendar preferences:', error);
          // Keep the default enabled state if localStorage parsing fails
        }
      }
      // If no saved preferences, keep the default enabled state from JSON files
      
    } catch (error) {
      console.error('Failed to load custom calendars:', error);
    } finally {
      setLoadingCalendars(false);
    }
  };

  // Get all events from enabled calendars
  const getAllEnabledEvents = (): CustomEvent[] => {
    return customCalendars
      .filter(calendar => enabledCalendars.has(calendar.name))
      .flatMap(calendar => calendar.events);
  };

  // Toggle calendar enabled state
  const toggleCalendar = (calendarName: string) => {
    setEnabledCalendars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(calendarName)) {
        newSet.delete(calendarName);
      } else {
        newSet.add(calendarName);
      }
      
      // Save to localStorage
      localStorage.setItem('seeYouThere_enabledCalendars', JSON.stringify(Array.from(newSet)));
      
      return newSet;
    });
  };

  // Load custom calendars on component mount
  useEffect(() => {
    loadCustomCalendars();
  }, []);

  return (
    <div className="flex flex-col min-h-screen pt-0 px-2 sm:px-4 pb-2 sm:pb-4 bg-gray-50">
      {showUserForm && <UserForm />}
      {showUserModal && <UserManagementModal />}
      {showFestivalPrompt && <FestivalPrompt />}
      {showResetConfirm && <ResetConfirmDialog />}
      {showSharingModal && <SharingStatusModal />}
      {showGroupConfigModal && <GroupConfigModal />}
      {showTimeModal && <TimeSelectionModal />}
      
      <div className="mb-0">
        {/* Logo header */}
        <div className="flex justify-center pt-0 pb-1">
          <img 
            src="/logo.png" 
            alt="See Ya There Logo" 
            className="h-32 sm:h-44 md:h-56 w-auto object-contain"
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
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              className={`px-4 py-4 text-sm sm:text-base rounded-xl flex items-center justify-center font-medium min-h-[52px] transition-all active:scale-95 ${
                view === 'calendar' 
                  ? 'text-white shadow-lg' 
                  : `text-white hover:opacity-80`
              }`}
              style={{ 
                backgroundColor: view === 'calendar' ? groupConfig.color : '#B5B682'
              }}
              onClick={() => setView('calendar')}
            >
              <Calendar className="mr-2 h-4 w-4" /> 
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </button>
            <button 
              className={`px-4 py-4 text-sm sm:text-base rounded-xl flex items-center justify-center font-medium min-h-[52px] transition-all active:scale-95 ${
                view === 'results' 
                  ? 'text-white shadow-lg' 
                  : `text-white hover:opacity-80`
              }`}
              style={{ 
                backgroundColor: view === 'results' ? groupConfig.color : '#B5B682'
              }}
              onClick={() => setView('results')}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Results
            </button>
          </div>
          
          {/* Group Management Button */}
          <button
            onClick={() => setShowUserModal(true)}
            className="w-full px-4 py-4 text-sm sm:text-base rounded-xl flex items-center justify-center font-medium min-h-[52px] transition-all active:scale-95 text-white hover:opacity-80"
            style={{ backgroundColor: '#7C9885' }}
          >
            <Users className="mr-2 h-4 w-4" /> Group Management
          </button>
        </div>

      </div>

      {/* Sharing Status Modal */}
      <SharingStatusModal />

      {/* Calendar View */}
      {view === 'calendar' && (
        <>
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={prevMonth}
                className="p-3 rounded-full hover:bg-[#FEDC97] active:bg-[#28666E] active:text-white transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {getMonthName(currentMonth)} {currentMonth.getFullYear()}
                </h2>
                <div className="text-xs sm:text-sm font-normal mt-1" style={{ color: groupConfig.color }}>
                  {groupConfig.name} Calendar
                </div>
              </div>
              <button 
                onClick={nextMonth}
                className="p-3 rounded-full hover:bg-[#FEDC97] active:bg-[#28666E] active:text-white transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="font-medium text-gray-500 text-sm py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
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
                    h-12 sm:h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer relative text-sm sm:text-base
                    ${!day.day ? 'text-[#B5B682]' : 'hover:bg-[#FEDC97] active:bg-[#28666E] active:text-white'}
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

      {/* Action Buttons - Show below Calendar */}
      {view === 'calendar' && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              className="px-4 py-3 text-sm rounded-lg flex items-center justify-center font-medium min-h-[48px] transition-colors text-white hover:opacity-80"
              style={{ backgroundColor: '#B5B682' }}
              onClick={() => window.open('https://color-coded-budget-buddy.lovable.app/', '_blank')}
              title="Split costs with your group using Split Sumthin"
            >
              <DollarSign className="mr-1 h-4 w-4" /> Split Costs
            </button>
            <button
              onClick={copyShareableURL}
              className={`px-4 py-3 text-sm rounded-lg flex items-center justify-center font-medium min-h-[48px] transition-colors text-white ${
                users.length > 0 
                  ? 'hover:opacity-80' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ backgroundColor: users.length > 0 ? groupConfig.color : '#9CA3AF' }}
              disabled={users.length === 0}
            >
              <Users className="mr-2 h-4 w-4" /> Share
            </button>
          </div>
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
                  
                  {/* User Preference Status */}
                  {!hasCurrentUserMadePreferences() && currentUserName && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">⚠️</span>
                        <div>
                          <div className="text-sm font-medium text-orange-800">
                            {currentUserName}, you haven't chosen your preferred dates yet!
                          </div>
                          <div className="text-xs text-orange-600 mt-1">
                            Star your favorite dates on the calendar to help the group find the best meetup times.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-700 mb-3">
                      Dates ranked by how many people chose them as preferred
                    </div>
                    <div className="space-y-2">
                      {getMostPreferredDates().map((preference, index) => (
                        <div key={index} className="px-3 py-2 bg-white rounded border border-yellow-200">
                          <div className="space-y-2">
                            {/* User preference count and stars - moved to top */}
                            <div className="flex items-center justify-between">
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
                            
                            {/* Date and type information */}
                            <div>
                              <div className="font-medium text-sm">{formatDateForDisplay(preference.date)}</div>
                              <div className="text-xs text-yellow-600">
                                {enabledCalendars.size > 0 && isDateWithinFestival(preference.date) ? '🎵 Event day' : 'Meetup day'}
                              </div>
                            </div>
                            
                            {/* Calendar invite link for the top date where everyone agrees */}
                            {index === 0 && preference.count === users.length && (
                              <div className="border-t border-yellow-200 pt-3">
                                <div className="text-xs font-medium text-yellow-800 mb-3">
                                  🎯 Perfect Meetup Day! Choose your meeting time:
                                </div>
                                
                                {!showInlineTimeSelection ? (
                                  <button
                                    onClick={() => setShowInlineTimeSelection(true)}
                                    className="text-xs px-3 py-2 rounded-lg text-white hover:opacity-80 transition-colors flex items-center gap-1"
                                    style={{ backgroundColor: groupConfig.color }}
                                  >
                                    <Download className="h-3 w-3" />
                                    Choose Meeting Time
                                  </button>
                                ) : (
                                  <div className="space-y-3">
                                    {/* Time of Day Selection */}
                                    <div>
                                      <div className="text-xs font-medium text-gray-700 mb-2">Time of day:</div>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <button
                                          onClick={() => {
                                            setInlineSelectedTimeOfDay('morning');
                                            setInlineSelectedSpecificTime('10:00');
                                          }}
                                          className={`p-3 rounded-lg border text-xs transition-all ${
                                            inlineSelectedTimeOfDay === 'morning'
                                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="text-xl mb-1">🌅</div>
                                          <div className="font-medium">Morning</div>
                                          <div className="text-xs text-gray-500">8 AM-12 PM</div>
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            setInlineSelectedTimeOfDay('afternoon');
                                            setInlineSelectedSpecificTime('14:00');
                                          }}
                                          className={`p-3 rounded-lg border text-xs transition-all ${
                                            inlineSelectedTimeOfDay === 'afternoon'
                                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="text-xl mb-1">☀️</div>
                                          <div className="font-medium">Afternoon</div>
                                          <div className="text-xs text-gray-500">12 PM - 6 PM</div>
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            setInlineSelectedTimeOfDay('evening');
                                            setInlineSelectedSpecificTime('18:00');
                                          }}
                                          className={`p-3 rounded-lg border text-xs transition-all ${
                                            inlineSelectedTimeOfDay === 'evening'
                                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="text-xl mb-1">🌙</div>
                                          <div className="font-medium">Evening</div>
                                          <div className="text-xs text-gray-500">6 PM - 11 PM</div>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Specific Time Selection */}
                                    {inlineSelectedTimeOfDay && (
                                      <div>
                                        <div className="text-xs font-medium text-gray-700 mb-2">Specific time:</div>
                                        <input
                                          type="time"
                                          value={inlineSelectedSpecificTime}
                                          onChange={(e) => setInlineSelectedSpecificTime(e.target.value)}
                                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        {inlineSelectedSpecificTime && (
                                          <div className="mt-1 text-xs text-gray-600">
                                            Meeting time: {(() => {
                                              const [hours, minutes] = inlineSelectedSpecificTime.split(':');
                                              const hour = parseInt(hours);
                                              const ampm = hour >= 12 ? 'PM' : 'AM';
                                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                              return `${displayHour}:${minutes} ${ampm}`;
                                            })()}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          setShowInlineTimeSelection(false);
                                          setInlineSelectedTimeOfDay(null);
                                          setInlineSelectedSpecificTime('');
                                        }}
                                        className="flex-1 px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (inlineSelectedTimeOfDay) {
                                            const calendarLink = generateGoogleCalendarLink(
                                              preference.date, 
                                              false, 
                                              undefined, 
                                              inlineSelectedTimeOfDay, 
                                              inlineSelectedSpecificTime
                                            );
                                            window.open(calendarLink, '_blank');
                                            setShowInlineTimeSelection(false);
                                            setInlineSelectedTimeOfDay(null);
                                            setInlineSelectedSpecificTime('');
                                          }
                                        }}
                                        disabled={!inlineSelectedTimeOfDay}
                                        className="flex-1 px-3 py-2 text-xs text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                        style={{ 
                                          backgroundColor: inlineSelectedTimeOfDay ? groupConfig.color : undefined 
                                        }}
                                      >
                                        <Download className="h-3 w-3" />
                                        Create Invite
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
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
                              {enabledCalendars.size > 0 && isDateWithinFestival(dateStr) ? '🎵 Event day' : 'Meetup day'}
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
                
                {/* User Preference Reminder */}
                {!hasCurrentUserMadePreferences() && currentUserName && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">💡</span>
                      <div>
                        <div className="text-sm font-medium text-blue-800">
                          Tip: Star your preferred dates on the calendar
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Help your group by marking which available dates work best for you!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

                  {/* Unavailable Days Summary */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                        {getAllUnavailableDays().length}
                      </div>
                      <div className="text-sm font-medium text-red-700">Total Unavailable</div>
                      <div className="text-xs text-red-600 mt-1">
                        {getAllUnavailableDays().length === 1 ? 'day' : 'days'} marked busy
                      </div>
                    </div>
                  </div>
                </div>

                {/* Festival Summary */}
                {enabledCalendars.size > 0 && getFestivalMeetups().length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
                          {getFestivalMeetups().length}
                        </div>
                        <div className="text-sm font-medium text-yellow-700">Event Opportunities</div>
                        <div className="text-xs text-yellow-600 mt-1">
                          event {getFestivalMeetups().length === 1 ? 'meetup' : 'meetups'}
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
                              {enabledCalendars.size > 0 && isDateWithinFestival(dateStr) && (
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
                              {enabledCalendars.size > 0 && isDateWithinFestival(dateStr) && (
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
                              {enabledCalendars.size > 0 && isDateWithinFestival(dateStr) && (
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
              {enabledCalendars.size > 0 && getFestivalMeetups().length > 0 && (
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                    <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#28666E]" /> Event Meetup Opportunities
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700 mb-3">
                      🎵 Events where friends are actually attending together!
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
                              {meetup.attendees.map((user: User) => (
                                <div 
                                  key={user.id}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-green-500 text-white"
                                  title={`${user.name} is attending this event`}
                                >
                                  🎵
                                </div>
                              ))}
                              {users.filter(u => !meetup.attendees.find((a: User) => a.id === u.id)).map(user => (
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

              {/* Festival Section - Plans and Tickets */}
              {enabledCalendars.size > 0 && getCurrentUserFestivals().length > 0 && (
                <div className="mt-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#033F63] mb-2">🎵 Your Festival Experience</h2>
                    <p className="text-gray-600">Your upcoming music festival plans and tickets</p>
                  </div>

                  {/* Festival Plans - Detailed View */}
                  <div className="p-4 bg-white rounded-lg shadow border-2 border-[#28666E] mb-8">
                    <h3 className="font-medium mb-4 flex items-center text-sm sm:text-base">
                      <Music className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#28666E]" /> Your Festival Plans
                    </h3>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-sm text-indigo-700 mb-3">
                        🎵 Music festivals you're attending
                      </div>
                      <div className="space-y-3">
                        {getCurrentUserFestivals().map((item, index) => (
                          <div key={index} className="p-3 border border-indigo-200 rounded-lg bg-white">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-indigo-900">{item.festival.name}</div>
                                  <div className="text-xs text-indigo-600">
                                    📍 {item.festival.location} • {formatDateForDisplay(item.festival.startDate)} - {formatDateForDisplay(item.festival.endDate)}
                                  </div>
                                  {item.festival.description && (
                                    <div className="text-xs text-gray-600 mt-1">{item.festival.description}</div>
                                  )}
                                </div>
                              </div>
                              {item.otherAttendees.length > 0 && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-indigo-100">
                                  <span className="text-xs text-indigo-600 font-medium">Also attending:</span>
                                  <div className="flex gap-1">
                                    {item.otherAttendees.map((name: string, nameIndex: number) => (
                                      <span 
                                        key={nameIndex}
                                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Festival Tickets - Visual Concert Tickets */}
                  <div>
                    <h3 className="font-medium mb-6 text-center text-lg text-[#033F63]">
                      🎫 Your Festival Tickets
                    </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getCurrentUserFestivals().map((item, index) => (
                      <div 
                        key={index}
                        className="festival-ticket relative"
                        style={{
                          perspective: '1000px',
                        }}
                      >
                        <div className="ticket-inner relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 rounded-lg p-6 transform transition-all duration-500 hover:rotateY-12 hover:rotateX-5 hover:scale-105 shadow-xl hover:shadow-2xl">
                          {/* Foil overlay for reflection effect */}
                          <div className="foil-overlay absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none"></div>
                          
                          {/* Ticket perforations */}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full -ml-2"></div>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full -mr-2"></div>
                          
                          {/* Ticket content */}
                          <div className="relative z-10 text-white">
                            <div className="border-b border-white/30 pb-3 mb-3">
                              <div className="text-xs opacity-75 mb-1">CONCERT TICKET</div>
                              <div className="font-bold text-lg mb-1">{item.festival.name}</div>
                              <div className="text-sm opacity-90">📍 {item.festival.location}</div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="opacity-75">DATES:</span>
                                <span className="font-medium">
                                  {formatDateForDisplay(item.festival.startDate)} - {formatDateForDisplay(item.festival.endDate)}
                                </span>
                              </div>
                              
                              {item.otherAttendees.length > 0 && (
                                <div className="pt-2 border-t border-white/30">
                                  <div className="text-xs opacity-75 mb-2">FRIENDS ALSO ATTENDING:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {item.otherAttendees.map((name: string, nameIndex: number) => (
                                      <span 
                                        key={nameIndex}
                                        className="px-2 py-1 text-xs bg-white/20 rounded-full backdrop-blur-sm"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Barcode-style decoration */}
                            <div className="mt-4 pt-3 border-t border-white/30">
                              <div className="flex space-x-1 justify-center">
                                {[...Array(12)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="bg-white/60 rounded-full" 
                                    style={{ 
                                      width: '2px', 
                                      height: Math.random() * 20 + 10 + 'px' 
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>
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

      {/* Split Costs View */}
      {view === 'split' && (
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center text-sm sm:text-base">
              <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#28666E]" /> Split Costs with Split Sumthin
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#FEDC97] p-4 rounded-lg border border-[#28666E]">
              <h4 className="font-medium text-[#033F63] mb-2">Perfect Companion App!</h4>
              <p className="text-sm text-[#033F63] mb-3">
                Once you've planned your meetup dates, use Split Sumthin to easily split costs for accommodations, 
                food, transportation, and festival tickets with your group.
              </p>
              <div className="flex justify-center">
                <a
                  href="https://color-coded-budget-buddy.lovable.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#28666E] text-white rounded-md hover:bg-[#033F63] transition-colors text-center text-sm font-medium inline-flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Open Split Sumthin
                </a>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2 text-sm">How to use Split Sumthin with your group:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Create a new budget in Split Sumthin</li>
                <li>Add your group members from See Ya There</li>
                <li>Add shared expenses like festival tickets, camping fees, gas, food</li>
                <li>Split costs fairly among participants</li>
                <li>Track who owes what and settle up easily</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* About View */}
      {view === 'about' && <AboutPage />}


      {/* Event Calendars - Mobile-First Design */}
      {view === 'calendar' && customCalendars.length > 0 && (
        <div className="mb-4 bg-white rounded-lg shadow overflow-hidden">
          {/* Header - Always Visible */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center text-base">
                <Music className="mr-2 h-5 w-5 text-[#033F63]" /> Event Calendars
              </h3>
              {enabledCalendars.size > 0 && (
                <span className="text-xs font-medium text-white bg-[#033F63] px-2 py-1 rounded-full">
                  {enabledCalendars.size}/{customCalendars.length}
                </span>
              )}
            </div>
            {enabledCalendars.size === 0 && (
              <p className="text-sm text-gray-500 mt-1">Tap calendars below to show events</p>
            )}
          </div>
          
          {/* Calendar Selection - Mobile Optimized */}
          <div className="p-4">
            {loadingCalendars ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading calendars...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {customCalendars.map((calendar) => (
                  <button
                    key={calendar.name}
                    onClick={() => toggleCalendar(calendar.name)}
                    className={`w-full p-4 rounded-xl border-2 transition-all active:scale-95 ${
                      enabledCalendars.has(calendar.name) 
                        ? 'border-blue-400 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      backgroundColor: enabledCalendars.has(calendar.name) 
                        ? calendar.color + '15' 
                        : '#f9fafb'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            enabledCalendars.has(calendar.name) 
                              ? 'border-blue-500' 
                              : 'border-gray-300'
                          }`}
                          style={{
                            backgroundColor: enabledCalendars.has(calendar.name) 
                              ? calendar.color 
                              : 'transparent'
                          }}
                        >
                          {enabledCalendars.has(calendar.name) && (
                            <div className="w-3 h-3 text-white text-xs">✓</div>
                          )}
                        </div>
                        {calendar.icon && (
                          <span className="text-xl">{calendar.icon}</span>
                        )}
                        <div className="text-left">
                          <div className="font-medium text-gray-800">{calendar.name}</div>
                          <div className="text-sm text-gray-500">
                            {calendar.events.length} events
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {enabledCalendars.has(calendar.name) ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Events Preview - Mobile Optimized */}
          {enabledCalendars.size > 0 && (
            <div className="border-t border-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">
                    Upcoming Events ({getAllEnabledEvents().length})
                  </h4>
                  <div className="text-xs text-gray-500">
                    Tap to jump to month
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getAllEnabledEvents()
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .slice(0, 6) // Limit to 6 events on mobile for performance
                    .map(event => (
                    <button 
                      key={event.id}
                      className={`w-full p-3 rounded-lg border border-gray-200 text-left active:scale-95 transition-all ${event.color}`}
                      onClick={() => {
                        const eventDate = new Date(event.startDate + 'T12:00:00');
                        setCurrentMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
                      }}
                    >
                      <div className="font-medium text-sm mb-1">{event.name}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(event.startDate + 'T12:00:00').toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(event.startDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })} - 
                        {new Date(event.endDate + 'T12:00:00').toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: new Date(event.endDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </div>
                      {event.location && (
                        <div className="text-xs text-gray-500 mt-1 truncate">📍 {event.location}</div>
                      )}
                    </button>
                  ))}
                  {getAllEnabledEvents().length > 6 && (
                    <div className="text-center py-2 text-xs text-gray-500">
                      ... and {getAllEnabledEvents().length - 6} more events
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer - appears at bottom of all views */}
      <div className="mt-8 text-center py-4 border-t border-gray-200">
        <button
          onClick={() => setView('about')}
          className="text-sm text-gray-500 hover:text-[#28666E] underline"
        >
          What is this?
        </button>
      </div>
    </div>
  );
}