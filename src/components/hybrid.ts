import { html } from "htm/preact";
import { asIsland } from "../../utils/server";

const CounterIsland = await asIsland("./Counter", __filename);

export default function Hybrid() {
  return html`
    <div>
      <span>This is prerendered from Preact and below is an island.</span>
      <${CounterIsland} start=${4} />
    </div>
  `;
}
