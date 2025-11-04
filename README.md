# The Prancing Pony

A vendor-customer relationship tracking application built with FastAPI and React.

**Note:** This is an example application used for pair-programming exercises during Rekap's technical interviews.

## Project Structure

```
.
├── app/                    # Backend FastAPI application
│   ├── api/               # API endpoints
│   │   ├── vendors.py     # Vendor endpoints
│   │   └── customers.py   # Customer endpoints
│   ├── models/            # Database models
│   │   ├── vendor.py
│   │   └── customer.py
│   ├── services/          # Business logic
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── vendor_service.py
│   │   └── customer_service.py
│   ├── config.py          # Configuration
│   ├── database.py        # Database setup
│   └── main.py            # FastAPI app entry point
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── pages/         # React pages/components
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Tailwind CSS
│   └── package.json
├── alembic/               # Database migrations
│   └── versions/          # Migration scripts
├── pyproject.toml         # Python dependencies
├── alembic.ini            # Alembic configuration
├── .env.example           # Environment variables template
└── README.md
```

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **SQLite**: Lightweight database
- **Pydantic**: Data validation using Python type hints
- **Uvicorn**: ASGI server

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

## Setup Instructions

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- Poetry (for Python dependency management)

### Backend Setup

1. Install Poetry (if not already installed):
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Install Python dependencies:
```bash
poetry install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your API keys (if needed for interview exercises):
```bash
# Add your API keys to .env
OPENAI_API_KEY=your_key_here
```

5. Run database migrations:
```bash
poetry run alembic upgrade head
```

6. Run the backend server:
```bash
poetry run python -m app.main
```

Or using uvicorn directly:
```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative API Documentation: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Vendors
- `GET /api/vendors/` - List all vendors
- `GET /api/vendors/{id}` - Get vendor by ID
- `POST /api/vendors/` - Create new vendor
- `PUT /api/vendors/{id}` - Update vendor
- `DELETE /api/vendors/{id}` - Delete vendor

### Customers
- `GET /api/customers/` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers/` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

## Development

### Running Tests (Backend)
```bash
poetry run pytest
```

### Building Frontend for Production
```bash
cd frontend
npm run build
```

### Code Formatting
The project follows standard Python (PEP 8) and TypeScript/React conventions.

## Database

The application uses SQLite by default with the database file `prancing_pony.db`. The database schema is managed using Alembic migrations.

### Database Migrations

The project uses Alembic for database migrations. This allows you to version control your database schema changes.

**Initial Setup:**
```bash
poetry run alembic upgrade head
```

**Creating a New Migration:**
After modifying models in `app/models/`, generate a migration:
```bash
poetry run alembic revision --autogenerate -m "Description of changes"
```

**Applying Migrations:**
```bash
poetry run alembic upgrade head
```

**Rolling Back Migrations:**
```bash
poetry run alembic downgrade -1  # Go back one migration
poetry run alembic downgrade base  # Go back to the beginning
```

**Viewing Migration History:**
```bash
poetry run alembic history
poetry run alembic current  # Show current version
```

**Resetting the Database:**
To completely reset the database:
```bash
rm prancing_pony.db
poetry run alembic upgrade head
```

### Test Data

The project includes scripts to export and import test data for development and testing purposes.

**Loading Test Data:**
```bash
poetry run python scripts/import_db.py test_data/test_data.json
```

This will:
- Clear all existing data in the database
- Import pre-configured test data including customers, events, and AI-generated summaries
- Prompt for confirmation before proceeding

**Exporting Current Data:**
```bash
poetry run python scripts/export_db.py test_data/test_data.json
```

This exports all database contents to a JSON file for backup or sharing test scenarios.

## Features

- **Vendor Management**: Track vendor information including contact details, email, phone, and notes
- **Customer Management (B2B)**: Manage customer organizations with industry, website, primary contacts, and more
- **Database Migrations**: Version-controlled schema changes using Alembic
- **RESTful API**: Clean API design with full CRUD operations
- **Modern UI**: Responsive interface built with React and TailwindCSS
- **Type Safety**: TypeScript on frontend, Pydantic validation on backend

## About This Project

This is a sample application created for Rekap's technical interview process. It provides a working full-stack application that candidates can extend and modify during pair-programming sessions.

## License

This project is open source and available under the MIT License.
