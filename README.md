# Air Quality Index (AQI) Dashboard

A comprehensive web application for analyzing and visualizing annual Air Quality Index data across different metropolitan areas in the United States. Built with Next.js, React, and modern data visualization libraries.


## 🌟 Features

### 📊 Interactive Data Visualization
- **Overview Dashboard**: Real-time statistics and key metrics across all locations
- **Trend Analysis**: Historical trends with year-over-year comparisons
- **City Comparisons**: Side-by-side analysis of air quality across metropolitan areas
- **Predictive Analytics**: Machine learning-powered forecasts for 2025-2028

### 🎯 Advanced Analytics
- **Linear Regression Models**: Statistical analysis of air quality trends
- **Multi-City Predictions**: Compare future air quality projections across cities
- **Confidence Intervals**: Statistical confidence measures for predictions
- **R² Values**: Model accuracy indicators

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Charts**: Powered by Recharts with hover effects and tooltips
- **Advanced Filtering**: Multi-dimensional data filtering by year and location

### 📈 Key Metrics Tracked
- Median AQI and 90th Percentile AQI
- Good, Moderate, and Unhealthy air quality days
- Primary pollutant breakdowns (Ozone, PM2.5, PM10, CO, NO₂)
- Maximum AQI values and hazardous day counts

## 🎥 Demo Videos

### Dashboard Overview
![Dashboard Demo](./docs/demo/AirAware_recording.mov)



### Mobile Responsive
<div style="display: flex; gap: 10px;">
  <img src="./docs/images/mobile-overview.png" alt="Mobile Overview" width="300">
  <img src="./docs/images/mobile-charts.png" alt="Mobile Charts" width="300">
</div>

*Responsive design optimized for mobile devices*

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/aqi-dashboard.git
   cd aqi-dashboard
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

\`\`\`
aqi-dashboard/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── air-quality-overview.tsx # Overview dashboard
│   ├── air-quality-trends.tsx   # Trend analysis
│   ├── air-quality-comparison.tsx # City comparisons
│   ├── air-quality-predictive.tsx # Predictive analytics
│   ├── air-quality-table.tsx    # Data table
│   ├── air-quality-filters.tsx  # Filtering controls
│   ├── dashboard.tsx            # Main dashboard
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── lib/                         # Utility functions
│   ├── types.ts                 # TypeScript definitions
│   ├── data-utils.ts           # Data processing utilities
│   ├── generate-epa-data.ts    # Data generation
│   └── regression-utils.ts      # Statistical analysis
├── public/                      # Static assets
│   └── data/                   # CSV data files
├── docs/                       # Documentation assets
│   ├── images/                 # Screenshots
│   └── videos/                 # Demo videos
└── README.md                   # This file
\`\`\`

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

### Data Visualization
- **Recharts** - React charting library
- **Lucide React** - Icon library
- **TanStack Table** - Advanced data tables

### Theming & UI
- **next-themes** - Dark/light mode support
- **Radix UI** - Accessible component primitives
- **Class Variance Authority** - Component variants

### Data Processing
- **Custom Linear Regression** - Statistical analysis
- **CSV Parsing** - Data import utilities
- **TypeScript Types** - Type-safe data handling

## 📊 Data Sources

The dashboard uses air quality data from major U.S. metropolitan areas including:

- Los Angeles-Long Beach-Anaheim, CA
- New York-Newark-Jersey City, NY-NJ-PA  
- Chicago-Naperville-Elgin, IL-IN-WI
- Phoenix-Mesa-Chandler, AZ
- Houston-The Woodlands-Sugar Land, TX
- San Francisco-Oakland-Berkeley, CA
- Denver-Aurora-Lakewood, CO
- Seattle-Tacoma-Bellevue, WA

### Data Coverage
- **Historical Data**: 2019-2024
- **Predicted Data**: 2025-2028
- **Metrics**: AQI values, air quality days, pollutant breakdowns
- **Update Frequency**: Annual data updates

## 🔮 Predictive Analytics

### Machine Learning Models
The dashboard implements custom linear regression models to predict future air quality trends:

- **Baseline Calculation**: Uses 2023-2024 data as baseline
- **Trend Modeling**: Applies compound growth factors
- **Confidence Intervals**: Statistical confidence measures
- **Model Validation**: R² values for accuracy assessment

### Prediction Methodology
- **Median AQI**: 10% annual increase projected
- **90th Percentile AQI**: 10% annual increase projected  
- **Unhealthy Days**: 15% annual increase projected
- **Good Days**: 5% annual decrease projected (indicating worsening conditions)

## 🎨 Customization

### Theme Configuration
The dashboard supports extensive theming through Tailwind CSS and CSS variables:

\`\`\`css
/* Light mode variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}

/* Dark mode variables */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... more variables */
}
\`\`\`

### Component Customization
All components are built with shadcn/ui and can be easily customized:

\`\`\`tsx
// Example: Customizing chart colors
const chartConfig = {
  medianAQI: {
    label: "Median AQI",
    color: "hsl(var(--chart-1))",
  },
  // Add more configurations
}
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform


### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **EPA Air Quality Data** - Environmental Protection Agency
- **shadcn/ui** - Component library and design system
- **Recharts** - Data visualization library
- **Next.js Team** - React framework
- **Vercel** - Deployment platform


---

**Built with ❤️ for better air quality awareness**
\`\`\`
