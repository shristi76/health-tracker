# WellnessHub: Comprehensive Wellness Tracker

WellnessHub is a feature-rich wellness tracking application designed to help you monitor various aspects of your health and wellbeing in one place.

## Features

- **User Authentication**: Secure login and signup system
- **Dashboard**: Overview of your wellness metrics in one place
- **Mood Tracker**: Track your mood with emoji buttons and view patterns on a color-coded calendar
- **Water Intake Tracker**: Monitor your daily water consumption with an interactive cup interface
- **Breathing Exercise**: Guided breathing animations with different techniques (Box Breathing, 4-7-8, Deep Breathing)
- **Meal Logger**: Log your meals and track calorie intake with daily summaries
- **Sleep Tracker**: Record your sleep duration and quality to identify patterns
- **Fitness Routine**: Track your workouts with built-in timers for each exercise
- **Stretching Sequence**: Customizable stretch routines with visual timers and drag-and-drop organization
- **Mental Health Journal**: Journal entries with mood tracking and tagging capability
- **Weight Tracker**: Monitor your weight with trend visualization
- **Health Dashboard**: View integrated health metrics (simulating wearable device integration)

## Technologies Used

- HTML5, CSS3, and JavaScript (ES6+)
- GSAP (GreenSock Animation Platform) for smooth animations
- LocalStorage for data persistence
- Responsive design for all device sizes

## Getting Started

1. Clone this repository to your local machine
2. Open `login.html` in your web browser to access the login screen
3. Create an account or login with existing credentials
4. Navigate through the different features using the sidebar menu

## GSAP Animations

This project uses the GSAP animation library to create smooth, engaging animations throughout the application:

- Login/signup form transitions
- Dashboard card animations
- Water and activity progress bars
- Breathing exercise circle animations
- Mood selection feedback
- Page transitions between sections

## Usage Guide

### Login/Signup
- Create a new account using the signup form
- Login with your credentials
- User sessions are maintained through LocalStorage

### Mood Tracker
- Click on an emoji that represents your current mood
- Add optional notes about how you're feeling
- Save to update your mood calendar and trends

### Water Intake
- Click on the cups to track your water consumption
- Adjust your daily goal using the + and - buttons
- Watch your progress in the water level visualization

### Breathing Exercise
- Choose your preferred breathing technique (Box Breathing, 4-7-8, Deep Breathing)
- Follow the animated visual guidance for proper breathing
- Set your desired session length

## Project Structure

- `login.html` - Login and signup page
- `index.html` - Main application
- `css/` - Stylesheet files
  - `login.css` - Styles for login page
  - `style.css` - Styles for main application
- `js/` - JavaScript files
  - `login.js` - Login and signup functionality
  - `main.js` - Main application logic
  - `breathing.js` - Breathing exercises
  - `mood.js` - Mood tracking
  - `water.js` - Water tracking

## Data Storage

The application uses browser LocalStorage for data persistence:
- User authentication information
- Mood history
- Water intake records
- Sleep data
- Meal logs
- Fitness activities

## License

This project is open source and available under the MIT License.

---

Created with ❤️ for a healthier, happier life. 