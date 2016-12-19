import React, { Component } from 'react';
import {
  findNodeHandle,
  NativeModules,
  Text,
  View
} from 'react-native';

const UIManager = NativeModules.UIManager;


const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) =>
      hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
    );
    promise.catch((error) =>
      hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

export default class QuoteView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.size = 500;
    this.state.interval = this.state.size / 2;
    this.state.promises = [];
    this.state.complete = false;
  }

  tryNewSize() {
    return this.createPromise(resolve => {
      requestAnimationFrame(() => resolve());
    })
    .then(() => {
      return this.createPromise(resolve => {
        UIManager.measureLayoutRelativeToParent(
          findNodeHandle(this._text),
          () => console.log('Error!'),
          (x, y, w, h) => {
            resolve([w, h]);
          },
        );
      })
    })
    .then((wh) => {
      this.checkSize(wh[0], wh[1]);
    })
    .catch(e => {
      if (!e.isCanceled) {
        console.log(e);  // Unexpected error.
      }
    });
  }

  createPromise(fn) {
    const cancelable = makeCancelable(
      new Promise(r => fn(r))
    );
    cancelable.promise
      .then(() => this.removePromise(cancelable))
      .catch(e => {
        if (!e.isCanceled) {
          console.log(e);  // Unexpected error.
        }
      });
    this.addPromise(cancelable);
    return cancelable.promise;
  }

  removePromise(promise) {
    const promises = this.state.promises;
    const index = promises.indexOf(promise);
    this.setState({
      promises: [
        ...promises.slice(0, index),
        ...promises.slice(index + 1)
      ]
    })
  }

  addPromise(promise) {
    this.setState({
      promises: [...this.state.promises, promise]
    })
  }

  checkSize(w, h) {
    let newSize;
    if (h > this.props.height * .95) {
      newSize = this.state.size - this.state.interval;
    } else if (h < this.props.height * .75) {
      newSize = this.state.size + this.state.interval;
    } else if (!this.state.complete) {
      this.setState({complete: true});
    }
    if (newSize) {
      this.setState({
        size: newSize,
        interval: this.state.interval / 2
      });
      this.tryNewSize();
    }
  }

  componentDidMount() {
    // Convert this to async/await function so I can process synchronously in loop
    this.tryNewSize();
  }

  componentWillUnmount() {
    this.state.promises.forEach((promise) => {
      promise.cancel();
    })
  }

  render() {
    const authorStyles = {
      fontFamily: 'DroidSans',
      textAlign: 'center',
      color: '#555555',
      marginBottom: 5,
      fontSize: Math.max(this.state.size / 2, 20),
      color: this.state.complete ? '#555555' : 'transparent'
    };
    return (
      <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Text ref={component => this._text = component}
              style={{
                fontFamily: 'DroidSerif',
                textAlign: 'center',
                margin: 20,
                backgroundColor: 'transparent',
                fontSize: this.state.size,
                color: this.state.complete ? '#111111' : 'transparent'
              }}>
          {this.props.text}
        </Text>
        <Text style={authorStyles}>
          {this.props.author}
        </Text>
      </View>
    )
  }
}