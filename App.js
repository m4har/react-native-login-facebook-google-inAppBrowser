import React, {useEffect, useState} from 'react';
import {
  View,
  Button,
  Linking,
  Alert,
  Platform,
  Image,
  Text,
} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const getDeepLink = (path = '') => {
  const scheme = 'jomblo';
  const prefix =
    Platform.OS == 'android' ? `${scheme}://login/` : `${scheme}://`;
  return prefix + path;
};

const App = () => {
  const [state, setState] = useState({
    isLogin: false,
    name: '',
    email: '',
    photo: '',
  });

  useEffect(() => {
    Linking.addEventListener('url', handleOpenURL);
    Linking.getInitialURL().then(url => {
      if (url) {
        handleOpenURL({url});
      }
    });
    return () => Linking.removeEventListener('url', handleOpenURL);
  }, []);

  const onPress = sosmed => async () => {
    try {
      const deepLink = getDeepLink('callback');
      const url = `https://stormy-lake-44695.herokuapp.com/auth/${sosmed}/`;
      if (await InAppBrowser.isAvailable()) {
        InAppBrowser.openAuth(url, deepLink, {}).then(response => {
          if (response.type === 'cancel') {
            Alert.alert(response.type);
          }
        });
      } else Linking.openURL(url);
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const handleOpenURL = ({url}) => {
    const [, user_string] = url.match(/user=([^#]+)/);
    const response = JSON.parse(decodeURI(user_string));
    const photo = response.picture.data?.url || response.picture;
    setState(prev => ({
      ...prev,
      isLogin: true,
      email: response.email,
      name: response.name,
      photo,
    }));
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button
        title="Login Google"
        color="#DB4437"
        onPress={onPress('google')}
      />
      <Button
        title="Login Facebook"
        color="#4267B2"
        onPress={onPress('Facebook')}
      />
      {state.isLogin && (
        <View style={{marginVertical: 20, alignItems: 'center'}}>
          <Image
            source={{uri: state.photo}}
            style={{height: 100, width: 100}}
          />
          <Text>{state.email}</Text>
          <Text>{state.name}</Text>
        </View>
      )}
    </View>
  );
};

export default App;
