import Profile from "../components/Profile";
import { lazy, Suspense } from "preact/compat";

const ProfilePicture = lazy(() => import("./ProfilePicture"));

export default function AboutPage() {
  return (
    <div>
      <h1>About Page (Server-Side Rendered)</h1>
      <p>This page is rendered on-demand on the server.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <Profile />
      <p>PP</p>
      <Suspense>
        <ProfilePicture />
      </Suspense>
    </div>
  );
}
