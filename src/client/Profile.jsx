import { lazy, Suspense } from "preact/compat";

const ProfilePicture = lazy(() => import("./ProfilePicture"));

export default function Profile() {
  return (
    <div>
      <Suspense>
        <ProfilePicture />
      </Suspense>
    </div>
  );
}
