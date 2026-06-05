# Stage 1: Build the React frontend SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Set up the Python FastAPI backend
FROM python:3.10-slim
WORKDIR /app

# Install compiler dependencies for scikit-learn/numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python packages
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy static frontend assets built in stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

# Configure production defaults
ENV DB_TYPE=mysql
ENV MYSQL_HOST=db
ENV MYSQL_PORT=3306
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=Tanay@232005
ENV MYSQL_DATABASE=smart_hospital_energy
ENV FLASK_PORT=5000
ENV FLASK_DEBUG=False
ENV MQTT_ENABLED=True
ENV MQTT_BROKER=broker.hivemq.com

# Start the uvicorn API gateway serving the SPA fallback
CMD ["python", "backend/app.py"]
