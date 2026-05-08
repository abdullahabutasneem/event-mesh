import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { PlaceOrderPage } from "./pages/PlaceOrderPage"
import { CustomerOrdersPage } from "./pages/CustomerOrdersPage"
import { OrderDetailPage } from "./pages/OrderDetailPage"

/*
Route table.

  /                     home / dashboard
  /place                place a new order (form)
  /customers            customer-id input -> list
  /customers/:id        list orders for that customer
  /orders/:id           single order detail with ship/cancel actions
*/
const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/place" element={<PlaceOrderPage />} />
      <Route path="/customers" element={<CustomerOrdersPage />} />
      <Route path="/customers/:customerId" element={<CustomerOrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
)

export default App
