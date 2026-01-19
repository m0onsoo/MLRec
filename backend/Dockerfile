
# Use Python 3.10 slim image for a smaller footprint
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies (none strictly needed for now, but good practice)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# We use --no-cache-dir to keep image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code (This includes app/data with all necessary files)
COPY backend/ ./backend/

# RecBole/benchmark are no longer needed as we decoupled dependencies

# Expose the port
EXPOSE 8000

# Set environment variables
# Ensure python path sees the current directory
ENV PYTHONPATH=/app

# Command to run the application
# We run from /app, so module path is backend.app.main
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
