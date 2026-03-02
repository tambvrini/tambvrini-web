FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN pip install -r backend/requirements.txt

CMD ["sh", "-c", "python -m uvicorn backend.server:app --host 0.0.0.0 --port $PORT"]
