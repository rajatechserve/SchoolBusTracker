# School Bus Tracker Web App

This project is a school management bus tracker application that consists of a mobile app for drivers and parents, and a web app for school management. The web app allows administrators to track bus statuses and manage student details.

## Features

- **Driver and Parent Login**: Secure login functionality for drivers and parents to access their respective dashboards.
- **Bus Tracking**: Real-time tracking of buses to ensure safety and timely arrivals.
- **Student Management**: Admin interface to manage student details, including adding, editing, and viewing student information.
- **Bus Management**: Admin interface to manage bus details and statuses.

## Technologies Used

- **Frontend**: React for the web app, React Native for the mobile app.
- **Backend**: Node.js with Express for the server.
- **Database**: MongoDB (or any other database of choice) for storing user and bus data.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB (or your preferred database) set up and running.

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd school-bus-tracker
   ```

2. Navigate to the web app directory and install dependencies:
   ```
   cd web
   npm install
   ```

3. Navigate to the mobile app directory and install dependencies:
   ```
   cd ../mobile
   npm install
   ```

4. Navigate to the server directory and install dependencies:
   ```
   cd ../server
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Start the web app:
   ```
   cd ../web
   npm start
   ```

3. Start the mobile app (ensure you have an emulator or device connected):
   ```
   cd ../mobile
   npm start
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the LICENSE file for details.