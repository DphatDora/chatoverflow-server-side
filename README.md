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
You need to create your .env file and establish your mongodb connection. See `sample/.env.sample`

```bash
MONGODB_URI = 'your mongodb connection URI'
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
POST /auth/forgot-password/send-otp &rarr body { email }
POST /auth/forgot-password/verify-otp &rarr body { email, otp }
POST /auth/forgot-password/reset-password &rarr body { resetToken, newPassword }
```



