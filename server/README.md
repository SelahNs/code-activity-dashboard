# Code Activity Dashboard - Backend

This is the backend service for the Code Activity Dashboard, a web application designed to track developer coding habits and provide analytics, similar to WakaTime.

The backend is a Django project that provides a stateless RESTful API for user authentication (manual and social), profile management, and logging coding activity events.

## Core Features (Implemented)

*   **Manual User Authentication**: Secure user sign-up with email and password, including mandatory email verification.
*   **Social Authentication**: Seamless user sign-up and login with providers like Google and GitHub.
*   **API Authentication**: Stateless API authentication using JSON Web Tokens (JWT).
*   **User Profile Management**: API endpoints for users to view and update their personal profiles.

## Tech Stack

*   **Framework**: Django
*   **API**: Django REST Framework (DRF)
*   **Authentication Engine**: `django-allauth` with the `allauth.headless` module for API-first integration.
*   **JWT Handling**: `djangorestframework-simplejwt`
*   **Database**: PostgreSQL

## Setup and Installation

Follow these steps to get the development environment running locally.

### 1. Prerequisites

*   Python 3.10+
*   Git
*   PostgreSQL

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd code-activity-dashboard/server
```

### 3. Set Up a Virtual Environment

```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
.\venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a file named `.env` in the project root (`server/`). Add the following variables, replacing the placeholder values with your actual credentials.

```ini
# Django's secret key for cryptographic signing.
DJANGO_SECRET_KEY="your-super-secret-django-key"

# PostgreSQL Database Credentials
DB_NAME="your_db_name"
DB_USER="your_db_user"
DB_PASSWORD="your_db_password"
DB_HOST="localhost"
DB_PORT="5432"

# Google OAuth2 Credentials (get these from the Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# The base URL of your React/Vue/etc. frontend application
FRONTEND_URL="http://localhost:3000"
```

### 6. Run Database Migrations

Apply the database schema migrations to create your tables.

```bash
python manage.py migrate
```

### 7. Run the Development Server

```bash
python manage.py runserver
```

The backend API will be running at `http://127.0.0.1:8000/`.

---

## API Endpoints

All endpoints are prefixed with `/_allauth/app/v1/`.

### Authentication

#### Manual Registration

*   **Endpoint**: `POST /_allauth/app/v1/signup`
*   **Description**: Creates a new, inactive user account and triggers a verification email.
*   **Response on Success**: `401 Unauthorized`. This is **expected behavior**. The response body indicates that the `verify_email` flow is now pending. The user is not authenticated until their email is verified and they log in.
*   **Request Body**:
    ```json
    {
        "email": "newuser@example.com",
        "password": "a-strong-password"
    }
    ```

#### Email Verification

*   **Endpoint**: `POST /_allauth/app/v1/auth/email/verify`
*   **Description**: Verifies a user's email address using the key sent to them. This activates the user's account.
*   **Response on Success**: `401 Unauthorized`. **Expected behavior**. This confirms the user is now active, but the verification action does not log them in. The next step is to log in.
*   **Request Body**:
    ```json
    {
        "key": "the-key-from-the-verification-email-link"
    }
    ```

#### Manual Login (Get JWTs)

*   **Endpoint**: `POST /_allauth/app/v1/auth/login`
*   **Description**: Authenticates an active user with their email and password and returns JWTs.
*   **Request Body**:
    ```json
    {
        "email": "verifieduser@example.com",
        "password": "the-user-password"
    }
    ```
*   **Success Response (`200 OK`)**:
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": { ... }
    }
    ```

#### Social Login / Signup (Google, GitHub, etc.)

*   **Endpoint**: `POST /_allauth/app/v1/auth/provider/token`
*   **Description**: Receives an `access_token` obtained from a social provider by the frontend. The backend validates this token, creates a new user if one doesn't exist, and returns JWTs.
*   **Request Body**:
    ```json
    {
        "provider": "google",
        "token": "the-access-token-obtained-by-the-frontend"
    }
    ```
*   **Success Response (`200 OK`)**:
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": { ... }
    }
    ```

### User Profile

#### Retrieve or Update User Profile

*   **Endpoint**: `GET /api/profile/`, `PUT /api/profile/`, `PATCH /api/profile/`
*   **Description**:
    *   `GET`: Retrieves the profile details of the currently authenticated user.
    *   `PUT`/`PATCH`: Updates the profile details of the currently authenticated user.
*   **Authentication**: **JWT Required**. The request must include an `Authorization` header.
    ```
    Authorization: Bearer <your_access_token>
    ```

---

## Frontend Authentication Flows

This section describes the end-to-end authentication flows that the frontend needs to implement.

### Social Login (Google) Flow

1.  **Step 1: Frontend Initiates Google Login**:
    The user clicks a "Login with Google" button. The frontend uses a library (e.g., `@react-oauth/google`) to handle the Google login pop-up and the entire OAuth 2.0 flow.

2.  **Step 2: User Authenticates with Google**: The user signs in with their Google account and grants permission in the pop-up.

3.  **Step 3: Google Returns `access_token` to Frontend**: Google's servers respond directly to the frontend library, providing a short-lived `access_token`.

4.  **Step 4: Frontend Sends Token to Backend**: The frontend takes the `access_token` it just received from Google and makes a `POST` request to the backend's provider endpoint: `/_allauth/app/v1/auth/provider/token`.

5.  **Step 5: Backend Returns Its Own JWTs**: The backend verifies Google's token, logs in or creates the user, and returns its own `access_token` and `refresh_token` in the response.

6.  **Step 6: Frontend Saves Tokens**: The frontend securely stores these new JWTs (e.g., in `localStorage`). The user is now authenticated with our application.

### Manual Registration Flow

1.  **Step 1: Frontend sends signup data** to `POST /_allauth/app/v1/signup`.
2.  **Step 2: Frontend handles the `401` response** by interpreting it as a successful signup and displays a "Please check your email to verify your account" message to the user.
3.  **Step 3: User clicks the link in their email**, which navigates them to a verification page on the frontend (e.g., `/verify-email/:key`).
4.  **Step 4: The verification page extracts the key** from the URL and sends it to `POST /_allauth/app/v1/auth/email/verify`.
5.  **Step 5: Frontend handles the `401` response** by interpreting it as a successful verification and redirects the user to the login page.
6.  **Step 6: User logs in**, and the frontend makes the final call to `POST /_allauth/app/v1/auth/login` to receive the application's JWTs.