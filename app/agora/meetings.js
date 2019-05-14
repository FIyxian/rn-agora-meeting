import React, {Component, PureComponent} from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    Dimensions, Modal, NativeModules, Image,
    BackHandler,Animated
} from 'react-native';
import {Surface, ActivityIndicator,Menu, FAB, Portal} from 'react-native-paper';
import {RtcEngine, AgoraView} from 'react-native-agora';
const {Agora} = NativeModules;
import {APPID} from './settings';

//Agora加载在本地响应失败，请检查您的编译器环境
if (!Agora) {
    throw new Error("Agora load failed in react-native, please check ur compiler environments");
}


const {
    FPS30,
    FixedLandscape,
    Host,
    AudioProfileDefault,
    AudioScenarioDefault,
} = Agora;

//引入图标
const BtnEndCall = () => require('../../image/btn_endcall.png');
const BtnMute = () => require('../../image/btn_mute.png');
const BtnSwitchCamera = () => require('../../image/btn_switch_camera.png');
const IconMuted = () => require('../../image/icon_muted.png');
const IconMutedAll = () =>require('../../image/btn_muted_All.png');
const BtnMuteAll = ()=>require('../../image/btn_mute_all.png');
const BtnEndMeeting = ()=>require('../../image/btn_endMeeting.png');
const BtnKickOut = ()=>require('../../image/btn_kickout.png');
const IconMutedCreator = ()=>require('../../image/btn_muted_creator.png');
const BtnMuteCreator = ()=>require('../../image/btn_mute_creator.png');
const BtnSwitchCameraCreator = ()=>require('../../image/btn_switch_creator.png');


//获得设备宽度
const {width} = Dimensions.get('window');

//设置样式
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
    },
    absView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    videoView: {
        padding: 5,
        //规定灵活的项目在必要的时候拆行或拆列。
        flexWrap: 'wrap',
        //	默认值。灵活的项目将水平显示，正如一个行一样。
        flexDirection: 'row',
        //属性设置元素的堆叠顺序。拥有更高堆叠顺序的元素总是会处于堆叠顺序较低的元素的前面。
        zIndex: 100
    },
    localView: {
        // width:30,
        // height:50,
        flex: 1
    },
    remoteView: {
        width: (width - 40) / 3,
        height: (width - 40) / 3,
        margin: 5
    },
    //三个功能图标
    bottomView: {
        padding: 20,
        flexDirection: 'row',
        //space-around	项目位于各行之前、之间、之后都留有空白的容器内。
        justifyContent: 'space-around'
    },
    barrageView:{
        backgroundColor:'rgba(0,0,0,0)',
        width:'100%',
        height:40,
        // borderBottomWidth:1,
        // borderColor:'#ffffff'
    },
    barrageText:{
        position:'absolute',
        left:400,
        color:'#ffffff',
    },
    container1:{
        marginTop:20
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 30,
    },

});


class OperateButton extends PureComponent {
    render() {
        const {onPress, source, style, imgStyle = {width: 50, height: 50}} = this.props;
        return (

            //本组件用于封装视图，使其可以正确响应触摸操作。当按下的时候，封装的视图的不透明度会降低
            <TouchableOpacity
                style={style}
                onPress={onPress}
                //指定封装的视图在被触摸操作激活时以多少不透明度显示（0到1之间）。默认值为0.2。
                activeOpacity={.7}
            >
                <Image
                    style={imgStyle}
                    source={source}
                />
            </TouchableOpacity>
        )
    }
}
//数据类型
type Props = {
    channelProfile: Number,
    channelName: String,
    videoProfile: Number,
    clientRole: Number,
    onCancel: Function,
    uid: Number,
    creator:Number,
    sessionId:String,
    num: Number,
    attenders:Object,
}

class AgoraRTCView extends Component<Props> {
    _didFocusSubscription;
    _willBlurSubscription;
    constructor(props) {
        super(props);
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
    }

    state = {
        kickOutVisible: false,
        peerIds: [],
        fab:[],
        positionAnmi: new Animated.Value(500),
        barrage:[[1],[2],[3]],
        msgId:0,
        msgs:'',
        joinSucceed: false,
        isMute: false,
        isMuteAll: false,
        isAbleMute:true,
        hideButton: false,
        visible: false,
        selectedUid: undefined,
        animating: true,
        open: false,
        name:''
    };


