# Use Node.js base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the application code
COPY . .

# Install dependencies
RUN npm i 

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 5000

# Command to start the application
CMD ["npm", "run", "start:dev"]