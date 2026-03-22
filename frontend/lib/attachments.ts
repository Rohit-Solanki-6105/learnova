import { API_URL } from "@/lib/auth";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export interface AttachmentItem {
  id: number;
  lesson: number;
  attachment_name: string;
  attachment_url: string;
  attachment_type: number; // 1=file, 2=link
}

export function toAbsoluteAttachmentUrl(url: string): string {
  const value = String(url || "").trim();
  if (!value) return "#";
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (/^(data|blob|mailto|tel):/i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

