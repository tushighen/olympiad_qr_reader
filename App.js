import React, {Component} from 'react';
import {
    Alert,
    Linking,
    Dimensions,
    LayoutAnimation,
    Text,
    View,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import {BarCodeScanner, Permissions} from 'expo';

export default class App extends Component {
    state = {
        hasCameraPermission: null,
        lastScannedUrl: null,
        mandate: {
            first_name: null,
            last_name: null,
            register_number: null,
            school_name: null,
        }
    };

    movies = [];

    componentDidMount() {
        this._requestCameraPermission();
    }

    _requestCameraPermission = async () => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status === 'granted',
        });
    };

    _handleBarCodeRead = result => {
        if (result.data !== this.state.lastScannedUrl) {
            LayoutAnimation.spring();
            fetch('http://olympiad.edu.mn/mandate/attendance/' + result.data)
                .then((response) => response.json())
                .then((responseJson) => {
                    this.setState({lastScannedUrl: 'Ирц амжилттай бүртгэгдлээ'});
                    this.state.mandate = responseJson;
                    // this.setState({mandate: responseJson});
                })
                .catch((error) => {
                    alert(error);
                });
        }
    };

    render() {
        return (
            <View style={styles.container}>

                {this.state.hasCameraPermission === null
                    ? <Text>Requesting for camera permission</Text>
                    : this.state.hasCameraPermission === false
                        ? <Text style={{color: '#fff'}}>
                            Camera permission is not granted
                        </Text>
                        : <BarCodeScanner
                            onBarCodeRead={this._handleBarCodeRead}
                            style={{
                                height: Dimensions.get('window').height,
                                width: Dimensions.get('window').width,
                            }}
                        />}

                {this._maybeRenderUrl()}

                <StatusBar hidden/>
            </View>
        );
    }

    _handlePressUrl = () => {
        Alert.alert(
            'Open this URL?',
            this.state.lastScannedUrl,
            [
                {
                    text: 'Yes',
                    onPress: () => Linking.openURL(this.state.lastScannedUrl),
                },
                {
                    text: 'No', onPress: () => {
                    }
                },
            ],
            {cancellable: false}
        );
    };

    _handlePressCancel = () => {
        this.setState({lastScannedUrl: null});
    };

    _maybeRenderUrl = () => {
        if (!this.state.lastScannedUrl) {
            return;
        }

        return (
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.url} onPress={this._handlePressUrl}>
                    <Text numberOfLines={1} style={styles.successText}>
                        {this.state.lastScannedUrl}
                    </Text>
                    <Text numberOfLines={1} style={styles.urlText}>
                        Овог: {this.state.mandate.last_name}
                    </Text>
                    <Text numberOfLines={1} style={styles.urlText}>
                        Нэр: {this.state.mandate.first_name}
                    </Text>
                    <Text numberOfLines={1} style={styles.urlText}>
                        Регистер: {this.state.mandate.register_number}
                    </Text>
                    <Text numberOfLines={1} style={styles.urlText}>
                        Сургууль: {this.state.mandate.school_name}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={this._handlePressCancel}>
                    <Text style={styles.cancelButtonText}>
                        Гарах
                    </Text>
                </TouchableOpacity>
            </View>
        );


        // function getMoviesFromApiAsync() {
        // fetch('https://facebook.github.io/react-native/movies.json')
        //     .then((response) => response.json())
        //     .then((responseJson) => {
        //
        //         // alert();
        //     })
        //     .catch((error) => {
        //         alert(error);
        //     });
        // }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 15,
        flexDirection: 'row',
    },
    url: {
        flex: 1,
    },
    successText: {
        color: '#34bf49',
        fontSize: 20,
    },
    urlText: {
        color: '#fff',
        fontSize: 20,
    },
    cancelButton: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
    },
});