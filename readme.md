# Weekly Schedule Manager

The Weekly Schedule Manager is a web-based application that allows users to efficiently organize their weekly schedules. This application is built using React and TypeScript, with Tailwind CSS for styling.

## Features

- **Add Schedule**: Add new activities to your weekly schedule.
- **Delete Schedule**: Remove unnecessary activities from your schedule.
- **Local Storage**: Schedules are saved in `localStorage` to persist even after refreshing the page.

## Installation

1. **Clone this repository**:

   ```bash
   git clone https://github.com/username/weekly-schedule-manager.git
   cd weekly-schedule-manager
   ```
2. **Install dependencies**:

   ```bash
   npm install
   ```
3. **Run the application**:

   ```bash
   npm start
   ```
4. **Open in browser**:
   Access the application at `http://localhost:3000`.

## Project Structure

- `src/`: Main directory for source code.
  - `components/`: Contains React components like `ScheduleForm` and `ScheduleDisplay`.
  - `types.ts`: Defines TypeScript types for schedule items.
  - `App.tsx`: Main application component.
  - `index.css`: CSS file using Tailwind CSS.
- `public/`: Contains static files like `index.html`.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Vite**: A modern build tool for frontend development.

## Contribution

Contributions are welcome! Please fork this repository and create a pull request for any improvements or new features.

## License

This project is licensed under the [MIT License](LICENSE).
