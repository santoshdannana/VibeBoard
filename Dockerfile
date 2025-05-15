# Use the official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port
EXPOSE 5000

# Start the app with gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
