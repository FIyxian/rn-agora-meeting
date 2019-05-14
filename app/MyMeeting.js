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
    ToastAndroid
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
            },()=>{ AsyncStorage.getItem('sid', (err,i) =>{
                this.setState({
                    sid : i,
                },()=>{
                        fetch('http://4iv4hf.natappfree.cc/meeting/get?sessionId='+this.state.sessionId)
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
            })}

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
            sid:'',
            isRefresh:false,
            text: '',
            num:'',
            creator:'',
            sessionId:'',
            attenders:'',
            list: [],
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
                <Text style={styles.text_ST}>时间：{item.starttime}</Text>
                <Text style={styles.text_dur}>预计：{item.duration}分钟</Text>
            </View>
            <View style={styles.bottomBox}>
                <Text style={styles.text_creator}>创建人：{item.sname}</Text>
                <View style={styles.text_join}><Text style={styles.btn} onPress={()=>this._joinMeeting(item)}>加入会议</Text></View>
            </View>
        </View>
    )

    _onRefresh=()=>{
        console.log(this.state.sid);
        console.log(this.state.sessionId);
        // 不处于 下拉刷新
        if(!this.state.isRefresh){
                fetch('http://4iv4hf.natappfree.cc/meeting/get?sessionId='+this.state.sessionId)
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
    };



    _joinMeeting=(item)=>{
        console.log(item);
        this.setState({
            num:item.num,
            creator:item.creator,
        },()=>{
            fetch('http://4iv4hf.natappfree.cc/meeting/join?sessionId='+this.state.sessionId+'&num='+this.state.num)
                .then(
                    (response) =>{
                        console.log(response);
                        return response.json();
                    })
                .then((json)=>{
                    console.log(json);
                    this.setState({
                            text: json.channelId,
                            attenders:json.attenders,
                            creator: item.creator,
                        },()=>{
                            this.props.navigation.navigate('Meeting',{
                                channelName: this .state.text,
                                attenders: this.state.attenders,
                                num:this.state.num,
                                uid:+this.state.sid,
                                sessionId:this.state.sessionId,
                                creator:this.state.creator,

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
        })

    }
    _footer = () => (
        <Text style={{height:60}}/>
    )

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text style={styles.titleContent}>
                    我的会议
                    </Text>
                </View>
                <View style={styles.headerLine}/>
                <FlatList
                    data={this.state.list}
                    renderItem={this._renderItem}
                    //指定每一个子元素的唯一的key
                    keyExtractor={(item,num)=>num.toString()}
                    onRefresh={this._onRefresh}
                    refreshing={this.state.isRefresh}
                    ListFooterComponent={this._footer}
                />
                <View style={styles.blank}/>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    title:{
        // flex:1,
        height: 60,
        width: width,
        backgroundColor:'#FFFFFA',
        // display:'flex',
        },
    titleContent:{
        fontSize:30,
        lineHeight:60,
        // fontWeight: 'bold',
        textAlign: 'center',
        color: '#333333',
    },
    headerLine:{
      width:width,
      height:1,
      backgroundColor:'lightgrey',
    },



    meetBox: {
        margin:10,
        // flex:1,
        height: 180,
        width: width-20,
        borderRadius: 10,
        backgroundColor: '#EBEBEB'
    },
    headerBox:{
        // backgroundColor:'red',
        // marginTop:10,
        height: 50,
    },
    text_theme: {
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 50,
        textAlign: 'center'
    },
    centerBox: {
        position:'relative',
        // backgroundColor:'blue',
        height: 50,
        flexDirection: "row",
    },
    text_ST: {
        position:'absolute',
        // width:width*10,
        paddingLeft:15,
        fontSize: 18,
        lineHeight: 50,
        // marginLeft:10

    },
    text_dur:{
        position:'absolute',
      // marginLeft: 20,
      fontSize:18,
      lineHeight:50,
        paddingLeft: width*0.6,

    },
    bottomBox: {
        position:'relative',
        // backgroundColor:'green',
        height: 80,
        flexDirection: "row",
        // marginBottom:
        alignItems: 'center',
    },
    text_creator:{
        position:'absolute',
        fontSize:23,
        lineHeight:80,
        paddingLeft: 20,
        // marginLeft:10,
    },
    text_join:{
        position:'absolute',
        marginLeft:width*0.6,
        // textAlign:'center',
        height: 60,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: '#58812F',
        // marginLeft:50
    },
    btn:{
        color: '#fff',
        fontSize: 20,
    },
    blank:{
        height:50,
        marginBottom:30,
    }
});