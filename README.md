# Basic Auth/Chat Application

This project is a full-stack chat application featuring basic authentication, built with ReactJS, Node.js, Redux for state management, PostgreSQL as the database, and Docker for containerization.

## Features

- User authentication (sign up, sign in, sign out)
- Global chat room
- Private messaging (next up)
- Redux for managing application state
- PostgreSQL database integration
- Containerized for easy deployment using Docker

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Docker and Docker Compose installed
- Node.js installed
- PostgreSQL installed or accessible remotely

## Installation

To install the Basic Auth/Chat Application, follow these steps:

1. Clone the repository:
git clone https://github.com/fogracvxy/basic_chat_web_app.git
2. Navigate to the project directory:
cd basic_chat_web_app
## Configuration

1. Update the `.env` file with your PostgreSQL database credentials and other environment variables.

2. If necessary, modify the `docker-compose.yml` to fit your setup.

## Running the Application

To run the application, use the following command:
docker-compose up --build


This will build the Docker images and start the services defined in your `docker-compose.yml` file.

## Usage

After starting the application, you can access:

- **Frontend**: `http://localhost:5174` to view the React application.
- **Backend**: The Node.js server will be running on `http://localhost:3001`.

## Contributing to the Basic Auth/Chat Application

To contribute to the Basic Auth/Chat Application, follow these steps:

1. Fork this repository.
2. Create a new branch: `git checkout -b branch_name`.
3. Make your changes and commit them: `git commit -m 'commit_message'`
4. Push to the original branch: `git push origin your-repo-name/branch_name`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

## Contributors

Thanks to the following people who have contributed to this project:

- [@fogracvxy](https://github.com/fogracvxy)




