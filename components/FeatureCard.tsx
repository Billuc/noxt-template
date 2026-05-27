import { html } from "htm/preact";

interface FeatureCardProps {
  icon: string;
  title: string;
  children: any;
}

export default function FeatureCard({ icon, title, children }: FeatureCardProps) {
  return html`
    <div class="feature-card">
      <div class="feature-icon">${icon}</div>
      <h3>${title}</h3>
      <div class="feature-content">${children}</div>
    </div>
  `;
}