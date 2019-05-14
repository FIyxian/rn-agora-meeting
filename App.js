/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React from 'react';

import Login from './app/Login';
import Regin from './app/Regin';
import UserIndex from './app/UserIndex';
import AddPeople from './app/AddPeople';
import Meeting from './app/agora/meetings';
import BuJu from './app/agora/buju';

import { createStackNavigator, createAppContainer } from 'react-navigation';


const RootStack = createStackNavigator({
    Login: {screen: Login,
        navigationOptions:{
            headerTitle:"登录",
            headerStyle: {            //标题栏样式
                backgroundColor:'deepskyblue',
            },headerTintColor: '#fff',  //标题文字和按钮颜色
            headerTitleStyle: {       //标题文字样式
                fontWeight: 'bold',
                // fontSize : 30,
            },

        }
    },
    Regin: {screen: Regin ,
        navigationOptions:{
            headerTitle:"注册",
            headerStyle: {            //标题栏样式
                backgroundColor:'deepskyblue',
            },headerTintColor: '#fff',  //标题文字和按钮颜色
            headerTitleStyle: {       //标题文字样式
                fontWeight: 'bold',
            },
        }},
    UserIndex: {screen: UserIndex,
        navigationOptions:{
            headerTitle:'界面',
            headerLeft:null,
            header:null,
        }
    },
    AddPeople: {screen: AddPeople,
        navigationOptions:{
            headerTitle:'参会人员',
            headerLeft:null,
        }
    },
    Meeting:{screen:Meeting,
        navigationOptions:{
            header:null,
        }
    },
    BuJu:{
        screen:BuJu,
    }
}
,{
    initialRouteName: 'Login',
    mode: 'card'
});

// export default App
export default createAppContainer(RootStack);