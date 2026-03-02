import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React from "react";
import MyReportsTab from "./MyReportsTab";
import SubmitReportTab from "./SubmitReportTab";

const Tab = createMaterialTopTabNavigator();

const ReportTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#000000",
          height: 3,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12,
          textTransform: "none",
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#9CA3AF",
        animationEnabled: true,
      }}
    >
      <Tab.Screen
        name="SubmitReport"
        component={SubmitReportTab}
        options={{ title: "Submit Report" }}
      />

      <Tab.Screen
        name="MyReports"
        component={MyReportsTab}
        options={{ title: "My Reports" }}
      />
    </Tab.Navigator>
  );
};

export default ReportTabs;
