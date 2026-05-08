import { Redirect } from "expo-router";
import { Route } from "@/lib/utils/routes";

export default function Index() {
  return <Redirect href={Route.HomePage} />;
}
