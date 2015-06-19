// Takes the observables listed in a component's observe method
// and subscribe. If data is new, then it will forceUpdate.
//
// Q: why does _resubscribe run so many times? Should it now only run once on
// applicable observables for a view on initial render? and wait
// for observable changes?
//
// A: currently liberally using _resubscribe to recreate new observables
// (example is query changes from navbar will change query state ->  componentWillUpdate ->
//  _resubscribe ->  component.observe ->  ThreadStore.list ->  creates new observable from API
//  call -> triggers onNext -> _resubscribe -> forceUpdate)
function _resubscribe(component, props) {
  var newObservables = component.observe(props);
  var newSubscriptions = {};

  Object.keys(newObservables).forEach(key => {
    newSubscriptions[key] = newObservables[key].subscribe(
      function onNext(value) {
        component.data[key] = value;
        // use != to prevent calling forceUpdate when null !== undefined is true
        if (component.data[key] != component._observerLastData[key]) { //eslint-disable-line eqeqeq
          component._observerCalledForceUpdate = true;
          console.log(2222222222222);
          // NOTE: from console.logging it appears that forceUpdate is to optimally used
          component.forceUpdate();
        }

        component._observerLastData[key] = value;
      },
      function onError() { },
      function onCompleted() { },
    );
  });

  _unsubscribe(component);
  component._observerSubscriptions = newSubscriptions;
}

function _unsubscribe(component) {
  Object.keys(component._observerSubscriptions).forEach(
    key => component._observerSubscriptions[key].dispose()
  );

  component._observerSubscriptions = {};
}

module.exports = function decorateWithObserve(ComposedComponent) {
  class ObserveEnhancer extends ComposedComponent {
    constructor(props) {
      super(props);

      if (this.observe){
        this.data = {};
        this._observerSubscriptions = {};
        this._observerLastData = {};
        _resubscribe(this, props);
      }
    }

    componentWillUpdate(newProps) {
      if (super.componentWillUpdate) {
        super.componentWillUpdate(newProps);
      }

      if (!this._observerCalledForceUpdate && this.observe) {
        _resubscribe(this, newProps);
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (super.componentDidUpdate) {
        super.componentDidUpdate(prevProps, prevState);
      }

      this._observerCalledForceUpdate = false;
    }

    componentWillReceiveProps(newProps) {
      if (super.componentWillReceiveProps) {
        super.componentWillReceiveProps(newProps);
      }

      if (this.observe){
        _resubscribe(this, newProps);
      }
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      if (this._observerSubscriptions){
        _unsubscribe(this);
      }
    }
  }

  ObserveEnhancer.defaultProps = ComposedComponent.defaultProps;
  ObserveEnhancer.propTypes = ComposedComponent.propTypes;
  ObserveEnhancer.contextTypes = ComposedComponent.contextTypes;

  return ObserveEnhancer;
};
