#!/usr/bin/env python
import os
import sys
import time
import socket

def wait_for_postgres(host='localhost', port=5432, retries=10, delay=2):
    """Wait for Postgres to become available before starting Django."""
    for i in range(retries):
        try:
            with socket.create_connection((host, port), timeout=2):
                print(f"✅ Connected to Postgres at {host}:{port}")
                return True
        except OSError:
            print(f"⚠️  Postgres not available (attempt {i + 1}/{retries}), retrying in {delay}s...")
            time.sleep(delay)
    print(f"❌ Could not connect to Postgres at {host}:{port} after {retries} attempts.")
    return False


if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        if not wait_for_postgres():
            sys.exit("Database not available. Start Postgres and try again.")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH?"
        ) from exc

    execute_from_command_line(sys.argv)
