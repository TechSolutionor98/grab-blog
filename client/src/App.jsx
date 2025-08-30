import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Header from "./components/Header"
import Home from "./pages/Home"
import BlogDetail from "./pages/BlogDetail"
import Category from "./pages/Category"
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminBlogs from "./pages/admin/AdminBlogs"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminTopics from "./pages/admin/AdminTopics"
import AdminBrands from "./pages/admin/AdminBrands"
import AdminComments from "./pages/admin/AdminComments"
import CreateBlog from "./pages/admin/CreateBlog"
import EditBlog from "./pages/admin/EditBlog"
import AdminLayout from "./components/admin/AdminLayout"
import Footer from "./components/Footer"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <Home />
                </>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <>
                  <Header />
                  <BlogDetail />
                </>
              }
            />
            <Route
              path="/category/:categoryId"
              element={
                <>
                  <Header />
                  <Category />
                </>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/blogs"
              element={
                <AdminLayout>
                  <AdminBlogs />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/create-blog"
              element={
                <AdminLayout>
                  <CreateBlog />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/edit-blog/:id"
              element={
                <AdminLayout>
                  <EditBlog />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/topics"
              element={
                <AdminLayout>
                  <AdminTopics />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <AdminLayout>
                  <AdminBrands />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/comments"
              element={
                <AdminLayout>
                  <AdminComments />
                </AdminLayout>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
