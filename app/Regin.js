
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    ToastAndroid,
    TouchableOpacity,
    TextInput, AsyncStorage
} from 'react-native';

import UserIndex from './UserIndex';
var Dimensions = require('Dimensions');
var {width,height} = Dimensions.get('window');

export default class Regin extends Component {
    constructor(props){
        super(props);
        this. _onChangeId = this._onChangeId.bind(this);
        this. _onChangeUserName = this._onChangeUserName.bind(this);
        this._onChangePassWord = this._onChangePassWord.bind(this);
        this._onConfirmPassword = this._onConfirmPassword.bind(this);

        this.state = {
            id:"",
            userName:"",
            passWord:"",
            confirmPassword:'',
            loginText:"登录",
            status:"",
            token:""
        };
        this.navigation = this.props.navigation;
    }
    _onChangeId(inputData){
        this.setState({id:inputData});
    }
    _onChangeUserName(inputData){
        this.setState({userName:inputData});
    }
    _onChangePassWord(pw){
        this.setState({passWord:pw});
    }
    _onConfirmPassword = (confirmPw) => {
        this.setState({confirmPassword:confirmPw});
    }

    _signIn = ()=>{
        this.props.navigation.navigate('UserIndex');
    }

    reg=()=>{
        let formData = new FormData();
        formData.append("sid" , this.state.id);
        formData.append("sname",this.state.userName);
        formData.append( "password",this.state.passWord);
        var url = 'http://4iv4hf.natappfree.cc/user/register';
        var opts = {
            method:"POST",
            mode: "cors",
            headers: {
                'Content-Type':'multipart/form-data'
            },
            body: formData,
                // JSON.stringify(dataForm)

        };

        if (this.state.passWord==this.state.confirmPassword){
            fetch(url, opts)
                .then((response) =>{
                    console.log(response);
                    return response.json();
                })
                .then((json) => {
                    if (json.code == 0){
                        ToastAndroid.show('注册成功',ToastAndroid.SHORT);

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
                                }})
                    }else if(json.code == 1) {
                        ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                    }else if(json.code == 2) {
                        ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                    }
                    else{
                        ToastAndroid.show('注册失败',ToastAndroid.SHORT);
                    }
                })
                .catch((e) => {
                    console.log(e);
                })
        }else{
            ToastAndroid.show('输入密码不匹配',ToastAndroid.SHORT);
        }

    }

    render() {
        return (
            <View style={styles.container}>
                <Image source={require('../image/6.png')} style={styles.tgIconStyle}/>
                <TextInput
                    placeholder={'请输入ID号'}
                    autoCapitalize='none'
                    editable={true}//是否可编辑
                    keyboardType={'numeric'}
                    onChangeText={this. _onChangeId}//输入框改变触发的函数
                    style={styles.tgTextInputStyle}
                />
                <TextInput
                    placeholder={'请输入用户名'}
                    autoCapitalize='none'
                    editable={true}//是否可编辑
                    onChangeText={this. _onChangeUserName}//输入框改变触发的函数
                    style={styles.tgTextInputStyle}
                />
                <TextInput
                    placeholder={'请输入密码'}
                    autoCapitalize='none'
                    password={true}
                    editable={true}//是否可编辑
                    keyboardType={'visible-password'}
                    onChangeText={this._onChangePassWord}
                    style={styles.tgTextInputStyle}
                />
                <TextInput
                    placeholder={'确认密码'}
                    autoCapitalize='none'
                    password={true}
                    editable={true}//是否可编辑
                    keyboardType={'visible-password'}
                    onChangeText={this._onConfirmPassword}
                    style={styles.tgTextInputStyle}
                />

                {/*<View style={styles.tgOtherLoginStyle}>*/}
                    {/*<Text>其他登录方式: </Text>*/}
                    {/*<Image  source={require('../image/6.png')}  style={styles.tgOtherImageStyle} />*/}
                    {/*<Image  source={require('../image/6.png')}  style={styles.tgOtherImageStyle} />*/}
                    {/*<Image  source={require('../image/6.png')}  style={styles.tgOtherImageStyle} />*/}
                {/*</View>*/}
                <TouchableOpacity  disabled={this.state.waiting}
                                                      onPress={this.reg}
            >
                <View style={styles.button}>
                    <Text　style={styles.btText}>注册</Text>
                </View>
            </TouchableOpacity>

            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems:'center'
    },

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

