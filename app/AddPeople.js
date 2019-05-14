import React, {Component} from 'react';
import {FlatList, StyleSheet, View, Text, Button, TouchableOpacity, AsyncStorage, ToastAndroid} from 'react-native';

var Dimensions = require('Dimensions');
var {width, height} = Dimensions.get('window');

export default class AddPeople extends Component {

    componentWillMount() {
        //读取sectionid
        AsyncStorage.getItem('sessionId', (err,d) => {
            // alert(d),
            this.setState({
                sessionId: d,
            },
                ()=>{
                    fetch('http://4iv4hf.natappfree.cc/user/findAll?sessionId='+this.state.sessionId)
                        .then((response) => {
                            console.log(response)
                            return response.json();
                        })
                        .then((json) => {
                            this.setState({
                                data:json.data
                            },()=>{
                                let arry=this.state.data;
                                let arry2=[];
                                var i=0;
                                    arry.map(((item,index)=>{
                                        arry2.push(Object.assign({},item,{num:i}));
                                        i++
                                    }))
                                this.setState(
                                    {
                                        data:arry2
                                    }
                                )

                                }
                                )

                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
            )
        })

    }

    constructor() {
        super();
        this.state = {
            sessionId:'',
            list: [{name: 1}, {name: 2}],
           //数据源
            data: [ ],
            //     {
            //     sid: 0,
            //     sname: '张三',
            //     select: false
            // },
            selectItem: [],
        }
    }

    _renderItem = ({item, index}) => (
        <View>
            <View style={styles.standaloneRowFront}>
                <TouchableOpacity
                    onPress={()=> this._selectItemPress(item)}>
                    <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 100,
                        backgroundColor: item.choose ? ("#ff081f") : ("#39a7fc")
                    }}/>
                </TouchableOpacity>
                <View
                    style={{
                        marginLeft: 100,
                        fontSize: 55,
                        textAlign: 'center',
                        lineHeight: 60

                    }}>
                    <Text>{item.sname}</Text>
                </View>
            </View>
            {/*</TouchableHighlight>*/}
        </View>
    )


//好像有点错，调试一下
    _selectItemPress = (item) => {

        if (item.choose) {
            this.state.selectItem.splice(this.state.selectItem.findIndex(function (x) {
                return x === item.name;
            }))
        } else {
            this.state.selectItem.push(item.sid)
        }
        this.state.data[item.num].choose = !item.choose
        // this.state.data=arr.pop()
        this.setState({data: this.state.data})
    }

    _submitPress() {
        // alert(this.state.selectItem)
        ToastAndroid.show('添加人员成功',ToastAndroid.SHORT);
        const {navigate, goBack, state} = this.props.navigation;
        state.params.callback(this.state.selectItem);
        this.props.navigation.goBack();
    }


    render() {
        // alert(this.state.sessionId)
        return (
            <View style={styles.container}>
                {/*<Text style={styles.welcome}>Welcome to8888888 React 4444 Native!</Text>*/}
                {/*<Text style={styles.instructions}>To get started, edit App.js</Text>*/}
                <FlatList
                    data={this.state.data}
                    renderItem={this._renderItem}
                    //指定每一个子元素的唯一的key
                    keyExtractor={(item,sid)=>sid.toString()}
                    ListFooterComponent={({item}) => {
                        return (<Button title={"确定"} onPress={this._submitPress.bind(this)}/>)
                    }}


                />


            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: '#F5FCFF',
    },
    standaloneRowFront: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 60,
        marginBottom: 5
    },


});
