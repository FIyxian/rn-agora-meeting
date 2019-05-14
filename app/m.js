//优化版----------------------
// 1.两次返回  --- 直接退出程序。
import React, {Component} from 'react';
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    PermissionsAndroid,
    Dimensions,
    BackHandler,
    ToastAndroid,
} from 'react-native';

const {width} = Dimensions.get('window');
//获取手机语音、相机权限
async function requestCameraAndAudioPermission() {
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('You can use the camera');
        } else {
            console.log('Camera permission denied');
        }
    } catch (err) {
        console.warn(err);
    }
}


export default class MyMeeting extends Component {
    _didFocusSubscription;
    _willBlurSubscription;
    componentWillMount() {
        AsyncStorage.getItem('sessionId', (err,d) => {
            this.setState({
                    sessionId: d,
                },
                ()=>{
                    fetch('http://192.168.1.105:8080/meeting/get?sessionId='+this.state.sessionId)
                        .then((response) => {
                            console.log(response)
                            return response.json();
                        })
                        .then((json) => {
                            this.setState({
                                list:json.data
                            })

                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
            )
        })

        //判断系统为安卓，请求权限
        if (Platform.OS === 'android') {
            requestCameraAndAudioPermission().then(_ => {

            });
        }
    }

    constructor(props) {
        super(props);
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
        this.state = {
            text: '',
            num:'',
            sessionId:'',
            list: [ ],
        }
    }
    componentDidMount() {
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
    }

    onBackButtonPressAndroid = () => {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            //最近2秒内按过back键，可以退出应用。
            BackHandler.exitApp();
            return;
        }
        this.lastBackPressed = Date.now();
        ToastAndroid.show('再按一次退出应用',ToastAndroid.SHORT);
        return true;
    };

    componentWillUnmount() {
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
    }





    _renderItem = ({item, index}) => (
        <View style={styles.meetBox}>
            <View style={styles.headerBox}>
                <Text style={styles.text_theme}>{item.item}</Text>
            </View>
            <View style={styles.centerBox}>
                <Text style={styles.text_ST}>开始时间：{item.starttime}</Text>
                <Text style={styles.text_dur}>预计时间：{item.duration}分钟</Text>
            </View>
            <View style={styles.bottomBox}>
                <Text style={styles.text_creator}>创建人：{item.creator}</Text>
                <View style={styles.text_join}><Text style={styles.btn} onPress={()=>this._joinMeeting(item)}>加入会议</Text></View>
            </View>
        </View>
    )

    _joinMeeting=(item)=>{

        console.log(item),
            // let params = {
            //     sessionId:this.state.sessionId,
            // };
            //加num
            fetch('http://192.168.1.105:8080/meeting/join?sessionId='+this.state.sessionId+'&num='+item.num)
                .then(
                    (response) =>{
                        console.log(response);
                        return response.json();
                    })
                .then((json)=>{
                    this.setState({
                            text: json.channelId,
                            // num: num,
                        },()=>{
                            // alert(this.state.text);
                            // alert(this.state.text),
                            //number
                            this.props.navigation.navigate('Meeting',{
                                channelName: this .state.text,
                                num:item.num,
                                onCancel: (message) => {
                                    this.setState({
                                        //变true
                                        visible: true,
                                        message
                                    });
                                    console.log('[agora]: onCancel ', message);
                                }

                            })}
                    );
                })
                .catch((error)=>{console.error('error',error)
                    alert(error);
                });
    }

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.list}
                    renderItem={this._renderItem}
                    //指定每一个子元素的唯一的key
                    keyExtractor={(item,num)=>num.toString()}
                />

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    meetBox: {
        height: 180,
        width: width,
        // backgroundColor: 'red'
    },
    headerBox:{
        marginTop:10,
        height: 50,
    },
    text_theme: {
        fontSize: 40,
        fontWeight: 'bold',
        lineHeight: 50,
        textAlign: 'center'
    },
    centerBox: {
        height: 50,
        flexDirection: "row",
    },
    text_ST: {
        fontSize: 20,
        lineHeight: 50,
        marginLeft:10

    },
    text_dur:{
        marginLeft: 20,
        fontSize:20,
        lineHeight:50,

    },
    bottomBox: {
        height: 80,
        flexDirection: "row",
        marginBottom:10
    },
    text_creator:{
        fontSize:25,
        lineHeight:80,
        marginLeft:10,
    },
    text_join:{
        height: 70,
        width: 150,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#58812F',
        marginLeft:50
    },
    btn:{
        color: '#fff',
        fontSize: 25,
    }
});