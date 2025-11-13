# School Bus Tracker Mobile App

This is the mobile application for the School Bus Tracker project, built using React Native. The app provides functionalities for both drivers and parents to log in and track bus statuses.

## Features

- **Driver Login**: Drivers can log in to access their dashboard.
- **Driver Dashboard**: Displays bus statuses and routes for drivers.
- **Parent Login**: Parents can log in to view their children's bus statuses.
- **Parent Dashboard**: Displays student statuses and bus locations for parents.
- **Real-time Tracking**: Integration with a map component to track bus locations in real-time.

## Installation

To get started with the mobile app, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the mobile directory:
   ```
   cd school-bus-tracker/mobile
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm start
   ```

## Development

- The main entry point of the application is located in `src/App.tsx`.
- Navigation setup can be found in `src/navigation/index.tsx`.
- Screens for driver and parent functionalities are located in `src/screens/Driver` and `src/screens/Parent` respectively.
- Components for map and vehicle status are in `src/components`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.