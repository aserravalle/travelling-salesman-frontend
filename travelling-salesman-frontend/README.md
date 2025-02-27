# Travelling Salesman Frontend

This project is a frontend application for a Travelling Salesman problem solver. It allows users to upload job and salesman data in CSV or Excel format, processes the data, and displays the results of job assignments.

## Project Structure

```
travelling-salesman-frontend
├── public
│   ├── index.html          # Main HTML entry point
├── src
│   ├── components          # React components
│   │   ├── FileUpload.tsx  # Component for file uploads
│   │   ├── JobList.tsx     # Component to display jobs
│   │   ├── SalesmanList.tsx # Component to display salesmen
│   │   └── ResultDisplay.tsx # Component to display results
│   ├── services            # API service functions
│   │   └── api.ts          # Functions for API calls
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point for the React application
│   └── styles
│       └── App.css         # CSS styles for the application
├── package.json             # npm configuration file
├── tsconfig.json            # TypeScript configuration file
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd travelling-salesman-frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to view the application.

## Usage

- Upload the Jobs and Salesmen files using the provided file upload component.
- The application will process the uploaded data and display the results, including assigned and unassigned jobs.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.