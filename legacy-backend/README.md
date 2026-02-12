# Code Activity Dashboard - Backend

This is the backend service for the Code Activity Dashboard, a web application designed to track developer coding habits and provide analytics, similar to WakaTime.

## 1. Project Overview & Architecture

The backend is a Django project that provides a stateless RESTful API. It is designed to be the single source of truth for a separate frontend application (e.g., React, Vue).

*   **Architecture**: Stateless Django API.
*   **Authentication**: Stateless authentication using JSON Web Tokens (JWT) for API requests, managed by `django-allauth`.
*   **Key Responsibilities**:
    *   Secure user authentication (manual and social providers like Google/GitHub).
    *   User profile management.
    *   (Upcoming) Logging and processing coding activity events.
    *   (Upcoming) Providing data for analytics and visualizations.

## 2. Tech Stack

*   **Framework**: Django
*   **API**: Django REST Framework (DRF)
*   **Authentication Engine**: `django-allauth` with the `allauth.headless` module for API-first integration.
*   **JWT Handling**: `djangorestframework-simplejwt`
*   **Database**: PostgreSQL
*   **CORS**: `django-cors-headers`

## 3. Local Development Setup

Follow these steps to get the development environment running locally.

### Prerequisites

*   Python 3.10+
*   Git
*   PostgreSQL running locally.

### Setup Steps

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd code-activity-dashboard/server
    ```

2.  **Set Up a Virtual Environment**
    ```bash
    # On macOS/Linux:
    python3 -m venv venv
    source venv/bin/activate

    # On Windows:
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create and Configure the Database**
    Ensure your PostgreSQL server is running, then create a database.
    ```bash
    # Example using psql
    psql -U postgres
    CREATE DATABASE your_db_name;
    \q
    ```

5.  **Configure Environment Variables**
    Create a file named `.env` in the project root (`server/`). It's recommended to copy `env.example` if it exists. Populate it with your credentials.

    ```ini
    # Django's secret key for cryptographic signing. Generate a new one for production.
    DJANGO_SECRET_KEY="your-super-secret-django-key"
    DEBUG="True"

    # PostgreSQL Database Credentials
    DB_NAME="your_db_name"
    DB_USER="your_db_user"
    DB_PASSWORD="your_db_password"
    DB_HOST="localhost"
    DB_PORT="5432"

    # Google OAuth2 Credentials (from Google Cloud Console)
    GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    
    # GitHub OAuth2 Credentials (from GitHub Developer Settings)
    GITHUB_CLIENT_ID="your-github-client-id"
    GITHUB_CLIENT_SECRET="your-github-client-secret"
    ```

6.  **Run Database Migrations**
    Apply the database schema migrations to create your tables.
    ```bash
    python manage.py migrate
    ```

7.  **Create a Superuser (Optional)**
    This is useful for accessing the Django Admin interface.
    ```bash
    python manage.py createsuperuser
    ```

8.  **Run the Development Server**
    ```bash
    python manage.py runserver
    ```
    The backend API will be running at `http://127.0.0.1:8000/`.

---

## 4. Core Concepts for Frontend

Before using the API, it's essential to understand these core concepts.

### JWT Authentication

Once a user is authenticated, the backend provides an `access_token` and a `refresh_token`.

*   The **`access_token`** is short-lived (e.g., 5-15 minutes) and must be included in the `Authorization` header for all protected API requests.
*   The **`refresh_token`** is long-lived (e.g., 1 day) and is used to get a new `access_token` when the old one expires.

**Example Request to a Protected Endpoint:**
```http
GET /api/profile/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer <your_access_token>
```

### The `{client}` Parameter

Many `django-allauth` endpoints include a `{client}` parameter in the URL path. For a web-based Single-Page Application (SPA), this should **always be `browser`**.

Example: `/_allauth/browser/v1/auth/login`

### CSRF Protection

Nearly all endpoints are stateless and protected by the JWT `Authorization` header.

There is **one critical exception**: initiating the social login flow (`/.../provider/redirect`). This endpoint is stateful and is protected by Django's standard CSRF protection to prevent "Login CSRF" attacks.

To use this endpoint, the frontend must first fetch a valid CSRF token.

1.  Make a `GET` request to `/api/csrf-token/`.
2.  The browser will receive a `csrftoken` cookie.
3.  The response body will also contain the token value.
4.  This token value must be included as a hidden field named `csrfmiddlewaretoken` in the `POST` request to the provider redirect endpoint.

---

## 5. API Endpoints Guide

This guide details the primary endpoints needed for the application.

### Authentication

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/csrf-token/` | `GET` | None | Fetches a CSRF token needed for specific stateful actions like social login. |
| `/_allauth/browser/v1/auth/signup` | `POST` | None | Creates a new user. Triggers a verification email. Does not log the user in. |
| `/_allauth/browser/v1/auth/login` | `POST` | None | Authenticates a user with email/password and returns JWTs. |
| `/api/token/refresh/` | `POST` | None | Exchanges a valid `refresh_token` for a new `access_token`. |
| `/api/logout/` | `POST` | JWT | *[To Be Implemented]* Invalidates the user's `refresh_token`. |

### Social Authentication (Browser Flow)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/_allauth/browser/v1/auth/provider/redirect` | `POST` | CSRF | Initiates the social login "redirect dance." Redirects the browser to the provider (Google/GitHub). |