    //生命周期渲染前 组件将要被加载到视图之前调用
    componentWillMount () {
        const config = {
            appid: APPID,
            channelProfile: this.props.channelProfile,
            videoProfile: this.props.videoProfile,
            clientRole: this.props.clientRole,
            videoEncoderConfig: {
                width: 360,
                height: 480,
                bitrate: 1,
                frameRate: FPS30,
                orientationMode: FixedLandscape,
            },
            // clientRole: Host,
            audioProfile: AudioProfileDefault,
            audioScenario: AudioScenarioDefault
        }
        // console.log("[CONFIG]", JSON.stringify(config));
        // console.log("[CONFIG.encoderConfig", config.videoEncoderConfig);


        //监听器
        RtcEngine.on('firstRemoteVideoDecoded', (data) => {
            console.log('[RtcEngine] onFirstRemoteVideoDecoded', data);
        });
        //用户加入
        RtcEngine.on('userJoined', (data) => {
            console.log('[RtcEngine] onUserJoined', data);
            var attenders =this.props.attenders;
            attenders.forEach((ele, index)=>{
                if(ele.sid == data.uid){
                    this.setState({
                        name: ele.sname,
                    })
                }
            })
            var msgss = this.state.name+"加入了会议！";
            const {peerIds} = this.state;
            //ndexOf() 方法对大小写敏感！
            //如果要检索的字符串值没有出现，则该方法返回 -1。
            if (peerIds.indexOf(data.uid) === -1) {
                this.setState({
                    msgs:msgss,
                    //加入peerIds中
                    peerIds: [...peerIds, data.uid]
                },()=>{
                    this.fabValue();
                    this.barrage();

                })
            }
        });
        //用户离线
        RtcEngine.on('userOffline', (data) => {
            console.log('[RtcEngine] onUserOffline', data);
            var attenders =this.props.attenders;

            attenders.forEach((ele, index)=>{
                if(ele.sid == data.uid){
                    this.setState({
                        name: ele.sname
                    })
                }
            })
            var msgss = this.state.name +"离开了会议！";
            console.log(this.props.attenders);
            this.setState({
                msgs:msgss,
                //创建出一个新数组，包含不等于掉线的id的所有id
                peerIds: this.state.peerIds.filter(uid => uid !== data.uid)
            },()=>{
                this.barrage();
                this.fabValue();
            })
        });
        //加入频道成功
        RtcEngine.on('joinChannelSuccess', (data) => {

            if (this.props.uid != this.props.creator){
                this.timer=setInterval(() => {
                    fetch('http://4iv4hf.natappfree.cc/message/getMessage?sessionId='+this.props.sessionId+'&msgId='+this.state.msgId)
                        .then((response)=>{
                            console.log(response);
                            return response.json();
                        })
                        .then((json)=>{

                            if (json.data) {

                                json.data.forEach((ele,index)=>{
                                    if(ele.conferenceId == this.props.num && ele.type == "mute"){
                                        this.setState({
                                            isAbleMute:!this.state.isAbleMute,
                                            isMute: !this.state.isMute,
                                            msgId: ele.msgId
                                        }, () => {
                                            RtcEngine.muteLocalAudioStream(this.state.isMute);
                                        })
                                    }else if (ele.conferenceId == this.props.num && ele.type =="kickout") {
                                        const { goBack } = this.props.navigation;
                                        RtcEngine.leaveChannel().then(_ => {
                                            this.setState({
                                                joinSucceed: false
                                            });
                                            goBack();
                                        }).catch(err => {
                                            console.log("[agora]: err", err);
                                        })
                                    }
                                })
                            }
                        })

                }, 5000);
            }

            console.log('[RtcEngine] onJoinChannelSuccess', data);
            //？---？？？？？？？？？？？？？？开始视频预览，应该是版本更新后被删除了
            RtcEngine.startPreview();
            this.setState({
                joinSucceed: true,
                animating: false
            })
        });
        //音量指示
        RtcEngine.on('audioVolumeIndication', (data) => {
            console.log('[RtcEngine] onAudioVolumeIndication', data);
        })
        //客户角色变化
        RtcEngine.on('clientRoleChanged', (data) => {
            console.log("[RtcEngine] onClientRoleChanged", data);
        })
        //错误处理
        RtcEngine.on('error', (data) => {
            console.log('[RtcEngine] onError', data);
            if (data.error === 17) {
                RtcEngine.leaveChannel().then(_ => {
                    this.setState({
                        joinSucceed: false
                    })
                    const { state, goBack } = this.props.navigation;
                    //这个onCancel干啥的？？？？？？？？？？？？？？？？？？？？？？
                    this.props.onCancel(data);
                    goBack();
                });
            }
        });
        // 初始化Agora引擎
        RtcEngine.init(config);
    }
    //在调用了render方法，组件加载成功并被成功渲染出来之后，所要执行的后续操作，一般都会在这个函数中进行，比如经常要面对的网络请求等加载数据操作
    componentDidMount () {


        //获取版本号
        RtcEngine.getSdkVersion((version) => {
            console.log('[RtcEngine] getSdkVersion', version);
        })

        console.log('[joinChannel] ' + this.props.channelName);
        //加入房间
        RtcEngine.joinChannel(this.props.channelName, this.props.uid);
        //启用说话者音量提示
        RtcEngine.enableAudioVolumeIndication(500, 3);

        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
    }
    barrage = ()=>{
        let listenVariable  = this.state.msgs;
        /*获取随机数*/
        let random = Math.floor(Math.random()*3);
        let newBarrage = [[],[],[]];
        newBarrage[random].push(listenVariable);
        this.setState({barrage:newBarrage});
        /*该方法将 循环执行 iterations 是循环的次数*/
        Animated.loop( Animated.timing(
            this.state.positionAnmi,
            {
                toValue: -306,
                duration: 10000,
            }
        ),{iterations:1}).start()
    }

