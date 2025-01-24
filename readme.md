# Wiiks a Weekly Schedule Manager

**Wiiks** is a web-based application that allows users to efficiently organize their weekly schedules. This application is built using **React** and **TypeScript**, with **Tailwind CSS** for styling and **Vite** as the build tool. It now integrates with **Supabase** for user authentication and database storage, allowing each user to manage their own schedules independently.

## Features

- **User Authentication**: Users can sign up, sign in, and manage their schedules securely.
- **Add Schedule**: Add new activities to your weekly schedule.
- **Delete Schedule**: Remove unnecessary activities from your schedule.
- **Persistent Storage**: Schedules are saved in a **Supabase** database, ensuring data is persisted across sessions and accessible from any device.
- **Responsive UI**: A modern and responsive user interface built with **Tailwind CSS**.

## Installation

### Using Docker (Recommended)

1. **Clone this repository**:

   ```bash
   git clone https://github.com/username/weekly-schedule-manager.git
   cd weekly-schedule-manager
   ```

2. **Set up environment variables**:
   Create a `.env` file in the project root with the following variables:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Build and run the application using Docker Compose**:

   ```bash
   docker compose up --build
   ```

4. **Open in browser**:
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

3. **Set up environment variables**:
   Create a `.env` file in the project root with the following variables:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the application**:

   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Access the application at `http://localhost:3000`.

## Project Structure

- `src/`: Main directory for source code.
    - `components/`: Contains React components like `ScheduleForm`, `ScheduleDisplay`, and `Auth`.
    - `lib/`: Contains configuration for **Supabase**.
    - `types.ts`: Defines TypeScript types for schedule items.
    - `App.tsx`: Main application component.
    - `index.css`: CSS file using Tailwind CSS.
- `public/`: Contains static files like `index.html`.
- `.env`: Environment variable configuration file.
- `Dockerfile`: Defines the steps to build the Docker image.
- `docker-compose.yml`: Configuration for running the application using Docker Compose.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Vite**: A modern build tool for frontend development.
- **Supabase**: Backend-as-a-Service (BaaS) providing authentication and database services.
- **Docker**: Containerization platform to build and run the application.
- **Nginx**: Web server used to serve the production build of the application.

## Contribution

Contributions are welcome! Please fork this repository and create a pull request for any improvements or new features.

## License

This project is licensed under the [MIT License](LICENSE).

