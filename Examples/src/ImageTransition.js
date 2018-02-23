import React, { Component } from 'react';
import { View, Text, Dimensions, Button, TouchableOpacity, FlatList, Animated, Easing, Image, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';
import _ from 'lodash';

import { FluidNavigator, Transition } from './../lib/';

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	detailsImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
    },
    detailsView: {
        padding: 10,
        backgroundColor: '#ECECEC',
        flex: 1,
    },
    text: {
        paddingBottom:40,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        margin: 2,
    },   
});

class ImageListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            items: []
        }
    }    
    componentDidMount() {
        const items = [];
        const size = Dimensions.get('window').width;
        for(let i=0; i<50; i++)
            items.push({ url: 'https://picsum.photos/' + size + '/' + size + '?image=' + i});

        this.setState({...this.state, items})
    }
    render() {        
        return (
            <View style={styles.container}>
                <ImageGrid images={this.state.items} imageSelected={(image) => 
                    this.props.navigation.navigate('imageDetails', {
                    url: image.url,
                })}
            />
            </View>);
    }    
}

class ImageDetailsScreen extends React.Component{
    render() {
        const { params } = this.props.navigation.state;
        const size = Dimensions.get('window').width;
        const uri = params.url;
        return(
            <View style={styles.container}>
                <Transition shared={params.url}>
                    <Image style={styles.detailsImage} source={{uri: uri}}/>
                </Transition>
                <Transition appear='bottom' nodelay>
                    <View style={styles.detailsView}>
                        <Text style={styles.text}>This is image number {params.itemId}</Text>
                        <Button title='Back' onPress={() => this.props.navigation.goBack()} />
                    </View>
                </Transition>
            </View>
        );
    }
}

class ImageGrid extends Component {
    constructor(props){
        super(props);
        this._colCount = 3;
        const { width: windowWidth } = Dimensions.get("window");
        this._margin = 2;
        this._photoSize = (windowWidth - this._margin * this._colCount * 2) / this._colCount;        
        this.state = { chunkedImages : _.chunk(props.images, this._colCount) }        
    }
    
    _colCount
    _photoSize
    _margin
    _chunkedImages

    componentWillReceiveProps(nextProps){
        this.setState({...this.state, chunkedImages : _.chunk(nextProps.images, this._colCount)});
    }

    render() {
        return (
            <FlatList
                data={this.state.chunkedImages}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderItem.bind(this)}                
            />);
    }

    keyExtractor(item, index){
        return "key_" + index;
    }

    renderItem(item) {
        return (
            <View style={styles.row}>
                {item.item.map(this.renderCell.bind(this))}
            </View>
        )
    }
    
    renderCell(image) {
        return (
            <TouchableOpacity onPress={() => this.props.imageSelected(image)} key={image.url}>
                <View style={styles.cell}>
                    <Transition shared={image.url}>
                        <Image source={{uri: image.url}} 
                            style={{width: this._photoSize, height: this._photoSize}}
                        />
                    </Transition>
                </View>
            </TouchableOpacity>
        )
    }
}

const Navigator = FluidNavigator({
    imageList: { screen: ImageListScreen },
    imageDetails: { screen: ImageDetailsScreen },
}, {
    transitionConfig: {
        timing: Animated.timing,
		duration: 350,
		easing: Easing.inOut(Easing.ease),
    }
});

export default () => (
	<Navigator />
);