    fabValue =()=>{
        if (this.state.peerIds != 0){
            var  attenders =this.props.attenders, peerIds = this.state.peerIds;
            var newArr = attenders.filter((ele,index)=>{
                for (var i=0; i < peerIds.length; i++){
                    return ele.sid == peerIds[i];
                }
            }) ;
            var arr=[];
            newArr.forEach((ele,index)=>{
                var item ={ icon: require('../../image/btn_people.png'), label: ele.sname, onPress : ()=>this.kickOutFetch(ele) };
                arr.push(item);
            })
            this.setState({
                fab: arr,
            })
        }else {
            this.setState({
                fab:[],
            })
        }

    }


    onBackButtonPressAndroid = () => {
            return true;
    };

    //一般用于优化，可以返回false或true来控制是否进行渲染(true 的话进行下2步操作，false不会进行下去)
    shouldComponentUpdate(nextProps) { return nextProps.navigation.isFocused(); }

    // 销毁阶段函数  用于清理一些无用的内容，比如：定时器清除
    componentWillUnmount () {
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
        this.timer && clearTimeout(this.timer);
        //
        if (this.state.joinSucceed) {
            RtcEngine.leaveChannel().then(res => {
                //删除所有事件监听器
                RtcEngine.removeAllListeners();
                //销毁引擎实例
                RtcEngine.destroy();
            }).catch(err => {
                RtcEngine.removeAllListeners();
                RtcEngine.destroy();
                console.log("leave channel failed", err);
            })
        } else {
            RtcEngine.removeAllListeners();
            RtcEngine.destroy();
        }
    }

    //生命周期

    // -------------------------------------------------------------------------------------------------------

  //-------------------------------新添1
  //结束会议
    endMeeting = () => {
        //给服务器发请求……
        fetch('http://4iv4hf.natappfree.cc/meeting/end?sessionId='+this.props.sessionId+'&num='+this.props.num)
            .then((response)=>{
                console.log(response);
            })
            .then(()=>{
                console.log('oo');
                const { goBack } = this.props.navigation;
                RtcEngine.leaveChannel().then(()=> {
                    this.setState({
                        joinSucceed: false
                    });
                    goBack();
                }).catch(err => {
                    console.log("[agora]: err", err);
                })
            })
            .catch((error)=>{console.error('error',error);
            alert(error);
        });
    }




//挂断功能
    handleCancel = () => {
        //给服务器发请求……
        const { goBack } = this.props.navigation;
        RtcEngine.leaveChannel().then(_ => {
            this.setState({
                joinSucceed: false
            });
            goBack();
        }).catch(err => {
            console.log("[agora]: err", err);
        })
    }


    //转换相机方向
    switchCamera = () => {
        RtcEngine.switchCamera();
    }

