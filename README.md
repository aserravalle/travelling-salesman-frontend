# Travelling Salesman Frontend

This project is the front-end application for the **Travelling Salesman Problem (TSP)** solution. It allows users to upload job and salesman data via CSV or Excel files, processes the data, and communicates with a backend API to assign jobs to salesmen. The results are then displayed and can be downloaded as a CSV file.

---

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Node.js installation includes npm (Node Package Manager).

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app by starting the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to **http://localhost:5173**.

---

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


---

## Tech Stack

### JSX Syntax

- **Description**: JSX (JavaScript XML) is a syntax extension for JavaScript that looks similar to XML or HTML. It is used with React to describe what the UI should look like.
- **Usage**: JSX allows you to write HTML elements in JavaScript and place them in the DOM without using methods like `createElement()` or `appendChild()`.
- **Example**:
  ```jsx
  const element = <h1>Hello, world!</h1>;
  ```

### Tailwind CSS

- **Description**: Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing custom CSS.
- **Usage**: Tailwind CSS allows you to apply styles directly in your HTML or JSX by using predefined classes.
- **Example**:
  ```jsx
  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Button
  </button>
  ```

### React Hooks

- **Description**: React hooks are functions that let you use state and other React features in functional components. They allow you to manage state, side effects, context, refs, and more.
- **Usage**: Hooks like `useState` and `useEffect` are commonly used to manage component state and side effects.
- **Example**:
  ```jsx
  import React, { useState, useEffect } from 'react';

  function ExampleComponent() {
    const [count, setCount] = useState(0);

    useEffect(() => {
      document.title = `You clicked ${count} times`;
    }, [count]);

    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
      </div>
    );
  }
  ```

### Lucide React

- **Description**: Lucide React is a library of icons for React applications. It provides a collection of customizable icons that can be easily integrated into your React components.
- **Usage**: You can import and use icons from Lucide React in your components.
- **Example**:
  ```jsx
  import { Home } from 'lucide-react';

  function IconComponent() {
    return <Home color="blue" size={24} />;
  }
  ```

### Unsplash

- **Description**: Unsplash is a website that provides high-quality, freely usable images. You can use Unsplash to source stock photos via valid URLs.
- **Usage**: You can fetch images from Unsplash and use them in your application.
- **Example**:
  ```jsx
  const imageUrl = 'https://source.unsplash.com/random/800x600';

  function ImageComponent() {
    return <img src={imageUrl} alt="Random from Unsplash" />;
  }
  ```

---
