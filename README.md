# InRooms

A networking platform for tech sales professionals. Members discover and join curated
events, build a network of connections, message each other, and manage a paid
subscription — all from a single web app.

## Features

- **Events** — browse, save and register for events, with a personal view of everything
  you have joined and calendar export.
- **Network** — connection requests, profiles and reputation, with LinkedIn OAuth for
  onboarding and profile import.
- **Messaging** — direct messages between members, with notifications.
- **Rooms** — smaller, focused sessions layered on top of the event system.
- **Subscriptions and billing** — Stripe-backed plans, checkout and billing management.
- **Courses and resources** — learning material available to subscribers.
- **Admin panel** — event, user and content management for operators.
- **Guided onboarding** — a product tour for new members.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, Headless UI, Framer Motion |
| Forms and validation | React Hook Form, Zod |
| Backend services | Firebase, Supabase |
| Payments | Stripe |
| AI features | OpenAI API |
| Deployment | Netlify |

The application is organised by feature: `src/pages` holds the routed views (user,
admin, auth, subscription, courses), `src/services` wraps every external integration —
events, connections, messaging, LinkedIn, Stripe — and `src/contexts` carries shared
state such as the authenticated session.

## Running locally

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the Firebase, Supabase, Stripe and OpenAI
credentials, then:

```bash
npm run dev
```
