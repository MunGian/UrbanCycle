import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export const icon = {
  home: (props: any) => <Feather name="home" size={24} {...props} />,
  message: (props: any) => <AntDesign name="message" size={24} {...props} />,
  report: (props: any) => <AntDesign name="alert" size={24} {...props} />,
  donate: (props: any) => (
    <FontAwesome6 name="handshake" size={24} color="black" />
  ),
  profile: (props: any) => (
    <FontAwesome5 name="user-circle" size={24} {...props} />
  ),
};
