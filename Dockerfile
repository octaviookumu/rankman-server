# Use the official Node.js image as the base image
FROM node:16

# Create and set the working directory in the container
WORKDIR /app

# Copies the package.json and package-lock.json files from the current directory on the host machine to the /app directory in the container. The * in package*.json allows us to copy both files at once
COPY package*.json ./
COPY prisma ./prisma/

# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# # Install project dependencies
RUN npm install

# # Copy the rest of the application files to the working directory
COPY . .

# RUN npm run build
RUN npm run build

# Expose the port where your NestJS application will run
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]

# CMD ["npm", "run", "start:dev"]