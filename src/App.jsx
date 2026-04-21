import { AdminDashboard } from "./components/AdminDashboard.jsx";
import { SnapshotGalleryPage } from "./components/SnapshotGalleryPage.jsx";

function App() {
  if (window.location.pathname === "/snapshots") {
    return <SnapshotGalleryPage />;
  }

  return <AdminDashboard />;
}

export default App;
