import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ToastAndroid,
    TextInput,
    AsyncStorage,
     Dimensions,

} from 'react-native';

import UserIndex from './UserIndex';
import Regin from './Regin';

const {width} = Dimensions.get('window');


export default class Login extends Component {
    constructor(props){
        super(props);
        this._onChangeId = this._onChangeId.bind(this);
        this._onChangePassWord = this._onChangePassWord.bind(this);
        this.state = {
            id:"",
            passWord:"",
            loginText:"登录",
            reginText:"注册",
            code:"",
            msg:"",
            sessionId:""
        };


    }
    _onChangeId(inputData){
        this.setState({id:inputData});
    }
    _onChangePassWord(inputData){
        this.setState({passWord:inputData});
    }
    // _onIdChanged = (newId) => {
    //     this.id = newId;
    // }

    _signIn = ()=>{
        this.props.navigation.navigate('UserIndex');
    }
    _redirect = ()=>{
        this.props.navigation.navigate('Regin');
    }

    login =()=>{
        // this._signIn();
        let formData = new FormData();
        formData.append("sid" , this.state.id);
        formData.append( "password",this.state.passWord);
        var url = 'http://4iv4hf.natappfree.cc/user/login';
        var opts = {
            method:"POST",
            mode: "cors",
            headers: {
                'Content-Type':'multipart/form-data'
            },
            body: formData,
        };
        fetch(url, opts)
            .then((response) =>{
                console.log(response);
                return response.json();
            })
            .then((json) => {
                //状态码
                if (json.code == 0){
                    AsyncStorage.setItem('sessionId',json.sessionId,()=>{AsyncStorage.setItem(
                        'sid',this.state.id,()=>{
                            this._signIn();
                            // alert(json.sessionId)
                        }
                    )});
                }else if(json.code==3){
                    ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                }else if(json.code==4){
                    ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                }
                else{
                    ToastAndroid.show('登录失败',ToastAndroid.SHORT);
                }
            })
            .catch((e) => {
                console.log(e);
            })
    }

    render() {

        return (
            <View style={styles.container}>
                <Image source={require('../image/6.png')} style={styles.tgIconStyle}/>
                <TextInput
                    placeholder={'请输入ID号'}
                    autoCapitalize='none'
                    keyboardType={'numeric'}
                    editable={true}//是否可编辑
                    onChangeText={this._onChangeId}
                    style={styles.tgTextInputStyle}
                />
                {/*<KeyboardAvoidingView behavior="padding" style={styles.cont}>*/}
                <TextInput
                    placeholder={'请输入密码'}
                    autoCapitalize='none'
                    password={true}
                    editable={true}
                    keyboardType={'visible-password'}
                    onChangeText={this._onChangePassWord}
                    style={styles.tgTextInputStyle}
                />
                {/*</KeyboardAvoidingView>*/}
                <View >
                    <Text onPress={this._redirect}>{this.state.reginText}</Text>
                </View>
                <TouchableOpacity
                    onPress={this.login}
                >
                    <View style={styles.button}>
                        <Text　style={styles.btText}>{this.state.loginText}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems:'center',

    },
    // cont: {
    //     // flex: 1,
    //     backgroundColor:'white',
    //     justifyContent: 'center',//
    //     paddingHorizontal: 20,
    //     paddingTop: 20,
    // },

    tgIconStyle:{
        width:80,
        height:80,
        marginTop:60,
        marginBottom:30,
        borderRadius:40,
        borderWidth:1,
        borderColor:'grey'
    },

    tgTextInputStyle:{
        width:width*0.8,
        height:38,
        borderColor: 'lightgrey',
        borderWidth: 1,
        marginBottom:8,
        borderRadius:4,
        textAlign:'left',
        alignSelf:'center'
    },

    tgLoginBtnStyle:{
        height:38,
        width:width*0.8,
        backgroundColor:'#00BB00',
        marginTop:8,
        marginBottom:20,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:4
    },

    tgSettingStyle:{
        flexDirection:'row',
        width:width*0.8,
        fontSize: 20,
        justifyContent:'space-between'
    },

    tgOtherLoginStyle:{
        flexDirection:'row',
        alignItems:'center',
        position:'absolute',
        bottom:width*0.1,
        left:width*0.1
    },

    tgOtherImageStyle:{
        width:40,
        height:40,
        borderRadius:20,
        marginLeft:8
    },

    button: {
        height: 50,
        width: 280,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#58812F',
        marginTop: 20,
    },

    btText: {
        color: '#fff',
        fontSize: 20,
    }
});

