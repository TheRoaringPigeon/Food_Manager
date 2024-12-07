FROM food_manager_alpine:dev

WORKDIR /app

COPY requirements.txt .

RUN apk update && apk add \
        python3 python3-dev py3-pip && \
    python3 -m venv /app/venv && \
    . /app/venv/bin/activate && \
    pip install -r requirements.txt

RUN addgroup -g 531 andrew && \
    adduser -D -G andrew -u 531 andrew && \
    chown -R andrew:andrew /app

COPY . .    

RUN chmod +x /app/entrypoint.sh

USER andrew

EXPOSE 8001

ENTRYPOINT ["/app/entrypoint.sh"]