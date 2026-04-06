import { html } from "htm/preact";
import ProfilePicture from "./ProfilePicture";

export default function Profile() {
  return html`
    <div>
      <span>This is my profile</span>
      <${ProfilePicture} />
    </div>
  `;
}
