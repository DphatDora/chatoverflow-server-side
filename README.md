<div align="center">

  <div>
    <!-- <img src="https://img.shields.io/badge/-React-black?style=for-the-badge&logo=react&logoColor=white&color=61DAFB" alt="react" />     -->
    <img src="https://img.shields.io/badge/-Express-black?style=for-the-badge&logo=express&logoColor=white" alt="express" />
<img src="https://img.shields.io/badge/-MongoDB-black?style=for-the-badge&logo=mongodb&logoColor=white&color=47A248" alt="mongodb" />
<!-- <img src="https://img.shields.io/badge/-TailwindCSS-black?style=for-the-badge&logo=tailwindcss&logoColor=white&color=06B6D4" alt="tailwind css" /> -->

  </div>

  <h3 align="center">Group 1</h3>

   <div align="center">
    <p>
        Labor of love — Group1's ChatOverFlow server-side.
    </p>
    </div>
</div>

## Introduction

Temporarily blank content...

## Features

Some highlights include:

<!-- -  MDX-powered posts — write articles that seamlessly blend Markdown and React components.
-  Custom interactive elements — from visual demos to playful UI experiments.
-  React ecosystem — built with React, Next.js, and styled with a clean, reusable design. -->

## Tech Stack

-  Express.js
-  MongoDB
-  ...

## Running Locally

> [!NOTE]
> For dev member, you need to folk this repo and follow the open-source workflow to contribute.
> Simply `folk` &rarr; `commit changes` &rarr; `open pull request`.

