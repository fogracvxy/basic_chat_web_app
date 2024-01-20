# Step 1: Build the React application
FROM node:20 AS build

# Set the working directory in the Docker container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of your client's source code
COPY . .

# Build the application
RUN npm run build

# Step 2: Serve the React application using a lightweight server like nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Default command to run when starting the container
CMD ["nginx", "-g", "daemon off;"]
