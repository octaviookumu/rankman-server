# The Dockerfile sets up a container for running the application. It installs the necessary dependencies, copies the application code into the container, builds the application, and starts the server using the production build

# Specifies the base image for the Docker container. We use the official Node.js 16.x image as the base in this case
FROM node:16

# Sets the working directory inside the container to /app. This is where the application code will be copied and where the container will run from
WORKDIR /app

# Copies the package.json and package-lock.json files from the current directory on the host machine to the /app directory in the container. The * in package*.json allows us to copy both files at once
COPY package*.json ./

# Installs the application dependencies in the container. This step uses the npm install command to install the dependencies listed in package.json
RUN npm install

# Copies the application code from the host machine to the /app directory in the container
COPY . .

# used to build the application in the container. This command will typically create a dist folder with the production build of the application
RUN npm run build

# Specifies the command to run when the container starts
CMD [ "npm", "run", "start:dev" ]