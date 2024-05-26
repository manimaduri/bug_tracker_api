# Bug Tracker

This is a bug tracking system built with Node.js and Express. It uses PostgreSQL for data storage.

## Features

- User authentication and authorization
- Users can create, update, and delete bugs
- Users can view all bugs or get a specific bug by ID
- Each bug is associated with a project

## How to Run the Project

1. Install the dependencies by running `npm install`
2. Start the server by running `npm start`

## Project Structure

The main application entry point is `src/app.ts`. The `src/models` directory contains the data models and data transfer objects (DTOs). The `src/repositories` directory contains the classes that interact with the database. The `src/routers` directory contains the routes for the application. The `src/services` directory contains the classes that contain the business logic. The `src/utils` directory contains utility functions used across the application.

Here is a more detailed breakdown:

- `src/`
    - `app.ts`: Main application entry point
    - `models/`: Contains data models and DTOs
        - `dto/`: Contains DTOs
            - `EmployeeDTO.ts`
            - `OrganizationDTO.ts`
            - `UserDTO.ts`
        - `Employee.ts`
        - `Organization.ts`
        - `User.ts`
    - `repositories/`: Contains classes that interact with the database
        - `EmployeeRepository.ts`
        - `OrganizationRepository.ts`
        - `UserRepository.ts`
    - `routers/`: Contains the routes for the application
        - `userRouter.ts`
    - `services/`: Contains classes that contain the business logic
        - `UserService.ts`
    - `utils/`: Contains utility functions used across the application
        - `hashPassword.ts`
        - `responseHandler.ts`
        - `validateDTO.ts`

## License

ISC