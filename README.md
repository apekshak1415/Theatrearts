**Step-by-Step Project Execution Guide
Prerequisites**
Make sure these are installed:
Node.js (v14 or higher)
MongoDB
A browser (like Chrome)
A code editor (e.g., VS Code)

**Step 1**: Clone the GitHub Repository
git clone https://github.com/your-username/your-repo-name.gitcd your-repo-name

**Step 2:** Install Node.js Dependencies
Make sure you’re inside the project folder (where server.js exists):
npm install
This installs all required packages (like express, mongoose, bcrypt, cors).

** Step 3:** Start MongoDB Locally
Open a separate terminal and run:
mongod
> Make sure MongoDB is running on default port 27017.

**Step 4:** Start the Backend Server
Go back to your project terminal and run: cd backend
> node server.js

You should see:
Server running on port 3000
MongoDB connected
> Your server will now be running at: http://localhost:3000

**Step 5:** Open the Frontend Pages
Open these files directly in your browser (double-click or open in VS Code with Live Server):
artist-auth.html → Artist signup/login
admin-auth.html → Admin signup/login
user-auth.html → User signup/login
artist-dashboard.html → Artist dashboard (after login)
