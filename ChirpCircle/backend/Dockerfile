# ======================
# Stage 1: Builder Stage
# ======================
FROM node:22.8.0 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Set TEST_MODE environment variable before running tests
ENV TEST_MODE=EXPIRATION
# Run the tests
RUN npm test

# =========================
# Stage 2: Production Stage
# =========================
FROM node:22.8.0 AS production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]

