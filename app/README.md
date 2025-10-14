# Django Food Management System

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate --fake-initial
   python manage.py migrate
   ```

4. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   # or `python manage.py loaddata superuser.json`
   ```

5. **Run the server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

- **Ingredients:** `/api/ingredients/`
- **Recipes:** `/api/recipes/`
- **Inventory:** `/api/inventory/`
- **Prepared Food:** `/api/prepared-food/`

Visit `http://localhost:8000/api/` for the interactive API browser.

## Admin Panel

Visit `http://localhost:8000/admin/` to access the admin interface.
