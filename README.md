# StyleSync

StyleSync is a web application that provides fashion recommendations and a platform for fashion enthusiasts. It features an AI-powered stylist that suggests outfits based on user-uploaded images and preferences, a shopping section with recommended and admin-added products, and a "Fashion Fest" section for discovering local fashion events.

## Features

* **AI Stylist**: Get personalized fashion recommendations by uploading an image and specifying the season and occasion. The AI analyzes your features to suggest suitable outfits.
* **Shopping Collection**: Browse and purchase clothing items. The shop includes both AI-recommended products and items added by administrators.
* **Fashion Fest**: Discover and share information about upcoming fashion events in your area. Users can upvote events they are interested in.
* **User Authentication**: Secure user and admin authentication system.
* **Admin Dashboard**: A dedicated dashboard for administrators to manage products and fashion fests.

## Technologies Used

### Frontend

* **React**: A JavaScript library for building user interfaces.
* **Vite**: A fast build tool for modern web development.
* **Axios**: A promise-based HTTP client for the browser and Node.js.
* **Lucide-React**: A library of simply designed icons.
* **Bootstrap**: A popular CSS framework for building responsive and mobile-first websites.

### Backend

* **Django**: A high-level Python web framework that encourages rapid development and clean, pragmatic design.
* **Django REST Framework**: A powerful and flexible toolkit for building Web APIs.
* **Node.js & Express**: Used for the primary backend server, handling user authentication, product management, and orders.
* **MongoDB & Mongoose**: A NoSQL database and an Object Data Modeling (ODM) library for MongoDB and Node.js.
* **jsonwebtoken & bcryptjs**: For implementing user authentication and password hashing.

### AI & Machine Learning

* **FashionCLIP**: An open-source model for fashion-specific image and text embeddings.
* **InsightFace**: A library for 2D and 3D face analysis.
* **OpenCV & PyTorch**: Libraries for computer vision and machine learning.

## Setup and Installation

### Prerequisites

* Node.js and npm
* Python and pip
* MongoDB

### Frontend (Vite + React)

1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`

### Backend (Node.js + Express)

1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Start the server: `nodemon server.js`

### AI Server (Django)

1.  Navigate to the `fashion_project` directory:
2.  Install Python dependencies: `pip install -r requirements.txt`
3.  Start the Django server: `python manage.py runserver 8001`

## Usage

1.  **User Registration/Login**: Create an account or log in as a user or admin.
2.  **AI Stylist**: Navigate to the "AI Stylist" page, upload an image, select the season and usage, and get personalized recommendations.
3.  **Shop**: Browse the "Shop" page to see recommended and other available products. Add items to your bag and proceed to checkout.
4.  **Fashion Fest**: View upcoming fashion events on the "Fashion Fest" page. Logged-in users can also add new events and upvote existing ones.
5.  **Admin Panel**: Admins can log in to access the admin dashboard to manage products and fests.
