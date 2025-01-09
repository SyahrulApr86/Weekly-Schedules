
# Weekly Schedule Manager

The **Weekly Schedule Manager** is a web-based application that allows users to efficiently organize their weekly schedules. This application is built using **React** and **TypeScript**, with **Tailwind CSS** for styling and **Vite** as the build tool.

## Features

- **Add Schedule**: Add new activities to your weekly schedule.
- **Delete Schedule**: Remove unnecessary activities from your schedule.
- **Local Storage**: Schedules are saved in `localStorage` to persist even after refreshing the page.

## Installation

### Using Docker (Recommended)

1. **Clone this repository**:

   ```bash
   git clone https://github.com/username/weekly-schedule-manager.git
   cd weekly-schedule-manager
   ```

2. **Build and run the application using Docker Compose**:

   ```bash
   docker compose up --build
   ```

3. **Open in browser**:
   Access the application at `http://localhost`.

### Local Development

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
   npm run dev
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
- `Dockerfile`: Defines the steps to build the Docker image.
- `docker-compose.yml`: Configuration for running the application using Docker Compose.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Vite**: A modern build tool for frontend development.
- **Docker**: Containerization platform to build and run the application.
- **Nginx**: Web server used to serve the production build of the application.

## Contribution

Contributions are welcome! Please fork this repository and create a pull request for any improvements or new features.

## License

This project is licensed under the [MIT License](LICENSE).
