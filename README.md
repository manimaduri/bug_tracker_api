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

The main application entry point is `src/server.js`. The `src/controllers` directory contains the logic for handling requests for bugs, comments, projects, and users. The `src/routes` directory contains the routes for the application. The `src/middleware` directory contains middleware functions for authentication and authorization.



## License

ISC 
