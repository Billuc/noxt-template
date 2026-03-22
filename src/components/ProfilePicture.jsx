export default async function ProfilePicture() {
  await Bun.sleep(3000);
  return (
    <img
      src="https://images.unsplash.com/photo-1772736856751-34baaf544954?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="Profile Picture"
    />
  );
}
