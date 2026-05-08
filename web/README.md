# Event Mesh — Web

React + Vite + TypeScript frontend for the event-mesh order service.

## Run

In one terminal, start the backend (from repo root):

```bash
docker compose up -d
npm install
npm run dev          # http://localhost:3000
```

In another terminal, start the web app:

```bash
cd web
npm install
npm run dev          # http://localhost:5173
```

Vite proxies `/api/*` to the backend on `:3000`, so no CORS setup is needed.

## Pages

| Route                       | Purpose                                  |
| --------------------------- | ---------------------------------------- |
| `/`                         | Home dashboard                           |
| `/place`                    | Place a new order                        |
| `/customers`                | Look up orders by customer ID            |
| `/customers/:customerId`    | List orders for that customer            |
| `/orders/:orderId`          | Order detail with ship / cancel actions  |

## Build

```bash
npm run build        # type-check + bundle to web/dist
npm run preview      # serve the production bundle locally
```
