# Website Freelancing Control Panel

This directory contains the UI and mock API for the "Website Freelancing" project control panel.

## How It Works

The interface is divided into three main panels: Dashboard, Admin, and Team. Access is initiated from the "Phase 0" project list, which opens a modal to select a panel.

-   **Dashboard (`/dashboard`)**: A read-only overview of project financials and activity.
-   **Admin (`/admin`)**: A passcode-protected area for managing clients, costs, and payments.
-   **Team (`/team`)**: A passcode-protected area for team members to manage their personal ledger for project-related expenses.

## How to Integrate a Real Backend

The current UI is powered by a mock API located in `src/lib/api.ts`, which returns static data from `src/lib/mock-data.json`. To connect this to a real backend (like Google Sheets via Apps Script), follow these steps:

1.  **Create your Backend Endpoints**:
    Deploy a web app using Google Apps Script or another service that exposes RESTful endpoints corresponding to the functions in `src/lib/api.ts`. The expected endpoints and JSON shapes are:
    -   `GET /api/projects/website-freelancing/summary`
    -   `GET /api/projects/website-freelancing/clients`
    -   `POST /api/projects/website-freelancing/clients/create`
    -   `POST /api/projects/website-freelancing/costs/update`
    -   `GET /api/projects/website-freelancing/payments?projectId=...`
    -   `POST /api/projects/website-freelancing/payments/add`
    -   `GET /api/projects/website-freelancing/team-ledger?memberId=...`
    -   `POST /api/projects/website-freelancing/team/add-entry`
    -   `GET /api/projects/website-freelancing/logs?projectId=...`

2.  **Update API Functions**:
    Open `src/lib/api.ts`. Replace the content of each function to use `fetch` to call your real API endpoints.

    For example, to connect `getSummary`:

    ```typescript
    // src/lib/api.ts

    // Replace this:
    // import mockData from './mock-data.json';
    // export async function getSummary() {
    //     await delay(500);
    //     return mockData.summary;
    // }

    // With this:
    export async function getSummary() {
        const response = await fetch('YOUR_API_ENDPOINT/summary');
        if (!response.ok) {
            throw new Error('Failed to fetch summary');
        }
        return response.json();
    }
    ```

3.  **Repeat for all functions** in `src/lib/api.ts`, updating the `fetch` URL for each one.

## How to Change Passcodes

The passcodes for the Admin and Team panels are managed by the `<PasscodeProtect>` component. You can change them directly in the code.

-   **Admin Passcode**: Open `src/app/projects/website-freelancing/admin/page.tsx` and change the `passcode` prop.
    ```tsx
    <PasscodeProtect
        // ...
        passcode="NEW_ADMIN_PASSCODE"
    >
        <AdminContent/>
    </PasscodeProtect>
    ```

-   **Team Passcode**: Open `src/app/projects/website-freelancing/team/page.tsx` and change the `passcode` prop.
    ```tsx
    <PasscodeProtect
        // ...
        passcode="NEW_TEAM_PASSCODE"
    >
        <TeamContent />
    </PasscodeProtect>
    ```

Authentication status is stored in `localStorage` under the keys `admin-passcode-auth` and `team-passcode-auth`. To force a re-login for all users, you would need them to clear their browser's local storage for your site.