    //静音功能
    toggleAllRemoteAudioStreams = () => {
        if (this.state.isAbleMute){
            this.setState({
                isMute: !this.state.isMute
            }, () => {
                // muteLocalAudioStream             | bool (default false)                     | 将自己静音                                 |
                // muteAllRemoteAudioStreams        | bool (default false)                     | 静音所有远端 音频                             |
                // | muteRemoteAudioStream            | number uid（用户uid） bool  mute（是否静音）       | 静音指定用户 音频
                RtcEngine.muteLocalAudioStream(this.state.isMute);
            })
        }
    }
    //静音所有-->发请求
    muteAllAudioStreams = ()=>{
        this.setState({
            isMuteAll: !this.state.isMuteAll
        }, () => {
            // let uuid=(()=>{
            //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,(c)=> {
            //         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            //         return v.toString(16);
            //     });
            // })();
            let formData = new FormData();
            formData.append("from" ,this.props.creator);
            formData.append( "to", "all");
            formData.append( "type", "mute");
            formData.append( "conferenceId", this.props.num);
            formData.append( "multicast", "true");
            formData.append( "msgId",(()=>{
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,(c)=> {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });
            })() );
            var url = 'http://4iv4hf.natappfree.cc/message/sendMessage?sessionId='+this.props.sessionId;
            var opts = {
                method:"POST",
                mode: "cors",
                headers: {
                    'Content-Type':'multipart/form-data'
                },
                body: formData,
            };


            fetch(url, opts).then((response)=>{
                console.log(response);
                // return JSON.parse(response);
            }) .catch(err => {
                    console.log("[agora]: err", err);
                })
        })
    }



    toggleHideButtons = () => {
        this.setState({
            //hideButton变true
            hideButton: !this.state.hideButton
        })
    }

    onPressVideo = (uid) => {
        this.setState({
            selectedUid: uid
        }, () => {
            this.setState({
                visible: true
            })
        })
    }

    toolBar = ({hideButton, isMute,isMuteAll}) => {
        if (this.props.uid == this.props.creator){
            if (!hideButton) {
                return (
                    <View>
                        <View style={styles.bottomView}>
                            <OperateButton
                                //静音功能
                                onPress={this.muteAllAudioStreams}
                                source={isMuteAll ? IconMutedAll() : BtnMuteAll()}
                            />
                            <OperateButton
                                //静音功能
                                onPress={this.toggleAllRemoteAudioStreams}
                                source={isMute ? IconMutedCreator() : BtnMuteCreator()}
                            />
                            <OperateButton
                                //结束会议
                                style={{alignSelf: 'center', marginBottom: -10}}
                                onPress={this.endMeeting}
                                imgStyle={{width: 60, height: 60}}
                                source={BtnEndMeeting()}
                            />


                            <OperateButton
                                //转换相机方向
                                onPress={this.switchCamera}
                                source={BtnSwitchCameraCreator()}
                            />
                        </View>
                    </View>)
            }
        }
        else {
            if (!hideButton) {
                return (
                    <View>
                        <View style={styles.bottomView}>
                            <OperateButton
                                //静音功能
                                onPress={this.toggleAllRemoteAudioStreams}
                                source={isMute ? IconMuted() : BtnMute()}
                            />
                            <OperateButton
                                //挂断功能
                                style={{alignSelf: 'center', marginBottom: -10}}
                                onPress={this.handleCancel}
                                imgStyle={{width: 60, height: 60}}
                                source={BtnEndCall()}
                            />
                            <OperateButton
                                //转换相机方向
                                onPress={this.switchCamera}
                                source={BtnSwitchCamera()}
                            />
                        </View>
                    </View>)
            }
        }

    }

    // person = ()=>{
    //     [
    //         { icon: require('../../image/btn_people.png'), onPress: () => console.log('Pressed add') },
    //         { icon: require('../../image/btn_people.png'), label: 'Star111', onPress: () => console.log('Pressed star')},
    //         { icon: require('../../image/btn_people.png'), label: 'Email11', onPress: () => console.log('Pressed email') },
    //         { icon: require('../../image/btn_people.png'), label: 'Remind11', onPress: () => console.log('Pressed notifications') },
    //     ]
    // }

    kickOutFetch =(item)=>{
        let formData = new FormData();
        formData.append("from" ,this.props.creator);
        formData.append( "to", item.sid);
        formData.append( "type", "kickout");
        formData.append( "conferenceId", this.props.num);
        formData.append( "multicast", "false");
        formData.append( "msgId",(()=>{
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,(c)=> {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        })() );
        var url = 'http://4iv4hf.natappfree.cc/message/sendMessage?sessionId='+this.props.sessionId;
        var opts = {
            method:"POST",
            mode: "cors",
            headers: {
                'Content-Type':'multipart/form-data'
            },
            body: formData,
        };


        fetch(url, opts).then((response)=>{
            console.log(response);
            // return JSON.parse(response);
        }) .catch(err => {
            console.log("[agora]: err", err);
        })

    }

    fab = ()=>{
        if (this.props.uid == this.props.creator) {
            return(
                <FAB.Group
                    open={this.state.open}
                    style={{position:'absolute',bottom:70,zIndex:300}}
                    icon={this.state.open ? require('../../image/btn_kickout.png') : require('../../image/btn_kickout_first.png')}
                    actions={this.state.fab}
                    onStateChange={({ open }) => this.setState({ open })}
                    // onPress={() => {
                    //     if (this.state.open) {
                    //         // do something if the speed dial is open
                    //
                    //     }
                    // }}
                />
            )
        }
    }



    agoraPeerViews = ({visible, peerIds}) => {
        //if=true，显示最大
        return (visible ?
            <View style={styles.videoView} /> :
            <View style={styles.videoView}>{
                peerIds.map((uid, key) => (
                    //map() 方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => this.onPressVideo(uid)}
                        key={key}>
                        <AgoraView
                            //小窗口的样式
                            style={styles.remoteView}
                            //多视频界面覆盖 设置为true优先在上层（bool） |
                            zOrderMediaOverlay={true}
                            //显示远程视频（number 传入uid）
                            remoteUid={uid}
                        />
                    </TouchableOpacity>
                ))
            }</View>)
    }

    selectedView = ({visible}) => {
        return (
            <Modal
                visible={visible}
                presentationStyle={'fullScreen'}
                animationType={'slide'}
                onRequestClose={() => {}}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{flex: 1}}
                    onPress={() => this.setState({
                        visible: false
                    })} >

                    {/*//大窗口*/}
                    <AgoraView
                        style={{flex: 1}}
                        // 多视频界面覆盖 设置为true优先在上层（bool）
                        zOrderMediaOverlay={true}
                        // 显示远程视频（number 传入uid）
                        remoteUid={this.state.selectedUid}
                    />
                </TouchableOpacity>
            </Modal>)
    }

    render () {
        if (!this.state.joinSucceed) {
            return (
                //活动指示器用于显示应用程序中某些活动的进度。它可以用作React Native附带的ActivityIndi​​cator的插件。
                <View style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator animating={this.state.animating} />
                </View>
            )
        }
        const { barrage} = this.state;

        return (
            //Surface是一个基本容器，可以为具有高程阴影的元素提供深度。可以通过elevation在Android和iOS上指定属性来应用阴影。
            <Surface
                //活跃的不透明度
                activeOpacity={1}
                // onPress={this.toggleHideButtons}
                style={styles.container}
            >
                {/*//显示本地视频showLocalVideo*/}
                <AgoraView style={styles.localView} showLocalVideo={true} />
                <View style={styles.absView}>

                    <View style={styles.container1}>
                        <View style={styles.barrageView}>
                            <Animated.Text style={{left:this.state.positionAnmi}}>
                                {barrage[1].length !== 0?barrage[1].map((item,index)=>{
                                    return <Text style={styles.barrageText} key={index}>{item}   </Text>
                                }):''}
                            </Animated.Text>
                        </View>
                        <View style={styles.barrageView}>
                            <Animated.Text style={{left:this.state.positionAnmi}}>
                                {barrage[0].length !== 0?barrage[0].map((item,index)=>{
                                    return <Text style={styles.barrageText} key={index}>{item}    </Text>
                                }):''}
                            </Animated.Text>
                        </View>
                        <View style={styles.barrageView}>
                            <Animated.Text style={{left:this.state.positionAnmi}}>
                                {barrage[2].length !== 0 ?barrage[2].map((item,index)=>{
                                    return <Text style={styles.barrageText} key={index}>{item}    </Text>
                                }):''}
                            </Animated.Text>
                        </View>
                    </View>
                </View>
                    {/*<Text>channelName: {this.props.uid}, peers: {this.props.creator}</Text>*/}
                    {/*//小窗口*/}
                    {this.fab(this.state)}
                    {this.agoraPeerViews(this.state)}

                {/*//按钮*/}
                    {this.toolBar(this.state)}

                {/*//放大*/}
                {this.selectedView(this.state)}
            </Surface>
        )
    }
}

export default function AgoraRTCViewContainer(props) {
    const {navigation} = props;
    const channelProfile = navigation.getParam('channelProfile', 1);
    const videoProfile = navigation.getParam('videoProfile', 4);
    const clientRole = navigation.getParam('clientRole', 1);
    const channelName = navigation.getParam('channelName', 'agoratest');
    const uid = navigation.getParam('uid', Math.floor(Math.random() * 100));
    const onCancel = navigation.getParam('onCancel');
    const creator = navigation.getParam('creator');
    const sessionId = navigation.getParam('sessionId');
    const num= navigation.getParam('num')
    const attenders = navigation.getParam('attenders')

    return (<AgoraRTCView
        channelProfile={channelProfile}
        channelName={channelName}
        videoProfile={videoProfile}
        clientRole={clientRole}
        uid={uid}
        num={num}
        attenders={attenders}
        sessionId={sessionId}
        creator={creator}
        onCancel={onCancel}
        {...props}
   />);
}