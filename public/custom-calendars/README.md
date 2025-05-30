# Custom Calendars

This directory contains custom calendar overlays that can be displayed in the See Ya There app. You can easily add your own event calendars by creating JSON files in this directory.

## How to Add a Custom Calendar

1. Create a new JSON file in this directory (e.g., `my-events-2025.json`)
2. Follow the schema format shown below
3. Add your new calendar file to the `manifest.json` file
4. The app will automatically detect and load your calendar

## Automatic Calendar Discovery

The app uses a `manifest.json` file to discover available calendars. When you add a new calendar:

**Option 1: Manual Update**
1. Create your calendar JSON file
2. Add the filename to the `calendars` array in `manifest.json`
3. Refresh the app to see your new calendar

**Option 2: Automatic Update (Recommended)**
1. Create your calendar JSON file
2. Run: `node update-manifest.js` (this will automatically scan and update the manifest)
3. Refresh the app to see your new calendar

Example `manifest.json`:
```json
{
  "calendars": [
    "music-festivals-2025.json",
    "red-rocks-2025.json",
    "dillon-amphitheater-2025.json",
    "your-new-calendar.json"
  ]
}
```

## JSON Schema

```json
{
  "name": "Calendar Display Name",
  "description": "Brief description of this calendar",
  "enabled": true,
  "color": "#28666E",
  "icon": "🎵",
  "events": [
    {
      "id": 1,
      "name": "Event Name",
      "startDate": "2025-06-15",
      "endDate": "2025-06-17",
      "dayOfWeekStart": "Saturday",
      "location": "Event Location",
      "description": "Event description",
      "color": "bg-blue-200",
      "website": "https://example.com",
      "time": "All Day"
    }
  ]
}
```

## Field Descriptions

### Calendar Level
- `name`: Display name for the calendar (shown in toggle)
- `description`: Brief description of the calendar
- `enabled`: Whether this calendar is enabled by default
- `color`: Hex color for the calendar theme
- `icon`: Emoji icon for the calendar (optional)

### Event Level
- `id`: Unique identifier for the event
- `name`: Event name
- `startDate`: Start date in YYYY-MM-DD format
- `endDate`: End date in YYYY-MM-DD format
- `dayOfWeekStart`: Day of the week the event starts (optional)
- `location`: Event location
- `description`: Event description (optional)
- `color`: Tailwind CSS background color class for the event dot
- `website`: Event website or ticket info (optional)
- `time`: Event time or "All Day" (optional)
- `startTime`: Specific start time (optional)
- `endTime`: Specific end time (optional)

## Examples

### Corporate Events
```json
{
  "name": "Company Events 2025",
  "description": "Annual company meetings and events",
  "enabled": true,
  "color": "#1E40AF",
  "icon": "🏢",
  "events": [
    {
      "id": 1,
      "name": "Annual Conference",
      "startDate": "2025-09-15",
      "endDate": "2025-09-17",
      "location": "Convention Center",
      "description": "Our annual company conference",
      "color": "bg-blue-200"
    }
  ]
}
```

### Sports Events
```json
{
  "name": "Local Sports 2025",
  "description": "Local sports games and tournaments",
  "enabled": true,
  "color": "#059669",
  "icon": "⚽",
  "events": [
    {
      "id": 1,
      "name": "Soccer Tournament",
      "startDate": "2025-07-20",
      "endDate": "2025-07-22",
      "location": "City Stadium",
      "color": "bg-green-200"
    }
  ]
}
```

### Academic Calendar
```json
{
  "name": "School Calendar 2025",
  "description": "School breaks and important dates",
  "enabled": true,
  "color": "#7C2D12",
  "icon": "🎓",
  "events": [
    {
      "id": 1,
      "name": "Spring Break",
      "startDate": "2025-03-10",
      "endDate": "2025-03-14",
      "location": "University",
      "color": "bg-orange-200"
    }
  ]
}
```

## Tips

- Use descriptive file names (e.g., `tech-conferences-2025.json`)
- Keep event IDs unique within each calendar
- Use appropriate Tailwind CSS color classes for visual variety
- Test your JSON syntax before adding to ensure it loads properly
- The app will show a toggle for each enabled calendar 