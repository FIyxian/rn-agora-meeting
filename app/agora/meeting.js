



import React, {Component, PureComponent} from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    Dimensions, Modal, NativeModules, Image
} from 'react-native';
import {Surface, ActivityIndicator} from 'react-native-paper';
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



//获得设备宽度
const {width,height} = Dimensions.get('window');

//设置样式
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4'
    },
    absView: {
        position: 'relative',
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
    }
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
                activeOpacity={0.7}
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
}

class AgoraRTCView extends Component<Props> {
    state = {
        peerIds: [],
        joinSucceed: false,
        isMute: false,
        hideButton: false,
        visible: false,
        selectedUid: undefined,
        animating: true
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
        console.log("[CONFIG]", JSON.stringify(config));
        console.log("[CONFIG.encoderConfig", config.videoEncoderConfig);


        //监听器
        RtcEngine.on('firstRemoteVideoDecoded', (data) => {
            console.log('[RtcEngine] onFirstRemoteVideoDecoded', data);
        });
        //用户加入
        RtcEngine.on('userJoined', (data) => {
            console.log('[RtcEngine] onUserJoined', data);
            const {peerIds} = this.state;
            //ndexOf() 方法对大小写敏感！
            //如果要检索的字符串值没有出现，则该方法返回 -1。
            if (peerIds.indexOf(data.uid) === -1) {
                this.setState({
                    //加入peerIds中
                    peerIds: [...peerIds, data.uid]
                })
            }
        });
        //用户离线
        RtcEngine.on('userOffline', (data) => {
            console.log('[RtcEngine] onUserOffline', data);
            this.setState({
                //创建出一个新数组，包含不等于掉线的id的所有id
                peerIds: this.state.peerIds.filter(uid => uid !== data.uid)
            })
        });
        //加入频道成功
        RtcEngine.on('joinChannelSuccess', (data) => {
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
    }
    //一般用于优化，可以返回false或true来控制是否进行渲染(true 的话进行下2步操作，false不会进行下去)
    shouldComponentUpdate(nextProps) { return nextProps.navigation.isFocused(); }

    // 销毁阶段函数  用于清理一些无用的内容，比如：定时器清除
    componentWillUnmount () {
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
        this.setState({
            isMute: !this.state.isMute
        }, () => {
            // muteLocalAudioStream             | bool (default false)                     | 将自己静音                                 |
            // muteAllRemoteAudioStreams        | bool (default false)                     | 静音所有远端 音频                             |
            // | muteRemoteAudioStream            | number uid（用户uid） bool  mute（是否静音）       | 静音指定用户 音频
            RtcEngine.muteLocalAudioStream(this.state.isMute);
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

    toolBar = ({hideButton, isMute}) => {
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

        return (
            //Surface是一个基本容器，可以为具有高程阴影的元素提供深度。可以通过elevation在Android和iOS上指定属性来应用阴影。
            <Surface
                //活跃的不透明度
                activeOpacity={1}
                onPress={this.toggleHideButtons}
                style={styles.container}
            >
                {/*//显示本地视频showLocalVideo*/}
                <AgoraView style={styles.localView} showLocalVideo={true} />
                <View style={styles.absView}>

                    {/*//主页面*/}

                    {/*//界面上方的频道名称和频道人数*/}
                    {/*<Text>channelName: {this.props.channelName}, peers: {this.state.peerIds.length}</Text>*/}

                    {/*//???????????????????????*/}
                    {this.agoraPeerViews(this.state)}
                    {this.toolBar(this.state)}
                </View>
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

    return (<AgoraRTCView
        channelProfile={channelProfile}
        channelName={channelName}
        videoProfile={videoProfile}
        clientRole={clientRole}
        uid={uid}
        onCancel={onCancel}
        {...props}
    ></AgoraRTCView>);
}