Our server is live at [ChatOverflow-Server-Side](https://nvhoaidt.vercel.app/). For running locally, follow these steps to set up the project on your machine.

**Prerequisites**

This project was build with Node.js, so make sure you have the following installed on your machine:

-  [Git](https://git-scm.com/)
-  [Node.js](https://nodejs.org/en)
-  [npm, yarm or pnpm (recommended)](https://www.npmjs.com/)

> [!NOTE]
> While you can run this project using any package manager, I highly recommend using [`pnpm`](https://pnpm.io/) as your package manager, as it's faster and more efficient than `npm` or `yarn`.

**Cloning the Repository**

```bash
git clone https://github.com/HCMUTE-MTSE/chatoverflow-server-side
cd chatoverflow-server-side
```

**Installation**

Install the project dependencies using pnpm:

```bash
pnpm install
```

**Connect Database**

You need to create your .env file and establish your mongodb connection.

**Setup `.env`**

See example in `sample/.env.sample`. You'll need to create your own `.env` file and fullfill it with your own.

### Basic Configuration

```bash
MONGODB_URI= your_mongodb_connection_URI
JWT_SECRET= your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES=7d
```

### **Email Configuration**

Configure email settings for OTP authentication:

```bash
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

#### **Setup Gmail App Password**

Follow these steps to configure `EMAIL_USER` and `EMAIL_PASS`:

**Step 1: Sign in to Google Account**

1. Visit [Google Account](https://myaccount.google.com) and log in with your Gmail account
2. Navigate to **Security**

**Step 2: Enable 2-Step Verification**

1. Find **2-Step Verification** under the "Signing in to Google" section
2. Enable it if you haven't already

**Step 3: Create an App Password**

1. Scroll down and look for **App passwords**
2. Click on **App passwords** (you may need to log in again)
3. Choose the app (e.g., Mail) and device (or select **Other** and enter a custom name like "ChatOverflow")
4. Click **Generate**

**Step 4: Copy App Password**

1. Google will generate a 16-character app password (e.g., `abcd efgh ijkl mnop`)
2. Copy and save it safely — it will only be shown once

### **Complete `.env` Example**

```bash
MONGODB_URI=mongodb://localhost:27017/chatoverflow
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES=7d
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Running the Project**

Run with nodemon:

```bash
pnpm run dev
```

Run with plain node:

```bash
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to takle with the server.

**Route map**

```
http://localhost:3000/auth/login
http://localhost:3000/auth/signup
http://localhost:3000/auth/forgot-password
```

**Tesing**
Forgot password:

```
POST /auth/forgot-password { email }
POST /auth/forgot-password/reset-password &rarr body { email, otp, newPassword }
```

**Project Tree**

<details>
  <summary>View source tree</summary>

```
chatoverflow-server
├─ api
│  └─ index.js
├─ app
│  ├─ config
│  │  ├─ app.conf.js
│  │  ├─ auth.conf.js
│  │  ├─ db.conf.js
│  │  ├─ init.js
│  │  └─ _docs.txt
│  ├─ controller
│  │  ├─ auth
│  │  │  ├─ ForgotPassword.controller.js
│  │  │  ├─ Login.controller.js
│  │  │  ├─ Logout.controller.js
│  │  │  └─ Signup.controller.js
│  │  ├─ topic
│  │  │  ├─ Question.controller.js
│  │  │  └─ Sample.controller.js
│  │  ├─ user
│  │  │  ├─ Sample.controller.js
│  │  │  └─ UserInfo.controller.js
│  │  └─ _docs.txt
│  ├─ database
│  │  ├─ init.js
│  │  ├─ Mongo.database.js
│  │  ├─ seeders
│  │  │  ├─ seedAnswers.js
│  │  │  ├─ seedQuestions.js
│  │  │  └─ seedUsers.js
│  │  └─ _docs.txt
│  ├─ dto
│  │  ├─ Address.dto.js
│  │  ├─ req
│  │  │  ├─ login.request.js
│  │  │  ├─ signup.request.js
│  │  │  └─ user.request.js
│  │  └─ res
│  │     ├─ api.response.js
│  │     ├─ login.response.js
│  │     ├─ signup.response.js
│  │     └─ user.response.js
│  ├─ middleware
│  │  ├─ App.middleware.js
│  │  ├─ ErrorHandler.middleware.js
│  │  ├─ init.js
│  │  └─ _docs.txt
│  ├─ models
│  │  ├─ Answer.model.js
│  │  ├─ Credential.model.js
│  │  ├─ Question.model.js
│  │  ├─ User.model.js
│  │  ├─ User.PasswordReset.model.js
│  │  └─ _docs.txt
│  ├─ repository
│  │  ├─ auth.repository.js
│  │  └─ question.repository.js
│  ├─ routes
│  │  ├─ auth
│  │  │  ├─ docs.txt
│  │  │  ├─ forgot-password.js
│  │  │  ├─ index.js
│  │  │  ├─ login.js
│  │  │  ├─ logout.js
│  │  │  └─ signup.js
│  │  ├─ feed
│  │  │  ├─ index.js
│  │  │  ├─ latest.js
│  │  │  ├─ popular.js
│  │  │  └─ trending.js
│  │  ├─ index.js
│  │  ├─ topic
│  │  │  ├─ index.js
│  │  │  ├─ latest.js
│  │  │  ├─ popular.js
│  │  │  └─ trending.js
│  │  ├─ user
│  │  │  ├─ banned.js
│  │  │  ├─ blocked.js
│  │  │  ├─ friend.js
│  │  │  ├─ index.js
│  │  │  ├─ info.js
│  │  │  └─ online.js
│  │  └─ users.js
│  ├─ services
│  │  ├─ auth
│  │  ├─ common
│  │  ├─ topic
│  │  ├─ user
│  │  └─ _docs.txt
│  ├─ utils
│  │  ├─ jwt.js
│  │  ├─ Logger.util.js
│  │  ├─ validator.js
│  │  └─ _docs.txt
│  └─ views
│     ├─ documentation
│     │  └─ index.pug
│     ├─ error.pug
│     ├─ index.pug
│     ├─ layout.pug
│     ├─ layouts
│     │  └─ index.pug
│     ├─ partials
│     │  └─ index.pug
│     ├─ support
│     │  └─ index.pug
│     └─ _docs.txt
├─ app.js
├─ bin
│  └─ www
├─ package-lock.json
├─ package.json
├─ pnpm-lock.yaml
├─ public
│  ├─ images
│  │  └─ _docs.txt
│  ├─ javascripts
│  │  └─ _docs.txt
│  └─ stylesheets
│     └─ style.css
├─ README.md
├─ sample
├─ src
│  └─ _docs.txt
└─ vercel.json

```

</details>
