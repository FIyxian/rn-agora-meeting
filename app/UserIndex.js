import { createBottomTabNavigator } from 'react-navigation';
import CreateMeeting from "./CreateMeeting";
import MyMeeting from "./MyMeeting";

export default createBottomTabNavigator(
    {
        My: { screen: MyMeeting,
        },

        Create: { screen: CreateMeeting,
        },
});