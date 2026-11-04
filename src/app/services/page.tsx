import { redirect } from "next/navigation";

// There is no separate services overview page — the full list lives on the home page.
export default function ServicesIndex() {
  redirect("/#services");
}
