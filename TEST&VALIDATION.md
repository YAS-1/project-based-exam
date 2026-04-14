# Tested and Validated Endpoints and URLs

This document outlines the specific backend endpoints and frontend URLs selected for testing during Phase Four: Testing and Validation.

## Backend Endpoints (Tested via Postman)

We will use Postman to test the following critical backend endpoints to ensure data integrity, authentication mechanisms, and API contract adherence:

1. **Login Endpoint: Confirms authentication endpoint behavior for valid/invalid credentials.**
   - **Method:** `POST`
   - **URL:** `/api/auth/token/`
   - **Reason for Testing:** Validates the authentication mechanism, ensuring that registered users can successfully obtain JWT tokens for secure access to the platform.

2. **Sign Up Endpoint: Confirms API contract + user model creation/validation.**
   - **Method:** `POST`
   - **URL:** `/api/users/register/`
   - **Reason for Testing:** Verifies the user registration flow, including password validation and successful user creation in the database.

3. **Reviews Endpoint: Confirms review model creation (authenticated) and relation to movie/user.**
   - **Method:** `GET` & `POST`
   - **URL:** `/api/movies/list/<tmdb_id>/reviews/` 
   - **Reason for Testing:** This endpoint handles both fetching existing reviews and submitting new ones. Testing this ensures that authenticated users can successfully post reviews tied to specific movies, and that the data is correctly retrieved.

4. **Database Returning Movies Endpoint (Movie List): Explicit data synchronization test: TMDB -> local DB persistence path.**
   - **Method:** `GET`
   - **URL:** `/api/movies/list/` (and related endpoints like `/api/movies/search/`)
   - **Reason for Testing:** Confirms that the backend correctly retrieves and serves movie data. This is critical for rendering the movie lists efficiently when data already exists locally or needs to be fetched.

5. **Dashboard Stats Endpoint: Confirms aggregation/model logic over interactions/watchlist/preferences.**
   - **Method:** `GET`
   - **URL:** `/api/recommendations/dashboard/`
   - **Reason for Testing:** This endpoint aggregates data on a user's movie interactions (e.g., liked, disliked, watchlist counts). Testing this ensures that the backend successfully packages this user-specific data to be consumed by the frontend dashboard.

## Frontend URLs (Tested via Browser / Jest)

We will test the following specific frontend URLs to ensure seamless user interaction and accurate display of backend data:

1. **Selecting a Movie URL (Movie Detail Page)**
   - **URL Path:** `http://localhost:3000/movie/[id]` (e.g., `http://localhost:3000/movie/550`)
   - **Reason for Testing:** This is the core interaction point where users view movie details. We must verify that the page correctly fetches and displays movie metadata, cast information, and the correct dynamic routing based on the `[id]`.

2. **Reviews URL Rendering**
   - **URL Path:** Rendered within `http://localhost:3000/movie/[id]` (via `<ReviewSection />`)
   - **Reason for Testing:** Since reviews are rendered directly on the movie detail page, we need to test that the UI correctly populates the reviews section and allows authenticated users to interact with the review submission form.

3. **Dashboard URL & Metrics**
   - **URL Path:** `http://localhost:3000/dashboard`
   - **Reason for Testing:** This page displays user-specific metrics such as Watchlist, Liked Movies, and Recent Interactions. Testing this URL ensures that the user's interaction data is correctly synced with the server and displayed accurately on their personal dashboard.
