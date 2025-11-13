# School Bus Tracker

This project is a comprehensive school management bus tracker application designed to facilitate communication and tracking between parents, drivers, and school management. It consists of three main components: a mobile app for drivers and parents, a web app for school management, and a server for handling backend operations.

## Project Structure

The project is organized into three main directories:

- **mobile**: Contains the React Native application for drivers and parents.
- **web**: Contains the React web application for school management.
- **server**: Contains the backend server application for handling API requests and data management.

## Features

### Mobile App
- **Driver Login**: Allows drivers to log in and access their dashboard.
- **Parent Login**: Allows parents to log in and view their children's bus statuses.
- **Real-time Tracking**: Displays real-time bus locations on a map.
- **Vehicle Status**: Shows the status of each vehicle.

### Web App
- **Dashboard**: Provides an overview of bus and student information.
- **Student Management**: Allows school management to add, edit, and view student details.
- **Bus Management**: Enables management of bus details and statuses.

### Server
- **Authentication**: Handles user login and registration.
- **Bus Tracking**: Manages bus tracking and updates.
- **Data Management**: Interacts with the database to manage student and bus records.

## Technologies Used
- **Frontend**: React Native for mobile, React for web.
- **Backend**: Node.js with Express for the server.
- **Database**: (Specify your choice of database, e.g., MongoDB, PostgreSQL, etc.)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the mobile directory and install dependencies:
   ```
   cd mobile
   npm install
   ```

3. Navigate to the web directory and install dependencies:
   ```
   cd ../web
   npm install
   ```

4. Navigate to the server directory and install dependencies:
   ```
   cd ../server
   npm install
   ```

## Running the Application

- To run the mobile app, navigate to the mobile directory and use:
  ```
  npm start
  ```

- To run the web app, navigate to the web directory and use:
  ```
  npm start
  ```

- To run the server, navigate to the server directory and use:
  ```
  npm start
  ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.