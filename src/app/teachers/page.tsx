import { redirect } from "next/navigation";

// /teachers without an id — redirect to courses
export default function TeachersIndexPage() {
  redirect("/courses");
}
