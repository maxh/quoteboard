/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  findNodeHandle,
  AppRegistry,
  Dimensions,
  NativeModules,
  PixelRatio,
  StyleSheet,
  Text,
  View,
  ViewPagerAndroid
} from 'react-native';

const Immersive = NativeModules.RNImmersive;
const UIManager = NativeModules.UIManager;

let QUOTE_LIST = [
  {
    text: 'Your ego can become an obstacle to your work. If you start believing in your greatness, it is the death of your creativity.',
    author: 'Marina Abramović'
  },
  {
    text: 'The artist never entirely knows — We guess. We may be wrong, but we take leap after leap in the dark.',
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

const MARGIN = 50;

class AutoText extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.size = 500;
    this.state.interval = this.state.size / 2;
  }

  tryNewSize() {
    requestAnimationFrame(() => {
      UIManager.measureLayoutRelativeToParent(
        findNodeHandle(this._text),
        () => { console.log('Error!') },
        (x, y, w, h) => { this.checkSize(w, h) },
      );
    });
  }

  checkSize(w, h) {
    if (h > this.props.height + MARGIN) {
      this.setState({
        size: this.state.size - this.state.interval,
        interval: this.state.interval / 2
      });
      this.tryNewSize();
    } else if (h < this.props.height - MARGIN) {
      this.setState({
        size: this.state.size + this.state.interval,
        interval: this.state.interval / 2
      });
      this.tryNewSize();
    } else if (!this.state.complete) {
      this.setState({complete: true});
    }
  }

  _onLayout() {
    //console.log(arguments);
  }

  componentDidMount() {
    // Convert this to async/await function so I can process synchronously in loop
    this.tryNewSize();
  }

  render() {
    return (
      <Text ref={component => this._text = component}
            onLayout={this._onLayout}
            style={{
              backgroundColor: 'transparent',
              fontSize: this.state.size,
              color: this.state.complete ? 'black' : 'transparent'
            }}>
        {this.props.children}
      </Text>
    )
  }

}

export default class QuoteBoard extends Component {
  constructor(props) {
    super(props);
    this.updateIndex_ = this.updateIndex_.bind(this);
    this.state = {
      quoteIndex: 0
    }
  }

  componentDidMount() {
    Immersive.on();
  }

  render() {
    var {height, width} = Dimensions.get('window');
    let quotes = [];
    for (let i = 0; i < 3; i++) {
      let quoteIndex = (this.state.quoteIndex + i) % QUOTE_LIST.length;
      let quote = QUOTE_LIST[quoteIndex];
      quotes.push(
        <View key={quoteIndex} style={styles.container}>
          <AutoText width={400} height={height * .8}>
            {quote.text}
          </AutoText>
          <Text style={styles.author}>
            {quote.author}
          </Text>
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
    newIndex = (newIndex + QUOTE_LIST.length) % QUOTE_LIST.length; 
    this.setState({quoteIndex: newIndex});
  }
}

var {height, width} = Dimensions.get('window');
var maxDimension = Math.max(height, width);
var pixelRatio = PixelRatio.get();


function float2int (value) {
  return value | 0;
}

function getCorrectFontSizeForScreen(
    pixelRatio, screenWidth, screenHeight, currentFont){
  let factor = (
      ((screenWidth * pixelRatio) / 320) +
      ((screenHeight * pixelRatio) / 640)
    ) / 2.0;
  let maxFontDifferFactor = 5; //the maximum pixels of font size we can go up or down
  console.log("The factor is: "+factor);
  if(factor<=1){
    return currentFont-float2int(maxFontDifferFactor*0.3);
  }else if((factor>=1) && (factor<=1.6)){
    return currentFont-float2int(maxFontDifferFactor*0.1);
  }else if((factor>=1.6) && (factor<=2)){
    return currentFont;
  }else if((factor>=2) && (factor<=3)){
    return currentFont+float2int(maxFontDifferFactor*0.65);
  }else if (factor>=3){
    return currentFont+float2int(maxFontDifferFactor);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontFamily: 'DroidSerif',
    fontSize: getCorrectFontSizeForScreen(pixelRatio, width, height, 40),
    textAlign: 'center',
    margin: 10,
    color: '#111111',
  },
  author: {
    fontFamily: 'DroidSans',
    textAlign: 'center',
    color: '#555555',
    marginBottom: 5,
    fontSize: 30,
  },
});

AppRegistry.registerComponent('QuoteBoard', () => QuoteBoard);