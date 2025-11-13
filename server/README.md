# School Bus Tracker Server

This project is a backend server for the School Bus Tracker application. It provides APIs for managing user authentication, bus tracking, and student details.

## Features

- User authentication for drivers and parents
- Bus tracking and status updates
- Management of student details

## Technologies Used

- Node.js
- Express
- TypeScript
- MongoDB (or any other database of choice)

## Getting Started

### Prerequisites

- Node.js installed on your machine
- MongoDB (or any other database) set up

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the server directory:
   ```
   cd school-bus-tracker/server
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Running the Server

To start the server, run:
```
npm start
```

The server will be running on `http://localhost:3000` (or any other port specified in your configuration).

### API Endpoints

- **POST /api/auth/login**: Authenticate users (drivers and parents).
- **GET /api/bus/status**: Get the current status of the buses.
- **GET /api/students**: Retrieve student details.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

### License

This project is licensed under the MIT License.