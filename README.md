
# Travelling Salesman Frontend

A web application that optimizes job assignments for salesmen using the traveling salesman algorithm.

## Features

- Upload Jobs and Salesmen data via CSV or Excel files
- Review and validate uploaded data
- Process job assignments using an optimization algorithm
- View assignment results in a sortable, filterable table
- Export results to CSV for further analysis

## Data Format

### Jobs Data

Each job record should include:
- `job_id`: Unique identifier for the job
- `date`: Date the job needs to be completed
- `location`: GPS coordinates (latitude, longitude)
- `duration_mins`: Estimated duration of service in minutes
- `entry_time`: Earliest time for starting the job
- `exit_time`: Latest time for completing the job

### Salesmen Data

Each salesman record should include:
- `salesman_id`: Unique identifier for the salesman
- `home_location`: Starting GPS coordinates (latitude, longitude)
- `start_time`: Earliest available start time
- `end_time`: Latest available end time

## Getting Started

1. Upload your Jobs and Salesmen files in CSV or Excel format
2. Review the parsed data to ensure accuracy
3. Submit the data for assignment processing
4. View and export the optimized job assignments

## API Integration

The application sends the processed data to an API endpoint (`travelling-salesman-backend.com/assign_jobs`) and displays the optimized job assignments when received. For development purposes, a mock response is used when the API is not available.

## Technologies Used

- React & TypeScript
- Tailwind CSS for styling
- shadcn/ui for UI components
- Papa Parse for CSV parsing
- XLSX for Excel file parsing
- Framer Motion for animations

## Development

**Install dependencies:**
```sh
npm install
```

**Run the development server:**
```sh
npm run dev
```


## File Structure

The project directory contains the following files and folders:

- **/src**: Contains the source code of the application.
    - **/components**: 
        - **DataTable.tsx**: A component for displaying data in a table format.
        - **FileUpload.tsx**: A component for uploading files.
        - **Map.tsx**: A component for displaying a map.
    - **/services**: 
        - **api.ts**: Contains functions for making API calls to the backend.
    - **/utils**: 
        - **fileParser.ts**: Contains utility functions for parsing files.
    - **App.tsx**: The main application component that sets up the routing and layout.
    - **index.css**: The main CSS file for the application.
    - **main.tsx**: The entry point of the application that renders the root component.
    - **types.ts**: TypeScript type definitions used throughout the application.
    - **vite-env.d.ts**: TypeScript declaration file for Vite.
- **/test/data**: Contains the source code of the application.
    - **Jobs_Test_Data.csv**: Test data file containing job information.
    - **Salesmen_Test_Data.csv**: Test data file containing salesman information.
- **eslint.config.js**: Configuration file for ESLint, a tool for identifying and fixing linting issues in the code.
- **index.html**: The main HTML file that serves as the entry point for the application.
- **package-lock.json**: Automatically generated file that describes the exact dependency tree installed in `node_modules`.
- **package.json**: Contains the project metadata and dependencies.
- **postcss.config.js**: Configuration file for PostCSS, a tool for transforming CSS with JavaScript plugins.
- **tailwind.config.js**: Configuration file for Tailwind CSS, a utility-first CSS framework.
- **tsconfig.app.json**: TypeScript configuration file for the application.
- **tsconfig.json**: Base TypeScript configuration file.
- **tsconfig.node.json**: TypeScript configuration file for Node.js.
- **vite.config.ts**: Configuration file for Vite, a build tool that provides a faster and leaner development experience.

