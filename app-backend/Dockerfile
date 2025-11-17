# --- Builder Stage ---
FROM python:3.10-slim As builder
WORKDIR /app
COPY requirements.txt .
RUN python -m venv /venv && \
	/venv/bin/pip install --no-cache-dir -r requirements.txt

#stage-2
FROM python:3.10-slim
WORKDIR /app
COPY . .
COPY app.py .
ENV PATH="/venv/bin:$PATH"
COPY --from=builder /venv /venv
EXPOSE 5000
CMD ["python", "app.py"]

# This is a comment to force a file change