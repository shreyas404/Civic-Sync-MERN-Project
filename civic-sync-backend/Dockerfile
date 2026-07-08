FROM node:18-alpine

# Set environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install only production dependencies and clean cache to minimize image size
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Expose standard Cloud Run port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
