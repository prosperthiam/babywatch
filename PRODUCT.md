# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary roles on one account system, switchable without re-login:
- **Parents** looking for childcare, booking sitters for specific dates/times, tracking bookings, chatting with sitters, optionally watching a live camera feed during a booking.
- **Sitters** ("babysitters") offering availability, accepting/declining missions, managing their profile and reviews.
- **Admin** role for marketplace oversight (`AdminDashboard`).

Primary usage context: evening, on a phone, often one-handed (confirmed by user — design must account for reachability/thumb use, not just small-screen layout).

## Product Purpose

BabyWatch is a babysitting marketplace connecting parents and sitters. It exists to make finding and booking trustworthy childcare simple, with booking, in-app chat, payments, reviews, and an optional live camera feed during a booking so a parent can check in visually.

## Positioning

Core differentiator (confirmed): **verified-sitter trust**, not the camera feature. The product's promise is captured in its tagline — "la garde d'enfants en toute confiance" (childcare in complete trust) — built on sitter verification/vetting. Live camera monitoring, chat, and reviews are supporting features that reinforce trust, not the primary mechanism a competitor couldn't copy.

## Operating Context

- Web app (Vite/React) plus native Android/iOS wrappers via Capacitor — the wrapper does not make the design language native; this stays a web design system per platform rules.
- French-first product (`tagline`, most UI strings), with a confirmed Arabic (`ar`) locale that requires working RTL layout — not an afterthought.
- Real backend: Express/PostgreSQL API, Stripe payments, LiveKit live camera streaming during bookings, socket.io chat, Resend transactional email.
- Currently in a **test phase**: the database holds real (not seeded/fake) users, sitters, and bookings, but in very small numbers.

## Capabilities and Constraints

- Booking lifecycle with status, pricing, and an optional camera flag (`camera_sessions`, LiveKit-backed).
- In-app chat per booking (`messages`, socket.io rooms keyed `booking_${bookingId}`).
- Reviews, favorites, availability, children profiles (including medical notes/allergies/routines) as supporting data.
- No test suite currently exists in the repo.
- Secondary gray is fixed at `#8b9bb0` for contrast on dark backgrounds — do not lighten this value in future work.

## Brand Commitments

- Name "BabyWatch" and the French tagline "La garde d'enfants en toute confiance" are **locked in** — binding for all future work.
- French is the primary voice; Arabic is a confirmed, supported locale requiring RTL-correct layout.

## Evidence on Hand

- Real (small-volume) production data: actual accounts, sitters, and bookings exist, but counts are low (test phase).
- **Do not fabricate**: no invented testimonials, no marketing counters (e.g. "+500 babysitters"), no invented average ratings. Empty states must remain genuine empty states rather than being papered over with fake content.

## Product Principles

1. Trust is the product: every design decision should reinforce verified, dependable childcare — not just visual polish.
2. Design for evening, one-handed phone use as the default real-world condition, not an edge case.
3. Never fabricate scale or social proof; honest small-scale/empty states are correct at this stage.
4. French and Arabic (RTL) are both first-class; layouts must hold up mirrored, not just translated.
5. The camera feature supports trust and reassurance — it is not the headline pitch.

## Accessibility & Inclusion

No formal accessibility standard (e.g. WCAG) is imposed, but real constraints apply:
- Arabic locale requires functioning RTL layout throughout.
- Primary usage is evening, on a phone, often one-handed — reachability and legibility in low light matter.
- Secondary gray `#8b9bb0` is fixed for dark-background contrast; do not substitute a paler value.
