# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the final image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the production dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy the build files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy other necessary files (like .env, etc.)
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
