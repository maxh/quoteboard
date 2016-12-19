/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Dimensions,
  NativeModules,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  ViewPagerAndroid
} from 'react-native';

import * as firebase from 'firebase';

import QuoteView from './components/QuoteView';

const Immersive = NativeModules.RNImmersive;
const UIManager = NativeModules.UIManager;

let QUOTE_LIST = [
  {
    text: 'Your ego can become an obstacle to your work. If you start believing in your greatness, it is the death of your creativity.',
    author: 'Marina Abramović'
  },
  {
    text: 'The artist never entirely knows — we guess. We may be wrong, but we take leap after leap in the dark.',
    author: 'Agnes de Mille'
  },
  {
    text: 'Creativity is discontent translated into arts.',
    author: 'Eric Hoffer'
  },
  {
    text: 'When I say artist I mean the one who is building things... some with a brush – some with a shovel – some choose a pen.',
    author: 'Jackson Pollock'
  },
  {
    text: 'Great things are done by a series of small things brought together.',
    author: 'Vincent Van Gogh'
  }
];

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAm8Z6Qhp09K6Y7uRptmt-NqjVqt5zwNNo",
  authDomain: "quoteboard-34c0c.firebaseapp.com",
  databaseURL: "https://quoteboard-34c0c.firebaseio.com",
  storageBucket: "quoteboard-34c0c.appspot.com",
  messagingSenderId: "1016242885872"
};
const firebaseApp = firebase.initializeApp(config);


export default class QuoteBoard extends Component {
  constructor(props) {
    super(props);
    this.itemsRef = this.getRef().child('quotes');
    this.updateIndex_ = this.updateIndex_.bind(this);
    this.state = {
      quoteIndex: 0,
      quotes: QUOTE_LIST
    }
  }

  getRef() {
    return firebaseApp.database().ref();
  }

  listenForItems(itemsRef) {
    itemsRef.once('value').then((snap) => {
      // get children as an array
      var items = [];
      snap.forEach((child) => {
        const val = child.val();
        items.push({
          text: val.text,
          author: val.author
        });
      });
      console.log(items);
      console.log([...this.state.quotes, ...items]);
      this.setState({
        quotes: [...this.state.quotes, ...items]
      });

    });
  }

  componentDidMount() {
    Immersive.on();
    this.listenForItems(this.itemsRef);
  }

  render() {
    var {height, width} = Dimensions.get('window');
    const quotes = [];
    for (let i = 0; i < 3; i++) {
      const quoteIndex = (this.state.quoteIndex + i) % this.state.quotes.length;
      const quote = this.state.quotes[quoteIndex];
      quotes.push(
        <View key={quoteIndex} style={styles.container}>
          <QuoteView height={height * .8} author={quote.author} text={quote.text} />
        </View>
      );
    }
    return (
      <ViewPagerAndroid
        style={styles.container}
        onPageSelected={this.updateIndex_}
        initialPage={1}>
        {quotes}
      </ViewPagerAndroid>
    );
  }

  updateIndex_(event) {
    const change = event.nativeEvent.position - 1;
    let newIndex = this.state.quoteIndex + change;
    const length = this.state.quotes.length;
    newIndex = (newIndex + length) % length; 
    this.setState({quoteIndex: newIndex});
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

AppRegistry.registerComponent('QuoteBoard', () => QuoteBoard);
