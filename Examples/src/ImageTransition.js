import React, { Component } from 'react';
import { View, Text, Dimensions, Button, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { FluidNavigator, Transition } from './../lib/';

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	item: {
        height: 90,
        padding: 10,
        flex: 1,
        flexDirection: 'row',
    },
    image: {
        height: 80,
        width: 80,
    },
    detailsImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width,
    },
    detailsView: {
        padding: 10,
        backgroundColor: '#ECECEC'
    },
    text: {
        paddingBottom:40,
    }
});

class ImageListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state= {
            items: []
        }
    }
    colcount = 4
    componentDidMount() {
        const items = [];
        const size = Dimensions.get('window').width;
        for(let i=0; i<2; i++)
            items.push('https://picsum.photos/' + size + '/' + size + '?image=' + i);

        this.setState({...this.state, items})
    }
    render() {        
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.items}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem.bind(this)}
                    >
                </FlatList>
            </View>);
    }
    keyExtractor(item, index){
        return "key_" + index;
    }
    renderItem(rowItem) {
        return (
            <TouchableOpacity style={styles.item} onPress={() => this.props.navigation.navigate('imageDetails', {
                itemId: rowItem.index,
              })}>
                <Transition shared={'image' + rowItem.index}>
                    <Image style={styles.image} source={{uri: rowItem.item}}/>
                </Transition>
            </TouchableOpacity>
        );
    }
    renderRow(rowItem){
        return(
            <View styles={styles.row}>

            </View>
        )
    }
}

class ImageDetailsScreen extends React.Component{
    render() {
        const { params } = this.props.navigation.state;
        const size = Dimensions.get('window').width;
        const uri = 'https://picsum.photos/' + size + '/' + size + '?image=' + params.itemId;
        return(
            <View style={styles.container}>
                <Transition shared={'image' + params.itemId}>
                    <Image style={styles.detailsImage} source={{uri: uri}}/>
                </Transition>
                <Transition appear='bottom' immediate>
                    <View style={styles.detailsView}>
                        <Text style={styles.text}>This is image number {params.itemId}</Text>
                        <Button title='Back' onPress={() => this.props.navigation.goBack()} />
                    </View>
                </Transition>
            </View>
        );
    }
}

const Navigator = FluidNavigator({
    imageList: { screen: ImageListScreen },
    imageDetails: { screen: ImageDetailsScreen },
});

export default () => (
	<Navigator />
);