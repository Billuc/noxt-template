import htm from "htm";
import { h } from "preact";
import ProfilePicture from "./ProfilePicture";

const html = htm.bind(h);

export default function Profile() {
  return html`
    <div>
      <span>This is my profile</span>
      <${ProfilePicture} />
    </div>
  `;
}
