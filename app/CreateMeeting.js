import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    AsyncStorage,
    FlatList, ToastAndroid, Dimensions
} from 'react-native';
import DatePicker from 'react-native-datepicker';

const {width} = Dimensions.get('window');
type Props = {};
export default class CreateMeeting extends Component<Props> {
    componentWillMount() {
        AsyncStorage.getItem('sessionId', (err,d) => {
            // alert(d),
            this.setState({
                sessionId: d,
            })})

    }
    constructor(props) {
        super(props);
        this.state = {
            theme: '',
            date: '',
            duration: '',
            attenders: '',
            // moment: moment().format('YYYY-MM-DD'),
            sessionId: '',
            list: '',

        }
    }
    componentDidMount(){
        console.log(AsyncStorage.getItem('sessionId'))
    }

    addP = () => {
        this.props.navigation.navigate('AddPeople', {
                callback: (data) => {
                    this.setState({
                        attenders: data,
                    })
                }
            }
        );
    }


    createM = () => {
        let formData = new FormData();
        formData.append("sessionId",this.state.sessionId);
        formData.append("attenders",this.state.attenders.toString());
        formData.append( "theme",this.state.theme);
        formData.append( "startTime",this.state.date);
        formData.append( "duration",this.state.duration);


        fetch('http://4iv4hf.natappfree.cc/meeting/create',{
            method:'POST',
            headers:{
                'Content-Type':'multipart/form-data'
            },
            body: formData

        })
            .then(response => response.json())
            .then((json)=>{
                if(json.code==0){
                    this.setState({
                        attenders:'',
                        theme:'',
                        date:'',
                        duration:'',
                    },()=>{
                        ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                        this.props.navigation.goBack();
                    })

                }
                else if(json.code==6){
                    ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                }
                else if(json.code==7){
                    ToastAndroid.show(json.msg,ToastAndroid.SHORT);
                }
                else{
                    ToastAndroid.show('创建失败',ToastAndroid.SHORT);
                }
            })
            .catch((error)=>{console.error('error',error)
                alert(error);
            });

    }


    render() {
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text style={styles.titleContent}>
                        创建会议
                    </Text>
                </View>
                <View style={styles.headerLine}/>
                <TextInput
                    placeholder={'请输入会议主题'}
                    value = {this.state.theme}
                    autoCapitalize='none'
                    editable={true}//是否可编辑
                    onChangeText={(inputData) => {
                        this.setState({
                            theme: inputData,
                        })
                    }}
                    style={styles.tgTextInputStyle}
                />

                <Text style={styles.meetingTime}>请选择会议开始时间</Text>

                <DatePicker
                    style={{width: width * 0.6, borderColor: 'grey',}}
                    date={this.state.date}
                    mode="datetime"
                    placeholder="选择日期/时间"
                    androidMode="default"
                    format="YYYY-MM-DD HH:mm"
                    confirmBtnText="确定"
                    cancelBtnText="取消"
                    // minDate={this.state.moment}
                    maxDate="2050-06-01"
                    is24Hour={false}
                    customStyles={{
                        dateIcon: {
                            position: 'absolute',
                            right: 0,
                            top: 4,
                            paddingLeft: 0
                        },
                        dateInput: {
                            marginLeft: 0
                        }
                    }}
                    minuteInterval={10}
                    onDateChange={(date) => {
                        this.setState({date: date})
                    }}
                />

                <TextInput
                    placeholder={'请输入会议预计持续时间/分钟'}
                    autoCapitalize='none'
                    keyboardType={'numeric'}
                    value={this.state.duration}
                    password={true}
                    editable={true}
                    onChangeText={(inputData) => {
                        this.setState({
                            duration: inputData,
                        })
                    }}
                    // onChangeText={this._onChangePassWord}
                    style={styles.tgTextInputStyle}
                />

                <View style={styles.addUser}>
                    <Text style={styles.chText}>参会人员：</Text>
                    <TouchableOpacity onPress={this.addP}>
                        {/*onPress={() => this.setState({isVisible: true})}*/}

                        <Image source={require('../image/add.png')} style={styles.addStyle}/>
                    </TouchableOpacity>
                </View>
                {/*<View style={{width:width,height:50,backgroundColor:'red'}}>*/}
                {/*<FlatList*/}
                {/*data={this.state.list}*/}
                {/*renderItem={this._renderSelect}/>*/}
                {/*</View>*/}

                <TouchableOpacity
                    onPress={this.createM}
                >
                    <View style={styles.button}>
                        <Text style={styles.btText}>创建会议</Text>
                    </View>
                </TouchableOpacity>


            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
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
        // fontWeight: "",
        textAlign: 'center',
        color: '#333333',
    },headerLine:{
        width:width,
        height:1,
        backgroundColor:'lightgrey',
    },




    meetingTime: {
        marginTop: 15,
        marginBottom: 10,
        fontSize: 20

    },
    tgTextInputStyle: {
        width: width * 0.6,
        height: 38,
        marginTop: 30,
        borderColor: 'lightgrey',
        borderWidth: 1,
        // marginBottom:8,
        borderRadius: 4,
        textAlign: 'center',
        alignSelf: 'center'
    },
    button: {
        height: 50,
        width: 280,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#306699',
        marginTop: 20,
    },
    chText: {
        marginTop: 20,
        // marginRight:width*0.7,
        color: 'grey',
        fontSize: 20,
    },
    addUser: {
        flexDirection: "row",
        // justifyContent: 'false',
    },
    addStyle: {
        marginTop: 20,
        // color: 'grey',
        tintColor: 'grey',
        width: 35,
        height: 35,
    },
    btText: {
        color: '#fff',
        fontSize: 20,
    },
    button_in: {
        height: 50,
        width: 220,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#306266',
        marginTop: 20,
    }

});