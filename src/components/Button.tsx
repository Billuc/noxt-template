import { html } from "htm/preact";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  children: any;
  icon?: string;
}

export default function Button({ href, onClick, variant = 'primary', children, icon }: ButtonProps) {
  const className = `btn btn-${variant}`;
  const content = html`
    ${icon ? html`<span>${icon}</span>` : ''}
    <span>${children}</span>
  `;
  
  if (href) {
    return html`<a href="${href}" class="${className}">${content}</a>`;
  }
  
  return html`<button class="${className}" onClick="${onClick}">${content}</button>`;
}