import Constants from 'expo-constants';
import React, { useState } from 'react';
import { SafeAreaView, Button, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview' 

export default function Index() {
    const [showWebView, SetShowWebView] = useState(false);
    const webviewRef = React.useRef<WebView>(null);
    const [event, setEvent] = useState({event: '', payload: {}})

    const EVENTS = {
        CAPTURE: 'capture',
        MATCH: 'match',
        ERROR: 'error'
    }

    const handleEvent = (event: any) => {
        console.log(event)
        const eventType = event.event
        const payload = event.payload
        switch (eventType){
            case EVENTS.CAPTURE:
                onCapture(payload)
                break
            case EVENTS.MATCH:
                onMatch(payload)
                break
            case EVENTS.ERROR:
                onError(payload)
                break
            default:
                break
        }
    }

    const registerEvent = (event: string, payload: any) => {
        setEvent({event: event, payload: payload})
    }

    const sendEventToWebView = (event: string, payload: any) => {
        const eventObject = {
            event: event,
            payload: payload
        }
        webviewRef.current?.injectJavaScript(
            getIjectableScript(eventObject)
        );
        console.log('sending event', eventObject)

    }

    const getIjectableScript = (message:any) => {
        return `
            (function() {
                document.dispatchEvent(new MessageEvent('message', {
                    data: '${JSON.stringify(message)}'
                }));
            })();
        `;
    }

    const onCapture = (payload: any) => {
        console.log('capturing', payload)
        SetShowWebView(false)
    }

    const onMatch = (payload: any) => {
        console.log('matching', payload)
        SetShowWebView(false)
    }

    const onError = (payload: any) => {
        console.log('error', payload)
        SetShowWebView(false)
    }

    const renderWebView = () => {
        return (
            <WebView 
                source={{ uri: 'https://face-recognition-topaz-ten.vercel.app/' }}
                //codigo para debugar erros no webview 
                injectedJavaScriptBeforeContentLoaded={`
                    window.onerror = function(message, sourcefile, lineno, colno, error) {
                    alert("Message: " + message + " - Source: " + sourcefile + " Line: " + lineno + ":" + colno);
                    return true;
                    };
                    true;
                `}
                originWhitelist={['*']}
                style={styles.container}
                ref={webviewRef}
                javaScriptEnabled={true}
                onLoad={() => setTimeout(() => sendEventToWebView(event.event, event.payload), 100)}
                onMessage={(event) => handleEvent(JSON.parse(event.nativeEvent.data)) }
                />
        )
    }

    return showWebView ? 
                renderWebView() 
                : 
                <>
                    <SafeAreaView style = {styles.container}>
                        <Button
                            title="Cadastro Facial"
                                onPress={ () => {
                                    SetShowWebView(true);
                                    registerEvent(EVENTS.CAPTURE, {});
                                }} />
                        <Button
                            title="Bater Ponto"
                            onPress={() => {
                                SetShowWebView(true);
                                registerEvent(EVENTS.MATCH, {user: {name: 'teste', faceid: []}});
                            }} />
                    </SafeAreaView >
                </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
    },
});

