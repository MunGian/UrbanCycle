import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export const icon = {
  home: (props: any) => <Feather name="home" size={24} {...props} />,
  message: (props: any) => <AntDesign name="message" size={24} {...props} />,
  report: (props: any) => <AntDesign name="alert" size={24} {...props} />,
  profile: (props: any) => (
    <FontAwesome5 name="user-circle" size={24} {...props} />
  ),
};
