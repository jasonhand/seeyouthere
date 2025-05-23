# See You There 🎵

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.2-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A React-based web application for effortless group date planning with music festival integration

## ✨ Features

- **📅 Interactive Calendar** - Clean, intuitive calendar interface for date selection
- **👥 Multi-User Support** - Individual availability tracking for each group member
- **🎯 Smart Results** - Dates sorted by most available users for optimal planning
- **🎵 Festival Integration** - Overlay music festival dates to plan around events
- **🔗 Easy Sharing** - Share availability with friends via URL
- **💾 Local Storage** - Automatically saves your preferences and data
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

Visit the live application: [See You There](https://your-netlify-site.netlify.app)

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 4.9.3
- **Styling**: TailwindCSS 3.3.2
- **Build Tool**: Vite 6.3.5
- **Icons**: Lucide React
- **Deployment**: Netlify

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seeyouthere.git
   cd seeyouthere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run netlify-build` | Build and prepare for Netlify deployment |

## 🎯 How It Works

1. **Create Your Profile** - Enter your name to join the group planning session
2. **Select Your Availability** - Click on calendar dates when you're available
3. **Share with Friends** - Copy the URL to share your group's planning session
4. **View Results** - Switch to results view to see the best dates for your group
5. **Plan Around Events** - See music festival overlays to avoid conflicts

## 🏗️ Project Structure

```
src/
├── GroupDateFinder.tsx    # Main component with calendar and results
├── main.tsx              # Application entry point
└── index.css             # Global styles and TailwindCSS imports
```

## 🌐 Deployment

This project is configured for seamless deployment on Netlify:

### Automatic Deployment

1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the build settings from `netlify.toml`
3. Every push to main branch triggers a new deployment

### Manual Deployment

```bash
npm run netlify-build
# Upload the 'dist' folder to Netlify
```

## 🔧 Configuration

The project includes configuration files for:

- **Vite**: `vite.config.ts` - Build tool configuration
- **TypeScript**: `tsconfig.json` - TypeScript compiler options
- **TailwindCSS**: `tailwind.config.ts` - Styling framework configuration
- **PostCSS**: `postcss.config.js` - CSS processing
- **Netlify**: `netlify.toml` - Deployment and routing configuration

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Backend integration for persistent data storage
- [ ] User authentication and profiles
- [ ] Email notifications for date confirmations
- [ ] Integration with calendar apps (Google Calendar, Outlook)
- [ ] Custom event overlays beyond music festivals
- [ ] Mobile app development
- [ ] Advanced analytics and insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- TailwindCSS for the utility-first CSS framework
- Lucide React for beautiful icons
- Netlify for seamless deployment platform

---

<p align="center">
  Made with ❤️ for better group planning
</p>