### Account Management

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/_allauth/browser/v1/account/password/change`| `POST` | JWT | Allows an authenticated user to change their password. |
| `/_allauth/browser/v1/auth/password/request` | `POST` | None | Starts the "forgot password" flow by sending a reset link to the user's email. |
| `/_allauth/browser/v1/auth/password/reset` | `POST` | None | Sets a new password using a valid key from the reset email. |
| `/_allauth/browser/v1/account/email` | `GET` | JWT | Lists all email addresses associated with the account. |
| `/_allauth/browser/v1/account/email` | `POST` | JWT | Adds a new email address to the account (will require verification). |

### User Profile (Custom Endpoint)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/profile/` | `GET` | JWT | Retrieves the profile and user details for the currently authenticated user. |
| `/api/profile/` | `PATCH` | JWT | Updates the profile details (e.g., `bio`) or user details (e.g., `full_name`). |

---

## 6. Frontend Implementation Flows

This section provides step-by-step guides for the frontend developer.

### Flow 1: Manual Registration & Login

1.  **Submit Signup Form**: User fills out and submits the registration form.
2.  **Call Signup Endpoint**: Frontend sends a `POST` request to `/_allauth/browser/v1/auth/signup` with `email` and `password`.
3.  **Handle Success (Pending Verification)**: The backend will respond with `401 Unauthorized`. This is **expected**. The response body will indicate that the `verify_email` flow is now pending. The frontend should display a message like "Success! Please check your email to verify your account."
4.  **User Clicks Email Link**: The user opens their email and clicks the verification link, which should point to a page on your frontend (e.g., `/verify-email?key=...`).
5.  **Call Verify Endpoint**: The frontend page extracts the `key` from the URL and sends a `POST` request to `/_allauth/browser/v1/auth/email/verify` with the key.
6.  **Handle Success (Verification Complete)**: The backend will again respond with `401 Unauthorized`. This is **expected** and confirms the user's account is now active. The frontend should now redirect the user to the login page with a success message.
7.  **Submit Login Form**: User logs in with their credentials.
8.  **Call Login Endpoint**: Frontend sends a `POST` to `/_allauth/browser/v1/auth/login`.
9.  **Store Tokens**: The backend responds with `200 OK`, providing `access_token` and `refresh_token`. The frontend must securely store these tokens. The user is now logged in.

### Flow 2: Social Login (Google/GitHub - Browser Flow)

This flow is stateful and requires a CSRF token.

1.  **Fetch CSRF Token**: Before displaying the login page, or just before the user clicks the login button, the frontend makes a `GET` request to `/api/csrf-token/`. This will set a `csrftoken` cookie and return the token value in the response body.
2.  **User Clicks "Login with Google"**: This action triggers a **form submission** (not an XHR/fetch request).
3.  **Submit to Redirect Endpoint**: The frontend submits a standard HTML `<form>` with `method="POST"` to `/_allauth/browser/v1/auth/provider/redirect`. The form must contain the following hidden inputs:
    *   `provider`: "google" or "github"
    *   `callback_url`: The full URL on your frontend where the user should be sent after a successful login (e.g., `http://localhost:5173/dashboard`).
    *   `csrfmiddlewaretoken`: The token value obtained in Step 1.
4.  **The Redirect Dance**: The browser's window will navigate through the following sequence automatically:
    *   `POST`s to your Django backend.
    *   Django validates the request and redirects to the Google/GitHub authentication screen.
    *   The user signs in and grants permission.
    *   Google/GitHub redirects back to a callback URL on your Django backend.
    *   Django processes the callback, creates/logs in the user, and finally redirects the browser to the `callback_url` you provided in Step 3.
5.  **Login Complete**: The user's browser is now at the destination page (e.g., `/dashboard`). Your `JWTTokenStrategy` will have delivered the JWTs (likely via secure, `HttpOnly` cookies). The frontend should now make a request to a protected endpoint like `/api/profile/` to get the user's data and update the UI.

### Flow 3: Handling Expired Access Tokens

1.  **API Call Fails**: The frontend makes a request to a protected endpoint (e.g., `/api/profile/`) with an expired `access_token`. The server responds with `401 Unauthorized`.
2.  **Call Refresh Endpoint**: An API client interceptor should catch this `401` error. It then makes a `POST` request to `/api/token/refresh/`, sending the stored `refresh_token`.
3.  **Receive New Token**: The backend validates the refresh token and returns a **new** `access_token` (and potentially a new `refresh_token` if rotation is enabled).
4.  **Store New Token & Retry**: The interceptor updates the stored `access_token` with the new one and automatically retries the original API request that failed. This entire process should be seamless to the user.

## 7. Full API Reference

For a complete and exhaustive list of all available API endpoints, including detailed request/response schemas, error codes, and parameters, please refer to the official documentation.

> **Refer to:** [Official django-allauth Headless OpenAPI Documentation](https://docs.allauth.org/en/latest/headless/openapi-specification/)