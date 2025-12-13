# Arena

![Arena logo/banner](https://hc-cdn.hel1.your-objectstorage.com/s/v3/5c33419f6692b32263773f195fb459b621d161c1_arena__5_.png)

A project submission and voting platform for events hosted by the Special Activities Division (SAD), Hack Club!

## Features

- **Slack Authentication:** Secure login using Slack.
- **Project Submission:** Submit your project with demo URL, source code, image, project name, and description.
- **HackaTime Integration:** Optionally link your HackaTime projects and display total time spent.
- **Project Gallery:** Browse all submitted projects in a clean, card-based gallery.
- **Voting System:** Vote for your favorite projects in multiple categories (Creativity, Fun, Accessibility).
- **Admin Live Leaderboard:** To view real-time results of the voting process.
- **Admin Panel:** For viewing submissions, users, and analytics.

## Local Setup

### Prerequisites
- Node.js 14+ and npm

### Backend
```bash
cd arena-backend
npm install
npm start
```

Create a `.env` file in `arena-backend/` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:5000/auth/slack/callback
```

### Frontend
```bash
cd arena-frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000` and connect to the backend on `http://localhost:5000`.

## Credits

[CSS Sword](https://codepen.io/judag/full/VrpywV/)

Made by [Irtaza](https://irtaza.xyz/)
